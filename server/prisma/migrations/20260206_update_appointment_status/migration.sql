-- AlterEnum
-- 添加新的预约状态：PENDING_PAYMENT（待支付）和 COMPLETED（已完成）
-- DONE 状态现在表示服务完成，等待支付
ALTER TYPE "AppointmentStatus" ADD VALUE 'PENDING_PAYMENT';
ALTER TYPE "AppointmentStatus" ADD VALUE 'COMPLETED';

-- 注意：由于 PostgreSQL 的限制，无法直接修改枚举值的含义
-- DONE 状态保持不变，新增 PENDING_PAYMENT 和 COMPLETED 状态
-- 业务逻辑：
-- PENDING -> 待处理（服务进行中）
-- DONE -> 服务完成（可以理解为待支付的前置状态，保持向后兼容）
-- PENDING_PAYMENT -> 待支付（明确的待支付状态）
-- COMPLETED -> 已完成（已支付）
-- CANCELED -> 已取消
