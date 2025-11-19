import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (Required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  avatar: varchar("avatar", { length: 10 }).default("cat"), // dog, cat, bird, lion, bear, cow, rabbit, panda
  isAdmin: boolean("is_admin").default(false).notNull(),
  isBlocked: boolean("is_blocked").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Bank accounts table
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountNumber: varchar("account_number", { length: 16 }).notNull().unique(),
  bsb: varchar("bsb", { length: 6 }),
  routingNumber: varchar("routing_number", { length: 9 }),
  swiftCode: varchar("swift_code", { length: 11 }),
  branchCode: varchar("branch_code", { length: 6 }),
  region: varchar("region", { length: 2 }).notNull(), // AU, US, NZ
  balance: decimal("balance", { precision: 16, scale: 2 }).default("0.00").notNull(),
  accountType: varchar("account_type", { length: 20 }).default("checking").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

// Cards table (Debit and Credit)
export const cards = pgTable("cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  cardNumber: varchar("card_number", { length: 16 }).notNull().unique(),
  cardType: varchar("card_type", { length: 10 }).notNull(), // debit, credit
  cvv: varchar("cvv", { length: 3 }).notNull(),
  expiryMonth: varchar("expiry_month", { length: 2 }).notNull(),
  expiryYear: varchar("expiry_year", { length: 4 }).notNull(),
  cardholderName: varchar("cardholder_name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCardSchema = createInsertSchema(cards).omit({
  id: true,
  createdAt: true,
});

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromAccountId: varchar("from_account_id").references(() => accounts.id, { onDelete: 'set null' }),
  toAccountId: varchar("to_account_id").references(() => accounts.id, { onDelete: 'set null' }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // transfer, bill_pay, payid, deposit, withdrawal, admin_credit
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, approved, declined, completed
  description: text("description"),
  reference: varchar("reference"),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }), // For admin transactions
  availableAt: timestamp("available_at"), // When funds become available
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Access codes table (for login verification)
export const accessCodes = pgTable("access_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 8 }).notNull().unique(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  isUsed: boolean("is_used").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

export const insertAccessCodeSchema = createInsertSchema(accessCodes).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export type InsertAccessCode = z.infer<typeof insertAccessCodeSchema>;
export type AccessCode = typeof accessCodes.$inferSelect;

// PayID registrations
export const payIds = pgTable("pay_ids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  payIdType: varchar("pay_id_type", { length: 20 }).notNull(), // email, phone, abn
  payIdValue: varchar("pay_id_value").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPayIdSchema = createInsertSchema(payIds).omit({
  id: true,
  createdAt: true,
});

export type InsertPayId = z.infer<typeof insertPayIdSchema>;
export type PayId = typeof payIds.$inferSelect;
