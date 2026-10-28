# 宠物店管理系统部署手册

## 架构总览

| 项 | 值 |
|---|---|
| 工作台 | `https://pet.offerscoming.cn`（Next.js 管理后台，`petshop-workbench` 容器） |
| API | `https://pet-api.offerscoming.cn`（NestJS 后端，`petshop-backend` 容器） |
| 小程序 | Taro，通过微信开发者工具发布，**不走本服务器** |
| 服务器 | 阿里云 首尔（境外，免备案） |
| 代码仓库 | `https://github.com/luyaowang-cv/petshop`（公开） |
| 数据库 | 复用 job-assistant 的 `job-assistant-db`（PostgreSQL） |
| HTTPS | 复用 job-assistant 的 Caddy 反代 + Let's Encrypt |

## 目录

- `client/` — Next.js 管理后台（工作台）→ `petshop-workbench`
- `server/` — NestJS 后端 API → `petshop-backend`
- `miniprogram/` — Taro 小程序（微信开发者工具发布）

## 更新上线流程（CI 构建 + 服务器轮询自动部署）

```bash
# 本地改完代码后
git add -A
git commit -m "..."   # 注意：.env 已被 gitignore，不会提交
git push origin main
```

推到 `main` 后全自动：

1. **GitHub Actions**（`.github/workflows/deploy.yml`）构建两个镜像并推到 ghcr（公开仓库，服务器拉取无需登录）：
   - `ghcr.io/luyaowang-cv/petshop-api:latest`（构建 `server/`）
   - `ghcr.io/luyaowang-cv/petshop-workbench:latest`（构建 `client/`）
2. 服务器每 2 分钟跑一次 `/root/watch-deploy-petshop.sh`（crontab + flock），发现 ghcr 上 `:latest` 镜像 ID 变了，就 `docker compose pull` + `force-recreate` 对应容器。

最吃内存的 `next build`/`nest build` 在 GitHub runner 上完成，2G 服务器只拉现成镜像，彻底告别服务器本地编译的 OOM。两个项目（job-assistant + petshop）共用这台机器也没压力。

### 手动兜底

自动部署异常或想立即上线时，在服务器上手动跑一轮：

```bash
flock -n /tmp/petshop-deploy.lock /root/watch-deploy-petshop.sh
# 或在 GitHub 仓库 Actions 页手动重跑 workflow（重建镜像）
```

旧的手工脚本 `/root/deploy-petshop.sh`（`git pull` + 本地 `--build`）保留作兜底，但会在服务器本地编译，较慢。

### 数据库迁移（会暂停自动部署）

如果某次提交改了 `server/prisma/migrations/`，`watch-deploy-petshop.sh` 会**暂停自动部署**——生产镜像里没有 Prisma CLI，新代码先上会撞旧表结构。手动迁移：

```bash
# 1. 在服务器上用一次性容器跑迁移（挂载迁移目录 + 连到 job-assistant_default 网络的 DB）
cd /root/petshop/server
DB_PASS=$(grep '^PETSHOP_DB_PASSWORD=' /root/petshop/server/.env | cut -d= -f2-)
docker run --rm -v "$PWD/prisma:/app/prisma" --network job-assistant_default \
  -e DATABASE_URL="postgresql://petshop:${DB_PASS}@job-assistant-db:5432/petshop?schema=public" \
  node:20-slim sh -c "cd /app && npx --yes prisma@5 migrate deploy"

# 2. 解除暂停：把 git 前进到最新，再手动触发部署
cd /root/petshop && git pull --ff-only
flock -n /tmp/petshop-deploy.lock /root/watch-deploy-petshop.sh
```

## 密钥（务必只留在服务器，不上 git）

- `server/.env`（DB 密码、JWT、微信凭证等）已被 `.gitignore` 忽略，只存在于服务器本地。
- `client/.env.production`（API 地址 `NEXT_PUBLIC_API_URL`，非机密，会内联进前端产物）已提交进仓库，供 CI 构建工作台时读取。
- 首次部署的建库建用户步骤见 `miniprogram-mvp-deploy.md`。

## 回滚

```bash
git revert <commit> && git push origin main
# 服务器 2 分钟内自动拉取旧镜像并重建；或手动：
#   flock -n /tmp/petshop-deploy.lock /root/watch-deploy-petshop.sh
```
