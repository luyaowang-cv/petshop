-- CreateEnum
CREATE TYPE "SmsProvider" AS ENUM ('ALIYUN', 'TENCENT', 'HUAWEI');

-- CreateEnum
CREATE TYPE "SmsScenario" AS ENUM ('APPOINTMENT_CONFIRM', 'APPOINTMENT_REMIND', 'APPOINTMENT_COMPLETE', 'ORDER_CONFIRM', 'BALANCE_CHANGE', 'BIRTHDAY_GREETING', 'TEST');

-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SmsConfig" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" "SmsProvider" NOT NULL DEFAULT 'ALIYUN',
    "accessKeyId" TEXT NOT NULL,
    "accessKeySecret" TEXT NOT NULL,
    "signName" TEXT NOT NULL,
    "appointmentConfirmTemplateId" TEXT,
    "appointmentRemindTemplateId" TEXT,
    "appointmentCompleteTemplateId" TEXT,
    "orderConfirmTemplateId" TEXT,
    "balanceChangeTemplateId" TEXT,
    "birthdayGreetingTemplateId" TEXT,
    "appointmentConfirmEnabled" BOOLEAN NOT NULL DEFAULT false,
    "appointmentRemindEnabled" BOOLEAN NOT NULL DEFAULT false,
    "appointmentCompleteEnabled" BOOLEAN NOT NULL DEFAULT false,
    "orderConfirmEnabled" BOOLEAN NOT NULL DEFAULT false,
    "balanceChangeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "birthdayGreetingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "appointmentRemindHours" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsRecord" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "scenario" "SmsScenario" NOT NULL,
    "templateId" TEXT NOT NULL,
    "templateContent" TEXT,
    "status" "SmsStatus" NOT NULL,
    "messageId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT,
    "appointmentId" TEXT,
    "orderId" TEXT,
    "petId" TEXT,

    CONSTRAINT "SmsRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsRecord_phoneNumber_idx" ON "SmsRecord"("phoneNumber");

-- CreateIndex
CREATE INDEX "SmsRecord_scenario_idx" ON "SmsRecord"("scenario");

-- CreateIndex
CREATE INDEX "SmsRecord_status_idx" ON "SmsRecord"("status");

-- CreateIndex
CREATE INDEX "SmsRecord_sentAt_idx" ON "SmsRecord"("sentAt");

-- CreateIndex
CREATE INDEX "SmsRecord_customerId_idx" ON "SmsRecord"("customerId");
