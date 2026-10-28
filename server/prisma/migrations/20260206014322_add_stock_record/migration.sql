/*
  Warnings:

  - Made the column `gender` on table `Pet` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `PetshopService` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('GROOMING', 'MEDICAL', 'BOARDING');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProductOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "Pet" ALTER COLUMN "gender" SET NOT NULL;

-- AlterTable
ALTER TABLE "PetshopService" ADD COLUMN     "category" "ServiceCategory" NOT NULL DEFAULT 'GROOMING',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ProductOrder" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "totalAmount" INTEGER NOT NULL,
    "status" "ProductOrderStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockRecord" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "totalCost" INTEGER NOT NULL,
    "supplier" TEXT,
    "operator" TEXT NOT NULL DEFAULT '',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductOrder_customerId_idx" ON "ProductOrder"("customerId");

-- CreateIndex
CREATE INDEX "ProductOrder_status_idx" ON "ProductOrder"("status");

-- CreateIndex
CREATE INDEX "ProductOrder_createdAt_idx" ON "ProductOrder"("createdAt");

-- CreateIndex
CREATE INDEX "ProductOrderItem_orderId_idx" ON "ProductOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "ProductOrderItem_productId_idx" ON "ProductOrderItem"("productId");

-- CreateIndex
CREATE INDEX "StockRecord_productId_idx" ON "StockRecord"("productId");

-- CreateIndex
CREATE INDEX "StockRecord_createdAt_idx" ON "StockRecord"("createdAt");

-- CreateIndex
CREATE INDEX "PetshopService_category_idx" ON "PetshopService"("category");

-- CreateIndex
CREATE INDEX "PetshopService_status_idx" ON "PetshopService"("status");
