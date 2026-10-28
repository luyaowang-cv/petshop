# 🐾 爱尚宠物管理系统 - 前端展示

> 这是一个现代化的宠物店管理系统前端项目，展示了完整的 UI/UX 设计和前端技术实现。

⚠️ **注意：本仓库仅包含前端代码，用于技术展示和学习参考。后端 API 未开源。**

---

## ✨ 项目亮点

### 🎨 UI/UX 设计

- 现代化的界面设计
- 完整的响应式布局（支持电脑/平板/手机）
- 深色模式支持
- 流畅的交互体验

### 💻 技术栈

- **Next.js 13** - React 框架（App Router）
- **TypeScript** - 类型安全
- **Ant Design 5** - 企业级 UI 组件库
- **React Query** - 数据获取和状态管理
- **Zustand** - 轻量级状态管理
- **Tailwind CSS** - 原子化 CSS

### 🎯 核心功能展示

#### 1. 数据看板

- 实时统计数据展示
- 今日预约列表
- 财务数据可视化

#### 2. 客户管理

- 客户信息管理
- 会员等级系统（VIP/普通）
- 积分和余额管理
- 宠物档案管理

#### 3. 服务预约

- 在线预约功能
- 预约状态管理
- 服务订单跟踪

#### 4. 商品管理

- 商品信息展示
- 分类管理
- 库存管理

#### 5. 财务统计

- 收入统计图表
- 商品销量分析
- 利润报表

#### 6. 系统设置

- 门店信息配置
- 支付设置
- 短信通知配置

---

## 📸 项目截图

### 首页 - 数据看板

![首页](./screenshots/dashboard.png)

### 客户管理

![客户管理](./screenshots/customers.png)

### 服务预约

![服务预约](./screenshots/appointments.png)

### 响应式设计

![响应式](./screenshots/responsive.png)

---

## 🚀 快速开始

### 环境要求

- Node.js 16+
- Yarn 或 npm

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/luyaowang-cv/petshop-management-system-frontend.git
cd petshop-management-system-frontend
```

2. **安装依赖**

```bash
cd client
yarn install
```

3. **配置环境变量**

```bash
cp .env.example .env
# 编辑 .env 文件，配置 API 地址
```

4. **启动开发服务器**

```bash
yarn dev
```

5. **访问应用**

```
http://localhost:3000
```

---

## 📁 项目结构

```
client/
├── src/
│   ├── app/                 # Next.js 页面（App Router）
│   │   ├── dashboard/       # 管理后台
│   │   │   ├── (pages)/    # 各功能页面
│   │   │   │   ├── customers/      # 客户管理
│   │   │   │   ├── appointments/   # 预约管理
│   │   │   │   ├── products/       # 商品管理
│   │   │   │   ├── services/       # 服务管理
│   │   │   │   ├── orders/         # 订单管理
│   │   │   │   ├── inventory/      # 库存管理
│   │   │   │   ├── finance/        # 财务统计
│   │   │   │   └── settings/       # 系统设置
│   │   │   └── page.tsx     # 首页
│   │   └── login/           # 登录页
│   │
│   ├── components/          # React 组件
│   │   ├── common/          # 通用组件
│   │   ├── layouts/         # 布局组件
│   │   ├── ui/              # UI 基础组件
│   │   ├── customers/       # 客户相关组件
│   │   ├── services/        # 服务相关组件
│   │   └── inventory/       # 库存相关组件
│   │
│   ├── services/            # API 服务层
│   │   └── queries/         # React Query 查询
│   │
│   ├── stores/              # Zustand 状态管理
│   ├── theme/               # 主题配置
│   ├── utils/               # 工具函数
│   └── @types/              # TypeScript 类型定义
│
├── public/                  # 静态资源
├── package.json
└── tsconfig.json
```

---

## 🎨 设计特点

### 1. 响应式设计

- 使用 Ant Design 的栅格系统
- 支持 xs/sm/md/lg/xl 断点
- 移动端优先的设计理念

### 2. 主题系统

- 支持亮色/暗色主题切换
- 使用 Ant Design 主题定制
- 统一的颜色和样式规范

### 3. 组件化开发

- 高度模块化的组件结构
- 可复用的业务组件
- 清晰的组件层次

### 4. 状态管理

- React Query 管理服务端状态
- Zustand 管理客户端状态
- 自动缓存和数据同步

---

## 🛠️ 技术亮点

### 1. Next.js App Router

- 使用最新的 App Router 架构
- 服务端组件和客户端组件混合使用
- 优化的路由和加载性能

### 2. TypeScript 全覆盖

- 完整的类型定义
- 类型安全的 API 调用
- 更好的开发体验

### 3. React Query

- 智能的数据缓存
- 自动重新获取
- 乐观更新

### 4. 代码质量

- ESLint 代码检查
- Prettier 代码格式化
- 统一的代码风格

---

## 📚 学习资源

如果你想学习本项目使用的技术：

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [TypeScript 文档](https://www.typescriptlang.org/docs)
- [Ant Design 文档](https://ant.design/docs/react/introduce-cn)
- [React Query 文档](https://tanstack.com/query/latest)
- [Zustand 文档](https://zustand-demo.pmnd.rs)

---

## ⚠️ 重要说明

### 关于后端 API

本仓库仅包含前端代码。要运行完整的应用，你需要：

1. **自行实现后端 API**
   - 参考 `client/src/services/` 目录下的 API 调用
   - 实现对应的 RESTful API 接口

2. **或使用 Mock 数据**
   - 可以使用 JSON Server 或 MSW 模拟 API
   - 用于学习和演示

3. **API 接口文档**
   - 查看 `client/src/services/queries/` 了解 API 结构
   - 所有接口都有完整的 TypeScript 类型定义

### 数据库设计

后端使用的数据库结构可以从前端的类型定义中推断：

- 查看 `client/src/@types/` 目录
- 包含所有数据模型的 TypeScript 定义

---

## 📄 许可证

MIT License

本项目仅用于学习和技术展示。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

如果你觉得这个项目对你有帮助，请给个 ⭐ Star！

---

## 📧 联系方式

- GitHub: [@luyaowang-cv](https://github.com/luyaowang-cv)
- 项目地址: [petshop-management-system-frontend](https://github.com/luyaowang-cv/petshop-management-system-frontend)

---

## 🙏 致谢

感谢所有开源项目和社区的支持！

---

**注意：** 如需完整的前后端项目（包括后端代码），请联系作者。
