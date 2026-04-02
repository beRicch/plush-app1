import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 */

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const subscriptionTierEnum = pgEnum("subscriptionTier", ["free", "plush_member", "plush_ai", "plush_society"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatarUrl"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  moneyPersonality: varchar("moneyPersonality", { length: 255 }),
  monthlyIncomeRange: varchar("monthlyIncomeRange", { length: 50 }),
  incomeFrequency: varchar("incomeFrequency", { length: 20 }),
  weeklyCap: integer("weeklyCap"),
  monthlySavingsTarget: integer("monthlySavingsTarget"),
  weeklyAllowance: integer("weeklyAllowance"),
  subscriptionTier: subscriptionTierEnum("subscriptionTier").default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const expenses = pgTable("expenses", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  amount: integer("amount").notNull(),
  merchant: text("merchant").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  entryMethod: varchar("entryMethod", { length: 50 }).notNull(),
  notes: text("notes"),
  aiSoftComment: text("aiSoftComment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const savingsGoals = pgTable("savingsGoals", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  name: text("name").notNull(),
  targetAmount: integer("targetAmount").notNull(),
  currentAmount: integer("currentAmount").default(0).notNull(),
  targetDate: varchar("targetDate", { length: 10 }).notNull(),
  coverTheme: varchar("coverTheme", { length: 50 }),
  motivationNote: text("motivationNote"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const ajoCircles = pgTable("ajoCircles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  creatorId: integer("creatorId").notNull(),
  contributionAmount: integer("contributionAmount").notNull(),
  frequency: varchar("frequency", { length: 20 }).notNull(),
  maxMembers: integer("maxMembers").notNull(),
  payoutOrder: text("payoutOrder"),
  currentRound: integer("currentRound").default(0).notNull(),
  totalRounds: integer("totalRounds").notNull(),
  inviteCode: varchar("inviteCode", { length: 10 }).unique().notNull(),
  status: varchar("status", { length: 20 }).default("waiting").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const ajoMembers = pgTable("ajoMembers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  circleId: varchar("circleId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export const ajoContributions = pgTable("ajoContributions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  circleId: varchar("circleId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  roundNumber: integer("roundNumber").notNull(),
  amount: integer("amount").notNull(),
  paidAt: timestamp("paidAt"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
export const savingsDeposits = pgTable("savingsDeposits", {
  id: varchar("id", { length: 36 }).primaryKey(),
  goalId: varchar("goalId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  amount: integer("amount").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = typeof savingsGoals.$inferInsert;
export type SavingsDeposit = typeof savingsDeposits.$inferSelect;
export type InsertSavingsDeposit = typeof savingsDeposits.$inferInsert;
export type AjoCircle = typeof ajoCircles.$inferSelect;
export type InsertAjoCircle = typeof ajoCircles.$inferInsert;
export type AjoMember = typeof ajoMembers.$inferSelect;
export type InsertAjoMember = typeof ajoMembers.$inferInsert;
export type AjoContribution = typeof ajoContributions.$inferSelect;
export type InsertAjoContribution = typeof ajoContributions.$inferInsert;

export const debts = pgTable("debts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  name: text("name").notNull(),
  originalAmount: integer("originalAmount").notNull(),
  currentAmount: integer("currentAmount").notNull(),
  interestRate: varchar("interestRate", { length: 10 }).notNull(),
  minimumPayment: integer("minimumPayment").notNull(),
  dueDate: varchar("dueDate", { length: 10 }),
  type: varchar("type", { length: 50 }).notNull(),
  strategy: varchar("strategy", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Debt = typeof debts.$inferSelect;
export type InsertDebt = typeof debts.$inferInsert;

export const investments = pgTable("investments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  assetName: text("assetName").notNull(),
  assetType: varchar("assetType", { length: 50 }).notNull(),
  currentValue: integer("currentValue").notNull(),
  purchasePrice: integer("purchasePrice").notNull(),
  quantity: varchar("quantity", { length: 50 }).notNull(),
  purchaseDate: varchar("purchaseDate", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

export const communityPosts = pgTable("communityPosts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  content: text("content").notNull(),
  postType: varchar("postType", { length: 20 }).notNull(),
  likesCount: integer("likesCount").default(0).notNull(),
  commentsCount: integer("commentsCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

export const communityComments = pgTable("communityComments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  postId: varchar("postId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = typeof communityComments.$inferInsert;

export const ritualCompletions = pgTable("ritualCompletions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  ritualName: varchar("ritualName", { length: 100 }).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export const bills = pgTable("bills", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  dueDate: varchar("dueDate", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  category: varchar("category", { length: 50 }).default("Bills").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const ajoMessages = pgTable("ajoMessages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  circleId: varchar("circleId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  message: text("message").notNull(),
  isSystem: integer("isSystem").default(0).notNull(), // 0 for user, 1 for system
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bill = typeof bills.$inferSelect;
export type InsertBill = typeof bills.$inferInsert;
export type AjoMessage = typeof ajoMessages.$inferSelect;
export type InsertAjoMessage = typeof ajoMessages.$inferInsert;
export type RitualCompletion = typeof ritualCompletions.$inferSelect;
export type InsertRitualCompletion = typeof ritualCompletions.$inferInsert;
