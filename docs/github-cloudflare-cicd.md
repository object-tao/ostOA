# GitHub + Cloudflare CI/CD

## 架构

- Web: Cloudflare Pages，推荐项目名 `ostoa-web`，绑定域名 `ostoa.org`
- API: Cloudflare Worker，名称 `ostoa-api`，绑定域名 `api.ostoa.org`
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
- `VITE_API_BASE_URL`: `https://api.ostoa.org`
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

## 域名绑定

域名已经在 Cloudflare 购买并托管，所以推荐这样绑定：

### Web 主站

在 Cloudflare Dashboard：

1. 打开 `Workers & Pages -> ostoa-web`
2. 进入 `Custom domains`
3. 添加 `ostoa.org`
4. 可选添加 `www.ostoa.org`，并在 Pages 或 Redirect Rules 中重定向到 `ostoa.org`

### API

在 Cloudflare Dashboard：

1. 打开 `Workers & Pages -> ostoa-api`
2. 进入 `Settings -> Domains & Routes`
3. 添加自定义域 `api.ostoa.org`
4. 确认 Worker 能访问 D1 binding `DB`

当前 Worker CORS 已允许：

- `https://ostoa.org`
- `https://www.ostoa.org`
- `https://ostoa-web.pages.dev`

## 首次部署顺序

1. 推送代码到 `https://github.com/object-tao/ostOA.git`
2. 配置 GitHub Secrets
3. 在 Cloudflare 创建 Pages 项目和 D1 数据库
4. 更新 `apps/api/wrangler.toml` 的 `database_id`
5. 在 GitHub Actions 手动运行 `Deploy API`
6. 在 GitHub Actions 手动运行 `Deploy Web`
7. 给 Worker 绑定 `api.ostoa.org`
8. 给 Pages 绑定 `ostoa.org`
9. 验证 API：`https://api.ostoa.org/api/health`
10. 验证 Web：`https://ostoa.org`

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
