# Obie CRM

Obie CRM is a fresh Cloudflare-native starter built for:

- Cloudflare Pages for the React admin
- Cloudflare Workers for the API
- Cloudflare D1 for data storage

## Apps

- `apps/web`: React + Vite admin console
- `apps/api`: Cloudflare Worker API and D1 migrations

## Default admin

- Email: `admin@obiecrm.com`
- Password: `Admin123!`

## Local development

1. Create API secrets:

```powershell
Copy-Item apps/api/.dev.vars.example apps/api/.dev.vars
```

2. Start the Worker locally:

```powershell
npm.cmd run dev:api
```

3. In a second terminal, start the web app:

```powershell
npm.cmd run dev:web
```

4. Apply local D1 migrations if needed:

```powershell
npm.cmd run db:migrate:local -w apps/api
```

## Deployment

GitHub Actions are set up for:

- `CI`: typecheck and build
- `Deploy Web`: deploy the admin to Cloudflare Pages
- `Deploy API`: apply D1 migrations and deploy the Worker

Full setup steps are in [docs/github-cloudflare-cicd.md](C:/Users/Administrator/Documents/New%20project/docs/github-cloudflare-cicd.md).
