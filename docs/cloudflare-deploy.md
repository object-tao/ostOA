# Cloudflare 部署说明

## 第一次配置

在项目根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/configure-cloudflare-token.ps1
```

按提示输入 Cloudflare API Token。输入时不会显示，保存到当前 Windows 用户环境变量。

## 一键同步线上

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-cloudflare.ps1
```

脚本会依次执行：

1. 构建 API
2. 构建 Web
3. 同步远程 D1 数据库迁移
4. 发布 `ostoa-api`
5. 发布 `ostoa-web`

## 可选参数

只发布前端：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-cloudflare.ps1 -SkipMigration -SkipApi
```

只发布 API：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-cloudflare.ps1 -SkipWeb
```

## Token 权限

Cloudflare API Token 至少需要：

- Account / Workers Scripts / Edit
- Account / Pages / Edit
- Account / D1 / Edit
- Account / Workers R2 Storage / Edit
- Zone / Zone / Read
- Zone / Workers Routes / Edit

