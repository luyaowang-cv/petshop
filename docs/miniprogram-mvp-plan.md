# 小程序 MVP 开发计划（Plan）

> 版本：v0.1
> 前置文档：[miniprogram-mvp-spec.md](./miniprogram-mvp-spec.md)
> 开发方式：TDD（先写测试 → 红 → 实现 → 绿）

---

## 1. 目标

交付「顾客小程序 + 工作台预约审核 + 后端小程序 API」的 MVP，打通顾客自助预约闭环。

## 2. 技术栈（已锁定）

| 层 | 技术 | 说明 |
|----|------|------|
| 小程序 | **Taro (React + TypeScript)** | 用户端 |
| 后端 | NestJS（现有）+ Prisma + PostgreSQL | 新增 miniprogram 模块 |
| 工作台 | Next.js（现有） | 仅改动预约审核、照片 |

## 3. 模块划分

```
miniprogram/            # 新增：Taro 小程序
server/src/
  ├── app/use-cases/    # 新增 miniprogram 相关用例
  └── infra/
      ├── auth/         # 新增 Customer JWT 策略/守卫
      ├── http/         # 新增 miniprogram 控制器、审核路由
      ├── providers/    # 新增微信 API 客户端、图片存储
      └── database/     # schema 迁移
client/                 # 改动：预约审核 UI、照片
docs/                   # spec / plan / tasks
```

## 4. 开发阶段（里程碑）

### Phase 0：外部前置（可能阻塞，最先办）

- 注册微信小程序（**企业/个体户主体**，否则 `getPhoneNumber` 不可用）
- 获取 AppID / AppSecret
- 申请订阅消息模板（预约审核结果、预约提醒）
- 确定图片存储方案（本地磁盘 or 阿里云 OSS / 腾讯云 COS）

> ⚠️ Phase 0 不完成，T-05（登录）、T-12（订阅消息）无法真机联调，但后端可用 mock 先行开发。

### Phase 1：后端基础设施（TDD）

- 数据库 schema 变更 + 迁移
- 微信配置与微信 API 客户端
- Customer JWT 策略/守卫
- 图片上传服务

### Phase 2：后端小程序 API（TDD）

- 登录绑定、宠物 CRUD、服务列表、预约（提交/列表/取消/审核）、会员中心、订阅消息

### Phase 3：小程序前端（Taro）

- 工程初始化、请求封装、登录、3 个 tab 页面、宠物管理、预约流程

### Phase 4：工作台改动

- 预约审核 UI（通过/拒绝+理由）、照片展示/上传

### Phase 5：联调与验收

- 端到端联调，回归 spec §10 全部验收标准

## 5. 依赖关系

- 小程序（Phase 3）依赖后端 API（Phase 2）完成。
- 工作台审核 UI（Phase 4）依赖后端审核接口（T-11）。
- 后端各任务按 tasks.md 顺序推进，TDD 单测先行。

## 6. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 小程序主体资质不足，无法一键授权手机号 | Phase 0 优先确认；若个人主体，登录方案降级为手动填手机号 |
| 微信接口依赖外部网络，测试不稳定 | 微信客户端抽象为接口，单测用 mock，真机联调单独验证 |
| 图片存储方案未定 | 接口抽象，MVP 本地兜底，后续切换 OSS/COS 无痛 |
| 顾客 JWT 与 admin JWT 混淆 | 独立守卫 + 独立 secret，单测覆盖越权场景 |

## 7. 交付物

- [ ] `miniprogram/` Taro 小程序源码
- [ ] `server/` 新增 miniprogram 模块 + 迁移 + 单测
- [ ] `client/` 预约审核 UI + 照片
- [ ] 通过 spec §10 全部验收标准
