# 阶段 A 部署镜像：多阶段构建，最终镜像只含 dist + 生产依赖。
# 在服务器上执行：docker compose -f docker-compose.prod.yml up -d --build

# ---------- build ----------
# 用 Debian(slim) 而不是 Alpine（Prisma 引擎是 glibc 版）。
# Prisma 靠 `openssl version -v` / ldconfig 检测 OpenSSL 版本；slim 镜像里没有 openssl
# 命令行，检测失败会默认回落 openssl-1.1.x，运行时报 libssl.so.1.1 缺失崩溃。
# 所以 build / run 两个阶段都要装 openssl。
FROM node:20-slim AS build
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# 依赖层（利用 Docker 缓存）
COPY package.json package-lock.json ./
RUN npm ci

# 只生成 client，跳过 erd 生成器（erd 依赖 puppeteer/Chromium，拖慢构建；生产也不需要 ERD.svg）
COPY prisma ./prisma
RUN npx prisma generate --generator client

# 编译源码（nest build → dist/main.js）
COPY . .
RUN npm run build

# 去掉 dev 依赖，缩小最终镜像
RUN npm prune --omit=dev

# ---------- run ----------
FROM node:20-slim
WORKDIR /app

# 运行时加载 Prisma 引擎同样靠 openssl 检测 OpenSSL 版本，这里也要装。
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# 上传图片落这里（compose 里挂 volume 持久化）
RUN mkdir -p /app/uploads

EXPOSE 3333
CMD ["node", "dist/main"]
