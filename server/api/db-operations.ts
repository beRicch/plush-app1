/**
 * Database Operations for Plush
 * Handles all CRUD operations for expenses, goals, debts, investments, etc.
 */

// Database operations - using mock data for now
// In production, connect to real database via Drizzle ORM
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { getDb, getDbOrThrow } from "../db.js";
import {
  expenses,
  savingsGoals,
  ajoCircles,
  ajoMembers,
  ajoContributions,
  savingsDeposits,
  debts,
  investments,
  communityPosts,
  communityComments,
  ritualCompletions,
  users,
  bills,
  ajoMessages,
} from "../../drizzle/schema.js";
import type {
  Expense,
  SavingsGoal,
  Debt,
  Investment,
  CommunityPost,
  CommunityComment,
  RitualCompletion,
  Bill,
  AjoMessage,
} from "../../drizzle/schema.js";

/**
 * Expense Operations
 */
export async function createExpense(data: {
  userId: number;
  amount: number;
  merchant: string;
  category: string;
  date: string;
  type: "expense" | "income";
  entryMethod: string;
  notes?: string;
  aiSoftComment?: string;
}) {
  const db = await getDbOrThrow();
  const id = crypto.randomUUID();

  const [newExpense] = await db.insert(expenses).values({
    id,
    ...data,
  }).returning();
  
  return newExpense;
}

export async function getExpenses(userId: number, limit = 50) {
  const db = await getDbOrThrow();
  return await db.select()
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.createdAt))
    .limit(limit);
}

export async function deleteExpense(expenseId: string, userId: number) {
  // Mock: Delete expense
  return { success: true };
}

/**
 * Savings Goals Operations
 */
export async function createSavingsGoal(data: {
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  coverTheme?: string;
  motivationNote?: string;
}) {
  const db = await getDb();
  const id = crypto.randomUUID();

  const [newGoal] = await db.insert(savingsGoals).values({
    id,
    name: data.name,
    userId: data.userId,
    targetAmount: data.targetAmount,
    currentAmount: data.currentAmount || 0,
    targetDate: data.targetDate,
    coverTheme: data.coverTheme,
    motivationNote: data.motivationNote,
    status: "active",
  }).returning();

  return newGoal;
}

export async function getSavingsGoals(userId: number) {
  const db = await getDb();
  return await db.select()
    .from(savingsGoals)
    .where(eq(savingsGoals.userId, userId))
    .orderBy(desc(savingsGoals.createdAt));
}

export async function updateGoalProgress(goalId: string, amount: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[DB] Fallback to mock for updateGoalProgress");
    return { success: true };
  }

  const [goal] = await db.select().from(savingsGoals).where(eq(savingsGoals.id, goalId)).limit(1);
  if (!goal) return { success: false, error: "Goal not found" };

  const newAmount = goal.currentAmount + amount;
  await db.update(savingsGoals)
    .set({ currentAmount: newAmount })
    .where(eq(savingsGoals.id, goalId));

  return { success: true, newAmount };
}

export async function createSavingsDeposit(data: {
  goalId: string;
  userId: number;
  amount: number;
  date: string;
}) {
  const db = await getDb();
  const id = crypto.randomUUID();

  if (!db) {
    console.warn("[DB] Fallback to mock for createSavingsDeposit");
    return { id, ...data, createdAt: new Date() };
  }

  // Use a transaction to update both the deposit and the goal amount
  return await db.transaction(async (tx) => {
    const [newDeposit] = await tx.insert(savingsDeposits).values({
      id,
      ...data,
    }).returning();

    const [goal] = await tx.select().from(savingsGoals).where(eq(savingsGoals.id, data.goalId)).limit(1);
    if (goal) {
      await tx.update(savingsGoals)
        .set({ currentAmount: goal.currentAmount + data.amount })
        .where(eq(savingsGoals.id, data.goalId));
    }

    return newDeposit;
  });
}

export async function getGoalDeposits(goalId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[DB] Fallback to mock for getGoalDeposits");
    return [
      { date: "Today", amount: 10000 },
      { date: "3 days ago", amount: 15000 },
    ];
  }

  return await db.select()
    .from(savingsDeposits)
    .where(eq(savingsDeposits.goalId, goalId))
    .orderBy(desc(savingsDeposits.createdAt));
}

/**
 * Debt Operations
 */
