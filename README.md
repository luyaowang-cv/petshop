# 🐾 爱尚宠物管理系统

一个现代化的宠物店管理系统，帮助宠物店轻松管理客户、宠物、服务预约、商品库存和财务数据。

## ✨ 功能特性

### 核心功能

- 👥 **客户管理** - 客户信息管理、会员等级（VIP/普通）、积分与余额管理
- 🐕 **宠物档案** - 宠物信息、健康记录、疫苗信息、过敏史
- 📅 **服务预约** - 预约管理、服务订单、状态跟踪
- 🛍️ **商品管理** - 商品信息、分类管理、库存管理
- 💰 **财务统计** - 收入统计、商品销量、利润分析
- 📦 **库存管理** - 入库记录、库存预警
- 💳 **收银台** - 快速结账、订单管理
- 📱 **短信通知** - 服务完成通知、预约提醒（支持阿里云/腾讯云/华为云）

### 技术亮点

- 🎨 响应式设计 - 支持电脑、平板、手机多端访问
- 🌓 深色模式 - 支持明暗主题切换
- 🔐 JWT 认证 - 安全的用户认证和授权
- 🔄 实时数据 - React Query 实现数据自动同步
- 📊 数据可视化 - 财务报表、销售统计
- 🎯 DDD 架构 - 清晰的领域驱动设计

## 🛠️ 技术栈

### 前端

- **Next.js 13** - React 框架（App Router）
- **TypeScript** - 类型安全
- **Ant Design** - UI 组件库
- **React Query** - 数据获取和状态管理
- **Zustand** - 轻量级状态管理
- **Day.js** - 日期处理

### 后端

- **NestJS** - Node.js 框架
- **TypeScript** - 类型安全
- **Prisma** - ORM 数据库工具
- **MySQL** - 关系型数据库
- **Passport.js** - 身份认证
- **JWT** - Token 认证
- **class-validator** - 数据验证

## 📦 快速开始

### 环境要求

- Node.js 16+
- MySQL 8.0+
- Yarn 或 npm

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/luyaowang-cv/petshop-management-system.git
cd petshop-management-system
```

2. **后端配置**

```bash
cd server
yarn install

# 配置环境变量
cp .example.env .env
# 编辑 .env 文件，配置数据库连接等信息

# 运行数据库迁移
yarn prisma migrate dev

# 启动后端服务
yarn start:dev
```

3. **前端配置**

```bash
cd client
yarn install

# 配置环境变量
cp .example.env .env
# 编辑 .env 文件，配置 API 地址

# 启动前端服务
yarn dev
```

4. **访问应用**

- 前端：http://localhost:3000
- 后端 API：http://localhost:3333

### 默认账号

- 用户名：admin
- 密码：admin123

## 📁 项目结构

```
petshop-project/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── app/           # Next.js 页面
│   │   ├── components/    # React 组件
│   │   ├── services/      # API 服务
│   │   ├── stores/        # 状态管理
│   │   └── @types/        # TypeScript 类型定义
│   └── package.json
│
├── server/                 # 后端项目
│   ├── src/
│   │   ├── app/           # 应用层
│   │   │   ├── entities/      # 领域实体
│   │   │   ├── repositories/  # 仓储接口
│   │   │   └── use-cases/     # 业务用例
│   │   ├── infra/         # 基础设施层
│   │   │   ├── database/      # 数据库实现
│   │   │   ├── http/          # HTTP 控制器
│   │   │   └── cryptography/  # 加密服务
│   │   └── main.ts
│   ├── prisma/            # 数据库 Schema
│   └── package.json
│
└── README.md
```

## 🗄️ 数据库设计

系统采用关系型数据库设计，主要包含以下核心表：

- **User** - 用户表
- **Customer** - 客户表
- **Pet** - 宠物表
- **PetshopService** - 服务项目表
- **Appointment** - 预约表
- **Product** - 商品表
- **ProductOrder** - 商品订单表
- **StockRecord** - 库存记录表
- **FinanceRecord** - 财务记录表
- **PointsRecord** - 积分记录表
- **RechargeRecord** - 充值记录表
- **SmsConfig** - 短信配置表
- **SmsRecord** - 短信记录表

详细的 ERD 图请查看：`server/prisma/ERD.svg`

## 🚀 部署

### 前端部署（Vercel）

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

### 后端部署（云服务器）

1. 购买云服务器（阿里云/腾讯云等）
2. 安装 Node.js 和 MySQL
3. 上传代码并安装依赖
4. 配置 PM2 进程管理
5. 配置 Nginx 反向代理

## 📝 开发计划

- [ ] 疫苗提醒功能
- [ ] 客户端小程序
- [ ] 实时消息推送
- [ ] 数据导出功能
- [ ] 更多报表统计

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

如有问题或建议，欢迎联系！

---

⭐ 如果这个项目对你有帮助，请给个 Star！
