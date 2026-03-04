import { db } from "./db";
import {
  messages,
  notifications,
  payments,
  type Message,
  type InsertMessage,
  type UpdateMessageRequest,
  type Notification,
  type InsertNotification,
  type Payment,
} from "@shared/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export interface IStorage {
  getMessages(type?: string, authorId?: string): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, updates: UpdateMessageRequest): Promise<Message>;
  deleteMessage(id: number): Promise<void>;
  deleteMessages(ids: number[]): Promise<void>;
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notif: InsertNotification): Promise<Notification>;
  markNotificationsRead(userId: string): Promise<void>;
  createPayment(data: { userId: string; messageId: number | null; stripeSessionId: string; amount: number; status?: string }): Promise<Payment>;
  getPaymentBySessionId(sessionId: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  getAllMessages(): Promise<Message[]>;
  anonymizeUserMessages(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getMessages(type?: string, authorId?: string): Promise<Message[]> {
    if (type && authorId) {
      return await db.select().from(messages).where(and(eq(messages.type, type), eq(messages.authorId, authorId))).orderBy(desc(messages.createdAt));
    } else if (type) {
      return await db.select().from(messages).where(and(eq(messages.type, type), eq(messages.isPrivate, false))).orderBy(desc(messages.createdAt));
    } else if (authorId) {
      return await db.select().from(messages).where(eq(messages.authorId, authorId)).orderBy(desc(messages.createdAt));
    }
    return await db.select().from(messages).where(eq(messages.isPrivate, false)).orderBy(desc(messages.createdAt));
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [msg] = await db.select().from(messages).where(eq(messages.id, id));
    return msg;
  }

  async createMessage(insertMsg: InsertMessage & { isSpecial?: boolean; isPrivate?: boolean }): Promise<Message> {
    const [msg] = await db.insert(messages).values(insertMsg).returning();
    return msg;
  }

  async updateMessage(id: number, updates: UpdateMessageRequest): Promise<Message> {
    const [updated] = await db.update(messages)
      .set(updates)
      .where(eq(messages.id, id))
      .returning();
    return updated;
  }

  async deleteMessage(id: number): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }

  async deleteMessages(ids: number[]): Promise<void> {
    await db.delete(messages).where(inArray(messages.id, ids));
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notif: InsertNotification): Promise<Notification> {
    const [inserted] = await db.insert(notifications).values(notif).returning();
    return inserted;
  }

  async markNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async anonymizeUserMessages(userId: string): Promise<void> {
    await db.update(messages).set({ authorId: null }).where(eq(messages.authorId, userId));
  }

  async createPayment(data: { userId: string; messageId: number | null; stripeSessionId: string; amount: number; status?: string }): Promise<Payment> {
    const [payment] = await db.insert(payments).values({
      userId: data.userId,
      messageId: data.messageId,
      stripeSessionId: data.stripeSessionId,
      amount: data.amount,
      status: data.status || "pending",
    }).returning();
    return payment;
  }

  async getPaymentBySessionId(sessionId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.stripeSessionId, sessionId));
    return payment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const [updated] = await db.update(payments).set({ status }).where(eq(payments.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