export async function createDebt(data: {
  userId: number;
  name: string;
  originalAmount: number;
  currentAmount: number;
  interestRate: string;
  minimumPayment: number;
  dueDate?: string;
  type: string;
  strategy?: string;
}) {
  const db = await getDb();
  const id = crypto.randomUUID();

  if (!db) {
    console.warn("[DB] Fallback to mock for createDebt");
    return { id, ...data, createdAt: new Date() };
  }

  const [newDebt] = await db.insert(debts).values({
    id,
    ...data,
  }).returning();

  return newDebt;
}

export async function getDebts(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[DB] Fallback to mock for getDebts");
    return [
      {
        id: "1",
        userId,
        name: "Credit Card",
        originalAmount: 500000,
        currentAmount: 350000,
        interestRate: "18.5",
        minimumPayment: 50000,
        dueDate: "2026-04-10",
        type: "credit_card",
        strategy: "avalanche",
        createdAt: new Date(),
      },
    ];
  }

  return await db.select()
    .from(debts)
    .where(eq(debts.userId, userId))
    .orderBy(desc(debts.createdAt));
}

/**
 * Investment Operations
 */
export async function createInvestment(data: {
  userId: number;
  platform: string;
  assetName: string;
  assetType: string;
  currentValue: number;
  purchasePrice: number;
  quantity: string;
  purchaseDate: string;
}) {
  const db = await getDb();
  const id = crypto.randomUUID();

  if (!db) {
    console.warn("[DB] Fallback to mock for createInvestment");
    return { id, ...data, createdAt: new Date() };
  }

  const [newInvestment] = await db.insert(investments).values({
    id,
    ...data,
  }).returning();

  return newInvestment;
}

export async function getInvestments(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[DB] Fallback to mock for getInvestments");
    return [
      {
        id: "1",
        userId,
        platform: "Bamboo",
        assetName: "Tier-1 Stocks",
        assetType: "stock",
        currentValue: 150000,
        purchasePrice: 120000,
        quantity: "100",
        purchaseDate: "2024-01-15",
        createdAt: new Date(),
      },
    ];
  }

  return await db.select()
    .from(investments)
    .where(eq(investments.userId, userId))
    .orderBy(desc(investments.createdAt));
}

/**
 * Community Operations
 */
export async function createPost(data: {
  userId: number;
  content: string;
  postType: string;
}) {
  const db = await getDb();
  const id = crypto.randomUUID();

  if (!db) {
    console.warn("[DB] Fallback to mock for createPost");
    return { id, ...data, likesCount: 0, commentsCount: 0, createdAt: new Date() };
  }

  const [newPost] = await db.insert(communityPosts).values({
    id,
    likesCount: 0,
    commentsCount: 0,
    ...data,
  }).returning();

  return newPost;
}

export async function getCommunityFeed(limit = 20) {
  const db = await getDb();
  if (!db) {
    console.warn("[DB] Fallback to mock for getCommunityFeed");
    return [
      {
        id: "1",
        userId: 1,
        content: "Just hit my ₦50k savings milestone! 🎉",
        postType: "milestone",
        likesCount: 42,
        commentsCount: 5,
        createdAt: new Date(),
      },
    ];
  }

  return await db.select()
    .from(communityPosts)
    .orderBy(desc(communityPosts.createdAt))
    .limit(limit);
}

export async function addComment(postId: string, userId: number, content: string) {
  const db = await getDb();
  const id = crypto.randomUUID();

  if (!db) {
    console.warn("[DB] Fallback to mock for addComment");
    return { id, postId, userId, content, createdAt: new Date() };
  }

  const [newComment] = await db.insert(communityComments).values({
    id,
    postId,
    userId,
    content,
  }).returning();

  return newComment;
}

/**
 * Ritual Operations
 */
export async function logRitualCompletion(userId: number, ritualName: string) {
  const db = await getDb();
  const id = crypto.randomUUID();

  if (!db) {
    console.warn("[DB] Fallback to mock for logRitualCompletion");
    return { id, userId, ritualName, completedAt: new Date() };
  }

  const [newCompletion] = await db.insert(ritualCompletions).values({
    id,
    userId,
    ritualName,
  }).returning();

  return newCompletion;
}

