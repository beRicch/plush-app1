CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."subscriptionTier" AS ENUM('free', 'plush_member', 'plush_ai', 'plush_society');--> statement-breakpoint
CREATE TABLE "ajoCircles" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"creatorId" integer NOT NULL,
	"contributionAmount" integer NOT NULL,
	"frequency" varchar(20) NOT NULL,
	"maxMembers" integer NOT NULL,
	"payoutOrder" text,
	"currentRound" integer DEFAULT 0 NOT NULL,
	"totalRounds" integer NOT NULL,
	"inviteCode" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ajoCircles_inviteCode_unique" UNIQUE("inviteCode")
);
--> statement-breakpoint
CREATE TABLE "ajoContributions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"circleId" varchar(36) NOT NULL,
	"userId" integer NOT NULL,
	"roundNumber" integer NOT NULL,
	"amount" integer NOT NULL,
	"paidAt" timestamp,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ajoMembers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"circleId" varchar(36) NOT NULL,
	"userId" integer NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communityComments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"postId" varchar(36) NOT NULL,
	"userId" integer NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communityPosts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"content" text NOT NULL,
	"postType" varchar(20) NOT NULL,
	"likesCount" integer DEFAULT 0 NOT NULL,
	"commentsCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "debts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" text NOT NULL,
	"originalAmount" integer NOT NULL,
	"currentAmount" integer NOT NULL,
	"interestRate" varchar(10) NOT NULL,
	"minimumPayment" integer NOT NULL,
	"dueDate" varchar(10),
	"type" varchar(50) NOT NULL,
	"strategy" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"amount" integer NOT NULL,
	"merchant" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"date" varchar(10) NOT NULL,
	"type" varchar(20) NOT NULL,
	"entryMethod" varchar(50) NOT NULL,
	"notes" text,
	"aiSoftComment" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"platform" varchar(100) NOT NULL,
	"assetName" text NOT NULL,
	"assetType" varchar(50) NOT NULL,
	"currentValue" integer NOT NULL,
	"purchasePrice" integer NOT NULL,
	"quantity" varchar(50) NOT NULL,
	"purchaseDate" varchar(10) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ritualCompletions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"ritualName" varchar(100) NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "savingsGoals" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" text NOT NULL,
	"targetAmount" integer NOT NULL,
	"currentAmount" integer DEFAULT 0 NOT NULL,
	"targetDate" varchar(10) NOT NULL,
	"coverTheme" varchar(50),
	"motivationNote" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"phone" varchar(20),
	"avatarUrl" text,
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"moneyPersonality" varchar(255),
	"monthlyIncomeRange" varchar(50),
	"subscriptionTier" "subscriptionTier" DEFAULT 'free' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
