CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  region TEXT,
  cooperation_status TEXT NOT NULL DEFAULT 'Prospect',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts_v2 (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  name TEXT NOT NULL,
  title TEXT,
  phone TEXT,
  email TEXT,
  wechat TEXT,
  social_handle TEXT,
  company_name TEXT,
  relationship_note TEXT,
  meeting_context TEXT,
  core_value TEXT,
  business_card_name TEXT,
  business_card_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS timelines (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  contact_id TEXT,
  follow_up_date TEXT NOT NULL,
  follow_up_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  todo_reminder_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (contact_id) REFERENCES contacts_v2(id)
);

CREATE TABLE IF NOT EXISTS tag_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  FOREIGN KEY (group_id) REFERENCES tag_groups(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_group_name ON tags(group_id, name);

CREATE TABLE IF NOT EXISTS entity_tags (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_entity_tags_unique ON entity_tags(entity_type, entity_id, tag_id);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO tag_groups (id, name, description, sort_order)
VALUES
  ('grp_industry', 'Industry', 'Industry dimension', 1),
  ('grp_region', 'Region', 'Region dimension', 2),
  ('grp_influence', 'Influence', 'Decision strength and relationship depth', 3),
  ('grp_interest', 'Interest', 'Personal interest and conversation starters', 4);

INSERT OR IGNORE INTO tags (id, group_id, name, color)
VALUES
  ('tag_semiconductor', 'grp_industry', 'Semiconductor', 'geekblue'),
  ('tag_logistics', 'grp_industry', 'Logistics', 'cyan'),
  ('tag_shanghai', 'grp_region', 'Shanghai', 'green'),
  ('tag_shenzhen', 'grp_region', 'Shenzhen', 'lime'),
  ('tag_key_decider', 'grp_influence', 'Key Decision Maker', 'volcano'),
  ('tag_connector', 'grp_influence', 'Resource Connector', 'purple'),
  ('tag_golf', 'grp_interest', 'Golf', 'gold'),
  ('tag_coffee', 'grp_interest', 'Coffee', 'orange');

INSERT OR IGNORE INTO customers (id, name, industry, phone, email, website, region, cooperation_status, notes)
VALUES
  ('cus_001', 'Obsidian Semi', 'Semiconductor', '+86 21 5555 1001', 'bd@obsidiansemi.com', 'https://obsidiansemi.example.com', 'Shanghai', 'Active', 'Potential strategic customer. Founder prefers concise updates.'),
  ('cus_002', 'Harbor Chain', 'Logistics', '+86 755 6666 9002', 'ops@harborchain.com', 'https://harborchain.example.com', 'Shenzhen', 'Prospect', 'Interested in CRM for channel partner management.'),
  ('cus_003', 'North Vale Studio', 'Creative Services', '+86 10 8888 2010', 'hello@northvale.com', 'https://northvale.example.com', 'Beijing', 'Dormant', 'Creative studio with periodic consulting requests.');

INSERT OR IGNORE INTO contacts_v2 (
  id, customer_id, name, title, phone, email, wechat, social_handle, company_name, relationship_note, meeting_context, core_value, business_card_name, business_card_url
)
VALUES
  ('ct_001', 'cus_001', 'Wendy Qian', 'VP Procurement', '+86 139 0100 0001', 'wendy.qian@obsidiansemi.com', 'wendy-qian', '@wendysemi', 'Obsidian Semi', 'Met through alumni dinner.', 'Quarterly semiconductor roundtable in Shanghai.', 'Can accelerate vendor evaluation.', 'wendy-card.jpg', 'https://files.example.com/wendy-card.jpg'),
  ('ct_002', 'cus_001', 'Aaron Xu', 'Factory GM', '+86 139 0100 0002', 'aaron.xu@obsidiansemi.com', 'aaron-xu', '@aaronfab', 'Obsidian Semi', 'Introduced by Wendy.', 'Plant visit and supply chain workshop.', 'Operational decision maker.', NULL, NULL),
  ('ct_003', 'cus_002', 'Mia Chen', 'Partnership Director', '+86 138 2200 8899', 'mia.chen@harborchain.com', 'mia-harbor', '@miapartners', 'Harbor Chain', 'Known from SaaS meetup.', 'Cross-border logistics salon.', 'Strong connector across channel ecosystem.', 'mia-card.pdf', 'https://files.example.com/mia-card.pdf');

INSERT OR IGNORE INTO timelines (id, customer_id, contact_id, follow_up_date, follow_up_type, summary, todo_reminder_at)
VALUES
  ('tl_001', 'cus_001', 'ct_001', '2026-05-02T09:30:00.000Z', 'WeChat', 'Discussed pilot procurement dashboard and internal review steps.', '2026-05-16T09:00:00.000Z'),
  ('tl_002', 'cus_001', 'ct_002', '2026-05-05T14:00:00.000Z', 'Meeting', 'Visited plant and mapped decision chain for tooling budget.', '2026-05-19T10:00:00.000Z'),
  ('tl_003', 'cus_002', 'ct_003', '2026-05-07T11:15:00.000Z', 'Phone', 'Confirmed interest in mobile-friendly contact capture workflow.', '2026-05-15T13:30:00.000Z');

INSERT OR IGNORE INTO attachments (id, entity_type, entity_id, file_name, file_type, file_url, file_size, notes)
VALUES
  ('att_001', 'customer', 'cus_001', 'pilot-proposal.pdf', 'application/pdf', 'https://files.example.com/pilot-proposal.pdf', 245760, 'Initial solution proposal'),
  ('att_002', 'contact', 'ct_003', 'mia-business-card.pdf', 'application/pdf', 'https://files.example.com/mia-business-card.pdf', 65536, 'Uploaded business card');

INSERT OR IGNORE INTO entity_tags (id, entity_type, entity_id, tag_id)
VALUES
  ('etag_001', 'customer', 'cus_001', 'tag_semiconductor'),
  ('etag_002', 'customer', 'cus_001', 'tag_shanghai'),
  ('etag_003', 'customer', 'cus_001', 'tag_key_decider'),
  ('etag_004', 'customer', 'cus_002', 'tag_logistics'),
  ('etag_005', 'customer', 'cus_002', 'tag_shenzhen'),
  ('etag_006', 'contact', 'ct_001', 'tag_shanghai'),
  ('etag_007', 'contact', 'ct_001', 'tag_key_decider'),
  ('etag_008', 'contact', 'ct_001', 'tag_coffee'),
  ('etag_009', 'contact', 'ct_003', 'tag_connector'),
  ('etag_010', 'contact', 'ct_003', 'tag_golf');
