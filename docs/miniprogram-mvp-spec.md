# 小程序 MVP 规格说明书（Spec）

> 状态：待确认（Draft for review）
> 版本：v0.1
> 关联产品：爱尚宠物管理系统（petshop-management-system）

---

## 1. 背景与目标

现有系统是「工作台（管理端）」单端形态：店员在网页/桌面上管理客户、宠物、预约、商品、财务等。本需求新增「微信小程序（用户端）」，让顾客在手机上自助完成：登录、管理自己的宠物、预约服务、查看会员信息。

**目标**：打通「顾客自助预约 → 店员在工作台审核 → 结果回传顾客」的核心闭环，并在上线首版即具备照片能力。

---

## 2. 范围

### 2.1 本期包含（In Scope）

- 微信小程序用户端
  - 微信登录（手机号一键授权）
  - 我的宠物（含照片、增删改查）
  - 预约服务（选服务 → 选宠物 → 选时间 → 提交，含店员审核）
  - 会员中心（查看余额、积分、等级）
  - 图片上传（宠物照片、头像、服务封面）
  - 微信订阅消息（预约审核结果、预约提醒）
- 工作台（管理端）
  - 预约审核（通过 / 拒绝，拒绝必填理由）
  - 宠物、服务照片的展示与上传

### 2.2 本期不包含（Out of Scope）

- 商城、商品下单
- 微信支付、充值（含充送活动）
- 次卡、优惠券、积分兑换
- 角色权限系统（店长/店员隔离，本期仅单管理员）
- 多租户、AI / Agent
- 疫苗提醒、数据导出

> 以上均在后续版本评估，本期不做，避免范围蔓延。

---

## 3. 用户与角色

| 角色 | 端 | 说明 |
|------|----|------|
| 顾客（Customer） | 小程序 | 微信登录，管理自己的宠物、预约、看会员信息 |
| 管理员（Admin） | 工作台 | 现有 admin 账号，负责审核预约、维护数据 |

> 本期工作台仅一个 admin 账号，不新增店员角色。

---

## 4. 总体架构与数据流

```
顾客手机（小程序）
   │  wx.login / getPhoneNumber
   ▼
后端 NestJS（localhost:3333）
   ├─ /miniprogram/* 接口（顾客端，JWT for Customer）
   ├─ /appointments/* 接口（工作台，JWT for Admin，现有）
   └─ 微信服务端 API（code2session / getuserphonenumber / 订阅消息）
   ▼
PostgreSQL（本地 5433 / 生产云端）
```

**关键架构点**：

1. 小程序与工作台共享同一后端、同一数据库，天然联动。
2. 认证区分两套 JWT：
   - 现有 JWT：签发 `User`（admin），保护工作台接口。
   - 新增 JWT：签发 `Customer`，保护 `/miniprogram/*` 接口。
   - 需新增「顾客 JWT 策略/守卫」，不能复用现有 admin 认证。

---

## 5. 功能需求

### 5.1 用户登录与绑定（手机号一键授权）

**流程**：

1. 小程序调用 `wx.login()` 获取临时 `code`。
2. 小程序调用 `getPhoneNumber` 获取手机号 `phoneCode`。
3. 前端将 `code` + `phoneCode` 提交到后端 `/miniprogram/auth`。
4. 后端用 `code` 调微信 `code2session` 换取 `openid`（必要时 `unionid`）。
5. 后端用 `phoneCode` 调微信 `getuserphonenumber` 换取手机号。
6. 后端按以下顺序匹配/创建 `Customer`：
   - 按 `openid` 查找；命中则更新手机号/头像并返回。
   - 未命中按手机号查找；命中则绑定 `openid` 并返回。
   - 均未命中则创建新 `Customer`（姓名默认「微信用户」，可后续补）。
7. 后端签发顾客 JWT（`accessToken` + `refreshToken`），返回给前端。

**规则**：

- 手机号通过微信一键授权获取，作为工作台识别/联系顾客的依据。
- `openid` 为顾客的微信唯一标识，绑定后不可更换（除非解绑，本期不做解绑）。
- 登录后，顾客信息与工作台 `Customer` 记录一致。

### 5.2 我的宠物（含照片）

顾客可对自己名下的宠物做增删改查：

- **列表**：展示宠物照片、名字、品种、类型（猫/狗/其他）、性别。
- **详情**：展示生日、年龄、是否绝育、疫苗信息、过敏史、健康备注、最近美容时间。
- **新增/编辑**：姓名、类型、品种、性别、生日、是否绝育、疫苗信息、过敏史、健康备注、照片。
- **删除**：删除自己的宠物（连带其预约历史仍保留，见数据模型说明）。
- **权限**：顾客只能操作 `ownerId` 为自己的宠物。

### 5.3 预约服务（含店员审核）

**顾客端流程**：

