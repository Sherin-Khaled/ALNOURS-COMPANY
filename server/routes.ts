import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { syncProductsFromOdoo, createOrUpdatePartner, createOrUpdateDeliveryAddress, createOrUpdateInvoiceAddress, createSalesOrder, getSalesOrderStatesByClientRefs, isOdooConfigured, createCrmLead, getLocalizedOdooProductDescription } from "./odoo";
import nodemailer from "nodemailer";
import { checkoutSessions, orders, type CheckoutSession, type Order, type PaymentStatus, type User } from "@shared/schema";
import { db } from "./db";
import { createMoyasarPayment, fetchMoyasarPayment, getMoyasarConfigError, getMoyasarPublishableKey, getMoyasarWebhookSecret, isMoyasarLiveMode, mapMoyasarStatusToPaymentStatus, type MoyasarPayment, type MoyasarWebhookEvent } from "./moyasar";
import { destroySession, getSessionCookieClearOptions, getSessionCookieName, getSessionUserId, regenerateSession, saveSession } from "./session";
import { hashPassword, verifyPasswordHash } from "./passwords";
import { createRateLimiter, getClientIp, normalizeRateLimitValue } from "./rate-limit";
import { resolvePublicAppBaseUrl } from "./config";
import { assertPromoEligibility, calculatePromoPricing, normalizePromoCode, promotionRequiresAuthenticatedUser } from "./promotions";

type MailTransporter = ReturnType<typeof nodemailer.createTransport>;

type SmtpConfig = {
  from: string;
  host: string;
  pass: string;
  port: number;
  secure: boolean;
  user: string;
};

const SHIPPING_COST = 10;
const PRODUCT_DESCRIPTION_FALLBACKS = {
  "cocktail-premium-drink": {
    en: "Water, Fruit Juice (Apple / Guava Pulp / Pineapple / Passion Fruit / Banana / Peach) not less than 10%, Sugar, Citric Acid (E330), Food Colors (Caramel) (E150D), Food Flavors, Total Soluble Solid 8% (min.)",
    ar: "ماء، عصير فواكه (تفاح / لب جوافة / أناناس / باشن فروت / موز / خوخ) بنسبة لا تقل عن 10%، سكر، حمض الستريك (E330)، ألوان غذائية (كراميل) (E150D)، نكهات غذائية، مواد صلبة ذائبة كلية 8% كحد أدنى.",
  },
  "guava-premium-drink": {
    en: "Water, Guava Pulp not less than 10%, Sugar, Citric Acid (E330), Food Stabilizer (E466), Ascorbic Acid (E300), Total Soluble Solid 8% (min.)",
    ar: "ماء، لب جوافة بنسبة لا تقل عن 10%، سكر، حمض الستريك (E330)، مُثبت غذائي (E466)، حمض الأسكوربيك (E300)، مواد صلبة ذائبة كلية 8% كحد أدنى.",
  },
  "mango-premium-drink": {
    en: "Water, Mango Pulp not less than 10%, Sugar, Citric Acid (E330), Food Stabilizer (E466) (E415), Ascorbic Acid (E300), Food Color (Beta Carotene) (E160A), Total Soluble Solid 8% (min.)",
    ar: "ماء، لب مانجو بنسبة لا تقل عن 10%، سكر، حمض الستريك (E330)، مُثبت غذائي (E466) و(E415)، حمض الأسكوربيك (E300)، لون غذائي (بيتا كاروتين) (E160A)، مواد صلبة ذائبة كلية 8% كحد أدنى.",
  },
  "orange-premium-drink": {
    en: "Water, Orange Concentrate not less than 10%, Sugar, Citric Acid (E330), Vitamin C (E300), Food Colors (Beta Carotene) (E160A), Food Flavors, Total Soluble Solid 8% (min.)",
    ar: "ماء، مركز برتقال بنسبة لا تقل عن 10%، سكر، حمض الستريك (E330)، فيتامين C (E300)، ألوان غذائية (بيتا كاروتين) (E160A)، نكهات غذائية، مواد صلبة ذائبة كلية 8% كحد أدنى.",
  },
} as const;

type OrderCreateItemInput = {
  productId: number;
  quantity: number;
  size: string;
};

type OdooOrderItem = {
  defaultCode: string;
  price: number;
  quantity: number;
};

type ShippingAddress = NonNullable<Order["shippingAddress"]>;
type StoredOrderItems = NonNullable<Order["items"]>;

type OrderDraft = {
  discountAmount: number;
  orderItems: OdooOrderItem[];
  promoCode: string | null;
  subtotal: number;
  shippingCost: number;
  storedItems: StoredOrderItems;
  total: number;
};

type WebsiteOrderCreateParams = {
  discountAmount: number;
  items: StoredOrderItems;
  moyasarPaymentId?: string | null;
  orderItems: OdooOrderItem[];
  paymentMethod: "card" | "cod";
  paymentStatus: PaymentStatus;
  promoCode: string | null;
  shippingAddress: ShippingAddress;
  shippingCost: number;
  total: number;
  userId: number;
};

const MOYASAR_FINALIZATION_LOCK_NAMESPACE = 9021;
const MAX_ORDER_ITEM_QUANTITY = 99;
const FORGOT_PASSWORD_GENERIC_SUCCESS_MESSAGE = "If an account exists for this email address, a password reset email has been sent.";
type PublicUser = Omit<User, "password" | "passwordHash" | "resetToken" | "resetTokenExpiry">;

function toPublicUser(user: User): PublicUser {
  const { password, passwordHash, resetToken, resetTokenExpiry, ...publicUser } = user;
  return publicUser;
}

