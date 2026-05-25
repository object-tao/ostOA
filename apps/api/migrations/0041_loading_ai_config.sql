CREATE TABLE IF NOT EXISTS loading_ai_config (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'openai',
  api_base_url TEXT NOT NULL DEFAULT 'https://api.openai.com/v1/responses',
  api_key TEXT,
  model TEXT NOT NULL DEFAULT 'gpt-4.1-mini',
  enabled INTEGER NOT NULL DEFAULT 1,
  system_prompt TEXT,
  temperature REAL NOT NULL DEFAULT 0.2,
  max_output_tokens INTEGER NOT NULL DEFAULT 2000,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO loading_ai_config (
  id, provider, api_base_url, model, enabled, system_prompt, temperature, max_output_tokens, notes
) VALUES (
  'default',
  'openai',
  'https://api.openai.com/v1/responses',
  'gpt-4.1-mini',
  1,
  '你是中亚大件运输配货专家。请用中文分析系统配载方案与人工方案的差异。目标：按整票总体成本、车辆数量、平板31吨限制、中亚44吨规则、超限证风险、可叠/不可压要求，提出优化建议。如果信息不足，请以问答方式提出最多5个关键问题；如果能判断，请给出建议方案和应沉淀的算法规则。',
  0.2,
  2000,
  '配货配载模块 AI 优化配置。API Key 可在基础信息中维护；线上也可继续使用 Cloudflare Secret 作为兜底。'
);
