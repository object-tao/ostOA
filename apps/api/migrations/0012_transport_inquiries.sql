CREATE TABLE IF NOT EXISTS transport_inquiries (
  id TEXT PRIMARY KEY,
  inquiry_no TEXT NOT NULL UNIQUE,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  cargo_name TEXT NOT NULL,
  cargo_type TEXT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  weight_kg REAL,
  volume_cbm REAL,
  package_count INTEGER,
  ready_date TEXT,
  target_arrival_date TEXT,
  customs_mode TEXT,
  temperature_requirement TEXT,
  special_requirement TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS transport_plans (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL,
  plan_no TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  route TEXT NOT NULL,
  transit_days INTEGER NOT NULL,
  estimated_cost REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  plan_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inquiry_id) REFERENCES transport_inquiries(id)
);

CREATE INDEX IF NOT EXISTS idx_transport_inquiries_created_at ON transport_inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_transport_inquiries_status ON transport_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_transport_plans_inquiry_id ON transport_plans(inquiry_id);

INSERT OR IGNORE INTO transport_inquiries (
  id, inquiry_no, customer_id, customer_name, contact_name, contact_phone, cargo_name, cargo_type,
  origin, destination, weight_kg, volume_cbm, package_count, ready_date, target_arrival_date,
  customs_mode, temperature_requirement, special_requirement, status, created_at, updated_at
) VALUES (
  'tinq_seed_001',
  'INQ-20260514-001',
  'cus_001',
  'Obsidian Semi',
  'Wendy Qian',
  '+86 139 0100 0001',
  '半导体设备配件',
  '普货',
  '中国 上海',
  '哈萨克斯坦 阿拉木图',
  8600,
  38,
  18,
  '2026-05-20',
  '2026-06-02',
  '一般贸易',
  '常温',
  '客户要求优先铁路，需包含阿拉山口/霍尔果斯口岸备选。',
  'PLAN_READY',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO transport_plans (
  id, inquiry_id, plan_no, title, route, transit_days, estimated_cost, currency, plan_text, status, created_at, updated_at
) VALUES (
  'tpln_seed_001',
  'tinq_seed_001',
  'PLN-20260514-001',
  '上海至阿拉木图铁路集装箱方案',
  '上海仓库 -> 西安/乌鲁木齐集结 -> 霍尔果斯口岸 -> 阿拉木图派送',
  13,
  4680,
  'USD',
  '推荐铁路集装箱运输。先在上海完成提货和国内报关资料预审，经西安或乌鲁木齐集结后从霍尔果斯出境，抵达阿拉木图后安排清关与末端派送。重点关注装箱加固、申报要素一致性、口岸换装排队和目的港清关资料提前确认。',
  'DRAFT',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
