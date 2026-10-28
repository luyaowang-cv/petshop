# 小程序后端 · 阶段 A 部署手册

> 目标：把后端部署到首尔服务器，让小程序**真机**能访问，打通「真机下单 → 工作台审核」。
> 阶段 A 只上后端，工作台仍留本地（指向服务器后端）。不依赖 GitHub，纯手动。

## 架构（阶段 A）

```
微信小程序（真机）
      │ HTTPS
      ▼
https://pet-api.offerscoming.cn  ── Caddy 反代（复用 job-assistant 的 Caddy）
      │
      ▼
petshop-backend :3333（本仓库新增容器）
      │
      ▼
job-assistant-db（复用现有 Postgres，新增 petshop 库）
```

复用了首尔服务器上已存在的 **Caddy** 和 **Postgres**，只新增一个 `petshop-backend` 容器，省内存。

## 前提

1. 服务器已在跑 job-assistant（`docker ps` 能看到 `job-assistant-caddy`、`job-assistant-db`）。
2. 域名 `offerscoming.cn` 已实名（用作真机没问题；正式发布仍需大陆备案，见 spec §11）。
3. **真机登录**需要真实小程序 AppID + AppSecret（否则后端走 Mock，手机上 `getPhoneNumber` 无法真机联调）。

---

## 步骤 0：DNS 解析

在 Cloudflare 加一条 A 记录（**灰云 / DNS Only**，不要开代理，否则 Caddy 签不出证书）：

| 类型 | 名称 | 值 |
|---|---|---|
| A | `pet-api` | `43.108.107.79` |

等解析生效：

```bash
nslookup pet-api.offerscoming.cn 8.8.8.8
```

## 步骤 1：建库建用户（服务器）

在现有 Postgres 容器里建一个独立库和用户：

```bash
docker exec -i job-assistant-db psql -U job_assistant -d postgres <<'SQL'
CREATE USER petshop WITH PASSWORD '在这里生成一个强密码';
CREATE DATABASE petshop OWNER petshop;
SQL
```

> 记下这个密码，下一步写进 `.env` 的 `PETSHOP_DB_PASSWORD`。

## 步骤 2：传源码 + 写 .env

**本机（Windows Git Bash）打包源码并上传**（排除 node_modules/dist/uploads/.env）：

```bash
cd server
tar --exclude=node_modules --exclude=dist --exclude=uploads --exclude=.env \
    -czf /tmp/petshop-server-src.tgz .
scp /tmp/petshop-server-src.tgz root@43.108.107.79:/tmp/
ssh root@43.108.107.79 'mkdir -p ~/petshop/server && tar -xzf /tmp/petshop-server-src.tgz -C ~/petshop/server'
```

**服务器上写 `~/petshop/server/.env`**（值从本机 `server/.env` 复制，密钥别手抄）：

```env
PETSHOP_DB_PASSWORD=<步骤 1 的密码>

JWT_SECRET_KEY=<从本机 server/.env 复制>
JWT_REFRESH_SECRET_KEY=<复制>
CUSTOMER_JWT_SECRET_KEY=<复制>
SMS_ENCRYPTION_KEY=<复制>
ADMIN_PASSWORD=123456

# 真机登录填真实值；暂不真机登录可留空（走 Mock）
WECHAT_APP_ID=
WECHAT_APP_SECRET=
```

```bash
chmod 600 ~/petshop/server/.env
```

> 核对只列 key 名、不 cat 出值：`grep -oE '^[A-Z_]+' ~/petshop/server/.env`

## 步骤 3：数据库迁移（本机，SSH 隧道）

沿用 job-assistant 的迁移方式——db 只绑回环地址，从本机走隧道迁移。

> **本地端口用 5434，别用 5433**：你本机的开发数据库已经占着 5433（本地 `server/.env` 的 `DB_URL` 是 `localhost:5433`），隧道再用 5433 会绑不上，`prisma migrate` 会误连到本机库报 `authentication failed for petshop`。

**终端 1** 建隧道（保持不关）：

```bash
ssh -N -L 5434:127.0.0.1:5432 root@43.108.107.79
```

**终端 2** 应用迁移：

```bash
cd server
DB_URL='postgresql://petshop:<步骤1的密码>@127.0.0.1:5434/petshop?schema=public' \
  npx prisma migrate deploy
```

> 用 `migrate deploy`（幂等），别用 `migrate dev`（会开 shadow database + 交互式问迁移名）。

## 步骤 4：构建 + 启动（服务器）

```bash
ssh root@43.108.107.79 'cd ~/petshop/server && docker compose -f docker-compose.prod.yml up -d --build'
ssh root@43.108.107.79 'docker logs --tail 30 petshop-backend'
```

预期日志末尾是 Nest 启动成功、没有 `SMS_ENCRYPTION_KEY ... not set` 或数据库连接错误。

> 2G 机器上 `nest build` 比 Nuxt 轻得多，一般不会 OOM。万一 OOM，退回本机构建再 `docker save`/`docker load`。

## 步骤 5：Caddy 加反代（服务器）

在 `~/job-assistant/Caddyfile` 里加一段（放在 `offerscoming.cn` 块之后）：

```caddy
pet-api.offerscoming.cn {
    encode gzip
    reverse_proxy petshop-backend:3333
}
```

重载 Caddy（不重启容器）：

```bash
docker exec -w /etc/caddy job-assistant-caddy caddy reload --config /etc/caddy/Caddyfile
```

## 步骤 6：改前端指向

- **小程序**：`miniprogram/src/constants/config.ts` 的 `API_BASE_URL` 已改为 `https://pet-api.offerscoming.cn`。
- **工作台（可选，真机联调审核时才需要）**：把 `client/.env` 的 `NEXT_PUBLIC_API_URL` 改成 `https://pet-api.offerscoming.cn`，重启本地 `npm run dev`。这样店员本地浏览器审核的预约，和真机提交的预约落在同一个服务器库。

## 步骤 7：验证

```bash
# 后端经 Caddy 通了没（能拿到 admin token 即通）
curl -s https://pet-api.offerscoming.cn/sessions \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@email.com","password":"123456"}' | head -c 200

# 容器状态与内存
docker ps --filter name=petshop-backend
docker stats --no-stream
```

然后按 [miniprogram-mvp-spec.md](./miniprogram-mvp-spec.md) §10 走一遍真机验收清单（登录 → 宠物 → 预约 → 工作台审核 → 会员中心）。

---

## 常见问题

| 症状 | 排查 |
|---|---|
| `https://pet-api.offerscoming.cn` 打不开 | `docker logs job-assistant-caddy`；DNS 是不是橙色云（要灰云）；80/443 安全组放行没 |
| 后端连不上数据库 | `docker network ls` 核对网络名是不是 `job-assistant_default`，不是就改 compose 里的 `networks` 名字 |
| 启动即崩 `SMS_ENCRYPTION_KEY not set` | `.env` 少了 `SMS_ENCRYPTION_KEY`，补上后 `up -d` 重建（`restart` 不重读 env） |
| 改了 `.env` 不生效 | 必须 `docker compose up -d` 重建，`restart` 不会重读环境变量 |
| 内存告警 | `docker stats --no-stream` 看 `petshop-backend` 是否逼近 512MiB |
