import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users, addresses, products, orders,
  type User, type InsertUser,
  type Address, type InsertAddress,
  type Product, type InsertProduct,
  type Order, type InsertOrder
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<void>;
  updateUserOdooPartnerId(id: number, partnerId: number): Promise<void>;
  
  getAddressesByUserId(userId: number): Promise<Address[]>;
  createAddress(address: InsertAddress & { userId: number }): Promise<Address>;
  
  getProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<void>;
  
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder & { userId: number }): Promise<Order>;
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

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<void> {
    await db.update(products).set(data).where(eq(products.id, id));
  }

  // Orders
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createOrder(insertOrder: InsertOrder & { userId: number }): Promise<Order> {
    const orderNo = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const [order] = await db.insert(orders).values({
      ...insertOrder,
      orderNo,
      date: new Date()
    }).returning();
    return order;
  }
}

export const storage = new DatabaseStorage();
