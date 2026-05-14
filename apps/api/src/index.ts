type Statement<T = Record<string, unknown>> = {
  bind(...values: unknown[]): Statement<T>;
  first<U = T>(): Promise<U | null>;
  all<U = T>(): Promise<{ results: U[] }>;
  run(): Promise<unknown>;
};

type Database = {
  prepare(query: string): Statement;
};

type R2ObjectBody = {
  body: ReadableStream | null;
  httpEtag?: string;
  writeHttpMetadata(headers: Headers): void;
};

type R2Bucket = {
  put(
    key: string,
    value: ArrayBuffer,
    options?: {
      httpMetadata?: {
        contentType?: string;
      };
    },
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
};

type Env = {
  DB: Database;
  ASSETS?: R2Bucket;
  AUTH_SECRET: string;
  CORS_ORIGIN?: string;
};

type SessionUser = {
  id: string;
  email: string;
  realName: string;
  roleCode: string;
  roleName: string;
};

type LoginRequest = {
  email?: string;
  password?: string;
};

type CustomerPayload = {
  name?: string;
  customerCode?: string;
  shortName?: string;
  detailedAddress?: string;
  companyProfile?: string;
  industry?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  whatsapp?: string;
  linkedin?: string;
  facebook?: string;
  region?: string;
  cooperationStatus?: string;
  notes?: string;
  tagIds?: string[];
  productIds?: string[];
};

type ContactPayload = {
  customerId?: string | null;
  name?: string;
  title?: string;
  department?: string;
  phone?: string;
  email?: string;
  wechat?: string;
  socialHandle?: string;
  companyName?: string;
  relationshipNote?: string;
  meetingContext?: string;
  coreValue?: string;
  businessCardName?: string;
  businessCardUrl?: string;
  tagIds?: string[];
};

type TimelinePayload = {
  followUpDate?: string;
  followUpType?: string;
  summary?: string;
  todoReminderAt?: string | null;
};

type FollowUpPayload = TimelinePayload & {
  entityType?: 'customer' | 'contact';
  entityId?: string;
};

type AttachmentPayload = {
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  fileSize?: number | null;
  notes?: string | null;
  timelineId?: string | null;
};

type TagGroupPayload = {
  name?: string;
  description?: string;
};

type TagPayload = {
  groupId?: string;
  name?: string;
  color?: string;
};

type ProductPayload = {
  name?: string;
  category?: string;
  notes?: string;
};

type TransportInquiryPayload = {
  customerId?: string;
  customerName?: string;
  contactName?: string;
  contactPhone?: string;
  cargoName?: string;
  cargoType?: string;
  origin?: string;
  destination?: string;
  weightKg?: number | string | null;
  volumeCbm?: number | string | null;
  packageCount?: number | string | null;
  readyDate?: string | null;
  targetArrivalDate?: string | null;
  customsMode?: string;
  temperatureRequirement?: string;
  specialRequirement?: string;
  cargoFiles?: Array<{
    key?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    fileUrl?: string;
  }>;
};

type TransportPlanPayload = {
  title?: string;
  route?: string;
  transitDays?: number | string | null;
  estimatedCost?: number | string | null;
  currency?: string;
  planText?: string;
};

type EntityTagPayload = {
  entityType?: 'customer' | 'contact';
  entityId?: string;
  tagIds?: string[];
};

type SearchEntityType = 'all' | 'customer' | 'contact';

const encoder = new TextEncoder();

function json(data: unknown, init: ResponseInit = {}, corsOrigin = '*') {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('access-control-allow-origin', corsOrigin);
  headers.set('access-control-allow-methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  headers.set('access-control-allow-headers', 'content-type,authorization');

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

function corsOrigin(request: Request, env: Env) {
  const allowed = env.CORS_ORIGIN?.trim();
  const origin = request.headers.get('origin');

  if (!allowed || allowed === '*') {
    return origin ?? '*';
  }

  const allowedOrigins = allowed.split(',').map((item) => item.trim());
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.hostname === 'ostoa-web.pages.dev' || originUrl.hostname.endsWith('.ostoa-web.pages.dev')) {
        return origin;
      }
    } catch {
      // Ignore malformed Origin headers and fall through to the default.
    }
  }

  return allowedOrigins[0];
}

function badRequest(origin: string, error: string) {
  return json({ error }, { status: 400 }, origin);
}

function unauthorized(origin: string) {
  return json({ error: 'Unauthorized. Please sign in again.' }, { status: 401 }, origin);
}

function notFound(origin: string, error = 'Resource not found.') {
  return json({ error }, { status: 404 }, origin);
}

async function parseBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

function isoNow() {
  return new Date().toISOString();
}

function slugFileName(fileName: string) {
  const cleaned = fileName.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
  return cleaned.replace(/^-|-$/g, '') || 'upload.bin';
}

function ensureString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueStrings(values: string[] | undefined) {
  return [...new Set((values ?? []).map((item) => item.trim()).filter(Boolean))];
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, '0')).join('');
}

function base64UrlEncode(value: string) {
  const bytes = encoder.encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  let binary = '';
  for (const byte of new Uint8Array(signature)) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function createToken(user: SessionUser, secret: string) {
  const payload = {
    ...user,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(encoded, secret);
  return `${encoded}.${signature}`;
}

async function verifyToken(token: string, secret: string): Promise<SessionUser | null> {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return null;
  }

  const expected = await sign(payload, secret);
  if (expected !== signature) {
    return null;
  }

  const decoded = JSON.parse(base64UrlDecode(payload)) as SessionUser & { exp: number };
  if (decoded.exp < Date.now()) {
    return null;
  }

  return {
    id: decoded.id,
    email: decoded.email,
    realName: decoded.realName,
    roleCode: decoded.roleCode,
    roleName: decoded.roleName,
  };
}

async function getUserFromRequest(request: Request, env: Env) {
  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return null;
  }

  return verifyToken(token, env.AUTH_SECRET);
}

async function recordActivity(env: Env, title: string, detail: string) {
  await env.DB.prepare('INSERT INTO activity_logs (id, title, detail, created_at) VALUES (?, ?, ?, ?)')
    .bind(createId('act'), title, detail, isoNow())
    .run();
}

async function replaceEntityTags(env: Env, entityType: 'customer' | 'contact', entityId: string, tagIds: string[]) {
  await env.DB.prepare('DELETE FROM entity_tags WHERE entity_type = ? AND entity_id = ?').bind(entityType, entityId).run();
  for (const tagId of uniqueStrings(tagIds)) {
    await env.DB.prepare('INSERT INTO entity_tags (id, entity_type, entity_id, tag_id) VALUES (?, ?, ?, ?)')
      .bind(createId('etag'), entityType, entityId, tagId)
      .run();
  }
}

async function replaceCustomerProducts(env: Env, customerId: string, productIds: string[]) {
  await env.DB.prepare('DELETE FROM customer_products WHERE customer_id = ?').bind(customerId).run();
  for (const productId of uniqueStrings(productIds)) {
    await env.DB.prepare('INSERT INTO customer_products (id, customer_id, product_id, created_at) VALUES (?, ?, ?, ?)')
      .bind(createId('cprod'), customerId, productId, isoNow())
      .run();
  }
}

