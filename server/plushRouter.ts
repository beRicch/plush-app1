/**
 * Plush Feature Router
 * Comprehensive tRPC router for all Plush features
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc.js";
import {
  parseImageWithVision,
  transcribeAudio,
  parseTextExpense,
  generateAIObservations,
  askPlushAI,
} from "./api/openai.js";
import {
  checkSubscription,
  restorePurchases,
  purchaseSubscription,
  hasFeatureAccess,
  getTierPricing,
} from "./api/revenuecat.js";
import {
  createExpense,
  getExpenses,
  deleteExpense,
  createSavingsGoal,
  getSavingsGoals,
  updateGoalProgress,
  createDebt,
  getDebts,
  createInvestment,
  getInvestments,
  createPost,
  getCommunityFeed,
  addComment,
  logRitualCompletion,
  getRitualStreak,
  getRitualCompletions,
  calculatePlushScore,
  getSpendingByCategory,
  getMonthlySavingsRate,
} from "./api/db-operations.js";

export const plushRouter = router({
  // ===== EXPENSES =====
  expenses: router({
    create: publicProcedure
      .input(
        z.object({
          amount: z.number(),
          merchant: z.string(),
          category: z.string(),
          date: z.string(),
          type: z.enum(["expense", "income"]),
          entryMethod: z.string(),
          notes: z.string().optional(),
          aiSoftComment: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createExpense({
          userId: ctx.user.id,
          ...input,
        });
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return getExpenses(ctx.user.id);
    }),

    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return deleteExpense(input.id, ctx.user.id);
      }),
  }),

  // ===== AI ENTRY MODES =====
  aiEntry: router({
    parseScreenshot: publicProcedure
      .input(z.object({ imageBase64: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const subscription = await checkSubscription(ctx.user.id);
        if (!hasFeatureAccess(subscription.tier, "screenshot")) {
          throw new Error("Feature not available on your plan");
        }
        return parseImageWithVision(input.imageBase64, "screenshot");
      }),

    parseVoice: publicProcedure
      .input(z.object({ audioBase64: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const subscription = await checkSubscription(ctx.user.id);
        if (!hasFeatureAccess(subscription.tier, "voice")) {
          throw new Error("Feature not available on your plan");
        }
        const transcript = await transcribeAudio(input.audioBase64);
        return parseTextExpense(transcript);
      }),

    parseCamera: publicProcedure
      .input(z.object({ imageBase64: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const subscription = await checkSubscription(ctx.user.id);
        if (!hasFeatureAccess(subscription.tier, "camera")) {
          throw new Error("Feature not available on your plan");
        }
        return parseImageWithVision(input.imageBase64, "receipt");
      }),

    parseText: publicProcedure
      .input(z.object({ text: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return parseTextExpense(input.text);
      }),
  }),

  // ===== SAVINGS GOALS =====
  goals: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          targetAmount: z.number(),
          targetDate: z.string(),
          coverTheme: z.string().optional(),
          motivationNote: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createSavingsGoal({
          userId: ctx.user.id,
          currentAmount: 0,
          ...input,
        });
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return getSavingsGoals(ctx.user.id);
    }),

    updateProgress: publicProcedure
      .input(z.object({ goalId: z.string(), amount: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return updateGoalProgress(input.goalId, input.amount);
      }),
  }),

  // ===== DEBTS =====
  debts: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          originalAmount: z.number(),
          currentAmount: z.number(),
          interestRate: z.string(),
          minimumPayment: z.number(),
          dueDate: z.string().optional(),
          type: z.string(),
          strategy: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createDebt({
          userId: ctx.user.id,
          ...input,
        });
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return getDebts(ctx.user.id);
    }),
  }),

  // ===== INVESTMENTS =====
  investments: router({
    create: publicProcedure
      .input(
        z.object({
          platform: z.string(),
          assetName: z.string(),
          assetType: z.string(),
          currentValue: z.number(),
          purchasePrice: z.number(),
          quantity: z.string(),
          purchaseDate: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createInvestment({
          userId: ctx.user.id,
          ...input,
        });
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return getInvestments(ctx.user.id);
    }),
  }),

  // ===== COMMUNITY =====
  community: router({
    feed: publicProcedure.query(async () => {
      return getCommunityFeed();
    }),

    createPost: publicProcedure
      .input(
        z.object({
          content: z.string(),
          postType: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createPost({
          userId: ctx.user.id,
          ...input,
        });
      }),

    addComment: publicProcedure
      .input(
        z.object({
          postId: z.string(),
          content: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return addComment(input.postId, ctx.user.id, input.content);
      }),
  }),

  // ===== RITUALS =====
  rituals: router({
    logCompletion: publicProcedure
      .input(z.object({ ritualName: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return logRitualCompletion(ctx.user.id, input.ritualName);
      }),

    getStreak: publicProcedure
      .input(z.object({ ritualName: z.string() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return getRitualStreak(ctx.user.id, input.ritualName);
      }),

    getCompletions: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return getRitualCompletions(ctx.user.id);
    }),
  }),

  // ===== INSIGHTS & ANALYTICS =====
  insights: router({
    plushScore: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return calculatePlushScore(ctx.user.id);
    }),

    spendingByCategory: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return getSpendingByCategory(ctx.user.id);
    }),

    savingsRate: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return getMonthlySavingsRate(ctx.user.id);
    }),

    aiObservations: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return generateAIObservations(ctx.user.id);
    }),

    askPlush: publicProcedure
      .input(z.object({ question: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const subscription = await checkSubscription(ctx.user.id);
        if (!hasFeatureAccess(subscription.tier, "ai_chat")) {
          throw new Error("Feature not available on your plan");
        }
        return askPlushAI(input.question);
      }),
  }),

  // ===== SUBSCRIPTIONS =====
  subscriptions: router({
    check: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return checkSubscription(ctx.user.id);
    }),

    restore: publicProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return restorePurchases(ctx.user.id);
    }),

    purchase: publicProcedure
      .input(
        z.object({
          tier: z.enum(["free", "plush_member", "plush_ai", "plush_society"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return purchaseSubscription(ctx.user.id, input.tier);
      }),

    pricing: publicProcedure.query(async () => {
      return getTierPricing();
    }),
  }),
});

export type PlushRouter = typeof plushRouter;
