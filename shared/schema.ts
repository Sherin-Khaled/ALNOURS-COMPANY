import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  phone: text("phone").notNull(),
  odooPartnerId: integer("odoo_partner_id"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  addressLine: text("address_line").notNull(),
  country: text("country").default("Saudi Arabia"),
  postalCode: text("postal_code"),
  isDefault: boolean("is_default").default(false).notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  slug: text("slug").notNull().unique(),
  flavor: text("flavor").notNull(),
  category: text("category").notNull(),
  sizes: jsonb("sizes").$type<string[]>().notNull(),
  price: integer("price").notNull(),
  currency: text("currency").default("SAR").notNull(),
  defaultCode: text("default_code"),
  description: text("description"),
  nutrition: jsonb("nutrition").$type<{
    fat: string;
    calories: string;
    carbs: string;
    protein?: string;
  }>().notNull(),
  ingredients: text("ingredients").notNull(),
  images: jsonb("images").$type<{
    packshot: string;
    decorations: string[];
  }>().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderNo: text("order_no").notNull().unique(),
  date: timestamp("date").defaultNow().notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull(),
  paymentMethod: text("payment_method").default("cod"),
  paymentStatus: text("payment_status").default("pending"),
  shippingAddress: jsonb("shipping_address").$type<{
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    country: string;
    postalCode?: string;
  }>(),
  items: jsonb("items").$type<{
    productId: number;
    name: string;
    quantity: number;
    size: string;
    price: number;
    image?: string;
  }[]>(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, userId: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, date: true, orderNo: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
