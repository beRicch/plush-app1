CREATE TABLE "savingsDeposits" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"goalId" varchar(36) NOT NULL,
	"userId" integer NOT NULL,
	"amount" integer NOT NULL,
	"date" varchar(10) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
