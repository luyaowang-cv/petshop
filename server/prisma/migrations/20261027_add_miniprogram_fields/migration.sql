-- 小程序 MVP：预约审核状态 + 图片字段 + 微信绑定字段

-- 1. 预约状态新增：已确认 / 已拒绝
ALTER TYPE "AppointmentStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "AppointmentStatus" ADD VALUE 'REJECTED';

-- 2. 预约表：拒绝理由、顾客备注
ALTER TABLE "Appointment" ADD COLUMN "rejectReason" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "customerNote" TEXT;

-- 3. 客户表：微信 openid、头像
ALTER TABLE "Customer" ADD COLUMN "openid" TEXT;
ALTER TABLE "Customer" ADD COLUMN "avatarUrl" TEXT;

-- 4. 宠物照片
ALTER TABLE "Pet" ADD COLUMN "imageUrl" TEXT;

-- 5. 服务封面图
ALTER TABLE "PetshopService" ADD COLUMN "imageUrl" TEXT;

-- 6. openid 唯一索引
CREATE UNIQUE INDEX "Customer_openid_key" ON "Customer"("openid");
