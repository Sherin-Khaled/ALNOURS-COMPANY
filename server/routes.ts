import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Mock Auth (using session or just a simple mock for now since it's frontend-first)
  // For simplicity in this demo, we'll use a mocked "logged in" state in memory 
  // or simple cookie/session if requested, but a global mock user is easier for B2C demo.
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
        password: input.password // In a real app, hash this!
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

  // Products
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

  // Orders
  app.get(api.orders.list.path, async (req, res) => {
    if (!mockLoggedInUserId) return res.status(401).json({ message: "Not authenticated" });
    const orders = await storage.getOrdersByUserId(mockLoggedInUserId);
    res.status(200).json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    if (!mockLoggedInUserId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const input = api.orders.create.input.parse(req.body);
      // Mock calculation for total
      const total = input.items.reduce((acc, item) => acc + (item.quantity * 30), 0) + 10; // 30 SAR per item + 10 SAR shipping
      
      const order = await storage.createOrder({
        userId: mockLoggedInUserId,
        total,
        status: "Processing"
      });
      res.status(201).json(order);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Addresses
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

  seedWithRetry();

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
        slug: "cocktail-premium-drink",
        flavor: "Cocktail",
        category: "Juice",
        sizes: ["235 ml", "1000 ml"],
        price: 30,
        currency: "SAR",
        nutrition: { fat: "0g", calories: "120 kcal", carbs: "30g" },
        ingredients: "Water, mixed fruit puree (mango, guava, orange), sugar, citric acid.",
        images: { packshot: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&auto=format&fit=crop&q=60", decorations: [] }
      },
      {
        name: "Mango Premium Drink",
        slug: "mango-premium-drink",
        flavor: "Mango",
        category: "Juice",
        sizes: ["235 ml", "1000 ml"],
        price: 30,
        currency: "SAR",
        nutrition: { fat: "0g", calories: "140 kcal", carbs: "35g" },
        ingredients: "Water, mango puree, sugar, citric acid.",
        images: { packshot: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=60", decorations: [] }
      },
      {
        name: "Guava Premium Drink",
        slug: "guava-premium-drink",
        flavor: "Guava",
        category: "Juice",
        sizes: ["235 ml", "1000 ml"],
        price: 30,
        currency: "SAR",
        nutrition: { fat: "0g", calories: "110 kcal", carbs: "28g" },
        ingredients: "Water, guava puree, sugar, citric acid.",
        images: { packshot: "https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?w=800&auto=format&fit=crop&q=60", decorations: [] }
      },
      {
        name: "Orange Premium Drink",
        slug: "orange-premium-drink",
        flavor: "Orange",
        category: "Juice",
        sizes: ["235 ml", "1000 ml"],
        price: 30,
        currency: "SAR",
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