1. 选择服务（仅展示 `status = ACTIVE` 的服务）。
2. 选择自己的一只宠物（无宠物时引导先添加宠物）。
3. 选择预约时间（具体到日期+时间）。
4. 可选填写备注（如「狗狗怕水」）。
5. 提交后生成预约，初始状态为 `PENDING`（待审核）。

**工作台审核流程**：

- 预约列表出现「待审核」记录，店员可：
  - **通过** → 状态变 `CONFIRMED`，向顾客推送「预约成功」订阅消息。
  - **拒绝** → 状态变 `REJECTED`，**必须填写拒绝理由**，向顾客推送「预约被拒」订阅消息（含理由）。
- 顾客可随时**取消**自己的待审核/已确认预约 → 状态变 `CANCELED`。
- 服务完成后店员标记 `COMPLETED`（工作台现有能力，本期确认可复用）。

### 5.4 会员中心

顾客查看：头像、姓名、会员等级（REGULAR/VIP）、余额、积分。

> 本期只读，不做充值/积分变动（充值、积分均在 Out of Scope）。

### 5.5 图片上传

- 统一上传接口，返回可访问的图片 URL。
- 用于：顾客头像、宠物照片、服务封面图。
- 存储方案：接口层抽象，MVP 优先本地磁盘存储（或对象存储 OSS/COS，按部署环境选择），后续可无痛切换。
- 限制：单张 ≤ 5MB，格式 jpg/png/webp。

### 5.6 微信订阅消息

两类场景（均为一次性订阅，顾客在提交预约时授权）：

| 场景 | 触发 | 内容 |
|------|------|------|
| 预约审核结果 | 店员通过/拒绝后 | 「您的预约已通过 / 被拒（含理由）」 |
| 预约提醒 | 预约时间前 N 小时（N 可配置，默认 2） | 「您有预约即将开始」 |

> 复用现有 `Appointment.reminderSent / reminderSentAt` 字段的提醒逻辑思路，但发送渠道由短信切换/扩展为微信订阅消息。

### 5.7 工作台预约审核

- 预约列表按状态筛选，支持「待审核」。
- 通过/拒绝操作；拒绝弹窗强制填写理由。
- 展示顾客备注、宠物照片、服务信息，便于审核判断。

---

## 6. 数据模型变更（Prisma Schema）

### 6.1 枚举变更

`AppointmentStatus` 新增两个值：

```prisma
enum AppointmentStatus {
  PENDING           // 待审核（顾客刚提交）
  CONFIRMED         // 新增：已通过（店员审核通过，待服务）
  REJECTED          // 新增：已拒绝（店员拒绝，必须带理由）
  CANCELED          // 已取消（顾客取消）
  COMPLETED         // 已完成
  DONE              // 历史遗留，本期不使用
  PENDING_PAYMENT   // 历史遗留（支付流），本期不使用
}
```

### 6.2 字段变更

```prisma
model Customer {
  // 新增
  openid    String?  @unique   // 微信唯一标识
  avatarUrl String?            // 顾客头像
  // 现有字段保持不变：name / phone / memberBalance / memberLevel / memberPoints ...
}

model Pet {
  // 新增
  imageUrl String?  // 宠物照片
  // 现有字段保持不变
}

model PetshopService {
  // 新增
  imageUrl String?  // 服务封面图
  // 现有字段保持不变
}

model Appointment {
  // 新增
  rejectReason String?  // 拒绝理由（status=REJECTED 时必填）
  customerNote String?  // 顾客预约备注
  // 现有字段保持不变：petId / serviceId / appointmentTime / status / reminderSent ...
}
```

### 6.3 配置项（环境变量 / 配置表）

| 配置 | 说明 |
|------|------|
| `WECHAT_APP_ID` | 小程序 AppID |
| `WECHAT_APP_SECRET` | 小程序 AppSecret |
| 订阅消息模板 ID | 审核结果模板、预约提醒模板（存配置表或环境变量） |

---

## 7. 预约状态机

```
顾客提交预约
     │
     ▼
 PENDING（待审核）
     │
     ├── 店员通过 ──────────► CONFIRMED（已确认）
     │                          │
     │                          ├── 店员标记完成 ──► COMPLETED（已完成）
     │                          │
     │                          └── 顾客取消 ──────► CANCELED（已取消）
     │
     ├── 店员拒绝（必填理由）──► REJECTED（已拒绝）
     │
     └── 顾客取消 ─────────────► CANCELED（已取消）
```

**状态流转约束**：

- `PENDING` 只能流转到 `CONFIRMED` / `REJECTED` / `CANCELED`。
- `CONFIRMED` 只能流转到 `COMPLETED` / `CANCELED`。
- `REJECTED` / `COMPLETED` / `CANCELED` 为终态，不可再流转。
- 拒绝时必须提供非空 `rejectReason`，否则拒绝失败。

