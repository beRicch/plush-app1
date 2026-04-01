/**
 * Plush Feature Router
 * Comprehensive tRPC router for all Plush features
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc.js";
import {
  parseImageWithVision,
  transcribeAudio,
  parseTextExpense,
  generateAIObservations,
  askPlushAI,
} from "./api/gemini.js";
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
  createSavingsDeposit,
  getGoalDeposits,
  createPost,
  getCommunityFeed,
  addComment,
  logRitualCompletion,
  getRitualStreak,
  getRitualCompletions,
  calculatePlushScore,
  getSpendingByCategory,
  getMonthlySavingsRate,
  createAjoCircle,
  joinAjoCircle,
  getAjoCircles,
  getAjoCircleDetails,
  recordAjoContribution,
  getAjoMessages,
  sendAjoMessage,
  getBills,
  createBill,
  getDashboardStats,
  getDetailedSpendingBreakdown,
  getLatestCommunityActivity,
} from "./api/db-operations.js";
import { updateUser, deleteUser } from "./db.js";

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

    getLatestActivity: protectedProcedure.query(async () => {
      return getLatestCommunityActivity();
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

  analytics: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      return getDashboardStats(ctx.user.id);
    }),
    spendingBreakdown: protectedProcedure.query(async ({ ctx }) => {
      return getDetailedSpendingBreakdown(ctx.user.id);
    }),
    plushScore: protectedProcedure.query(async ({ ctx }) => {
      return calculatePlushScore(ctx.user.id);
    }),
    aiObservations: protectedProcedure.query(async ({ ctx }) => {
      return generateAIObservations(ctx.user.id);
    }),
  }),

  insights: router({
    askPlush: protectedProcedure
      .input(z.object({ question: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const subscription = await checkSubscription(ctx.user.id);
        if (!hasFeatureAccess(subscription.tier, "ai_chat")) {
          throw new Error("Feature not available on your plan");
        }
        return askPlushAI(input.question);
      }),
  }),
  
  // ===== AJO CIRCLES =====
  ajo: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          contributionAmount: z.number(),
          frequency: z.string(),
          maxMembers: z.number(),
          payoutOrder: z.string(),
          totalRounds: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createAjoCircle({
          creatorId: ctx.user.id,
          ...input,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getAjoCircles(ctx.user.id);
    }),

    join: protectedProcedure
      .input(z.object({ inviteCode: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return joinAjoCircle(ctx.user.id, input.inviteCode);
      }),

    details: publicProcedure
      .input(z.object({ circleId: z.string() }))
      .query(async ({ input }) => {
        return getAjoCircleDetails(input.circleId);
      }),

    contribute: protectedProcedure
      .input(
        z.object({
          circleId: z.string(),
          roundNumber: z.number(),
          amount: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return recordAjoContribution({
          userId: ctx.user.id,
          ...input,
        });
      }),

    getMessages: protectedProcedure
      .input(z.object({ circleId: z.string() }))
      .query(async ({ input }) => {
        return getAjoMessages(input.circleId);
      }),

    sendMessage: protectedProcedure
      .input(z.object({ circleId: z.string(), message: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return sendAjoMessage({
          circleId: input.circleId,
          userId: ctx.user.id,
          message: input.message,
        });
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

  // ===== BILLS =====
  bills: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getBills(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        amount: z.number(),
        dueDate: z.string(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createBill({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // ===== SAVINGS =====
  savings: router({
    listGoals: protectedProcedure.query(async ({ ctx }) => {
      return getSavingsGoals(ctx.user.id);
    }),
    createGoal: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          targetAmount: z.number(),
          targetDate: z.string(),
          monthlyContribution: z.number().optional(),
          motivation: z.string().optional(),
          coverColor: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createSavingsGoal({
          userId: ctx.user.id,
          name: input.name,
          targetAmount: input.targetAmount,
          targetDate: input.targetDate,
          motivationNote: input.motivation,
          coverTheme: input.coverColor,
        });
      }),
    addDeposit: protectedProcedure
      .input(
        z.object({
          goalId: z.string(),
          amount: z.number(),
          date: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createSavingsDeposit({
          goalId: input.goalId,
          userId: ctx.user.id,
          amount: input.amount,
          date: input.date,
        });
      }),
    listDeposits: protectedProcedure
      .input(z.object({ goalId: z.string() }))
      .query(async ({ input }) => {
        return getGoalDeposits(input.goalId);
      }),
    updateGoalProgress: protectedProcedure
      .input(z.object({ goalId: z.string(), amount: z.number() }))
      .mutation(async ({ input }) => {
        return updateGoalProgress(input.goalId, input.amount);
      }),
  }),

  // ===== PROFILE =====
  profile: router({
    update: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          phone: z.string().optional(),
          avatarUrl: z.string().optional(),
          moneyPersonality: z.string().optional(),
          monthlyIncomeRange: z.string().optional(),
          incomeFrequency: z.string().optional(),
          weeklyCap: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await updateUser(ctx.user.openId, input);
        return { success: true };
      }),
    
    deleteAccount: protectedProcedure
      .mutation(async ({ ctx }) => {
        await deleteUser(ctx.user.id);
        return { success: true };
      }),
  }),
});

export type PlushRouter = typeof plushRouter;
