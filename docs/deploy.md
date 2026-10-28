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

## 更新上线流程（git 部署）

```bash
# 本地改完代码后
git add -A
git commit -m "..."   # 注意：.env 已被 gitignore，不会提交
git push origin main

# 服务器上（一键部署：git pull + 按改动只重建对应容器）
/root/deploy-petshop.sh
```

`deploy-petshop.sh` 会 `git pull --ff-only`，然后：
- `server/` 有改动 → 重建 `petshop-backend`
- `client/` 有改动 → 重建 `petshop-workbench`
- 只改 `docs/`、`miniprogram/` 等 → 只 pull，不重建容器

## 密钥（务必只留在服务器，不上 git）

- `server/.env`（DB 密码、JWT、微信凭证等）和 `client/.env`（API 地址）已被 `.gitignore` 忽略，只存在于服务器本地。
- 首次部署的建库建用户步骤见 `miniprogram-mvp-deploy.md`。

## 回滚

```bash
git revert <commit> && git push origin main
# 服务器上 /root/deploy-petshop.sh
```