async function listProducts(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT id, name, category, notes, created_at as createdAt, updated_at as updatedAt
      FROM products
      ORDER BY category ASC, name ASC
    `,
  ).all<{ id: string; name: string; category: string | null; notes: string | null; createdAt: string; updatedAt: string }>();

  return rows.results;
}

async function listProductsForCustomer(env: Env, customerId: string) {
  const rows = await env.DB.prepare(
    `
      SELECT products.id, products.name, products.category, products.notes
      FROM customer_products
      JOIN products ON products.id = customer_products.product_id
      WHERE customer_products.customer_id = ?
      ORDER BY products.category ASC, products.name ASC
    `,
  )
    .bind(customerId)
    .all<{ id: string; name: string; category: string | null; notes: string | null }>();

  return rows.results;
}

async function listProductsForCustomers(env: Env, customerIds: string[]) {
  const uniqueCustomerIds = uniqueStrings(customerIds);
  const grouped = new Map<string, Array<{ id: string; name: string; category: string | null; notes: string | null }>>();
  if (uniqueCustomerIds.length === 0) {
    return grouped;
  }

  for (let index = 0; index < uniqueCustomerIds.length; index += 50) {
    const batch = uniqueCustomerIds.slice(index, index + 50);
    const placeholders = batch.map(() => '?').join(', ');
    const rows = await env.DB.prepare(
      `
        SELECT customer_products.customer_id as customerId, products.id, products.name, products.category, products.notes
        FROM customer_products
        JOIN products ON products.id = customer_products.product_id
        WHERE customer_products.customer_id IN (${placeholders})
        ORDER BY products.category ASC, products.name ASC
      `,
    )
      .bind(...batch)
      .all<{ customerId: string; id: string; name: string; category: string | null; notes: string | null }>();

    for (const row of rows.results) {
      const products = grouped.get(row.customerId) ?? [];
      products.push({
        id: row.id,
        name: row.name,
        category: row.category,
        notes: row.notes,
      });
      grouped.set(row.customerId, products);
    }
  }

  return grouped;
}

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value: unknown) {
  const parsed = toNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

function jsonArray<T>(value: string | null | undefined, fallback: T[] = []) {
  if (!value) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function businessNo(prefix: string) {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
}

function normalizeTransportInquiry(row: Record<string, unknown>) {
  return {
    id: row.id,
    inquiryNo: row.inquiryNo,
    customerId: row.customerId,
    customerName: row.customerName,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    cargoName: row.cargoName,
    cargoType: row.cargoType,
    origin: row.origin,
    destination: row.destination,
    weightKg: row.weightKg,
    volumeCbm: row.volumeCbm,
    packageCount: row.packageCount,
    readyDate: row.readyDate,
    targetArrivalDate: row.targetArrivalDate,
    customsMode: row.customsMode,
    temperatureRequirement: row.temperatureRequirement,
    specialRequirement: row.specialRequirement,
    cargoFiles: jsonArray(row.cargoFiles as string | null),
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    plans: jsonArray(row.plans as string | null),
  };
}

async function listTransportInquiries(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        transport_inquiries.id,
        transport_inquiries.inquiry_no as inquiryNo,
        transport_inquiries.customer_id as customerId,
        COALESCE(NULLIF(transport_inquiries.customer_name, ''), customers.name) as customerName,
        transport_inquiries.contact_name as contactName,
        transport_inquiries.contact_phone as contactPhone,
        transport_inquiries.cargo_name as cargoName,
        transport_inquiries.cargo_type as cargoType,
        transport_inquiries.origin,
        transport_inquiries.destination,
        transport_inquiries.weight_kg as weightKg,
        transport_inquiries.volume_cbm as volumeCbm,
        transport_inquiries.package_count as packageCount,
        transport_inquiries.ready_date as readyDate,
        transport_inquiries.target_arrival_date as targetArrivalDate,
        transport_inquiries.customs_mode as customsMode,
        transport_inquiries.temperature_requirement as temperatureRequirement,
        transport_inquiries.special_requirement as specialRequirement,
        transport_inquiries.cargo_files as cargoFiles,
        transport_inquiries.status,
        transport_inquiries.created_at as createdAt,
        transport_inquiries.updated_at as updatedAt,
        COALESCE(
          json_group_array(
            CASE
              WHEN transport_plans.id IS NULL THEN NULL
              ELSE json_object(
                'id', transport_plans.id,
                'planNo', transport_plans.plan_no,
                'title', transport_plans.title,
                'route', transport_plans.route,
                'transitDays', transport_plans.transit_days,
                'estimatedCost', transport_plans.estimated_cost,
                'currency', transport_plans.currency,
                'planText', transport_plans.plan_text,
                'status', transport_plans.status,
                'createdAt', transport_plans.created_at
              )
            END
          ),
          '[]'
        ) as plans
      FROM transport_inquiries
      LEFT JOIN customers ON customers.id = transport_inquiries.customer_id
      LEFT JOIN transport_plans ON transport_plans.inquiry_id = transport_inquiries.id
      GROUP BY transport_inquiries.id
      ORDER BY transport_inquiries.created_at DESC
    `,
  ).all<Record<string, unknown>>();

  return rows.results.map((row) => ({
    ...normalizeTransportInquiry(row),
    plans: jsonArray<Record<string, unknown>>(row.plans as string | null).filter(Boolean),
  }));
}

async function getTransportInquiry(env: Env, id: string) {
  const items = await listTransportInquiries(env);
  return items.find((item) => item.id === id) ?? null;
}

async function createTransportInquiry(env: Env, body: TransportInquiryPayload) {
  const customerId = ensureString(body.customerId);
  let customerName = ensureString(body.customerName);
  if (customerId && !customerName) {
    const customer = await env.DB.prepare('SELECT name FROM customers WHERE id = ?').bind(customerId).first<{ name: string }>();
    customerName = customer?.name ?? '';
  }

  const cargoName = ensureString(body.cargoName);
  const origin = ensureString(body.origin);
  const destination = ensureString(body.destination);
  if (!customerName || !cargoName || !origin || !destination) {
    return { error: '客户、货物、起运地和目的地不能为空。' };
  }

  const id = createId('tinq');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO transport_inquiries (
        id, inquiry_no, customer_id, customer_name, contact_name, contact_phone, cargo_name, cargo_type,
        origin, destination, weight_kg, volume_cbm, package_count, ready_date, target_arrival_date,
        customs_mode, temperature_requirement, special_requirement, cargo_files, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      businessNo('INQ'),
      customerId || null,
      customerName,
      ensureString(body.contactName),
      ensureString(body.contactPhone),
      cargoName,
      ensureString(body.cargoType) || '普货',
      origin,
      destination,
      toNumber(body.weightKg),
      toNumber(body.volumeCbm),
      toInteger(body.packageCount),
      ensureString(body.readyDate),
      ensureString(body.targetArrivalDate),
      ensureString(body.customsMode) || '一般贸易',
      ensureString(body.temperatureRequirement) || '常温',
      ensureString(body.specialRequirement),
      JSON.stringify(body.cargoFiles ?? []),
      'NEW',
      now,
      now,
    )
    .run();

  await recordActivity(env, '新建运输询单', `${customerName}：${origin} -> ${destination}，货物：${cargoName}`);
  return { id };
}

