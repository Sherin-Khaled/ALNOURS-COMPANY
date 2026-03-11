import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";
import { syncProductsFromOdoo, createOrUpdatePartner, createSalesOrder, isOdooConfigured, createCrmLead } from "./odoo";
import nodemailer from "nodemailer";
import { db } from "./db";
import { orders } from "@shared/schema";
import { eq } from "drizzle-orm";

function createMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

async function sendPasswordResetEmail(toEmail: string, token: string, baseUrl: string) {
  const transporter = createMailTransporter();
  if (!transporter) {
    console.warn("[mail] SMTP not configured — reset link not sent. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.");
    return;
  }
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from: `ALNOURS <${from}>`,
    to: toEmail,
    subject: "Reset your ALNOURS password",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <img src="${baseUrl}/images/Alnours_logo.png" alt="ALNOURS" style="height:40px;margin-bottom:24px" />
        <h2 style="color:#0F3D91;margin-bottom:12px">Reset your password</h2>
        <p style="color:#555;margin-bottom:24px">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#0F3D91;color:#fff;padding:14px 28px;border-radius:100px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#aaa;font-size:12px;margin-top:32px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Migrate any legacy "Processing" orders to "Verified"
  try {
    await db.update(orders).set({ status: "Verified" }).where(eq(orders.status, "Processing"));
  } catch (e) {
    console.warn("[startup] Could not migrate order statuses:", (e as Error).message);
  }

  let mockLoggedInUserId: number | null = null;

  app.post(api.auth.signup.path, async (req, res) => {
    try {
      const input = api.auth.signup.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const user = await storage.createUser({
        firstName: input.firstName,
        lastName: input.lastName || null,
        email: input.email,
        phone: input.phone,
        password: input.password
      });
      mockLoggedInUserId = user.id;
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      mockLoggedInUserId = user.id;
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!mockLoggedInUserId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(mockLoggedInUserId);
    if (!user) {
      mockLoggedInUserId = null;
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json(user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    mockLoggedInUserId = null;
    res.status(200).json({ message: "Logged out" });
  });

  app.post(api.auth.forgotPassword.path, async (req, res) => {
    try {
      const input = api.auth.forgotPassword.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user) {
        return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
      }
      const token = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      await storage.updateUser(user.id, { resetToken: hashedToken, resetTokenExpiry: expiry } as any);
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const baseUrl = `${protocol}://${req.headers.host}`;
      await sendPasswordResetEmail(user.email, token, baseUrl);
      console.log(`[auth] Password reset requested for ${user.email}`);
      res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.auth.resetPassword.path, async (req, res) => {
    try {
      const input = api.auth.resetPassword.input.parse(req.body);
      const hashedToken = crypto.createHash("sha256").update(input.token).digest("hex");
      const user = await storage.getUserByResetToken(hashedToken);
      if (!user || !user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      await storage.updateUser(user.id, {
        password: input.password,
        resetToken: null,
        resetTokenExpiry: null,
      } as any);
      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.status(200).json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  });

  app.get(api.orders.list.path, async (req, res) => {
    if (!mockLoggedInUserId) return res.status(401).json({ message: "Not authenticated" });
    const orders = await storage.getOrdersByUserId(mockLoggedInUserId);
    res.status(200).json(orders);
  });

  app.get(api.orders.get.path, async (req, res) => {
    if (!mockLoggedInUserId) return res.status(401).json({ message: "Not authenticated" });
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) return res.status(400).json({ message: "Invalid order ID" });
    const order = await storage.getOrderById(orderId);
    if (!order || order.userId !== mockLoggedInUserId) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  });

  app.post(api.orders.create.path, async (req, res) => {
    if (!mockLoggedInUserId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const input = api.orders.create.input.parse(req.body);

      const allProducts = await storage.getProducts();
      let total = 0;
      const orderItems: { defaultCode: string; quantity: number; price: number }[] = [];
      const storedItems: { productId: number; name: string; quantity: number; size: string; price: number; image?: string }[] = [];

      for (const item of input.items) {
        const product = allProducts.find(p => p.id === item.productId);
        const price = product ? product.price : 30;
        total += item.quantity * price;
        storedItems.push({
          productId: item.productId,
          name: product?.name || "Unknown Product",
          quantity: item.quantity,
          size: item.size,
          price,
          image: product?.images?.packshot,
        });
        if (product?.defaultCode) {
          orderItems.push({
            defaultCode: product.defaultCode,
            quantity: item.quantity,
            price,
          });
        }
      }
      total += 10;

      const order = await storage.createOrder({
        userId: mockLoggedInUserId,
        total,
        status: "Verified",
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "card" ? "paid" : "pending",
        shippingAddress: input.shippingAddress,
        items: storedItems,
      });

      if (isOdooConfigured() && orderItems.length > 0) {
        try {
          const user = await storage.getUser(mockLoggedInUserId);
          if (user) {
            const addr = input.shippingAddress;
            const partnerId = await createOrUpdatePartner(
              {
                firstName: addr.fullName.split(" ")[0] || addr.fullName,
                lastName: addr.fullName.split(" ").slice(1).join(" ") || null,
                email: addr.email,
                phone: addr.phone,
              },
              {
                fullName: addr.fullName,
                city: addr.city,
                addressLine: addr.street,
                phone: addr.phone,
                country: addr.country,
                postalCode: addr.postalCode,
              },
              user.odooPartnerId || undefined
            );
            if (!user.odooPartnerId || user.odooPartnerId !== partnerId) {
              await storage.updateUserOdooPartnerId(user.id, partnerId);
            }
            await createSalesOrder(partnerId, orderItems, order.orderNo);
          }
        } catch (odooErr) {
          console.error("[odoo] Failed to create order in Odoo:", (odooErr as Error).message);
        }
      }

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(400).json({ message: "Invalid request" });
      }
    }
  });

  app.get(api.addresses.list.path, async (req, res) => {
    if (!mockLoggedInUserId) return res.status(401).json({ message: "Not authenticated" });
    const addresses = await storage.getAddressesByUserId(mockLoggedInUserId);
    res.status(200).json(addresses);
  });

  app.post(api.addresses.create.path, async (req, res) => {
    if (!mockLoggedInUserId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const input = api.addresses.create.input.parse(req.body);
      const address = await storage.createAddress({
        ...input,
        userId: mockLoggedInUserId
      });
      res.status(201).json(address);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.patch('/api/addresses/:id', async (req, res) => {
    if (!mockLoggedInUserId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid address ID" });
      const input = api.addresses.update.input.parse(req.body);
      const address = await storage.updateAddress(id, mockLoggedInUserId, input);
      res.status(200).json(address);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const input = api.contact.submit.input.parse(req.body);

      if (isOdooConfigured()) {
        try {
          await createCrmLead({
            contactName: input.name,
            email: input.email,
            phone: input.phone || "",
            name: input.productInterest ? `Website Inquiry: ${input.productInterest}` : "Website Contact Form",
            description: input.message,
          });
          return res.status(200).json({ message: "Your message has been sent successfully. Our team will get back to you soon." });
        } catch (odooErr) {
          console.error("[odoo] Failed to create CRM lead:", (odooErr as Error).message);
          return res.status(500).json({ message: "We couldn't process your request right now. Please try again later or contact us directly." });
        }
      }

      console.log("[contact] Form submission (no Odoo):", input);
      res.status(200).json({ message: "Your message has been sent successfully. Our team will get back to you soon." });
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  seedWithRetry().then(() => {
    syncProductsFromOdoo(
      () => storage.getProducts(),
      (id, data) => storage.updateProduct(id, data)
    ).catch(() => {});
  });

  return httpServer;
}

async function seedWithRetry(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await seedDatabase();
      return;
    } catch (err) {
      console.log(`Seed attempt ${i + 1}/${retries} failed: ${(err as Error).message}`);
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  console.log("Seeding skipped — database may be temporarily unavailable.");
}

async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    const productsData = [
      {
        name: "Cocktail Premium Drink",
        nameAr: "مشروب كوكتيل بريميوم",
        slug: "cocktail-premium-drink",
        flavor: "Cocktail",
        category: "Juice",
        sizes: ["200 ml", "1000 ml"],
        price: 30,
        currency: "SAR",
        defaultCode: "101003",
        nutrition: { fat: "0g", calories: "120 kcal", carbs: "30g" },
        ingredients: "Water, mixed fruit puree (mango, guava, orange), sugar, citric acid.",
        images: { packshot: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&auto=format&fit=crop&q=60", decorations: [] }
      },
      {
        name: "Mango Premium Drink",
        nameAr: "مشروب مانجو بريميوم",
        slug: "mango-premium-drink",
        flavor: "Mango",
        category: "Juice",
        sizes: ["200 ml", "1000 ml"],
        price: 30,
        currency: "SAR",
        defaultCode: "101001",
        nutrition: { fat: "0g", calories: "140 kcal", carbs: "35g" },
        ingredients: "Water, mango puree, sugar, citric acid.",
        images: { packshot: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=60", decorations: [] }
      },
      {
        name: "Guava Premium Drink",
        nameAr: "مشروب جوافة بريميوم",
        slug: "guava-premium-drink",
        flavor: "Guava",
        category: "Juice",
        sizes: ["200 ml", "1000 ml"],
        price: 30,
        currency: "SAR",
        defaultCode: "101002",
        nutrition: { fat: "0g", calories: "110 kcal", carbs: "28g" },
        ingredients: "Water, guava puree, sugar, citric acid.",
        images: { packshot: "https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?w=800&auto=format&fit=crop&q=60", decorations: [] }
      },
      {
        name: "Orange Premium Drink",
        nameAr: "مشروب برتقال بريميوم",
        slug: "orange-premium-drink",
        flavor: "Orange",
        category: "Juice",
        sizes: ["200 ml", "1000 ml"],
        price: 30,
        currency: "SAR",
        defaultCode: "101004",
        nutrition: { fat: "0g", calories: "115 kcal", carbs: "29g", protein: "2g" },
        ingredients: "Water, orange juice concentrate, sugar, citric acid.",
        images: { packshot: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&auto=format&fit=crop&q=60", decorations: [] }
      }
    ];

    for (const p of productsData) {
      await storage.createProduct(p);
    }
    console.log("Seeded mock products.");
  }
}