function requireAuthenticatedUserId(req: Request, res: Response) {
  const userId = getSessionUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Not authenticated" });
    return null;
  }

  return userId;
}

async function establishUserSession(req: Request, userId: number) {
  await regenerateSession(req);
  req.session.userId = userId;
  await saveSession(req);
}

async function verifyAndUpgradeUserPassword(user: User, candidatePassword: string) {
  if (user.passwordHash) {
    const passwordMatches = await verifyPasswordHash(candidatePassword, user.passwordHash);
    if (!passwordMatches) {
      return false;
    }

    if (user.password) {
      await storage.updateUser(user.id, { password: null } as any);
    }

    return true;
  }

  if (user.password === candidatePassword) {
    const passwordHash = await hashPassword(candidatePassword);
    await storage.updateUser(user.id, {
      password: null,
      passwordHash,
    } as any);
    return true;
  }

  return false;
}

function parseSmtpSecure(value: string | undefined): boolean | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;

  return null;
}

function getSmtpConfig(): { config: SmtpConfig | null; error: string | null } {
  const host = process.env.SMTP_HOST?.trim();
  const portValue = process.env.SMTP_PORT?.trim();
  const secure = parseSmtpSecure(process.env.SMTP_SECURE);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM?.trim();

  const missingOrInvalidVars = [
    !host ? "SMTP_HOST" : null,
    !portValue ? "SMTP_PORT" : null,
    secure === null ? "SMTP_SECURE" : null,
    !user ? "SMTP_USER" : null,
    !pass ? "SMTP_PASS" : null,
    !from ? "SMTP_FROM" : null,
  ].filter((value): value is string => Boolean(value));

  if (missingOrInvalidVars.length > 0) {
    return {
      config: null,
      error: `Missing or invalid SMTP configuration: ${missingOrInvalidVars.join(", ")}`,
    };
  }

  const port = Number.parseInt(portValue!, 10);
  if (!Number.isFinite(port) || port <= 0) {
    return {
      config: null,
      error: "Missing or invalid SMTP configuration: SMTP_PORT",
    };
  }

  return {
    config: {
      from: from!,
      host: host!,
      pass: pass!,
      port,
      secure: secure!,
      user: user!,
    },
    error: null,
  };
}

function createMailTransporter(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

async function sendPasswordResetEmail(transporter: MailTransporter, toEmail: string, token: string, baseUrl: string) {
    console.warn("[mail] SMTP not configured — reset link not sent. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.");
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

async function sendPasswordResetEmailWithTransporter(
  transporter: MailTransporter,
  smtpConfig: SmtpConfig,
  toEmail: string,
  token: string,
  baseUrl: string
) {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const info = await transporter.sendMail({
    from: `ALNOURS <${smtpConfig.from}>`,
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

  const deliveryInfo = info as {
    accepted?: string[];
    messageId?: string;
    rejected?: string[];
    response?: string;
  };

  if (Array.isArray(deliveryInfo.rejected) && deliveryInfo.rejected.length > 0) {
    throw new Error(`SMTP rejected recipient(s): ${deliveryInfo.rejected.join(", ")}`);
  }

  if (Array.isArray(deliveryInfo.accepted) && deliveryInfo.accepted.length === 0) {
    throw new Error("SMTP server did not accept the password reset email.");
  }

  return deliveryInfo;
}

function mapOdooSaleOrderStateToWebsiteStatus(state?: string | null): string | undefined {
  if (state === "draft" || state === "sent") {
    return "Processing";
  }

  if (state === "sale" || state === "done") {
    return "Verified";
  }

  if (state === "cancel") {
    return "Cancelled";
  }

  return undefined;
}

function shouldKeepLocalOrderStatus(status: string): boolean {
  return status === "Delivered" || status === "Cancelled";
}

function fallbackWebsiteOrderStatus(order: Order): Order {
  if (shouldKeepLocalOrderStatus(order.status)) {
    return order;
  }

  return order.status === "Verified"
    ? { ...order, status: "Processing" }
    : order;
}

async function syncOrdersWithOdooStatuses(localOrders: Order[]): Promise<Order[]> {
  if (!isOdooConfigured() || localOrders.length === 0) {
    return localOrders;
  }

  try {
    const stateByClientRef = await getSalesOrderStatesByClientRefs(localOrders.map((order) => order.orderNo));

    return localOrders.map((order) => {
      if (shouldKeepLocalOrderStatus(order.status)) {
        return order;
      }

      const mappedStatus = mapOdooSaleOrderStateToWebsiteStatus(stateByClientRef[order.orderNo]);
      return mappedStatus ? { ...order, status: mappedStatus } : fallbackWebsiteOrderStatus(order);
    });
  } catch (err) {
    console.error("[odoo] Failed to sync website order statuses:", (err as Error).message);
    return localOrders.map(fallbackWebsiteOrderStatus);
  }
}

async function ensureOrderPaymentSchema() {
  await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS moyasar_payment_id text`);
  await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid'`);
  await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost integer`);
  await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount integer`);
  await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code text`);
  await db.execute(sql`ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'unpaid'`);
  await db.execute(sql`UPDATE orders SET payment_status = 'unpaid' WHERE payment_status IS NULL`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS checkout_sessions (
      id serial PRIMARY KEY,
      user_id integer NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      total integer NOT NULL,
      shipping_cost integer NOT NULL,
      discount_amount integer,
      promo_code text,
      payment_method text DEFAULT 'card' NOT NULL,
      payment_status text DEFAULT 'unpaid' NOT NULL,
      moyasar_payment_id text,
      order_id integer,
      shipping_address jsonb NOT NULL,
      items jsonb NOT NULL,
      odoo_items jsonb NOT NULL
    )
  `);
  await db.execute(sql`ALTER TABLE checkout_sessions ADD COLUMN IF NOT EXISTS discount_amount integer`);
  await db.execute(sql`ALTER TABLE checkout_sessions ADD COLUMN IF NOT EXISTS promo_code text`);
}

async function ensureUserPasswordSchema() {
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`);
  await db.execute(sql`ALTER TABLE users ALTER COLUMN password DROP NOT NULL`);
}

function getCheckoutCallbackBaseUrl(req: { get(name: string): string | undefined; headers: Record<string, unknown>; protocol: string }) {
  return resolvePublicAppBaseUrl(req);
}

function getProductDescriptionFallback(slug: string, locale: "en" | "ar") {
  return PRODUCT_DESCRIPTION_FALLBACKS[slug as keyof typeof PRODUCT_DESCRIPTION_FALLBACKS]?.[locale] ?? null;
}

async function buildOrderDraft(
  items: OrderCreateItemInput[],
  promoCode?: string | null,
  userId?: number | null,
): Promise<OrderDraft> {
  if (items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  const allProducts = await storage.getProducts();
  const productsById = new Map(allProducts.map((product) => [product.id, product]));
  let subtotal = 0;
  const baseShippingCost = items.length > 0 ? SHIPPING_COST : 0;
  const orderItems: OrderDraft["orderItems"] = [];
  const storedItems: OrderDraft["storedItems"] = [];

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_ORDER_ITEM_QUANTITY) {
      throw new Error("Invalid item quantity");
    }

    const normalizedSize = item.size.trim();
    if (!normalizedSize) {
      throw new Error("Invalid item size");
    }

    const product = productsById.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    const price = product.price;
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Product ${item.productId} has an invalid price`);
    }

    subtotal += item.quantity * price;
    storedItems.push({
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      size: normalizedSize,
      price,
      image: product.images?.packshot,
    });

    if (product.defaultCode) {
      orderItems.push({
        defaultCode: product.defaultCode,
        quantity: item.quantity,
        price,
      });
    }
  }

  const normalizedPromoCode = normalizePromoCode(promoCode);
  if (normalizedPromoCode && promotionRequiresAuthenticatedUser(normalizedPromoCode) && !userId) {
    throw new Error("Please sign in to use this promo code");
  }

  if (normalizedPromoCode && userId) {
    const existingOrders = await storage.getOrdersByUserId(userId);
    const hasPlacedOrder = existingOrders.length > 0;
    const hasUsedPromo = existingOrders.some(
      (order) => normalizePromoCode(order.promoCode) === normalizedPromoCode,
    );

    assertPromoEligibility({
      hasPlacedOrder,
      hasUsedPromo,
      promoCode: normalizedPromoCode,
      subtotal,
    });
  } else {
    assertPromoEligibility({
      promoCode: normalizedPromoCode,
      subtotal,
    });
  }

  const pricing = calculatePromoPricing({
    promoCode: normalizedPromoCode,
    shippingCost: baseShippingCost,
    subtotal,
  });

  return {
    discountAmount: pricing.discountAmount,
    orderItems,
    promoCode: pricing.promoCode,
    shippingCost: pricing.shippingCost,
    storedItems,
    subtotal: pricing.subtotal,
    total: pricing.total,
  };
}