function buildGeneratedPlan(inquiry: Awaited<ReturnType<typeof getTransportInquiry>>, override: TransportPlanPayload = {}) {
  if (!inquiry) {
    return null;
  }
  const weight = Number(inquiry.weightKg ?? 0);
  const volume = Number(inquiry.volumeCbm ?? 0);
  const destination = String(inquiry.destination ?? '');
  const isKazakhstan = /哈萨克|Kazakhstan|Almaty|Astana|阿拉木图|阿斯塔纳/i.test(destination);
  const isUzbekistan = /乌兹别克|Uzbekistan|Tashkent|塔什干/i.test(destination);
  const route = ensureString(override.route) || `${inquiry.origin} -> 乌鲁木齐/西安集结 -> ${isKazakhstan ? '霍尔果斯/阿拉山口' : isUzbekistan ? '霍尔果斯-阿拉木图-塔什干' : '中亚口岸'} -> ${inquiry.destination}`;
  const transitDays = toInteger(override.transitDays) ?? (isUzbekistan ? 18 : isKazakhstan ? 13 : 16);
  const estimatedCost =
    toNumber(override.estimatedCost) ??
    Math.max(1200, Math.round((weight * 0.28 + volume * 35 + transitDays * 90) / 10) * 10);
  const title = ensureString(override.title) || `${inquiry.origin} 至 ${inquiry.destination} 中亚运输方案`;
  const planText =
    ensureString(override.planText) ||
    [
      `推荐路线：${route}。`,
      `运输方式：优先铁路/汽铁联运，预计 ${transitDays} 天，适合 ${inquiry.cargoName} 的时效和成本平衡。`,
      `操作节点：1. 起运地提货与装箱加固；2. 出口报关资料预审；3. 口岸换装/查验跟踪；4. 目的国清关；5. 末端派送签收。`,
      `风险提示：关注口岸排队、申报要素一致性、木包装/熏蒸、超重超限和目的国清关资料提前确认。`,
      `费用预估：${estimatedCost} ${ensureString(override.currency) || 'USD'}，最终报价需结合车板/箱型、保险、清关和派送地址复核。`,
    ].join('\n');

  return {
    title,
    route,
    transitDays,
    estimatedCost,
    currency: ensureString(override.currency) || 'USD',
    planText,
  };
}

async function generateTransportPlan(env: Env, inquiryId: string, body: TransportPlanPayload) {
  const inquiry = await getTransportInquiry(env, inquiryId);
  if (!inquiry) {
    return { error: '询单不存在。' };
  }

  const generated = buildGeneratedPlan(inquiry, body);
  if (!generated) {
    return { error: '无法生成方案。' };
  }

  const id = createId('tpln');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO transport_plans (
        id, inquiry_id, plan_no, title, route, transit_days, estimated_cost, currency, plan_text, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      inquiryId,
      businessNo('PLN'),
      generated.title,
      generated.route,
      generated.transitDays,
      generated.estimatedCost,
      generated.currency,
      generated.planText,
      'DRAFT',
      now,
      now,
    )
    .run();

  await env.DB.prepare('UPDATE transport_inquiries SET status = ?, updated_at = ? WHERE id = ?')
    .bind('PLAN_READY', now, inquiryId)
    .run();
  await recordActivity(env, '生成运输方案', `${inquiry.inquiryNo} 已生成方案：${generated.title}`);

  return { id };
}

async function listTransportPlans(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        transport_plans.id,
        transport_plans.inquiry_id as inquiryId,
        transport_plans.plan_no as planNo,
        transport_plans.title,
        transport_plans.route,
        transport_plans.transit_days as transitDays,
        transport_plans.estimated_cost as estimatedCost,
        transport_plans.currency,
        transport_plans.plan_text as planText,
        transport_plans.status,
        transport_plans.created_at as createdAt,
        transport_inquiries.inquiry_no as inquiryNo,
        transport_inquiries.customer_name as customerName,
        transport_inquiries.cargo_name as cargoName
      FROM transport_plans
      JOIN transport_inquiries ON transport_inquiries.id = transport_plans.inquiry_id
      ORDER BY transport_plans.created_at DESC
    `,
  ).all();

  return rows.results;
}

async function listTagGroups(env: Env) {
  const groups = await env.DB.prepare(
    'SELECT id, name, description, sort_order as sortOrder FROM tag_groups ORDER BY sort_order ASC, name ASC',
  ).all<{ id: string; name: string; description: string | null; sortOrder: number }>();

  const tags = await env.DB.prepare(
    'SELECT id, group_id as groupId, name, color FROM tags ORDER BY group_id ASC, rowid ASC',
  ).all<{ id: string; groupId: string; name: string; color: string }>();

  return groups.results.map((group) => ({
    ...group,
    tags: tags.results.filter((tag) => tag.groupId === group.id),
  }));
}

async function listEntityTags(env: Env, entityType: 'customer' | 'contact', entityId: string) {
  const rows = await env.DB.prepare(
    `
      SELECT tags.id, tags.name, tags.color, tag_groups.name AS groupName
      FROM entity_tags
      JOIN tags ON tags.id = entity_tags.tag_id
      JOIN tag_groups ON tag_groups.id = tags.group_id
      WHERE entity_tags.entity_type = ? AND entity_tags.entity_id = ?
      ORDER BY tag_groups.sort_order ASC, tags.name ASC
    `,
  ).bind(entityType, entityId).all<{ id: string; name: string; color: string; groupName: string }>();

  return rows.results;
}

async function listTagsForEntities(env: Env, entityType: 'customer' | 'contact', entityIds: string[]) {
  const uniqueEntityIds = uniqueStrings(entityIds);
  if (uniqueEntityIds.length === 0) {
    return new Map<string, Array<{ id: string; name: string; color: string; groupName: string }>>();
  }

  const grouped = new Map<string, Array<{ id: string; name: string; color: string; groupName: string }>>();
  for (let index = 0; index < uniqueEntityIds.length; index += 50) {
    const batch = uniqueEntityIds.slice(index, index + 50);
    const placeholders = batch.map(() => '?').join(', ');
    const rows = await env.DB.prepare(
      `
        SELECT entity_tags.entity_id as entityId, tags.id, tags.name, tags.color, tag_groups.name AS groupName
        FROM entity_tags
        JOIN tags ON tags.id = entity_tags.tag_id
        JOIN tag_groups ON tag_groups.id = tags.group_id
        WHERE entity_tags.entity_type = ? AND entity_tags.entity_id IN (${placeholders})
        ORDER BY tag_groups.sort_order ASC, tags.name ASC
      `,
    )
      .bind(entityType, ...batch)
      .all<{ entityId: string; id: string; name: string; color: string; groupName: string }>();

    for (const row of rows.results) {
      const tags = grouped.get(row.entityId) ?? [];
      tags.push({
        id: row.id,
        name: row.name,
        color: row.color,
        groupName: row.groupName,
      });
      grouped.set(row.entityId, tags);
    }
  }
  return grouped;
}

async function listTagsForEntityType(env: Env, entityType: 'customer' | 'contact') {
  const rows = await env.DB.prepare(
    `
      SELECT
        entity_tags.entity_id as entityId,
        tags.id,
        tags.name,
        tags.color,
        tag_groups.name as groupName
      FROM entity_tags
      JOIN tags ON tags.id = entity_tags.tag_id
      JOIN tag_groups ON tag_groups.id = tags.group_id
      WHERE entity_tags.entity_type = ?
      ORDER BY tag_groups.sort_order ASC, tags.name ASC
    `,
  )
    .bind(entityType)
    .all<{ entityId: string; id: string; name: string; color: string; groupName: string }>();

  const grouped = new Map<string, Array<{ id: string; name: string; color: string; groupName: string }>>();
  for (const row of rows.results) {
    const tags = grouped.get(row.entityId) ?? [];
    tags.push({
      id: row.id,
      name: row.name,
      color: row.color,
      groupName: row.groupName,
    });
    grouped.set(row.entityId, tags);
  }

  return grouped;
}

async function listAttachments(env: Env, entityType: 'customer' | 'contact', entityId: string) {
  const rows = await env.DB.prepare(
    `
      SELECT id, file_name as fileName, file_type as fileType, file_url as fileUrl, file_size as fileSize, notes, timeline_id as timelineId, created_at as createdAt
      FROM attachments
      WHERE entity_type = ? AND entity_id = ?
      ORDER BY created_at DESC
    `,
  ).bind(entityType, entityId).all();

  return rows.results;
}

async function listAttachmentsByTimelineIds(env: Env, timelineIds: string[]) {
  const grouped = new Map<string, unknown[]>();
  if (!timelineIds.length) {
    return grouped;
  }

  const batchSize = 50;
  for (let index = 0; index < timelineIds.length; index += batchSize) {
    const batch = timelineIds.slice(index, index + batchSize);
    const placeholders = batch.map(() => '?').join(',');
    const rows = await env.DB.prepare(
      `
        SELECT
          timeline_id as timelineId,
          id,
          file_name as fileName,
          file_type as fileType,
          file_url as fileUrl,
          file_size as fileSize,
          notes,
          created_at as createdAt
        FROM attachments
        WHERE timeline_id IN (${placeholders})
        ORDER BY created_at DESC
      `,
    )
      .bind(...batch)
      .all<{ timelineId: string; id: string; fileName: string; fileType: string; fileUrl: string; fileSize: number | null; notes: string | null; createdAt: string }>();

    for (const row of rows.results) {
      const attachments = grouped.get(row.timelineId) ?? [];
      attachments.push({
        id: row.id,
        fileName: row.fileName,
        fileType: row.fileType,
        fileUrl: row.fileUrl,
        fileSize: row.fileSize,
        notes: row.notes,
        createdAt: row.createdAt,
      });
      grouped.set(row.timelineId, attachments);
    }
  }

  return grouped;
}

async function listFollowUps(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        timelines.id,
        timelines.follow_up_date as followUpDate,
        timelines.follow_up_type as followUpType,
        timelines.summary,
        timelines.todo_reminder_at as todoReminderAt,
        timelines.customer_id as customerId,
        customers.name as customerName,
        timelines.contact_id as contactId,
        contacts_v2.name as contactName
      FROM timelines
      LEFT JOIN customers ON customers.id = timelines.customer_id
      LEFT JOIN contacts_v2 ON contacts_v2.id = timelines.contact_id
      ORDER BY timelines.follow_up_date DESC, timelines.created_at DESC
    `,
  ).all<{
    id: string;
    followUpDate: string;
    followUpType: string;
    summary: string;
    todoReminderAt: string | null;
    customerId: string | null;
    customerName: string | null;
    contactId: string | null;
    contactName: string | null;
  }>();

  const attachmentsByTimeline = await listAttachmentsByTimelineIds(
    env,
    rows.results.map((item) => item.id),
  );

  return rows.results.map((item) => ({
    ...item,
    entityType: item.contactId ? 'contact' : 'customer',
    entityId: item.contactId ?? item.customerId,
    entityName: item.contactName ?? item.customerName ?? '未命名对象',
    attachments: attachmentsByTimeline.get(item.id) ?? [],
  }));
}