export async function getRitualStreak(userId: number, ritualName: string) {
  const db = await getDb();
  if (!db) return 12;

  // Simple streak calculation (count of completions)
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(ritualCompletions)
    .where(
      and(
        eq(ritualCompletions.userId, userId),
        eq(ritualCompletions.ritualName, ritualName)
      )
    );
  
  return result[0]?.count || 0;
}

export async function getRitualCompletions(userId: number, days = 30) {
  const db = await getDb();
  if (!db) {
    return [
      { ritualName: "Soft Audit", count: 4 },
      { ritualName: "Naira Wins", count: 4 },
      { ritualName: "Plush Vision", count: 3 },
    ];
  }

  const result = await db.select({
    ritualName: ritualCompletions.ritualName,
    count: sql<number>`count(*)`
  })
    .from(ritualCompletions)
    .where(eq(ritualCompletions.userId, userId))
    .groupBy(ritualCompletions.ritualName);

  return result;
}

/**
 * Analytics Operations
 */
export async function calculatePlushScore(userId: number): Promise<number> {
  // Mock: Calculate Plush Score based on various factors
  // In production: Calculate based on actual data
  return 74; // Score out of 100
}

export async function getSpendingByCategory(userId: number) {
  // Mock: Return spending breakdown
  return {
    groceries: 25000,
    transportation: 12000,
    entertainment: 8000,
    utilities: 15000,
    other: 5000,
  };
}

export async function getMonthlySavingsRate(userId: number): Promise<number> {
  // Mock: Calculate savings rate
  return 28; // 28%
}

/**
 * Ajo Circle Operations
 */
export async function createAjoCircle(data: {
  creatorId: number;
  name: string;
  contributionAmount: number;
  frequency: string;
  maxMembers: number;
  payoutOrder: string;
  totalRounds: number;
}) {
  const db = await getDb();
  const id = crypto.randomUUID();
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  if (!db) {
    console.warn("[DB] Fallback to mock for createAjoCircle");
    return { id, inviteCode, ...data, status: "waiting", currentRound: 0, createdAt: new Date() };
  }

  const [newCircle] = await db.insert(ajoCircles).values({
    id,
    inviteCode,
    ...data,
    status: "waiting",
    currentRound: 0,
  }).returning();

  // Add creator as the first member
  await db.insert(ajoMembers).values({
    id: crypto.randomUUID(),
    circleId: id,
    userId: data.creatorId,
  });

  return { ...newCircle, inviteCode };
}

export async function joinAjoCircle(userId: number, inviteCode: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not connected");
  }

  const [circle] = await db.select()
    .from(ajoCircles)
    .where(eq(ajoCircles.inviteCode, inviteCode.toUpperCase()))
    .limit(1);

  if (!circle) {
    throw new Error("Circle not found with this code 🌸");
  }

  const members = await db.select().from(ajoMembers).where(eq(ajoMembers.circleId, circle.id));
  if (members.length >= circle.maxMembers) {
    throw new Error("This circle is already full, sis! 🛑");
  }

  const isAlreadyMember = members.some(m => m.userId === userId);
  if (isAlreadyMember) {
    return circle;
  }

  await db.insert(ajoMembers).values({
    id: crypto.randomUUID(),
    circleId: circle.id,
    userId,
  });

  return circle;
}

export async function getAjoCircles(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const subquery = db.select({ circleId: ajoMembers.circleId })
    .from(ajoMembers)
    .where(eq(ajoMembers.userId, userId));

  return await db.select()
    .from(ajoCircles)
    .where(inArray(ajoCircles.id, subquery));
}

export async function getAjoCircleDetails(circleId: string) {
  const db = await getDb();
  if (!db) return null;

  const [circle] = await db.select()
    .from(ajoCircles)
    .where(eq(ajoCircles.id, circleId))
    .limit(1);

  if (!circle) return null;

  const members = await db.select({
    id: users.id,
    name: users.name,
    avatarUrl: users.avatarUrl,
  })
    .from(ajoMembers)
    .innerJoin(users, eq(ajoMembers.userId, users.id))
    .where(eq(ajoMembers.circleId, circleId));

  const contributions = await db.select()
    .from(ajoContributions)
    .where(eq(ajoContributions.circleId, circleId))
    .orderBy(desc(ajoContributions.createdAt))
    .limit(20);

  return {
    ...circle,
    members,
    contributions,
  };
}

