import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'prayer', 'grace', 'sin'
  content: text("content").notNull(), // nullable for anonymous

  authorId: varchar("author_id"), // ← ADICIONADO

  likesCount: integer("likes_count").default(0).notNull(),
  isPardoned: boolean("is_pardoned").default(false).notNull(),
  isSpecial: boolean("is_special").default(false).notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
  reference: text("reference"), // used for verse
  reflection: text("reflection"), // used for verse
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).extend({
  content: z.string().min(1, "A mensagem não pode estar vazia")
}).omit({ 
  id: true,
  likesCount: true,
  isPardoned: true,
  isSpecial: true,
  createdAt: true 
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  messageId: integer("message_id").notNull(),
  type: text("type").notNull(), // 'like', 'pardon'
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  messageId: integer("message_id"),
  stripeSessionId: varchar("stripe_session_id").unique(),
  status: varchar("status").default("pending").notNull(),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Payment = typeof payments.$inferSelect;

export type CreateMessageRequest = InsertMessage;
export type UpdateMessageRequest = Partial<InsertMessage> & { likesCount?: number; isPardoned?: boolean; isSpecial?: boolean };
export type MessageResponseType = Message & { authorName?: string; authorCity?: string };
