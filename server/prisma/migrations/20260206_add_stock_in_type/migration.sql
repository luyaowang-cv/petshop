-- CreateEnum
CREATE TYPE "StockInType" AS ENUM ('PURCHASE', 'ADJUSTMENT');

-- AlterTable
ALTER TABLE "StockRecord" ADD COLUMN "type" "StockInType" NOT NULL DEFAULT 'PURCHASE';

-- AlterTable
ALTER TABLE "StockRecord" ALTER COLUMN "cost" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "StockRecord" ALTER COLUMN "totalCost" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "StockRecord_type_idx" ON "StockRecord"("type");