export async function recordAjoContribution(data: {
  userId: number;
  circleId: string;
  roundNumber: number;
  amount: number;
}) {
  const db = await getDb();
  const id = crypto.randomUUID();

  if (!db) return { id, ...data, status: "paid", createdAt: new Date() };

  const [newContribution] = await db.insert(ajoContributions).values({
    id,
    ...data,
    status: "paid",
    paidAt: new Date(),
  }).returning();

  return newContribution;
}

export async function getAjoMessages(circleId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: ajoMessages.id,
    sender: users.name,
    message: ajoMessages.message,
    isSystem: ajoMessages.isSystem,
    time: ajoMessages.createdAt,
  })
    .from(ajoMessages)
    .innerJoin(users, eq(ajoMessages.userId, users.id))
    .where(eq(ajoMessages.circleId, circleId))
    .orderBy(desc(ajoMessages.createdAt))
    .limit(50);
}

export async function sendAjoMessage(data: {
  circleId: string;
  userId: number;
  message: string;
  isSystem?: number;
}) {
  const db = await getDb();
  const id = crypto.randomUUID();

  if (!db) return { id, ...data, createdAt: new Date() };

  const [newMessage] = await db.insert(ajoMessages).values({
    id,
    circleId: data.circleId,
    userId: data.userId,
    message: data.message,
    isSystem: data.isSystem || 0,
  }).returning();

  return newMessage;
}

/**
 * Bill Operations
 */
export async function getBills(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(bills)
    .where(eq(bills.userId, userId))
    .orderBy(bills.dueDate);
}

export async function createBill(data: {
  userId: number;
  name: string;
  amount: number;
  dueDate: string;
  category?: string;
}) {
  const db = await getDb();
  const id = crypto.randomUUID();

  if (!db) return { id, ...data, status: "pending", createdAt: new Date() };

  const [newBill] = await db.insert(bills).values({
    id,
    ...data,
    status: "pending",
  }).returning();

  return newBill;
}

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Dashboard & Analytics
 */
export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) {
    return {
      safeToSpend: 45000,
      totalSaved: 140000,
      weeklyAllowance: 60000,
      plushScore: 74,
      income: 320000,
      spent: 180000,
    };
  }

  // Calculate real stats
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const userExpenses = await db.select().from(expenses).where(eq(expenses.userId, userId));
  const userGoals = await db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId));
  
  // 1. Total Saved = Sum of currentAmount across all active savings goals
  const totalSaved = userGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  
  // 2. Weekly Allowance = stored in user profile (synced from onboarding)
  const weeklyAllowance = user?.weeklyAllowance || 60000; // Default fallback
  
  // 3. Spent This Week = Sum of expenses from Monday to now
  const startOfWeek = getStartOfWeek();
  const spentThisWeek = userExpenses
    .filter(e => {
      if (e.type !== "expense") return false;
      const d = new Date(e.date);
      return d >= startOfWeek;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // 4. Safe to Spend This Week = Weekly Allowance - Total Spent This Week
  const safeToSpend = Math.max(0, weeklyAllowance - spentThisWeek);

  const plushScore = await calculatePlushScore(userId);

  // For monthly context
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const spentThisMonth = userExpenses
    .filter(e => {
      if (e.type !== "expense") return false;
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const incomeMap: Record<string, number> = { A: 75000, B: 175000, C: 375000, D: 750000 };
  const monthlyIncome = incomeMap[user?.monthlyIncomeRange || "C"] || 300000;

  return {
    safeToSpend,
    totalSaved,
    weeklyAllowance,
    plushScore,
    income: monthlyIncome,
    spent: spentThisMonth,
    spentThisWeek,
  };
}

export async function getDetailedSpendingBreakdown(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select({
    category: expenses.category,
    amount: sql<number>`sum(${expenses.amount})`,
  })
    .from(expenses)
    .where(and(eq(expenses.userId, userId), eq(expenses.type, "expense")))
    .groupBy(expenses.category);

  return result;
}

export async function getLatestCommunityActivity() {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: communityPosts.id,
    userId: communityPosts.userId,
    userName: users.name,
    content: communityPosts.content,
    postType: communityPosts.postType,
    createdAt: communityPosts.createdAt,
  })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.userId, users.id))
    .orderBy(desc(communityPosts.createdAt))
    .limit(1);
}