function recalculateStoredOrderTotal(order: Order) {
  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const pricing = calculatePromoPricing({
    promoCode: order.promoCode,
    shippingCost: order.shippingCost ?? (items.length > 0 ? SHIPPING_COST : 0),
    subtotal,
  });

  return {
    discountAmount: pricing.discountAmount,
    promoCode: pricing.promoCode,
    shippingCost: pricing.shippingCost,
    subtotal: pricing.subtotal,
    total: pricing.total,
  };
}

async function createWebsiteOrder(params: {
  discountAmount: number;
  items: StoredOrderItems;
  moyasarPaymentId?: string | null;
  orderItems: OdooOrderItem[];
  paymentMethod: "card" | "cod";
  paymentStatus: PaymentStatus;
  promoCode: string | null;
  shippingAddress: ShippingAddress;
  shippingCost: number;
  total: number;
  userId: number;
}): Promise<Order> {
  const order = await createLocalWebsiteOrder(params);
  await syncWebsiteOrderToOdoo(order, params);

  return order;
}

function buildWebsiteOrderInsert(params: WebsiteOrderCreateParams): Omit<typeof orders.$inferInsert, "date" | "id" | "orderNo"> {
  return {
    discountAmount: params.discountAmount,
    promoCode: params.promoCode,
    shippingCost: params.shippingCost,
    userId: params.userId,
    total: params.total,
    status: "Processing",
    paymentMethod: params.paymentMethod,
    paymentStatus: params.paymentStatus,
    moyasarPaymentId: params.moyasarPaymentId || null,
    shippingAddress: params.shippingAddress,
    items: params.items,
  };
}

