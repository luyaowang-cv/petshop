-- 简化会员等级：只保留 REGULAR 和 VIP
-- 将现有的 SILVER, GOLD, DIAMOND 统一转换为 VIP

-- 1. 先创建新的枚举类型
CREATE TYPE "MemberLevel_new" AS ENUM ('REGULAR', 'VIP');

-- 2. 添加临时列
ALTER TABLE "Customer" 
  ADD COLUMN "memberLevel_new" "MemberLevel_new";

-- 3. 迁移数据：将所有非REGULAR的会员等级转换为VIP
UPDATE "Customer" 
SET "memberLevel_new" = CASE 
  WHEN "memberLevel" = 'REGULAR' THEN 'REGULAR'::"MemberLevel_new"
  ELSE 'VIP'::"MemberLevel_new"
END;

-- 4. 删除旧列
ALTER TABLE "Customer" DROP COLUMN "memberLevel";

-- 5. 重命名新列
ALTER TABLE "Customer" RENAME COLUMN "memberLevel_new" TO "memberLevel";

-- 6. 设置默认值和非空约束
ALTER TABLE "Customer" 
  ALTER COLUMN "memberLevel" SET DEFAULT 'REGULAR'::"MemberLevel_new",
  ALTER COLUMN "memberLevel" SET NOT NULL;

-- 7. 删除旧枚举类型
DROP TYPE "MemberLevel";

-- 8. 重命名新枚举类型
ALTER TYPE "MemberLevel_new" RENAME TO "MemberLevel";