async function listTimelinesForCustomer(env: Env, customerId: string) {
  const rows = await env.DB.prepare(
    `
      SELECT
        timelines.id,
        timelines.follow_up_date as followUpDate,
        timelines.follow_up_type as followUpType,
        timelines.summary,
        timelines.todo_reminder_at as todoReminderAt,
        timelines.contact_id as contactId,
        contacts_v2.name as contactName
      FROM timelines
      LEFT JOIN contacts_v2 ON contacts_v2.id = timelines.contact_id
      WHERE timelines.customer_id = ?
      ORDER BY timelines.follow_up_date DESC, timelines.created_at DESC
    `,
  ).bind(customerId).all();

  return rows.results;
}

async function listTimelinesForContact(env: Env, contactId: string) {
  const rows = await env.DB.prepare(
    `
      SELECT
        timelines.id,
        timelines.follow_up_date as followUpDate,
        timelines.follow_up_type as followUpType,
        timelines.summary,
        timelines.todo_reminder_at as todoReminderAt,
        timelines.customer_id as customerId,
        customers.name as customerName
      FROM timelines
      LEFT JOIN customers ON customers.id = timelines.customer_id
      WHERE timelines.contact_id = ?
      ORDER BY timelines.follow_up_date DESC, timelines.created_at DESC
    `,
  ).bind(contactId).all();

  return rows.results;
}

async function listCustomers(env: Env) {
  const customers = await env.DB.prepare(
    `
      SELECT
        customers.id,
        customers.name,
        customers.customer_code as customerCode,
        customers.short_name as shortName,
        customers.detailed_address as detailedAddress,
        customers.industry,
        customers.region,
        customers.cooperation_status as cooperationStatus,
        customers.created_at as createdAt,
        customers.updated_at as updatedAt,
        COUNT(DISTINCT contacts_v2.id) as contactCount
      FROM customers
      LEFT JOIN contacts_v2 ON contacts_v2.customer_id = customers.id
      GROUP BY customers.id
      ORDER BY customers.updated_at DESC, customers.name ASC
    `,
  ).all();

  const items = [];
  const tagMap = await listTagsForEntityType(env, 'customer');
  const productMap = await listProductsForCustomers(
    env,
    (customers.results as Array<Record<string, unknown>>).map((customer) => String(customer.id)),
  );
  for (const customer of customers.results as Array<Record<string, unknown>>) {
    items.push({
      ...customer,
      contactCount: Number(customer.contactCount ?? 0),
      tags: tagMap.get(String(customer.id)) ?? [],
      products: productMap.get(String(customer.id)) ?? [],
    });
  }

  return items;
}

async function getCustomerDetail(env: Env, customerId: string) {
  const customer = await env.DB.prepare(
    `
      SELECT
        id,
        name,
        customer_code as customerCode,
        short_name as shortName,
        detailed_address as detailedAddress,
        company_profile as companyProfile,
        industry,
        phone,
        email,
        website,
        instagram,
        whatsapp,
        linkedin,
        facebook,
        region,
        cooperation_status as cooperationStatus,
        notes,
        created_at as createdAt,
        updated_at as updatedAt
      FROM customers
      WHERE id = ?
    `,
  ).bind(customerId).first<Record<string, unknown>>();

  if (!customer) {
    return null;
  }

  const contacts = await env.DB.prepare(
    `
      SELECT
        id,
        customer_id as customerId,
        name,
        title,
        department,
        phone,
        email,
        wechat,
        social_handle as socialHandle,
        company_name as companyName,
        relationship_note as relationshipNote,
        meeting_context as meetingContext,
        core_value as coreValue,
        business_card_name as businessCardName,
        business_card_url as businessCardUrl,
        created_at as createdAt,
        updated_at as updatedAt
      FROM contacts_v2
      WHERE customer_id = ?
      ORDER BY updated_at DESC, name ASC
    `,
  ).bind(customerId).all();

  return {
    ...customer,
    tags: await listEntityTags(env, 'customer', customerId),
    products: await listProductsForCustomer(env, customerId),
    contacts: contacts.results,
    timeline: await listTimelinesForCustomer(env, customerId),
    attachments: await listAttachments(env, 'customer', customerId),
  };
}