function generateWebsiteOrderNo() {
  return `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
}

async function createLocalWebsiteOrder(params: WebsiteOrderCreateParams): Promise<Order> {
  const order = await storage.createOrder(buildWebsiteOrderInsert(params));

  return order;
}

async function syncWebsiteOrderToOdoo(order: Order, params: Pick<WebsiteOrderCreateParams, "discountAmount" | "orderItems" | "paymentMethod" | "promoCode" | "shippingAddress" | "shippingCost">) {
  if (isOdooConfigured() && params.orderItems.length > 0) {
    try {
      const user = await storage.getUser(order.userId);
      if (user) {
        const addr = params.shippingAddress;
        const partnerId = await createOrUpdatePartner({
          firstName: user.firstName || addr.fullName.split(" ")[0] || addr.fullName,
          lastName: user.lastName || addr.fullName.split(" ").slice(1).join(" ") || null,
          email: user.email || addr.email,
          phone: user.phone || addr.phone,
        }, {
          city: addr.city,
          addressLine: addr.street,
          country: addr.country,
          postalCode: addr.postalCode,
        }, user.odooPartnerId || undefined);
        if (!user.odooPartnerId || user.odooPartnerId !== partnerId) {
          await storage.updateUserOdooPartnerId(user.id, partnerId);
        }

        const shippingPartnerId = await createOrUpdateDeliveryAddress(partnerId, {
          city: addr.city,
          addressLine: addr.street,
          country: addr.country,
          postalCode: addr.postalCode,
        });

        const invoicePartnerId = await createOrUpdateInvoiceAddress(partnerId, {
          city: addr.city,
          addressLine: addr.street,
          country: addr.country,
          postalCode: addr.postalCode,
        });

        await createSalesOrder(partnerId, params.orderItems, order.orderNo, {
          discountAmount: params.discountAmount,
          shippingPartnerId,
          invoicePartnerId,
          promoCode: params.promoCode,
          shippingCost: params.shippingCost,
          paymentMethod: params.paymentMethod,
        });
      }
    } catch (odooErr) {
      console.error("[odoo] Failed to create order in Odoo:", (odooErr as Error).message);
    }
  }
}

function assertMoyasarPaymentMatchesCheckoutSession(session: CheckoutSession, payment: MoyasarPayment) {
  if (payment.currency !== "SAR") {
    throw new Error("Moyasar payment currency mismatch");
  }

  if (payment.amount !== session.total * 100) {
    throw new Error("Moyasar payment amount mismatch");
  }

  const metadataSessionId = Number.parseInt(payment.metadata?.checkoutSessionId || "", 10);
  if (Number.isFinite(metadataSessionId) && metadataSessionId !== session.id) {
    throw new Error("Moyasar checkout session mismatch");
  }

  const metadataUserId = Number.parseInt(payment.metadata?.userId || "", 10);
  if (Number.isFinite(metadataUserId) && metadataUserId !== session.userId) {
    throw new Error("Moyasar checkout session user mismatch");
  }
}

async function resolveCheckoutSessionFromMoyasarPayment(payment: MoyasarPayment): Promise<CheckoutSession | undefined> {
  const byPaymentId = await storage.getCheckoutSessionByMoyasarPaymentId(payment.id);
  if (byPaymentId) {
    return byPaymentId;
  }

  const metadataSessionId = Number.parseInt(payment.metadata?.checkoutSessionId || "", 10);
  if (Number.isFinite(metadataSessionId)) {
    return storage.getCheckoutSessionById(metadataSessionId);
  }

  return undefined;
}

async function persistCheckoutSessionPaymentState(
  session: CheckoutSession,
  payment: MoyasarPayment,
  nextStatus?: PaymentStatus
) {
  const paymentStatus = nextStatus || mapMoyasarStatusToPaymentStatus(payment.status);
  const updatedSession = await storage.updateCheckoutSession(session.id, {
    moyasarPaymentId: payment.id,
    paymentStatus,
  });

  return {
    paymentStatus,
    session: updatedSession || { ...session, moyasarPaymentId: payment.id, paymentStatus },
  };
}

async function finalizeCardCheckoutSession(session: CheckoutSession, payment: MoyasarPayment): Promise<Order> {
  let createdOrder: Order | undefined;

  const order = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${payment.id}), ${MOYASAR_FINALIZATION_LOCK_NAMESPACE})`);

    const [lockedSession] = await tx
      .select()
      .from(checkoutSessions)
      .where(eq(checkoutSessions.id, session.id));

    if (!lockedSession) {
      throw new Error("Checkout session not found");
    }

    const sessionFinalizationUpdate = {
      moyasarPaymentId: payment.id,
      orderId: lockedSession.orderId,
      paymentStatus: "paid" as const,
      updatedAt: new Date(),
    };

    const [existingOrderByPayment] = await tx
      .select()
      .from(orders)
      .where(eq(orders.moyasarPaymentId, payment.id));

    if (existingOrderByPayment) {
      const [updatedExistingOrder] = await tx
        .update(orders)
        .set({
          paymentMethod: "card",
          paymentStatus: "paid",
          moyasarPaymentId: payment.id,
        })
        .where(eq(orders.id, existingOrderByPayment.id))
        .returning();

      if (
        lockedSession.orderId !== existingOrderByPayment.id ||
        lockedSession.paymentStatus !== "paid" ||
        lockedSession.moyasarPaymentId !== payment.id
      ) {
        await tx
          .update(checkoutSessions)
          .set({
            ...sessionFinalizationUpdate,
            orderId: existingOrderByPayment.id,
          })
          .where(eq(checkoutSessions.id, lockedSession.id));
      }

      return updatedExistingOrder || {
        ...existingOrderByPayment,
        paymentMethod: "card",
        paymentStatus: "paid",
        moyasarPaymentId: payment.id,
      };
    }

    if (lockedSession.orderId) {
      const [existingOrderBySession] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, lockedSession.orderId));

      if (existingOrderBySession) {
        const [updatedExistingOrder] = await tx
          .update(orders)
          .set({
            paymentMethod: "card",
            paymentStatus: "paid",
            moyasarPaymentId: payment.id,
          })
          .where(eq(orders.id, existingOrderBySession.id))
          .returning();

        if (lockedSession.paymentStatus !== "paid" || lockedSession.moyasarPaymentId !== payment.id) {
          await tx
            .update(checkoutSessions)
            .set(sessionFinalizationUpdate)
            .where(eq(checkoutSessions.id, lockedSession.id));
        }

        return updatedExistingOrder || {
          ...existingOrderBySession,
          paymentMethod: "card",
          paymentStatus: "paid",
          moyasarPaymentId: payment.id,
        };
      }
    }

    const [newOrder] = await tx
      .insert(orders)
      .values({
        ...buildWebsiteOrderInsert({
          discountAmount: lockedSession.discountAmount ?? 0,
          userId: lockedSession.userId,
          total: lockedSession.total,
          shippingCost: lockedSession.shippingCost,
          shippingAddress: lockedSession.shippingAddress,
          items: lockedSession.items,
          orderItems: lockedSession.odooItems,
          paymentMethod: "card",
          paymentStatus: "paid",
          promoCode: lockedSession.promoCode ?? null,
          moyasarPaymentId: payment.id,
        }),
        date: new Date(),
        orderNo: generateWebsiteOrderNo(),
      })
      .returning();

    if (!newOrder) {
      throw new Error("Failed to create order");
    }

    createdOrder = newOrder;

    await tx
      .update(checkoutSessions)
      .set({
        ...sessionFinalizationUpdate,
        orderId: newOrder.id,
      })
      .where(eq(checkoutSessions.id, lockedSession.id));

    return newOrder;
  });

  if (createdOrder) {
    await syncWebsiteOrderToOdoo(createdOrder, {
      discountAmount: session.discountAmount ?? 0,
      orderItems: session.odooItems,
      paymentMethod: "card",
      promoCode: session.promoCode ?? null,
      shippingAddress: session.shippingAddress,
      shippingCost: session.shippingCost,
    });
  }

  return order;
}

