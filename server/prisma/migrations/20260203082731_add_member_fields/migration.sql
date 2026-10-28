/*
  Warnings:

  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MemberLevel" AS ENUM ('REGULAR', 'SILVER', 'GOLD', 'DIAMOND');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "memberBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "memberExpireAt" TIMESTAMP(3),
ADD COLUMN     "memberJoinedAt" TIMESTAMP(3),
ADD COLUMN     "memberLevel" "MemberLevel" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "memberPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
