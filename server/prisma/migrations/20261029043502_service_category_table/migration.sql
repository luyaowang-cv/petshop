-- 服务分类从写死的枚举改为独立数据表，工作台可自由新增品类（如「美容」）

-- 1. 新建分类表
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");

-- 2. 落回现有的三个分类
INSERT INTO "service_categories" ("id", "name", "icon", "sortOrder", "createdAt", "updatedAt") VALUES
('6f1c2a70-0001-4a00-8000-000000000001', '洗护', '🛁', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6f1c2a70-0002-4a00-8000-000000000002', '医疗', '💊', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6f1c2a70-0003-4a00-8000-000000000003', '寄养', '🏠', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. 服务表新增 categoryId 并按旧枚举回填
ALTER TABLE "PetshopService" ADD COLUMN "categoryId" TEXT;

UPDATE "PetshopService" s
SET "categoryId" = c."id"
FROM "service_categories" c
WHERE c."name" = CASE s."category"::text
    WHEN 'GROOMING' THEN '洗护'
    WHEN 'MEDICAL'  THEN '医疗'
    WHEN 'BOARDING' THEN '寄养'
END;

-- 4. 删除旧枚举列（依赖它的索引会一并删除）与枚举类型
ALTER TABLE "PetshopService" DROP COLUMN "category";
DROP TYPE "ServiceCategory";

-- 5. 新列索引与外键
CREATE INDEX "PetshopService_categoryId_idx" ON "PetshopService"("categoryId");

ALTER TABLE "PetshopService" ADD CONSTRAINT "PetshopService_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