function assertMoyasarPaymentMatchesOrder(order: Order, payment: MoyasarPayment) {
  if (payment.currency !== "SAR") {
    throw new Error("Moyasar payment currency mismatch");
  }

  if (payment.amount !== order.total * 100) {
    throw new Error("Moyasar payment amount mismatch");
  }

  const metadataOrderId = Number.parseInt(payment.metadata?.orderId || "", 10);
  if (Number.isFinite(metadataOrderId) && metadataOrderId !== order.id) {
    throw new Error("Moyasar order mismatch");
  }

  const metadataUserId = Number.parseInt(payment.metadata?.userId || "", 10);
  if (Number.isFinite(metadataUserId) && metadataUserId !== order.userId) {
    throw new Error("Moyasar order user mismatch");
  }

  const metadataOrderNo = payment.metadata?.orderNo?.trim();
  if (metadataOrderNo && metadataOrderNo !== order.orderNo) {
    throw new Error("Moyasar order reference mismatch");
  }
}

async function resolveOrderFromMoyasarPayment(payment: MoyasarPayment): Promise<Order | undefined> {
  const byPaymentId = await storage.getOrderByMoyasarPaymentId(payment.id);
  if (byPaymentId) {
    return byPaymentId;
  }

  const metadataOrderId = Number.parseInt(payment.metadata?.orderId || "", 10);
  if (Number.isFinite(metadataOrderId)) {
    const byOrderId = await storage.getOrderById(metadataOrderId);
    if (byOrderId) {
      return byOrderId;
    }
  }

  const metadataOrderNo = payment.metadata?.orderNo?.trim();
  if (metadataOrderNo) {
    return storage.getOrderByOrderNo(metadataOrderNo);
  }

  return undefined;
}

