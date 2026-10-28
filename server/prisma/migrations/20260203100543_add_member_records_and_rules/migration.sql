-- CreateEnum
CREATE TYPE "PointsAction" AS ENUM ('ADD', 'DEDUCT', 'CONSUME', 'EXPIRE');

-- CreateTable
CREATE TABLE "RechargeRecord" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "operator" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RechargeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsRecord" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "action" "PointsAction" NOT NULL,
    "points" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "operator" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "spendAmount" INTEGER NOT NULL,
    "earnPoints" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointsRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RechargeRecord_customerId_idx" ON "RechargeRecord"("customerId");

-- CreateIndex
CREATE INDEX "RechargeRecord_createdAt_idx" ON "RechargeRecord"("createdAt");

-- CreateIndex
CREATE INDEX "PointsRecord_customerId_idx" ON "PointsRecord"("customerId");

-- CreateIndex
CREATE INDEX "PointsRecord_createdAt_idx" ON "PointsRecord"("createdAt");
