# GitHub + Cloudflare CI/CD

## 架构

- Web: Cloudflare Pages，推荐项目名 `ostoa-web`
- API: Cloudflare Worker，名称 `ostoa-api`
- Database: Cloudflare D1，推荐数据库名 `ostoa`
- CI/CD: GitHub Actions

## 需要你在 GitHub 配置的 Secrets

进入 `object-tao/ostOA` 仓库：

`Settings -> Secrets and variables -> Actions -> New repository secret`

添加：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT`
- `VITE_API_BASE_URL`
- `AUTH_SECRET`

推荐值：

- `CLOUDFLARE_PAGES_PROJECT`: `ostoa-web`
- `VITE_API_BASE_URL`: `https://ostoa-api.<你的 workers.dev 子域>`，绑定自定义域后可改为你的 API 域名
- `AUTH_SECRET`: 一串足够长的随机字符串

## Cloudflare 一次性设置

1. 创建 Pages 项目，名称建议 `ostoa-web`。构建由 GitHub Actions 执行，不需要开启 Cloudflare 自带 GitHub 构建。
2. 创建 D1 数据库，名称建议 `ostoa`。
3. 把 D1 database id 写入 [wrangler.toml](C:/Users/Administrator/Documents/New%20project/apps/api/wrangler.toml) 的 `database_id`。
4. 创建 Cloudflare API Token，权限至少包含：
   - Account: Cloudflare Pages Edit
   - Account: Workers Scripts Edit
   - Account: D1 Edit
   - Zone: DNS Edit，仅当你要自动或手动绑定自定义域时需要

## 首次部署顺序

1. 推送代码到 `https://github.com/object-tao/ostOA.git`
2. 配置 GitHub Secrets
3. 在 Cloudflare 创建 Pages 项目和 D1 数据库
4. 更新 `apps/api/wrangler.toml` 的 `database_id`
5. 在 GitHub Actions 手动运行 `Deploy API`
6. 在 GitHub Actions 手动运行 `Deploy Web`
7. 验证 API：`/api/health`
8. 验证 Web：打开 Cloudflare Pages 分配的域名并登录

## 工作流说明

### `ci.yml`

每次 PR 或推送到 `main/master` 时运行：

- `npm ci`
- `npm run lint`
- `npm run build`

### `deploy-api.yml`

- 执行 `wrangler d1 migrations apply ostoa --remote`
- 部署 Worker `ostoa-api`
- 注入 `AUTH_SECRET`

### `deploy-web.yml`

- 写入生产环境 `VITE_API_BASE_URL`
- 构建 React 前端
- 部署 `apps/web/dist` 到 Cloudflare Pages

## 默认登录

- Email: `admin@obiecrm.com`
- Password: `Admin123!`
