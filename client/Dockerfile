# 工作台（Next.js 14 管理后台）部署镜像
# 在服务器 ~/petshop/client 目录执行：docker compose -f docker-compose.prod.yml up -d --build

# ---------- build ----------
FROM node:20-slim AS build
WORKDIR /app

# node:20 官方镜像已内置 yarn 1.22.22，无需再装

# 依赖层（利用 Docker 缓存）
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 源码 + .env（NEXT_PUBLIC_API_URL 会在构建时内联进产物）
COPY . .

# 2G 低配机：限制 V8 堆，避免 next build 把宿主机内存打爆（连带 backend/db）
# AntD + recharts 的 webpack 编译较吃内存，512 会 OOM，放宽到 1024（swap 兜底）
ENV NODE_OPTIONS=--max-old-space-size=1024
RUN yarn build

# ---------- run ----------
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production

# next start 需要 .next 产物 + node_modules + next.config.js（本项目无 public/）
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.js ./next.config.js
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start"]
