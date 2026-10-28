-- CreateEnum
CREATE TYPE "PetType" AS ENUM ('CAT', 'DOG', 'OTHER');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "lastVisitAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "totalSpent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "isNeutered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastGroomingAt" TIMESTAMP(3),
ADD COLUMN     "petType" "PetType" NOT NULL DEFAULT 'OTHER';
