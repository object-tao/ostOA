CREATE TABLE IF NOT EXISTS gps_providers (
  id TEXT PRIMARY KEY,
  short_name TEXT NOT NULL,
  name TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  api_url TEXT,
  api_key TEXT,
  api_token TEXT,
  username TEXT,
  password_md5 TEXT,
  login_token TEXT,
  server_id TEXT,
  token_expires_at TEXT,
  last_query_position_time INTEGER DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  remark TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gps_providers_enabled ON gps_providers(enabled);

INSERT INTO gps_providers (
  id, short_name, name, website, phone, api_url, enabled, remark, created_at, updated_at
)
SELECT
  'gps_xinghe_tuan',
  '星河途安',
  '星河途安',
  'https://gitee.com/terry3/gwebmgr/wikis',
  '',
  '',
  1,
  '接口模式：login 获取 token/serverid，lastposition 按设备号查询最新位置。请维护 API 地址、账号、密码 MD5。',
  datetime('now'),
  datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM gps_providers WHERE id = 'gps_xinghe_tuan');