async function listContacts(env: Env) {
  const contacts = await env.DB.prepare(
    `
      SELECT
        contacts_v2.id,
        contacts_v2.customer_id as customerId,
        contacts_v2.name,
        contacts_v2.title,
        contacts_v2.department,
        contacts_v2.phone,
        contacts_v2.email,
        contacts_v2.wechat,
        contacts_v2.social_handle as socialHandle,
        contacts_v2.company_name as companyName,
        contacts_v2.relationship_note as relationshipNote,
        contacts_v2.meeting_context as meetingContext,
        contacts_v2.core_value as coreValue,
        contacts_v2.business_card_name as businessCardName,
        contacts_v2.business_card_url as businessCardUrl,
        contacts_v2.created_at as createdAt,
        contacts_v2.updated_at as updatedAt,
        customers.name as customerName
      FROM contacts_v2
      LEFT JOIN customers ON customers.id = contacts_v2.customer_id
      ORDER BY contacts_v2.updated_at DESC, contacts_v2.name ASC
    `,
  ).all();

  const items = [];
  const tagMap = await listTagsForEntities(
    env,
    'contact',
    (contacts.results as Array<Record<string, unknown>>).map((contact) => String(contact.id)),
  );
  for (const contact of contacts.results as Array<Record<string, unknown>>) {
    items.push({
      ...contact,
      tags: tagMap.get(String(contact.id)) ?? [],
    });
  }

  return items;
}

async function getContactDetail(env: Env, contactId: string) {
  const contact = await env.DB.prepare(
    `
      SELECT
        contacts_v2.id,
        contacts_v2.customer_id as customerId,
        contacts_v2.name,
        contacts_v2.title,
        contacts_v2.department,
        contacts_v2.phone,
        contacts_v2.email,
        contacts_v2.wechat,
        contacts_v2.social_handle as socialHandle,
        contacts_v2.company_name as companyName,
        contacts_v2.relationship_note as relationshipNote,
        contacts_v2.meeting_context as meetingContext,
        contacts_v2.core_value as coreValue,
        contacts_v2.business_card_name as businessCardName,
        contacts_v2.business_card_url as businessCardUrl,
        contacts_v2.created_at as createdAt,
        contacts_v2.updated_at as updatedAt,
        customers.name as customerName
      FROM contacts_v2
      LEFT JOIN customers ON customers.id = contacts_v2.customer_id
      WHERE contacts_v2.id = ?
    `,
  ).bind(contactId).first<Record<string, unknown>>();

  if (!contact) {
    return null;
  }

  return {
    ...contact,
    tags: await listEntityTags(env, 'contact', contactId),
    timeline: await listTimelinesForContact(env, contactId),
    attachments: await listAttachments(env, 'contact', contactId),
  };
}

async function queryEntityIdsByTags(env: Env, entityType: 'customer' | 'contact', tagIds: string[]) {
  if (tagIds.length === 0) {
    return null;
  }

  const placeholders = tagIds.map(() => '?').join(', ');
  const rows = await env.DB.prepare(
    `
      SELECT entity_id as entityId
      FROM entity_tags
      WHERE entity_type = ? AND tag_id IN (${placeholders})
      GROUP BY entity_id
      HAVING COUNT(DISTINCT tag_id) = ?
    `,
  ).bind(entityType, ...tagIds, tagIds.length).all<{ entityId: string }>();

  return rows.results.map((row) => row.entityId);
}

async function searchCustomers(env: Env, keyword: string, tagIds: string[]) {
  const ids = await queryEntityIdsByTags(env, 'customer', tagIds);
  let query = `
    SELECT
      customers.id,
      customers.name,
      customers.customer_code as customerCode,
      customers.short_name as shortName,
      customers.detailed_address as detailedAddress,
      customers.company_profile as companyProfile,
      customers.industry,
      customers.phone,
      customers.email,
      customers.website,
      customers.instagram,
      customers.whatsapp,
      customers.linkedin,
      customers.facebook,
      customers.region,
      customers.cooperation_status as cooperationStatus,
      customers.notes
    FROM customers
    WHERE (
      lower(customers.name) LIKE ? OR
      lower(COALESCE(customers.customer_code, '')) LIKE ? OR
      lower(COALESCE(customers.short_name, '')) LIKE ? OR
      lower(COALESCE(customers.detailed_address, '')) LIKE ? OR
      lower(COALESCE(customers.company_profile, '')) LIKE ? OR
      lower(COALESCE(customers.phone, '')) LIKE ? OR
      lower(COALESCE(customers.email, '')) LIKE ? OR
      lower(COALESCE(customers.website, '')) LIKE ? OR
      lower(COALESCE(customers.instagram, '')) LIKE ? OR
      lower(COALESCE(customers.whatsapp, '')) LIKE ? OR
      lower(COALESCE(customers.linkedin, '')) LIKE ? OR
      lower(COALESCE(customers.facebook, '')) LIKE ? OR
      lower(COALESCE(customers.notes, '')) LIKE ?
    )
  `;
  const binds: unknown[] = [keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword];

  if (ids && ids.length === 0) {
    return [];
  }

  if (ids && ids.length > 0) {
    query += ` AND customers.id IN (${ids.map(() => '?').join(', ')})`;
    binds.push(...ids);
  }

  query += ' ORDER BY customers.updated_at DESC, customers.name ASC';
  const rows = await env.DB.prepare(query).bind(...binds).all();
  const results = [];
  for (const row of rows.results as Array<Record<string, unknown>>) {
    results.push({
      type: 'customer',
      ...row,
      tags: await listEntityTags(env, 'customer', String(row.id)),
    });
  }
  return results;
}

async function searchContacts(env: Env, keyword: string, tagIds: string[]) {
  const ids = await queryEntityIdsByTags(env, 'contact', tagIds);
  let query = `
    SELECT
      contacts_v2.id,
      contacts_v2.name,
      contacts_v2.title,
      contacts_v2.department,
      contacts_v2.phone,
      contacts_v2.email,
      contacts_v2.company_name as companyName,
      contacts_v2.relationship_note as relationshipNote,
      contacts_v2.core_value as coreValue,
      customers.name as customerName
    FROM contacts_v2
    LEFT JOIN customers ON customers.id = contacts_v2.customer_id
    WHERE (
      lower(contacts_v2.name) LIKE ? OR
      lower(COALESCE(contacts_v2.phone, '')) LIKE ? OR
      lower(COALESCE(contacts_v2.relationship_note, '')) LIKE ? OR
      lower(COALESCE(contacts_v2.core_value, '')) LIKE ?
    )
  `;
  const binds: unknown[] = [keyword, keyword, keyword, keyword];

  if (ids && ids.length === 0) {
    return [];
  }

  if (ids && ids.length > 0) {
    query += ` AND contacts_v2.id IN (${ids.map(() => '?').join(', ')})`;
    binds.push(...ids);
  }

  query += ' ORDER BY contacts_v2.updated_at DESC, contacts_v2.name ASC';
  const rows = await env.DB.prepare(query).bind(...binds).all();
  const results = [];
  for (const row of rows.results as Array<Record<string, unknown>>) {
    results.push({
      type: 'contact',
      ...row,
      tags: await listEntityTags(env, 'contact', String(row.id)),
    });
  }
  return results;
}

function normalizeKeyword(value: string | null) {
  const trimmed = value?.trim().toLowerCase() ?? '';
  return `%${trimmed}%`;
}

