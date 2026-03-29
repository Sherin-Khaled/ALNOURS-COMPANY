import { db } from "./db";
import { and, eq } from "drizzle-orm";
import {
  users, addresses, products, orders, checkoutSessions,
  type User, type InsertUser,
  type Address, type InsertAddress,
  type Product,
  type Order,
  type CheckoutSession
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<void>;
  updateUserOdooPartnerId(id: number, partnerId: number): Promise<void>;
  
  getAddressesByUserId(userId: number): Promise<Address[]>;
  getAddressByIdForUser(id: number, userId: number): Promise<Address | undefined>;
  createAddress(address: InsertAddress & { userId: number }): Promise<Address>;
  updateAddress(id: number, userId: number, data: Partial<InsertAddress>): Promise<Address | undefined>;
  
  getProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: typeof products.$inferInsert): Promise<Product>;
  updateProduct(id: number, data: Partial<typeof products.$inferInsert>): Promise<void>;
  
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderByOrderNo(orderNo: string): Promise<Order | undefined>;
  getOrderByMoyasarPaymentId(paymentId: string): Promise<Order | undefined>;
  createOrder(order: Omit<typeof orders.$inferInsert, "date" | "id" | "orderNo">): Promise<Order>;
  updateOrder(id: number, data: Partial<typeof orders.$inferInsert>): Promise<Order | undefined>;

  getCheckoutSessionById(id: number): Promise<CheckoutSession | undefined>;
  getCheckoutSessionByMoyasarPaymentId(paymentId: string): Promise<CheckoutSession | undefined>;
  createCheckoutSession(session: Omit<typeof checkoutSessions.$inferInsert, "createdAt" | "id" | "updatedAt">): Promise<CheckoutSession>;
  updateCheckoutSession(id: number, data: Partial<typeof checkoutSessions.$inferInsert>): Promise<CheckoutSession | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<void> {
    await db.update(users).set(data).where(eq(users.id, id));
  }

  async updateUserOdooPartnerId(id: number, partnerId: number): Promise<void> {
    await db.update(users).set({ odooPartnerId: partnerId }).where(eq(users.id, id));
  }

  // Addresses
  async getAddressesByUserId(userId: number): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async getAddressByIdForUser(id: number, userId: number): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(
      and(eq(addresses.id, id), eq(addresses.userId, userId))
    );
    return address;
  }

  async createAddress(insertAddress: InsertAddress & { userId: number }): Promise<Address> {
    // If it's the first address, make it default
    const existing = await this.getAddressesByUserId(insertAddress.userId);
    const isDefault = existing.length === 0 ? true : (insertAddress.isDefault || false);
    
    if (isDefault && existing.length > 0) {
      // Clear other defaults
      await db.update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, insertAddress.userId));
    }
    
    const [address] = await db.insert(addresses).values({
      ...insertAddress,
      isDefault
    }).returning();
    return address;
  }

  async updateAddress(id: number, userId: number, data: Partial<InsertAddress>): Promise<Address | undefined> {
    const existingAddress = await this.getAddressByIdForUser(id, userId);
    if (!existingAddress) {
      return undefined;
    }

    if (data.isDefault) {
      await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    }

    const [updated] = await db.update(addresses)
      .set(data)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .returning();
    return updated;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(insertProduct: typeof products.$inferInsert): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, data: Partial<typeof products.$inferInsert>): Promise<void> {
    await db.update(products).set(data).where(eq(products.id, id));
  }

  // Orders
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByOrderNo(orderNo: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNo, orderNo));
    return order;
  }

  async getOrderByMoyasarPaymentId(paymentId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.moyasarPaymentId, paymentId));
    return order;
  }

  async createOrder(insertOrder: Omit<typeof orders.$inferInsert, "date" | "id" | "orderNo">): Promise<Order> {
    const orderNo = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const [order] = await db.insert(orders).values({
      ...insertOrder,
      orderNo,
      date: new Date()
    }).returning();
    return order;
  }

  async updateOrder(id: number, data: Partial<typeof orders.$inferInsert>): Promise<Order | undefined> {
    const [order] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return order;
  }

  // Checkout sessions
  async getCheckoutSessionById(id: number): Promise<CheckoutSession | undefined> {
    const [session] = await db.select().from(checkoutSessions).where(eq(checkoutSessions.id, id));
    return session;
  }

  async getCheckoutSessionByMoyasarPaymentId(paymentId: string): Promise<CheckoutSession | undefined> {
    const [session] = await db.select().from(checkoutSessions).where(eq(checkoutSessions.moyasarPaymentId, paymentId));
    return session;
  }

  async createCheckoutSession(
    session: Omit<typeof checkoutSessions.$inferInsert, "createdAt" | "id" | "updatedAt">
  ): Promise<CheckoutSession> {
    const [created] = await db.insert(checkoutSessions).values({
      ...session,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return created;
  }

  async updateCheckoutSession(
    id: number,
    data: Partial<typeof checkoutSessions.$inferInsert>
  ): Promise<CheckoutSession | undefined> {
    const [session] = await db.update(checkoutSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(checkoutSessions.id, id))
      .returning();
    return session;
  }
}

export const storage = new DatabaseStorage();