---

## 8. API 接口定义

### 8.1 小程序端（顾客，需顾客 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/miniprogram/auth` | 微信登录：`{ code, phoneCode }` → `{ accessToken, refreshToken, customer }` |
| GET | `/miniprogram/me` | 我的会员信息：`{ name, avatarUrl, memberLevel, memberBalance, memberPoints }` |
| GET | `/miniprogram/pets` | 我的宠物列表 |
| POST | `/miniprogram/pets` | 新增宠物（含 imageUrl） |
| PUT | `/miniprogram/pets/:id` | 更新宠物 |
| DELETE | `/miniprogram/pets/:id` | 删除宠物 |
| GET | `/miniprogram/services` | 可用服务列表（仅 ACTIVE） |
| POST | `/miniprogram/appointments` | 提交预约：`{ petId, serviceId?, appointmentTime, customerNote? }` |
| GET | `/miniprogram/appointments` | 我的预约列表（含状态、拒绝理由） |
| POST | `/miniprogram/appointments/:id/cancel` | 顾客取消预约 |
| POST | `/miniprogram/upload` | 上传图片，返回 `{ url }` |

> 小程序端预约通过 `pet.ownerId` 关联到当前顾客，接口内强制校验归属权。

### 8.2 工作台（管理员，现有 admin JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/appointments/:id/review` | 审核：`{ action: "CONFIRM" \| "REJECT", rejectReason? }` |

---

## 9. 非功能需求

- **安全**：顾客 JWT 与 admin JWT 隔离；所有 `/miniprogram/*` 接口校验 `pet.ownerId` 归属权；微信 AppSecret 不入库、不放前端。
- **图片**：单张 ≤ 5MB，jpg/png/webp；上传校验类型与大小。
- **幂等**：登录绑定流程幂等，重复登录不产生重复 Customer。
- **可观测**：微信接口调用失败需记录日志并返回可读错误。
- **兼容**：现有工作台功能不受影响；历史枚举值保留，旧数据可正常展示。

---

## 10. 验收标准（Acceptance Criteria，用于 TDD）

### 10.1 登录与绑定
- [ ] 给定合法 `code`+`phoneCode`，登录后返回有效 JWT，并创建/绑定唯一 Customer。
- [ ] 同一微信再次登录，返回同一个 Customer（不重复创建）。
- [ ] 给定非法 `code`，返回明确错误，不创建脏数据。
- [ ] 缺少 `phoneCode` 时返回错误（手机号必填）。

### 10.2 我的宠物
- [ ] 顾客只能看到 `ownerId` 为自己的宠物。
- [ ] 新增宠物必须含姓名；照片可选。
- [ ] 顾客无法通过接口访问/修改他人宠物（返回 403/404）。

### 10.3 预约
- [ ] 提交预约后状态为 `PENDING`。
- [ ] 仅能预约自己的宠物。
- [ ] 店员审核「通过」→ 状态 `CONFIRMED`。
- [ ] 店员审核「拒绝」但未填理由 → 拒绝操作失败。
- [ ] 店员审核「拒绝」且填理由 → 状态 `REJECTED`，理由已保存。
- [ ] 顾客可取消 `PENDING`/`CONFIRMED` 的预约，不能取消终态预约。
- [ ] 非法状态流转被拒绝。

### 10.4 图片上传
- [ ] 上传合法图片返回 URL。
- [ ] 上传超 5MB 或非法格式被拒绝。

### 10.5 会员中心
- [ ] 返回当前顾客的等级/余额/积分，与工作台数据一致。

### 10.6 订阅消息
- [ ] 预约通过/拒绝后，触发对应订阅消息发送（含理由）。

---

## 11. 风险与待确认项

| # | 事项 | 影响 | 建议 |
|---|------|------|------|
| 1 | `getPhoneNumber` 需要**非个人主体**小程序（企业/个体户） | 个人小程序无法一键授权手机号 | 提前确认小程序主体资质 |
| 2 | 订阅消息是「一次性订阅」，每次预约需重新授权 | 提醒可能漏发 | 提交预约时引导勾选授权 |
| 3 | 图片存储方案（本地 vs OSS/COS） | 影响部署与成本 | MVP 本地兜底，接口抽象后切换 |
| 4 | `Customer.phone` 当前无唯一约束 | 同一手机号可能对应多条记录 | 绑定逻辑以 `openid` 为准，必要时评估加唯一约束 |
| 5 | 顾客 JWT 与 admin JWT 隔离 | 安全边界 | 必须新增独立顾客守卫，不可复用 admin 认证 |

---

> 本文档为 v0.1 草稿。确认后据此产出 `plan.md`（开发计划）与 `tasks.md`（任务拆解），随后进入 TDD 开发。