async function createCustomer(env: Env, body: CustomerPayload) {
  const name = ensureString(body.name);
  if (!name) {
    return { error: 'Customer name is required.' };
  }
  const companyProfile = ensureString(body.companyProfile);
  if (companyProfile.length > 5000) {
    return { error: 'Company profile must be 5000 characters or fewer.' };
  }

  const id = createId('cus');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO customers (
        id, name, customer_code, short_name, detailed_address, company_profile, industry, phone, email, website, instagram, whatsapp, linkedin, facebook, region, cooperation_status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      name,
      ensureString(body.customerCode),
      ensureString(body.shortName),
      ensureString(body.detailedAddress),
      companyProfile,
      ensureString(body.industry),
      ensureString(body.phone),
      ensureString(body.email),
      ensureString(body.website),
      ensureString(body.instagram),
      ensureString(body.whatsapp),
      ensureString(body.linkedin),
      ensureString(body.facebook),
      ensureString(body.region),
      ensureString(body.cooperationStatus) || 'Prospect',
      ensureString(body.notes),
      now,
      now,
    )
    .run();

  await replaceEntityTags(env, 'customer', id, body.tagIds ?? []);
  await replaceCustomerProducts(env, id, body.productIds ?? []);
  await recordActivity(env, 'Customer created', `Added customer ${name}.`);
  return { id };
}

async function updateCustomer(env: Env, customerId: string, body: CustomerPayload) {
  const name = ensureString(body.name);
  if (!name) {
    return { error: 'Customer name is required.' };
  }
  const companyProfile = ensureString(body.companyProfile);
  if (companyProfile.length > 5000) {
    return { error: 'Company profile must be 5000 characters or fewer.' };
  }

  const existing = await env.DB.prepare('SELECT id FROM customers WHERE id = ?').bind(customerId).first();
  if (!existing) {
    return { error: 'Customer not found.' };
  }

  await env.DB.prepare(
    `
      UPDATE customers
      SET
        name = ?,
        customer_code = ?,
        short_name = ?,
        detailed_address = ?,
        company_profile = ?,
        industry = ?,
        phone = ?,
        email = ?,
        website = ?,
        instagram = ?,
        whatsapp = ?,
        linkedin = ?,
        facebook = ?,
        region = ?,
        cooperation_status = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      name,
      ensureString(body.customerCode),
      ensureString(body.shortName),
      ensureString(body.detailedAddress),
      companyProfile,
      ensureString(body.industry),
      ensureString(body.phone),
      ensureString(body.email),
      ensureString(body.website),
      ensureString(body.instagram),
      ensureString(body.whatsapp),
      ensureString(body.linkedin),
      ensureString(body.facebook),
      ensureString(body.region),
      ensureString(body.cooperationStatus) || 'Prospect',
      ensureString(body.notes),
      isoNow(),
      customerId,
    )
    .run();

  await replaceEntityTags(env, 'customer', customerId, body.tagIds ?? []);
  await replaceCustomerProducts(env, customerId, body.productIds ?? []);
  await recordActivity(env, 'Customer updated', `Updated customer ${name}.`);
  return { ok: true };
}

async function deleteCustomer(env: Env, customerId: string) {
  const existing = await env.DB.prepare('SELECT id, name FROM customers WHERE id = ?')
    .bind(customerId)
    .first<{ id: string; name: string }>();
  if (!existing) {
    return { error: 'Customer not found.' };
  }

  await env.DB.prepare('UPDATE contacts_v2 SET customer_id = NULL, updated_at = ? WHERE customer_id = ?')
    .bind(isoNow(), customerId)
    .run();
  await env.DB.prepare('DELETE FROM timelines WHERE customer_id = ?').bind(customerId).run();
  await env.DB.prepare('DELETE FROM attachments WHERE entity_type = ? AND entity_id = ?').bind('customer', customerId).run();
  await env.DB.prepare('DELETE FROM entity_tags WHERE entity_type = ? AND entity_id = ?').bind('customer', customerId).run();
  await env.DB.prepare('DELETE FROM customer_products WHERE customer_id = ?').bind(customerId).run();
  await env.DB.prepare('DELETE FROM customers WHERE id = ?').bind(customerId).run();
  await recordActivity(env, 'Customer deleted', `Deleted customer ${existing.name}.`);
  return { ok: true };
}

async function createContact(env: Env, body: ContactPayload) {
  const name = ensureString(body.name);
  if (!name) {
    return { error: 'Contact name is required.' };
  }

  const id = createId('ct');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO contacts_v2 (
        id, customer_id, name, title, department, phone, email, wechat, social_handle, company_name,
        relationship_note, meeting_context, core_value, business_card_name, business_card_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      ensureString(body.customerId) || null,
      name,
      ensureString(body.title),
      ensureString(body.department),
      ensureString(body.phone),
      ensureString(body.email),
      ensureString(body.wechat),
      ensureString(body.socialHandle),
      ensureString(body.companyName),
      ensureString(body.relationshipNote),
      ensureString(body.meetingContext),
      ensureString(body.coreValue),
      ensureString(body.businessCardName),
      ensureString(body.businessCardUrl),
      now,
      now,
    )
    .run();

  await replaceEntityTags(env, 'contact', id, body.tagIds ?? []);
  await recordActivity(env, 'Contact created', `Added contact ${name}.`);
  return { id };
}

async function updateContact(env: Env, contactId: string, body: ContactPayload) {
  const name = ensureString(body.name);
  if (!name) {
    return { error: 'Contact name is required.' };
  }

  const existing = await env.DB.prepare('SELECT id FROM contacts_v2 WHERE id = ?').bind(contactId).first();
  if (!existing) {
    return { error: 'Contact not found.' };
  }

  await env.DB.prepare(
    `
      UPDATE contacts_v2
      SET
        customer_id = ?,
        name = ?,
        title = ?,
        department = ?,
        phone = ?,
        email = ?,
        wechat = ?,
        social_handle = ?,
        company_name = ?,
        relationship_note = ?,
        meeting_context = ?,
        core_value = ?,
        business_card_name = ?,
        business_card_url = ?,
        updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      ensureString(body.customerId) || null,
      name,
      ensureString(body.title),
      ensureString(body.department),
      ensureString(body.phone),
      ensureString(body.email),
      ensureString(body.wechat),
      ensureString(body.socialHandle),
      ensureString(body.companyName),
      ensureString(body.relationshipNote),
      ensureString(body.meetingContext),
      ensureString(body.coreValue),
      ensureString(body.businessCardName),
      ensureString(body.businessCardUrl),
      isoNow(),
      contactId,
    )
    .run();

  await replaceEntityTags(env, 'contact', contactId, body.tagIds ?? []);
  await recordActivity(env, 'Contact updated', `Updated contact ${name}.`);
  return { ok: true };
}

async function deleteContact(env: Env, contactId: string) {
  const existing = await env.DB.prepare('SELECT id, name FROM contacts_v2 WHERE id = ?')
    .bind(contactId)
    .first<{ id: string; name: string }>();
  if (!existing) {
    return { error: 'Contact not found.' };
  }

  await env.DB.prepare('DELETE FROM timelines WHERE contact_id = ?').bind(contactId).run();
  await env.DB.prepare('DELETE FROM attachments WHERE entity_type = ? AND entity_id = ?').bind('contact', contactId).run();
  await env.DB.prepare('DELETE FROM entity_tags WHERE entity_type = ? AND entity_id = ?').bind('contact', contactId).run();
  await env.DB.prepare('DELETE FROM contacts_v2 WHERE id = ?').bind(contactId).run();
  await recordActivity(env, 'Contact deleted', `Deleted contact ${existing.name}.`);
  return { ok: true };
}

