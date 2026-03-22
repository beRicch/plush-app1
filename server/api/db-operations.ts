/**
 * Database Operations for Plush
 * Handles all CRUD operations for expenses, goals, debts, investments, etc.
 */

// Database operations - using mock data for now
// In production, connect to real database via Drizzle ORM
import type {
  Expense,
  SavingsGoal,
  Debt,
  Investment,
  CommunityPost,
  CommunityComment,
  RitualCompletion,
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
  const id = crypto.randomUUID();
  // TODO: Replace with real database insert
  // await db.insert(expenses).values({ id, ...data });
  return { id, ...data };
}

export async function getExpenses(userId: number, limit = 50) {
  // Mock: Return sample expenses
  return [
    {
      id: "1",
      userId,
      amount: 8500,
      merchant: "Shoprite",
      category: "groceries",
      date: new Date().toISOString().split("T")[0],
      type: "expense",
      entryMethod: "screenshot",
      notes: "Weekly groceries",
      aiSoftComment: "Great job tracking! 🌸",
      createdAt: new Date(),
    },
    {
      id: "2",
      userId,
      amount: 2500,
      merchant: "Uber",
      category: "transportation",
      date: new Date().toISOString().split("T")[0],
      type: "expense",
      entryMethod: "manual",
      notes: "Ride to office",
      createdAt: new Date(),
    },
  ];
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
  const id = crypto.randomUUID();
  // TODO: Replace with real database insert
  // await db.insert(savingsGoals).values({ id, currentAmount: data.currentAmount || 0, status: "active", ...data });
  return { id, ...data };
}

export async function getSavingsGoals(userId: number) {
  // Mock: Return sample goals
  return [
    {
      id: "1",
      userId,
      name: "Emergency Fund",
      targetAmount: 500000,
      currentAmount: 225000,
      targetDate: "2025-12-31",
      coverTheme: "ocean",
      motivationNote: "Build a 6-month safety net",
      status: "active",
      createdAt: new Date(),
    },
    {
      id: "2",
      userId,
      name: "Dream Vacation",
      targetAmount: 300000,
      currentAmount: 85000,
      targetDate: "2025-06-30",
      coverTheme: "sunset",
      motivationNote: "Bali trip with family",
      status: "active",
      createdAt: new Date(),
    },
  ];
}

export async function updateGoalProgress(goalId: string, amount: number) {
  // Mock: Update goal progress
  return { success: true };
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
  const id = crypto.randomUUID();
  // TODO: Replace with real database insert
  // await db.insert(debts).values({ id, ...data });
  return { id, ...data };
}

export async function getDebts(userId: number) {
  // Mock: Return sample debts
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
  const id = crypto.randomUUID();
  // TODO: Replace with real database insert
  // await db.insert(investments).values({ id, ...data });
  return { id, ...data };
}

export async function getInvestments(userId: number) {
  // Mock: Return sample investments
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

/**
 * Community Operations
 */
export async function createPost(data: {
  userId: number;
  content: string;
  postType: string;
}) {
  const id = crypto.randomUUID();
  // TODO: Replace with real database insert
  // await db.insert(communityPosts).values({ id, likesCount: 0, commentsCount: 0, ...data });
  return { id, ...data };
}

export async function getCommunityFeed(limit = 20) {
  // Mock: Return sample posts
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

export async function addComment(postId: string, userId: number, content: string) {
  const id = crypto.randomUUID();
  // TODO: Replace with real database insert
  // await db.insert(communityComments).values({ id, postId, userId, content });
  return { id, postId, userId, content };
}

/**
 * Ritual Operations
 */
export async function logRitualCompletion(userId: number, ritualName: string) {
  const id = crypto.randomUUID();
  // TODO: Replace with real database insert
  // await db.insert(ritualCompletions).values({ id, userId, ritualName });
  return { id, userId, ritualName };
}

export async function getRitualStreak(userId: number, ritualName: string) {
  // Mock: Return streak count
  return 12; // 12 weeks
}

export async function getRitualCompletions(userId: number, days = 30) {
  // Mock: Return completions for the past 30 days
  return [
    { ritualName: "Soft Audit", count: 4 },
    { ritualName: "Naira Wins", count: 4 },
    { ritualName: "Plush Vision", count: 3 },
  ];
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
