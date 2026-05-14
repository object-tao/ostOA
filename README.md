# ostOA 中亚运输管理系统

第一阶段先交付两个模块：

- 询单管理：录入客户、货物、起运地、目的地、重量体积、报关方式和特殊要求。
- 生成方案：基于询单生成中亚铁路/汽铁联运方案，保存路线、时效、预估费用和操作说明。

## 技术栈

- `apps/web`: React + Vite + Ant Design
- `apps/api`: Cloudflare Worker API + D1 migrations
- `GitHub Actions`: CI、Cloudflare Pages 部署、Worker/D1 部署
- 生产域名：`https://ostoa.org`
- API 域名：`https://api.ostoa.org`

## 默认管理员

- Email: `admin@obiecrm.com`
- Password: `Admin123!`

## 本地开发

```powershell
npm.cmd install
npm.cmd run db:migrate:local -w apps/api
npm.cmd run dev:api
npm.cmd run dev:web
```

## 部署

CI/CD 已放在 `.github/workflows`：

- `CI`: 安装依赖、类型检查、构建前后端
- `Deploy API`: 应用 D1 migrations 并部署 `ostoa-api`
- `Deploy Web`: 构建 Web 并部署到 Cloudflare Pages

完整授权和配置步骤见 [docs/github-cloudflare-cicd.md](C:/Users/Administrator/Documents/New%20project/docs/github-cloudflare-cicd.md)。