async function createTimeline(env: Env, entityType: 'customer' | 'contact', entityId: string, body: TimelinePayload) {
  const followUpDate = ensureString(body.followUpDate);
  const followUpType = ensureString(body.followUpType);
  const summary = ensureString(body.summary);
  if (!followUpDate || !followUpType || !summary) {
    return { error: 'Timeline entry requires date, type, and summary.' };
  }

  let customerId: string | null = null;
  let contactId: string | null = null;
  if (entityType === 'customer') {
    customerId = entityId;
  } else {
    contactId = entityId;
    const linkedCustomer = await env.DB.prepare('SELECT customer_id as customerId FROM contacts_v2 WHERE id = ?')
      .bind(entityId)
      .first<{ customerId: string | null }>();
    customerId = linkedCustomer?.customerId ?? null;
  }

  const timelineId = createId('tl');
  await env.DB.prepare(
    `
      INSERT INTO timelines (id, customer_id, contact_id, follow_up_date, follow_up_type, summary, todo_reminder_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(timelineId, customerId, contactId, followUpDate, followUpType, summary, ensureString(body.todoReminderAt) || null, isoNow())
    .run();

  await recordActivity(env, 'Timeline updated', `Added ${followUpType} follow-up for ${entityType} ${entityId}.`);
  return { ok: true, id: timelineId };
}

async function createAttachment(env: Env, entityType: 'customer' | 'contact', entityId: string, body: AttachmentPayload) {
  const fileName = ensureString(body.fileName);
  const fileType = ensureString(body.fileType);
  const fileUrl = ensureString(body.fileUrl);
  if (!fileName || !fileType || !fileUrl) {
    return { error: 'Attachment requires file name, type, and URL.' };
  }

  await env.DB.prepare(
    `
      INSERT INTO attachments (id, entity_type, entity_id, file_name, file_type, file_url, file_size, notes, timeline_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      createId('att'),
      entityType,
      entityId,
      fileName,
      fileType,
      fileUrl,
      body.fileSize ?? null,
      ensureString(body.notes) || null,
      ensureString(body.timelineId) || null,
      isoNow(),
    )
    .run();

  await recordActivity(env, 'Attachment added', `Stored attachment ${fileName} for ${entityType} ${entityId}.`);
  return { ok: true };
}

async function uploadFileToR2(env: Env, file: File, folder: string) {
  if (!env.ASSETS) {
    return { error: 'R2 bucket is not configured yet.' };
  }

  const safeFolder = slugFileName(folder || 'uploads');
  const safeName = slugFileName(file.name || 'upload.bin');
  const key = `${safeFolder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
  await env.ASSETS.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type || 'application/octet-stream',
    },
  });

  return {
    key,
    fileName: file.name || safeName,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    fileUrl: `/api/uploads/${encodeURIComponent(key)}`,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = corsOrigin(request, env);
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      const headers = new Headers();
      headers.set('access-control-allow-origin', origin);
      headers.set('access-control-allow-methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      headers.set('access-control-allow-headers', 'content-type,authorization');
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json(
        {
          status: 'ok',
          service: 'ostoa-api',
          timestamp: new Date().toISOString(),
        },
        { status: 200 },
        origin,
      );
    }

    const uploadMatch = url.pathname.match(/^\/api\/uploads\/(.+)$/);
    if (uploadMatch && request.method === 'GET') {
      if (!env.ASSETS) {
        return notFound(origin, 'Upload bucket is not configured.');
      }

      const object = await env.ASSETS.get(decodeURIComponent(uploadMatch[1]));
      if (!object || !object.body) {
        return notFound(origin, 'File not found.');
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('access-control-allow-origin', origin);
      return new Response(object.body, {
        status: 200,
        headers,
      });
    }

    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      const body = await parseBody<LoginRequest>(request);
      if (!body.email || !body.password) {
        return badRequest(origin, 'Email and password are required.');
      }

      const user = await env.DB.prepare(
        'SELECT id, email, password_hash, real_name, role_code, role_name FROM users WHERE email = ?',
      )
        .bind(body.email)
        .first<{
          id: string;
          email: string;
          password_hash: string;
          real_name: string;
          role_code: string;
          role_name: string;
        }>();

      if (!user) {
        return unauthorized(origin);
      }

      const hashed = await sha256(body.password);
      if (hashed !== user.password_hash) {
        return unauthorized(origin);
      }

      const sessionUser = {
        id: user.id,
        email: user.email,
        realName: user.real_name,
        roleCode: user.role_code,
        roleName: user.role_name,
      };

      const token = await createToken(sessionUser, env.AUTH_SECRET);
      return json({ token, user: sessionUser }, { status: 200 }, origin);
    }

    const sessionUser = await getUserFromRequest(request, env);
    if (!sessionUser) {
      return unauthorized(origin);
    }

    if (url.pathname === '/api/auth/me' && request.method === 'GET') {
      return json({ user: sessionUser }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/uploads' && request.method === 'POST') {
      const formData = await request.formData();
      const file = formData.get('file');
      const folder = ensureString(formData.get('folder'));
      if (!(file instanceof File)) {
        return badRequest(origin, 'File upload is required.');
      }

      const result = await uploadFileToR2(env, file, folder || 'attachments');
      if ('error' in result && result.error !== undefined) {
        return badRequest(origin, result.error);
      }

      return json(result, { status: 201 }, origin);
    }

    if (url.pathname === '/api/dashboard' && request.method === 'GET') {
      const totals = await env.DB.prepare(
        `
          SELECT
            (SELECT COUNT(*) FROM customers) AS customerCount,
            (SELECT COUNT(*) FROM contacts_v2) AS contactCount,
            (SELECT COUNT(*) FROM timelines WHERE todo_reminder_at IS NOT NULL AND todo_reminder_at >= datetime('now')) AS reminderCount,
            (SELECT COUNT(*) FROM attachments) AS attachmentCount
        `,
      ).first<{
        customerCount: number;
        contactCount: number;
        reminderCount: number;
        attachmentCount: number;
      }>();

      const tagHighlights = await env.DB.prepare(
        `
          SELECT tags.name, COUNT(*) AS usageCount
          FROM entity_tags
          JOIN tags ON tags.id = entity_tags.tag_id
          GROUP BY tags.id
          ORDER BY usageCount DESC, tags.name ASC
          LIMIT 6
        `,
      ).all<{ name: string; usageCount: number }>();

      const recentActivities = await env.DB.prepare(
        'SELECT id, title, detail, created_at as createdAt FROM activity_logs ORDER BY created_at DESC LIMIT 8',
      ).all<{ id: string; title: string; detail: string; createdAt: string }>();

      return json(
        {
          customerCount: Number(totals?.customerCount ?? 0),
          contactCount: Number(totals?.contactCount ?? 0),
          reminderCount: Number(totals?.reminderCount ?? 0),
          attachmentCount: Number(totals?.attachmentCount ?? 0),
          tagHighlights: tagHighlights.results.map((item) => ({
            name: item.name,
            usageCount: Number(item.usageCount),
          })),
          recentActivities: recentActivities.results,
        },
        { status: 200 },
        origin,
      );
    }

    if (url.pathname === '/api/transport-inquiries' && request.method === 'GET') {
      return json({ items: await listTransportInquiries(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/transport-inquiries' && request.method === 'POST') {
      const result = await createTransportInquiry(env, await parseBody<TransportInquiryPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(await getTransportInquiry(env, result.id), { status: 201 }, origin);
    }

    const transportInquiryMatch = url.pathname.match(/^\/api\/transport-inquiries\/([^/]+)$/);
    if (transportInquiryMatch && request.method === 'GET') {
      const item = await getTransportInquiry(env, transportInquiryMatch[1]);
      if (!item) {
        return notFound(origin, 'Transport inquiry not found.');
      }
      return json(item, { status: 200 }, origin);
    }

    const transportPlanGenerateMatch = url.pathname.match(/^\/api\/transport-inquiries\/([^/]+)\/generate-plan$/);
    if (transportPlanGenerateMatch && request.method === 'POST') {
      const result = await generateTransportPlan(
        env,
        transportPlanGenerateMatch[1],
        await parseBody<TransportPlanPayload>(request),
      );
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(await getTransportInquiry(env, transportPlanGenerateMatch[1]), { status: 201 }, origin);
    }

    if (url.pathname === '/api/transport-plans' && request.method === 'GET') {
      return json({ items: await listTransportPlans(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/customers' && request.method === 'GET') {
      return json({ items: await listCustomers(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/customers' && request.method === 'POST') {
      const result = await createCustomer(env, await parseBody<CustomerPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json({ id: result.id }, { status: 201 }, origin);
    }

    if (url.pathname === '/api/follow-ups' && request.method === 'GET') {
      return json({ items: await listFollowUps(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/follow-ups' && request.method === 'POST') {
      const body = await parseBody<FollowUpPayload>(request);
      const entityType = body.entityType;
      const entityId = ensureString(body.entityId);
      if ((entityType !== 'customer' && entityType !== 'contact') || !entityId) {
        return badRequest(origin, 'Follow-up requires a customer or contact target.');
      }
      const result = await createTimeline(env, entityType, entityId, body);
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    const customerMatch = url.pathname.match(/^\/api\/customers\/([^/]+)$/);
    if (customerMatch && request.method === 'GET') {
      const detail = await getCustomerDetail(env, customerMatch[1]);
      if (!detail) {
        return notFound(origin, 'Customer not found.');
      }
      return json(detail, { status: 200 }, origin);
    }

    if (customerMatch && request.method === 'PATCH') {
      const result = await updateCustomer(env, customerMatch[1], await parseBody<CustomerPayload>(request));
      if (result.error !== undefined) {
        return result.error === 'Customer not found.' ? notFound(origin, result.error) : badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    if (customerMatch && request.method === 'DELETE') {
      const result = await deleteCustomer(env, customerMatch[1]);
      if (result.error !== undefined) {
        return notFound(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    const customerTimelineMatch = url.pathname.match(/^\/api\/customers\/([^/]+)\/timelines$/);
    if (customerTimelineMatch && request.method === 'POST') {
      const result = await createTimeline(env, 'customer', customerTimelineMatch[1], await parseBody<TimelinePayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    const customerAttachmentMatch = url.pathname.match(/^\/api\/customers\/([^/]+)\/attachments$/);
    if (customerAttachmentMatch && request.method === 'POST') {
      const result = await createAttachment(env, 'customer', customerAttachmentMatch[1], await parseBody<AttachmentPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    if (url.pathname === '/api/contacts' && request.method === 'GET') {
      return json({ items: await listContacts(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/contacts' && request.method === 'POST') {
      const result = await createContact(env, await parseBody<ContactPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json({ id: result.id }, { status: 201 }, origin);
    }

    const contactMatch = url.pathname.match(/^\/api\/contacts\/([^/]+)$/);
    if (contactMatch && request.method === 'GET') {
      const detail = await getContactDetail(env, contactMatch[1]);
      if (!detail) {
        return notFound(origin, 'Contact not found.');
      }
      return json(detail, { status: 200 }, origin);
    }

    if (contactMatch && request.method === 'PATCH') {
      const result = await updateContact(env, contactMatch[1], await parseBody<ContactPayload>(request));
      if (result.error !== undefined) {
        return result.error === 'Contact not found.' ? notFound(origin, result.error) : badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    if (contactMatch && request.method === 'DELETE') {
      const result = await deleteContact(env, contactMatch[1]);
      if (result.error !== undefined) {
        return notFound(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    const contactTimelineMatch = url.pathname.match(/^\/api\/contacts\/([^/]+)\/timelines$/);
    if (contactTimelineMatch && request.method === 'POST') {
      const result = await createTimeline(env, 'contact', contactTimelineMatch[1], await parseBody<TimelinePayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    const contactAttachmentMatch = url.pathname.match(/^\/api\/contacts\/([^/]+)\/attachments$/);
    if (contactAttachmentMatch && request.method === 'POST') {
      const result = await createAttachment(env, 'contact', contactAttachmentMatch[1], await parseBody<AttachmentPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    if (url.pathname === '/api/tag-groups' && request.method === 'GET') {
      return json({ items: await listTagGroups(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/products' && request.method === 'GET') {
      return json({ items: await listProducts(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/products' && request.method === 'POST') {
      const body = await parseBody<ProductPayload>(request);
      const name = ensureString(body.name);
      if (!name) {
        return badRequest(origin, 'Product name is required.');
      }

      await env.DB.prepare(
        `
          INSERT INTO products (id, name, category, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
      )
        .bind(createId('prod'), name, ensureString(body.category), ensureString(body.notes), isoNow(), isoNow())
        .run();
      await recordActivity(env, 'Product created', `Added product ${name}.`);
      return json({ ok: true }, { status: 201 }, origin);
    }

    if (url.pathname === '/api/tag-groups' && request.method === 'POST') {
      const body = await parseBody<TagGroupPayload>(request);
      const name = ensureString(body.name);
      if (!name) {
        return badRequest(origin, 'Tag group name is required.');
      }

      await env.DB.prepare('INSERT INTO tag_groups (id, name, description, sort_order) VALUES (?, ?, ?, ?)')
        .bind(createId('grp'), name, ensureString(body.description), Date.now())
        .run();
      return json({ ok: true }, { status: 201 }, origin);
    }

    if (url.pathname === '/api/tags' && request.method === 'POST') {
      const body = await parseBody<TagPayload>(request);
      if (!ensureString(body.groupId) || !ensureString(body.name)) {
        return badRequest(origin, 'Tag name and group are required.');
      }

      await env.DB.prepare('INSERT INTO tags (id, group_id, name, color) VALUES (?, ?, ?, ?)')
        .bind(createId('tag'), ensureString(body.groupId), ensureString(body.name), ensureString(body.color) || 'blue')
        .run();
      return json({ ok: true }, { status: 201 }, origin);
    }

    if (url.pathname === '/api/entity-tags' && request.method === 'POST') {
      const body = await parseBody<EntityTagPayload>(request);
      if (!body.entityType || !body.entityId) {
        return badRequest(origin, 'Entity type and entity id are required.');
      }
      await replaceEntityTags(env, body.entityType, body.entityId, body.tagIds ?? []);
      return json({ ok: true }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/search' && request.method === 'GET') {
      const keyword = normalizeKeyword(url.searchParams.get('q'));
      const entityType = (url.searchParams.get('entityType') ?? 'all') as SearchEntityType;
      const tagIds = uniqueStrings(url.searchParams.getAll('tagIds'));

      const result = {
        customers: entityType === 'contact' ? [] : await searchCustomers(env, keyword, tagIds),
        contacts: entityType === 'customer' ? [] : await searchContacts(env, keyword, tagIds),
      };

      return json(result, { status: 200 }, origin);
    }

    return notFound(origin, 'API endpoint not found.');
  },
};