async function persistOrderPaymentState(order: Order, payment: MoyasarPayment, nextStatus?: PaymentStatus) {
  const paymentStatus = nextStatus || mapMoyasarStatusToPaymentStatus(payment.status);
  const updatedOrder = await storage.updateOrder(order.id, {
    moyasarPaymentId: payment.id,
    paymentStatus,
  });

  return {
    order: updatedOrder || { ...order, moyasarPaymentId: payment.id, paymentStatus },
    paymentStatus,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await ensureUserPasswordSchema();
  await ensureOrderPaymentSchema();

  const loginRateLimiter = createRateLimiter({
    name: "auth-login",
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts. Please try again later.",
    keyGenerator: (req) => {
      const email = normalizeRateLimitValue(req.body?.email);
      return `${getClientIp(req)}:${email || "unknown"}`;
    },
  });

  const signupRateLimiter = createRateLimiter({
    name: "auth-signup",
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many signup attempts. Please try again later.",
    keyGenerator: (req) => {
      const email = normalizeRateLimitValue(req.body?.email);
      return `${getClientIp(req)}:${email || "unknown"}`;
    },
  });

  const forgotPasswordRateLimiter = createRateLimiter({
    name: "auth-forgot-password",
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many password reset requests. Please try again later.",
    keyGenerator: (req) => {
      const email = normalizeRateLimitValue(req.body?.email);
      return `${getClientIp(req)}:${email || "unknown"}`;
    },
  });

  const resetPasswordRateLimiter = createRateLimiter({
    name: "auth-reset-password",
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many password reset attempts. Please try again later.",
    keyGenerator: (req) => getClientIp(req),
  });

  const contactRateLimiter = createRateLimiter({
    name: "contact-submit",
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many contact requests. Please try again later.",
    keyGenerator: (req) => {
      const email = normalizeRateLimitValue(req.body?.email);
      return `${getClientIp(req)}:${email || "unknown"}`;
    },
  });

  const moyasarCreateRateLimiter = createRateLimiter({
    name: "moyasar-create",
    windowMs: 10 * 60 * 1000,
    max: 8,
    message: "Too many payment attempts. Please wait a moment and try again.",
    keyGenerator: (req) => {
      const userId = getSessionUserId(req);
      return `${userId ?? "anonymous"}:${getClientIp(req)}`;
    },
  });

  app.post(api.auth.signup.path, signupRateLimiter, async (req, res) => {
    try {
      const input = api.auth.signup.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const passwordHash = await hashPassword(input.password);
      const user = await storage.createUser({
        firstName: input.firstName,
        lastName: input.lastName || null,
        email: input.email,
        phone: input.phone,
        password: null,
        passwordHash,
      });
      await establishUserSession(req, user.id);
      res.status(201).json(toPublicUser(user));
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.auth.login.path, loginRateLimiter, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const passwordMatches = await verifyAndUpgradeUserPassword(user, input.password);
      if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      await establishUserSession(req, user.id);
      res.status(200).json(toPublicUser(user));
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      await destroySession(req).catch(() => undefined);
      res.clearCookie(getSessionCookieName(), getSessionCookieClearOptions());
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.status(200).json(toPublicUser(user));
  });

  app.patch(api.auth.updateProfile.path, async (req, res) => {
    const userId = requireAuthenticatedUserId(req, res);
    if (!userId) return;

    try {
      const input = api.auth.updateProfile.input.parse(req.body);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Email already exists" });
      }

      await storage.updateUser(userId, {
        firstName: input.firstName,
        lastName: input.lastName || null,
        email: input.email,
        phone: input.phone,
      } as any);

      const updatedUser = await storage.getUser(userId);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(toPublicUser(updatedUser));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }

      console.error("[auth] Profile update failed:", (err as Error).message);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.changePassword.path, async (req, res) => {
    const userId = requireAuthenticatedUserId(req, res);
    if (!userId) return;

    try {
      const input = api.auth.changePassword.input.parse(req.body);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const currentPasswordMatches = await verifyAndUpgradeUserPassword(user, input.currentPassword);
      if (!currentPasswordMatches) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const passwordHash = await hashPassword(input.newPassword);
      await storage.updateUser(user.id, {
        password: null,
        passwordHash,
      } as any);

      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }

      console.error("[auth] Password change failed:", (err as Error).message);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.logout.path, async (req, res) => {
    try {
      await destroySession(req);
      res.clearCookie(getSessionCookieName(), getSessionCookieClearOptions());
      res.status(200).json({ message: "Logged out" });
    } catch (err) {
      console.error("[auth] Logout failed:", (err as Error).message);
      res.status(500).json({ message: "Failed to log out" });
    }
  });

  app.post(api.auth.forgotPassword.path, forgotPasswordRateLimiter, async (req, res) => {
    try {
      const input = api.auth.forgotPassword.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user) {
        return res.status(200).json({ message: FORGOT_PASSWORD_GENERIC_SUCCESS_MESSAGE });
      }

      const { config: smtpConfig, error: smtpConfigError } = getSmtpConfig();
      if (!smtpConfig) {
        console.error(`[mail] ${smtpConfigError}`);
        return res.status(503).json({ message: smtpConfigError });
      }

      const transporter = createMailTransporter(smtpConfig);

      const token = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      await storage.updateUser(user.id, { resetToken: hashedToken, resetTokenExpiry: expiry } as any);
      const baseUrl = resolvePublicAppBaseUrl(req);

      try {
        const deliveryInfo = await sendPasswordResetEmailWithTransporter(
          transporter,
          smtpConfig,
          user.email,
          token,
          baseUrl
        );
        console.log(
          `[mail] Password reset email accepted by SMTP for ${user.email} (${deliveryInfo.messageId || deliveryInfo.response || "no response"})`
        );
      } catch (mailErr) {
        await storage.updateUser(user.id, { resetToken: null, resetTokenExpiry: null } as any);
        const message = mailErr instanceof Error ? mailErr.message : "Unknown SMTP error";
        console.error("[mail] Failed to send password reset email:", message);
        return res.status(502).json({ message: `Failed to send password reset email: ${message}` });
      }

      console.log(`[auth] Password reset requested for ${user.email}`);
      res.status(200).json({ message: FORGOT_PASSWORD_GENERIC_SUCCESS_MESSAGE });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      console.error("[auth] Forgot password failed:", (err as Error).message);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.resetPassword.path, resetPasswordRateLimiter, async (req, res) => {
    try {
      const input = api.auth.resetPassword.input.parse(req.body);
      const normalizedToken = input.token.trim();
      if (!normalizedToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hashedToken = crypto.createHash("sha256").update(normalizedToken).digest("hex");
      const user =
        await storage.getUserByResetToken(hashedToken) ??
        await storage.getUserByResetToken(normalizedToken);

      if (!user || !user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      const passwordHash = await hashPassword(input.password);
      await storage.updateUser(user.id, {
        password: null,
        passwordHash,
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

    const requestedLang =
      typeof req.query.lang === "string" && req.query.lang === "ar" ? "ar" : "en";
    const fallbackDescription = getProductDescriptionFallback(product.slug, requestedLang);

    if (!product.defaultCode) {
      return res.status(200).json({
        ...product,
        description: fallbackDescription ?? product.description ?? null,
      });
    }

    const localizedDescription = await getLocalizedOdooProductDescription(
      product.defaultCode,
      requestedLang
    );
    const description =
      localizedDescription ??
      fallbackDescription ??
      (requestedLang === "en" ? product.description ?? null : null);

    res.status(200).json({ ...product, description });
  });

  app.get(api.payments.moyasar.config.path, (_req, res) => {
    const configError = getMoyasarConfigError();
    if (configError) {
      return res.status(503).json({ message: configError });
    }

    res.status(200).json({ publishableKey: getMoyasarPublishableKey() });
  });

  app.post(api.promos.apply.path, async (req, res) => {
    try {
      const input = api.promos.apply.input.parse(req.body);
      const draft = await buildOrderDraft(input.items, input.promoCode, getSessionUserId(req));

      res.status(200).json({
        promoCode: draft.promoCode,
        subtotal: draft.subtotal,
        shipping: draft.shippingCost,
        discount: draft.discountAmount,
        total: draft.total,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }

      const message = err instanceof Error ? err.message : "Invalid request";
      return res.status(400).json({ message });
    }
  });

  app.get(api.orders.list.path, async (req, res) => {
    const userId = requireAuthenticatedUserId(req, res);
    if (!userId) return;

    const localOrders = await storage.getOrdersByUserId(userId);
    const syncedOrders = await syncOrdersWithOdooStatuses(localOrders);
    res.status(200).json(syncedOrders);
  });

  app.get(api.orders.get.path, async (req, res) => {
    const userId = requireAuthenticatedUserId(req, res);
    if (!userId) return;

    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) return res.status(400).json({ message: "Invalid order ID" });
    const order = await storage.getOrderById(orderId);
    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: "Order not found" });
    }
    const [syncedOrder] = await syncOrdersWithOdooStatuses([order]);
    res.status(200).json(syncedOrder);
  });

  app.post(api.orders.create.path, async (req, res) => {
    const userId = requireAuthenticatedUserId(req, res);
    if (!userId) return;

    try {
      const input = api.orders.create.input.parse(req.body);
      if (input.paymentMethod !== "cod") {
        return res.status(400).json({ message: "Card payments must be completed through the payment flow" });
      }

      const draft = await buildOrderDraft(input.items, input.promoCode, userId);
      if (draft.total <= 0 || draft.storedItems.length === 0) {
        return res.status(400).json({ message: "Invalid order total" });
      }
      const order = await createWebsiteOrder({
        discountAmount: draft.discountAmount,
        userId,
        total: draft.total,
        shippingCost: draft.shippingCost,
        shippingAddress: input.shippingAddress,
        items: draft.storedItems,
        orderItems: draft.orderItems,
        paymentMethod: input.paymentMethod,
        paymentStatus: "unpaid",
        promoCode: draft.promoCode,
      });

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(400).json({ message: "Invalid request" });
      }
    }
  });

  app.post(api.payments.moyasar.create.path, moyasarCreateRateLimiter, async (req, res) => {
    const userId = requireAuthenticatedUserId(req, res);
    if (!userId) return;

    const configError = getMoyasarConfigError();
    if (configError) {
      return res.status(503).json({ message: configError });
    }

    let checkoutSession: CheckoutSession | undefined;

    try {
      const input = api.payments.moyasar.create.input.parse(req.body);
      const draft = await buildOrderDraft(input.items, input.promoCode, userId);
      if (draft.total <= 0 || draft.storedItems.length === 0) {
        return res.status(400).json({ message: "Invalid order total" });
      }

      checkoutSession = await storage.createCheckoutSession({
        discountAmount: draft.discountAmount,
        userId,
        total: draft.total,
        promoCode: draft.promoCode,
        shippingCost: draft.shippingCost,
        paymentMethod: "card",
        paymentStatus: "unpaid",
        moyasarPaymentId: null,
        orderId: null,
        shippingAddress: input.shippingAddress,
        items: draft.storedItems,
        odooItems: draft.orderItems,
      });

      const payment = await createMoyasarPayment({
        amount: draft.total * 100,
        callbackUrl: `${getCheckoutCallbackBaseUrl(req)}/checkout/payment-return?checkoutSessionId=${checkoutSession.id}`,
        description: `Website Checkout Session ${checkoutSession.id}`,
        metadata: {
          checkoutSessionId: String(checkoutSession.id),
          userId: String(userId),
        },
        token: input.token,
      });

      assertMoyasarPaymentMatchesCheckoutSession(checkoutSession, payment);

      const persisted = await persistCheckoutSessionPaymentState(
        checkoutSession,
        payment,
        payment.status === "initiated" ? "pending" : undefined,
      );

      if (payment.status !== "initiated" || !payment.source?.transaction_url) {
        return res.status(400).json({
          message: payment.source?.message || "Payment could not be initiated",
        });
      }

      res.status(200).json({
        checkoutSessionId: checkoutSession.id,
        paymentId: payment.id,
        paymentStatus: persisted.paymentStatus,
        transactionUrl: payment.source.transaction_url,
      });
    } catch (err) {
      if (checkoutSession) {
        await storage.updateCheckoutSession(checkoutSession.id, {
          paymentStatus: "failed",
        }).catch(() => undefined);
      }

      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }

      const message = err instanceof Error ? err.message : "Failed to create Moyasar payment";
      console.error("[moyasar] Failed to create payment:", message);
      res.status(400).json({ message });
    }
  });

  app.post(api.payments.moyasar.verify.path, async (req, res) => {
    const userId = requireAuthenticatedUserId(req, res);
    if (!userId) return;

    const configError = getMoyasarConfigError();
    if (configError) {
      return res.status(503).json({ message: configError });
    }

    try {
      const input = api.payments.moyasar.verify.input.parse(req.body);
      const payment = await fetchMoyasarPayment(input.paymentId);
      const checkoutSession = input.checkoutSessionId
        ? await storage.getCheckoutSessionById(input.checkoutSessionId)
        : await resolveCheckoutSessionFromMoyasarPayment(payment);

      if (checkoutSession) {
        if (checkoutSession.userId !== userId) {
          return res.status(404).json({ message: "Checkout session not found" });
        }

        assertMoyasarPaymentMatchesCheckoutSession(checkoutSession, payment);
        const persistedSession = await persistCheckoutSessionPaymentState(checkoutSession, payment);
        let order: Order | undefined;

        if (persistedSession.paymentStatus === "paid") {
          order = await finalizeCardCheckoutSession(persistedSession.session, payment);
        } else if (persistedSession.session.orderId) {
          order = await storage.getOrderById(persistedSession.session.orderId);
        }

        return res.status(200).json({
          checkoutSessionId: persistedSession.session.id,
          orderId: order?.id || null,
          orderNo: order?.orderNo || null,
          paymentId: payment.id,
          paymentStatus: persistedSession.paymentStatus,
          moyasarStatus: payment.status,
        });
      }

      const order = input.orderId
        ? await storage.getOrderById(input.orderId)
        : await resolveOrderFromMoyasarPayment(payment);

      if (!order || order.userId !== userId) {
        return res.status(404).json({ message: "Order not found" });
      }

      assertMoyasarPaymentMatchesOrder(order, payment);
      const persisted = await persistOrderPaymentState(order, payment);

      res.status(200).json({
        checkoutSessionId: null,
        orderId: order.id,
        orderNo: order.orderNo,
        paymentId: payment.id,
        paymentStatus: persisted.paymentStatus,
        moyasarStatus: payment.status,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }

      const message = err instanceof Error ? err.message : "Failed to verify payment";
      console.error("[moyasar] Failed to verify payment:", message);
      res.status(400).json({ message });
    }
  });

  app.post("/api/payments/moyasar/webhook", async (req, res) => {
    const payload = req.body as MoyasarWebhookEvent;
    res.status(200).json({ received: true });

    void (async () => {
      try {
        if (!payload?.data?.id) {
          return;
        }

        if (payload.live !== isMoyasarLiveMode()) {
          console.warn("[moyasar] Ignored webhook with unexpected live/test mode.");
          return;
        }

        if ((payload.secret_token || "").trim() !== getMoyasarWebhookSecret()) {
          console.warn("[moyasar] Ignored webhook with invalid secret token.");
          return;
        }

        const eventType = (payload.type || "").toLowerCase();
        const supportedEvents = new Set([
          "payment_paid",
          "payment_failed",
          "payment_faild",
          "payment_authorized",
          "payment_captured",
          "payment_verified",
          "payment_voided",
          "payment_refunded",
        ]);

        if (eventType && !supportedEvents.has(eventType)) {
          return;
        }

        const checkoutSession = await resolveCheckoutSessionFromMoyasarPayment(payload.data);
        if (checkoutSession) {
          assertMoyasarPaymentMatchesCheckoutSession(checkoutSession, payload.data);
          const persistedSession = await persistCheckoutSessionPaymentState(checkoutSession, payload.data);
          if (persistedSession.paymentStatus === "paid") {
            await finalizeCardCheckoutSession(persistedSession.session, payload.data);
          }
          return;
        }

        const order = await resolveOrderFromMoyasarPayment(payload.data);
        if (!order) {
          console.warn(`[moyasar] Webhook payment ${payload.data.id} could not be matched to a checkout session or order.`);
          return;
        }

        assertMoyasarPaymentMatchesOrder(order, payload.data);
        await persistOrderPaymentState(order, payload.data);
      } catch (err) {
        console.error("[moyasar] Webhook processing failed:", (err as Error).message);
      }
    })();
  });

  app.get(api.addresses.list.path, async (req, res) => {
    const userId = requireAuthenticatedUserId(req, res);
    if (!userId) return;

    const addresses = await storage.getAddressesByUserId(userId);
    res.status(200).json(addresses);
  });

  app.post(api.addresses.create.path, async (req, res) => {
    const userId = requireAuthenticatedUserId(req, res);
    if (!userId) return;

    try {
      const input = api.addresses.create.input.parse(req.body);
      const address = await storage.createAddress({
        ...input,
        userId
      });
      res.status(201).json(address);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.patch('/api/addresses/:id', async (req, res) => {
    const userId = requireAuthenticatedUserId(req, res);
    if (!userId) return;

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid address ID" });
      const existingAddress = await storage.getAddressByIdForUser(id, userId);
      if (!existingAddress) {
        return res.status(404).json({ message: "Address not found" });
      }
      const input = api.addresses.update.input.parse(req.body);
      const address = await storage.updateAddress(id, userId, input);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.status(200).json(address);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.contact.submit.path, contactRateLimiter, async (req, res) => {
    try {
      const input = api.contact.submit.input.parse(req.body);

      if (!isOdooConfigured()) {
        console.error("[odoo] Contact form rejected - Odoo credentials are not configured");
        return res.status(503).json({ message: "We couldn't process your request right now. Please try again later or contact us directly." });
      }

      try {
        await createCrmLead({
          contactName: input.name,
          email: input.email,
          phone: input.phone || "",
          name: input.productInterest ? `Website Lead: ${input.productInterest}` : `Website Lead: ${input.name}`,
          description: `Source: Website contact form\n\n${input.message}`,
        });
        return res.status(200).json({ message: "Your message has been sent successfully. Our team will get back to you soon." });
      } catch (odooErr) {
        console.error("[odoo] Failed to create CRM lead:", (odooErr as Error).message);
        return res.status(502).json({ message: "We couldn't process your request right now. Please try again later or contact us directly." });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
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
