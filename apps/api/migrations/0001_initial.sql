CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  real_name TEXT NOT NULL,
  role_code TEXT NOT NULL,
  role_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  last_contacted_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'New',
  owner TEXT NOT NULL,
  expected_close_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  related_to TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Open',
  due_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO users (id, email, password_hash, real_name, role_code, role_name)
VALUES ('usr_admin', 'admin@obiecrm.com', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'Olivia Chen', 'ADMIN', '超级管理员');

INSERT OR IGNORE INTO contacts (id, name, company, email, phone, status, last_contacted_at)
VALUES
  ('con_001', 'Lena Gao', 'Northstar Retail', 'lena@northstar.com', '+86 138 1000 2001', 'Active', '2026-05-10'),
  ('con_002', 'Ethan Wu', 'Blue Harbor Tech', 'ethan@blueharbor.com', '+86 138 1000 2002', 'Prospect', '2026-05-08'),
  ('con_003', 'Sofia Lin', 'Zenith Supply', 'sofia@zenith.com', '+86 138 1000 2003', 'Dormant', '2026-05-02');

INSERT OR IGNORE INTO deals (id, name, company, value, stage, owner, expected_close_date)
VALUES
  ('deal_001', 'Northstar 年度续约', 'Northstar Retail', 320000, 'Negotiation', 'Olivia Chen', '2026-05-28'),
  ('deal_002', 'Blue Harbor 新客试点', 'Blue Harbor Tech', 180000, 'Proposal', 'Olivia Chen', '2026-06-05'),
  ('deal_003', 'Zenith 售后增购', 'Zenith Supply', 92000, 'Qualified', 'Olivia Chen', '2026-06-12');

INSERT OR IGNORE INTO tasks (id, title, related_to, priority, status, due_date)
VALUES
  ('task_001', '跟进 Northstar 法务条款', 'Northstar 年度续约', 'High', 'In Progress', '2026-05-14'),
  ('task_002', '准备 Blue Harbor 演示材料', 'Blue Harbor 新客试点', 'Medium', 'Open', '2026-05-16'),
  ('task_003', '回访 Zenith 沉默账户', 'Zenith Supply', 'Low', 'Done', '2026-05-09');

INSERT OR IGNORE INTO activity_logs (id, title, detail)
VALUES
  ('act_001', '新商机推进', 'Northstar 年度续约进入 Negotiation 阶段'),
  ('act_002', '联系人创建', '新增联系人 Ethan Wu'),
  ('act_003', '任务完成', '完成 Zenith 售后增购回访');
