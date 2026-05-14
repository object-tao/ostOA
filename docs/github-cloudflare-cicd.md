# GitHub + Cloudflare CI/CD

## Architecture

- `admin.obiecrm.com`: Cloudflare Pages
- `api.obiecrm.com`: Cloudflare Worker
- `D1`: primary database
- `GitHub Actions`: CI + deploy

## GitHub secrets

Add these in `Settings -> Secrets and variables -> Actions`.

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT`
- `VITE_API_BASE_URL`
- `AUTH_SECRET`

Recommended values:

- `CLOUDFLARE_PAGES_PROJECT`: `obiecrm-web`
- `VITE_API_BASE_URL`: `https://api.obiecrm.com`
- `AUTH_SECRET`: a long random string

## Cloudflare setup

### 1. Create the Pages project

Create a Pages project named `obiecrm-web`.

The actual deploy will be handled by GitHub Actions, so you do not need Cloudflare's own GitHub build integration.

### 2. Create the D1 database

Create a D1 database named `obiecrm`.

After creation, copy the database ID and replace the placeholder in [wrangler.toml](C:/Users/Administrator/Documents/New%20project/apps/api/wrangler.toml).

### 3. Create the Worker

Deploy will create the Worker named `obiecrm-api`.

After the first successful deploy:

1. Open `Workers & Pages`
2. Open `obiecrm-api`
3. Add custom domain `api.obiecrm.com`

### 4. Bind the Pages custom domain

Open the Pages project and add custom domain `admin.obiecrm.com`.

## First deployment order

1. Push this repo to GitHub
2. Add GitHub secrets
3. Create the Pages project
4. Create the D1 database
5. Replace the D1 database ID in [wrangler.toml](C:/Users/Administrator/Documents/New%20project/apps/api/wrangler.toml)
6. Run `Deploy API`
7. Run `Deploy Web`
8. Bind `api.obiecrm.com`
9. Bind `admin.obiecrm.com`

## What the workflows do

### `deploy-api.yml`

- Applies D1 migrations remotely
- Publishes the Worker
- Injects `AUTH_SECRET`

### `deploy-web.yml`

- Writes the production API base URL
- Builds the React app
- Deploys static assets to Cloudflare Pages

## Manual checks

After deployment, verify:

- `https://api.obiecrm.com/api/health`
- `https://admin.obiecrm.com`
- Login works with `admin@obiecrm.com / Admin123!`
