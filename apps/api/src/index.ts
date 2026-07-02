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
  OPENAI_API_KEY?: string;
  MARKET_IMPORT_TOKEN?: string;
  GOOGLE_MAPS_API_KEY?: string;
  TELEGRAM_BOT_TOKEN?: string;
  FEISHU_APP_ID?: string;
  FEISHU_APP_SECRET?: string;
  FEISHU_REDIRECT_URI?: string;
  FEISHU_OAUTH_SCOPE?: string;
};

type SessionUser = {
  id: string;
  email: string;
  realName: string;
  roleCode: string;
  roleName: string;
  roles?: string[];
  permissions?: string[];
};

type LoginRequest = {
  email?: string;
  password?: string;
};

type FeishuLoginRequest = {
  code?: string;
  redirectUri?: string;
};

type FeishuBindRequest = FeishuLoginRequest;

type LoadingAiConfigPayload = {
  provider?: string;
  apiBaseUrl?: string;
  apiKey?: string;
  model?: string;
  enabled?: boolean;
  systemPrompt?: string;
  temperature?: number;
  maxOutputTokens?: number;
  notes?: string;
};

type MarketInfoPayload = {
  collectedAt?: string;
  whatsappNumber?: string;
  sourceGroup?: string;
  foreignText?: string;
  chineseTranslation?: string;
  rawPayload?: unknown;
};

type CustomerPayload = {
  name?: string;
  customerCode?: string;
  shortName?: string;
  contactName?: string;
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
  contractStatus?: string;
  contractFiles?: SupplierFilePayload[];
  invoiceInfo?: string;
  notes?: string;
  tagIds?: string[];
  productIds?: string[];
};

type SupplierFilePayload = {
  key?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileUrl?: string;
  customerVisible?: boolean;
  visibilityLevel?: string;
};

type SupplierPayload = {
  name?: string;
  supplierCode?: string;
  type?: string;
  types?: string[];
  contactInfo?: string;
  payee?: string;
  bankPhone?: string;
  bankCardNo?: string;
  bankName?: string;
  notes?: string;
  contractStatus?: string;
  contractFiles?: SupplierFilePayload[];
  attachments?: SupplierFilePayload[];
};

type SupplierVehiclePayload = {
  plateNo?: string;
  vehicleType?: string;
  requiredVehicleType?: string;
  vehicleLength?: string;
  axle?: string;
  drivingLicenseFiles?: SupplierFilePayload[];
  brandModel?: string;
  roadTransportCertNo?: string;
  experienceLicenseNo?: string;
  inspectionValidUntil?: string;
  operationCertReviewDate?: string;
  mandatoryScrapDate?: string;
  vehiclePhotoFiles?: SupplierFilePayload[];
  otherFiles?: SupplierFilePayload[];
};

type SupplierDriverPayload = {
  name?: string;
  phone?: string;
  telegramId?: string;
  idCardNo?: string;
  notes?: string;
  payee?: string;
  bankPhone?: string;
  bankCardNo?: string;
  bankName?: string;
  idFrontFiles?: SupplierFilePayload[];
  idBackFiles?: SupplierFilePayload[];
  driverLicenseFiles?: SupplierFilePayload[];
  insuranceFiles?: SupplierFilePayload[];
  internationalRoadPermitFiles?: SupplierFilePayload[];
};

type OversizeProjectPayload = {
  name?: string;
  customerId?: string | null;
  customerName?: string;
  origin?: string;
  destination?: string;
  startDate?: string | null;
  endDate?: string | null;
  manager?: string;
  status?: string;
  serviceScope?: string[];
  notes?: string;
  vehicleCount?: number | string | null;
  workflowTemplateId?: string | null;
  workflowNodeIds?: string[];
};

type OversizeTaskPayload = {
  vehicleNo?: string;
  vehicleType?: string;
  driverName?: string;
  driverPhone?: string;
  cargoSummary?: string;
  plannedDepartureDate?: string | null;
  status?: string;
  progress?: number | string | null;
  notes?: string;
};

type OversizeNodePayload = {
  status?: string;
  owner?: string;
  plannedDate?: string | null;
  completedAt?: string | null;
  notes?: string;
  files?: SupplierFilePayload[];
  customerVisible?: boolean;
  visibilityLevel?: string;
};

type OversizeTodoPayload = {
  taskId?: string | null;
  nodeId?: string | null;
  title?: string;
  owner?: string;
  dueDate?: string | null;
  status?: string;
  priority?: string;
  notes?: string;
};

type OversizeExceptionPayload = {
  taskId?: string | null;
  nodeId?: string | null;
  title?: string;
  level?: string;
  status?: string;
  owner?: string;
  description?: string;
  resolution?: string;
};

type WorkflowTemplatePayload = {
  name?: string;
  businessType?: string;
  enabled?: boolean;
  remark?: string;
};

type WorkflowTemplateNodePayload = {
  nodeName?: string;
  sortOrder?: number | string | null;
  nodeType?: string;
  defaultOwner?: string;
  defaultRoleId?: string;
  defaultRoleName?: string;
  required?: boolean;
  allowSkip?: boolean;
  allowReturn?: boolean;
  requireCustomerConfirm?: boolean;
  requireAttachment?: boolean;
  requireSupplier?: boolean;
  supplierTypes?: string[];
  requireVehicle?: boolean;
  requireDriver?: boolean;
  requireGps?: boolean;
  gpsProviderId?: string | null;
  gpsDeviceNo?: string;
  timeoutHours?: number | string | null;
  workingTimeRuleId?: string | null;
  description?: string;
};

type WorkingTimePeriodPayload = {
  weekday?: number | string | null;
  startTime?: string;
  endTime?: string;
};

type WorkingTimeRulePayload = {
  name?: string;
  country?: string;
  location?: string;
  nodeName?: string;
  timezone?: string;
  enabled?: boolean | number | string;
  remark?: string;
  periods?: WorkingTimePeriodPayload[];
};

type WorkingCalendarDayPayload = {
  country?: string;
  location?: string;
  date?: string;
  dayType?: string;
  name?: string;
  allDay?: boolean | number | string;
  periods?: Array<{ startTime?: string; endTime?: string }>;
  enabled?: boolean | number | string;
  remark?: string;
};

type WorkflowFormFieldPayload = {
  fieldName?: string;
  fieldKey?: string;
  fieldType?: string;
  required?: boolean;
  options?: string[];
  sortOrder?: number | string | null;
};

type WorkflowFileRequirementPayload = {
  fileName?: string;
  required?: boolean;
  allowedTypes?: string;
  maxCount?: number | string | null;
  customerVisible?: boolean;
  downloadable?: boolean;
};

type WorkflowActionPayload = {
  operator?: string;
  operationTime?: string;
  remark?: string;
  owner?: string;
  formValues?: Array<{
    fieldKey?: string;
    fieldName?: string;
    fieldType?: string;
    fieldValue?: string;
  }>;
  files?: SupplierFilePayload[];
  customerVisible?: boolean;
  visibilityLevel?: string;
  supplierId?: string;
  supplierName?: string;
  supplierType?: string;
  supplierVehicleId?: string;
  vehiclePlateNo?: string;
  supplierDriverId?: string;
  driverName?: string;
  driverPhone?: string;
  serviceCost?: number | string | null;
  serviceCurrency?: string;
  serviceExchangeRate?: number | string | null;
  serviceRemark?: string;
};

type WorkflowTrackingPayload = {
  trackedAt?: string;
  location?: string;
  trackingStatus?: string;
  content?: string;
  operator?: string;
  customerVisible?: boolean;
  visibilityLevel?: string;
  files?: SupplierFilePayload[];
  remark?: string;
};

type GpsProviderPayload = {
  shortName?: string;
  name?: string;
  website?: string;
  phone?: string;
  apiUrl?: string;
  apiKey?: string;
  apiToken?: string;
  username?: string;
  passwordMd5?: string;
  enabled?: boolean;
  remark?: string;
};

type ExchangeRatePayload = {
  currencyCode?: string;
  currencyName?: string;
  rateToCny?: number | string | null;
  source?: string;
  syncedAt?: string;
  enabled?: boolean | number | string;
  remark?: string;
};

type FinanceItemPayload = {
  direction?: 'receivable' | 'payable';
  projectId?: string | null;
  taskId?: string | null;
  workflowInstanceNodeId?: string | null;
  customerId?: string | null;
  customerName?: string;
  supplierId?: string | null;
  supplierName?: string;
  feeName?: string;
  currency?: string;
  amount?: number | string | null;
  exchangeRate?: number | string | null;
  status?: string;
  sourceType?: string;
  occurrenceStage?: string;
  files?: SupplierFilePayload[];
  notes?: string;
};

type FinanceBillPayload = {
  title?: string;
  customerId?: string | null;
  customerName?: string;
  status?: string;
  notes?: string;
  itemIds?: string[];
};

type FinancePaymentRequestPayload = {
  title?: string;
  supplierId?: string | null;
  supplierName?: string;
  status?: string;
  notes?: string;
  itemIds?: string[];
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

type EmployeePayload = {
  name?: string;
  phone?: string;
  email?: string;
  department?: string;
  position?: string;
  isSalesperson?: boolean;
  status?: string;
  notes?: string;
  feishuOpenId?: string;
  feishuUserId?: string;
};

type RbacRolePayload = {
  code?: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  permissionCodes?: string[];
};

type EmployeeRolePayload = {
  roleIds?: string[];
};

type VehicleTypePayload = {
  sequenceNo?: number | string | null;
  category?: string;
  name?: string;
  lineCount?: number | string | null;
  axleCount?: number | string | null;
  effectiveLength?: number | string | null;
  effectiveWidth?: number | string | null;
  effectiveHeight?: number | string | null;
  effectiveVolume?: number | string | null;
  payloadWeight?: number | string | null;
  tareWeight?: number | string | null;
  isClosed?: boolean | number | string | null;
  priceSort?: number | string | null;
  priceWeight?: number | string | null;
  scenario?: string;
  photoFiles?: SupplierFilePayload[];
};

type VehicleTypeQuotePayload = {
  quoteBatch?: string;
  quoteDate?: string;
  originCountry?: string;
  originCity?: string;
  destinationCountry?: string;
  destinationCity?: string;
  vehicleTypeId?: string | null;
  vehicleTypeName?: string;
  price?: number | string | null;
  currency?: string;
  remark?: string;
};

type LoadingRulePayload = {
  ruleCode?: string;
  ruleName?: string;
  category?: string;
  valueType?: string;
  ruleValue?: string;
  unit?: string;
  enabled?: boolean | number | string;
  description?: string;
  sortOrder?: number | string | null;
  applicableCountries?: string[];
};

type TransportInquiryPayload = {
  customerId?: string;
  customerName?: string;
  salesperson?: string;
  serviceItems?: string[];
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

type InquiryFilePayload = {
  key?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileUrl?: string;
};

type QuoteTransportInquiryPayload = {
  quoteAmount?: number | string | null;
  quoteCurrency?: string;
  quoteRemark?: string;
  quoteFiles?: InquiryFilePayload[];
  solutionFiles?: InquiryFilePayload[];
};

type InquiryTaskPayload = TransportInquiryPayload & {
  salespersonId?: string | null;
  salespersonName?: string | null;
};

type InquiryTaskQuotePayload = QuoteTransportInquiryPayload;

type InquiryTaskConfirmPayload = {
  remark?: string | null;
};

type TransportPlanPayload = {
  title?: string;
  route?: string;
  transitDays?: number | string | null;
  estimatedCost?: number | string | null;
  currency?: string;
  planText?: string;
};

type LoadingPlanPayload = {
  title?: string;
  cargoItems?: unknown[];
  vehicleIds?: string[];
  planResult?: Record<string, unknown>;
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
  headers.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  headers.set('access-control-allow-headers', 'content-type,authorization,x-market-token');

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
      if (
        originUrl.hostname === 'ostoa-web.pages.dev' ||
        originUrl.hostname.endsWith('.ostoa-web.pages.dev') ||
        originUrl.hostname === 'ostoa-driver.pages.dev' ||
        originUrl.hostname.endsWith('.ostoa-driver.pages.dev')
      ) {
        return origin;
      }
    } catch {
      // Ignore malformed Origin headers and fall through to the default.
    }
  }

  return allowedOrigins[0];
}

function normalizeApiError(error: unknown, fallback = 'Request failed.'): string {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === 'string') return error || fallback;
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const direct = record.error ?? record.message ?? record.cause ?? record.detail;
    if (direct) return normalizeApiError(direct, fallback);
    const errors = record.errors;
    if (Array.isArray(errors)) {
      const messages: string[] = errors.map((item): string => normalizeApiError(item, '')).filter(Boolean);
      if (messages.length) return messages.join('；');
    }
    try {
      const serialized = JSON.stringify(error);
      return serialized && serialized !== '{}' ? serialized : fallback;
    } catch {
      return String(error);
    }
  }
  return fallback;
}

function badRequest(origin: string, error: unknown) {
  return json({ error: normalizeApiError(error) }, { status: 400 }, origin);
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

function formatBeijing(value?: string | null) {
  if (!value) return '';
  const parsed = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (!Number.isFinite(parsed.getTime())) return value.replace('T', ' ').replace(/Z$/, '').slice(0, 16);
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(parsed);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
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

async function deleteRowsByIds(env: Env, table: string, column: string, ids: string[]) {
  const uniqueIds = uniqueStrings(ids);
  for (let index = 0; index < uniqueIds.length; index += 50) {
    const batch = uniqueIds.slice(index, index + 50);
    const placeholders = batch.map(() => '?').join(',');
    await env.DB.prepare(`DELETE FROM ${table} WHERE ${column} IN (${placeholders})`).bind(...batch).run();
  }
}

const defaultPermissions = [
  ['home.view', '查看首页', '首页', 'view'],
  ['todo.view', '查看我的待办', '我的待办', 'view'],
  ['todo.process', '处理待办', '我的待办', 'process'],
  ['tracking.view', '查看轨迹跟踪', '轨迹跟踪', 'view'],
  ['inquiry.view', '查看询单', '询单管理', 'view'],
  ['inquiry.create', '新建询单', '询单管理', 'create'],
  ['inquiry.edit', '编辑询单', '询单管理', 'edit'],
  ['inquiry.delete', '删除询单', '询单管理', 'delete'],
  ['inquiry.quote', '报价上传', '询单管理', 'quote'],
  ['loading.view', '查看配货配载', '配货配载', 'view'],
  ['loading.manage', '维护配载方案', '配货配载', 'manage'],
  ['project.view', '查看项目', '项目管理', 'view'],
  ['project.create', '新建项目', '项目管理', 'create'],
  ['project.edit', '编辑项目', '项目管理', 'edit'],
  ['project.delete', '删除项目', '项目管理', 'delete'],
  ['task.view', '查看运输任务', '运输任务', 'view'],
  ['task.edit', '编辑运输任务', '运输任务', 'edit'],
  ['task.workflow', '操作流程节点', '运输任务', 'workflow'],
  ['task.tracking.create', '增加节点跟踪', '运输任务', 'tracking'],
  ['finance.view', '查看财务管理', '财务管理', 'view'],
  ['finance.manage', '维护财务数据', '财务管理', 'manage'],
  ['supplier.view', '查看供应商', '供应商管理', 'view'],
  ['supplier.manage', '维护供应商', '供应商管理', 'manage'],
  ['customer.view', '查看客户', '客户管理', 'view'],
  ['customer.manage', '维护客户', '客户管理', 'manage'],
  ['base.view', '查看基础信息', '基础信息', 'view'],
  ['base.manage', '维护基础信息', '基础信息', 'manage'],
  ['employee.reset_password', '重置员工密码', '基础信息', 'resetPassword'],
  ['workflow.view', '查看流程模板', '流程模板', 'view'],
  ['workflow.manage', '维护流程模板', '流程模板', 'manage'],
  ['rbac.view', '查看权限角色', '权限管理', 'view'],
  ['rbac.manage', '维护权限角色', '权限管理', 'manage'],
] as const;

const defaultRoles = [
  {
    code: 'admin',
    name: '超级管理员',
    description: '拥有系统全部权限',
    permissions: defaultPermissions.map(([code]) => code),
  },
  {
    code: 'project_manager',
    name: '项目经理',
    description: '管理项目、任务、流程、客户和供应商',
    permissions: [
      'home.view',
      'todo.view',
      'todo.process',
      'tracking.view',
      'inquiry.view',
      'loading.view',
      'loading.manage',
      'project.view',
      'project.create',
      'project.edit',
      'task.view',
      'task.edit',
      'task.workflow',
      'task.tracking.create',
      'supplier.view',
      'supplier.manage',
      'customer.view',
      'customer.manage',
      'workflow.view',
    ],
  },
  {
    code: 'sales',
    name: '业务员',
    description: '处理询单、客户和项目查看',
    permissions: [
      'home.view',
      'tracking.view',
      'inquiry.view',
      'inquiry.create',
      'inquiry.edit',
      'inquiry.quote',
      'project.view',
      'project.create',
      'task.view',
      'customer.view',
      'customer.manage',
    ],
  },
  {
    code: 'operator',
    name: '操作员',
    description: '处理待办、任务节点和轨迹',
    permissions: ['home.view', 'todo.view', 'todo.process', 'tracking.view', 'task.view', 'task.edit', 'task.workflow', 'task.tracking.create', 'supplier.view'],
  },
  {
    code: 'finance',
    name: '财务',
    description: '管理应收应付和费用数据',
    permissions: ['home.view', 'tracking.view', 'finance.view', 'finance.manage', 'project.view', 'task.view', 'supplier.view', 'customer.view'],
  },
  {
    code: 'readonly',
    name: '只读用户',
    description: '只能查看主要业务数据',
    permissions: ['home.view', 'tracking.view', 'inquiry.view', 'loading.view', 'project.view', 'task.view', 'finance.view', 'supplier.view', 'customer.view', 'workflow.view'],
  },
] as const;

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

async function hmacSha256Bytes(keyBytes: ArrayBuffer | Uint8Array, value: string) {
  const rawKey = keyBytes instanceof Uint8Array ? keyBytes.slice().buffer : keyBytes;
  const key = await crypto.subtle.importKey('raw', rawKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

function toHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqualText(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

async function verifyTelegramInitData(initData: string, botToken: string) {
  if (!initData || !botToken) return { ok: false, error: 'Telegram initData is required.' };
  const params = new URLSearchParams(initData);
  const hash = params.get('hash') ?? '';
  if (!hash) return { ok: false, error: 'Telegram signature is missing.' };
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const secretKey = await hmacSha256Bytes(encoder.encode('WebAppData'), botToken);
  const calculatedHash = toHex(await hmacSha256Bytes(secretKey, dataCheckString));
  if (!timingSafeEqualText(calculatedHash, hash)) return { ok: false, error: 'Telegram signature is invalid.' };
  const authDate = Number(params.get('auth_date'));
  if (Number.isFinite(authDate) && authDate > 0) {
    const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
    if (ageSeconds > 86400) return { ok: false, error: 'Telegram session expired.' };
  }
  const userRaw = params.get('user');
  try {
    return { ok: true, user: userRaw ? JSON.parse(userRaw) : null };
  } catch {
    return { ok: true, user: null };
  }
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
    roles: decoded.roles ?? [],
    permissions: decoded.permissions ?? [],
  };
}

async function getUserFromRequest(request: Request, env: Env) {
  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return null;
  }

  const user = await verifyToken(token, env.AUTH_SECRET);
  if (!user) return null;

  try {
    const rbac = await getUserRbac(env, user);
    return {
      ...user,
      roles: rbac.roles,
      permissions: rbac.permissions,
      roleName: rbac.roles.length ? rbac.roles.join('、') : user.roleName,
    };
  } catch {
    return user;
  }
}

function isAdminUser(user: Pick<SessionUser, 'roleCode' | 'roleName' | 'roles' | 'permissions'> | null | undefined) {
  const roleValues = [user?.roleCode, user?.roleName, ...(user?.roles ?? [])]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
  return (
    roleValues.includes('admin') ||
    roleValues.includes('超级管理员') ||
    Boolean(user?.permissions?.includes('rbac.manage'))
  );
}

async function seedRbac(env: Env) {
  const permissionCount = await env.DB.prepare('SELECT COUNT(*) as count FROM rbac_permissions').first<{ count: number }>();
  const roleCount = await env.DB.prepare('SELECT COUNT(*) as count FROM rbac_roles').first<{ count: number }>();
  if (Number(permissionCount?.count ?? 0) >= defaultPermissions.length && Number(roleCount?.count ?? 0) >= defaultRoles.length) {
    return;
  }

  const now = isoNow();
  for (const [code, name, module, action] of defaultPermissions) {
    await env.DB.prepare(
      `
        INSERT OR IGNORE INTO rbac_permissions (id, code, name, module, action, description, sort_order, enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(`perm_${code.replace(/[^a-zA-Z0-9]+/g, '_')}`, code, name, module, action, '', defaultPermissions.findIndex(([item]) => item === code) + 1, 1, now, now)
      .run();
  }

  for (const role of defaultRoles) {
    const roleId = `role_${role.code}`;
    await env.DB.prepare(
      `
        INSERT OR IGNORE INTO rbac_roles (id, code, name, description, enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(roleId, role.code, role.name, role.description, 1, now, now)
      .run();

    for (const permissionCode of role.permissions) {
      const permission = await env.DB.prepare('SELECT id FROM rbac_permissions WHERE code = ?').bind(permissionCode).first<{ id: string }>();
      if (permission) {
        await env.DB.prepare('INSERT OR IGNORE INTO rbac_role_permissions (role_id, permission_id) VALUES (?, ?)').bind(roleId, permission.id).run();
      }
    }
  }
}

async function getUserRbac(env: Env, user: { id: string; email: string; roleCode: string }) {
  await seedRbac(env);
  if (user.roleCode === 'ADMIN') {
    const allPermissions = await env.DB.prepare('SELECT code FROM rbac_permissions WHERE enabled = 1 ORDER BY sort_order ASC').all<{ code: string }>();
    return { roles: ['超级管理员'], permissions: allPermissions.results.map((item) => item.code) };
  }

  const employee = await env.DB.prepare('SELECT id FROM employees WHERE lower(COALESCE(email, \'\')) = lower(?) LIMIT 1').bind(user.email).first<{ id: string }>();
  let roles: { id: string; name: string; code: string }[] = [];
  if (employee) {
    const roleRows = await env.DB.prepare(
      `
        SELECT rbac_roles.id, rbac_roles.name, rbac_roles.code
        FROM employee_roles
        JOIN rbac_roles ON rbac_roles.id = employee_roles.role_id
        WHERE employee_roles.employee_id = ? AND rbac_roles.enabled = 1
        ORDER BY rbac_roles.name ASC
      `,
    )
      .bind(employee.id)
      .all<{ id: string; name: string; code: string }>();
    roles = roleRows.results;
  }

  if (!roles.length) {
    const fallbackCode = user.roleCode === 'SALES' ? 'sales' : 'readonly';
    const fallback = await env.DB.prepare('SELECT id, name, code FROM rbac_roles WHERE code = ? LIMIT 1').bind(fallbackCode).first<{ id: string; name: string; code: string }>();
    roles = fallback ? [fallback] : [];
  }

  if (!roles.length) return { roles: [], permissions: ['home.view'] };
  const placeholders = roles.map(() => '?').join(',');
  const permissions = await env.DB.prepare(
    `
      SELECT DISTINCT rbac_permissions.code
      FROM rbac_role_permissions
      JOIN rbac_permissions ON rbac_permissions.id = rbac_role_permissions.permission_id
      WHERE rbac_role_permissions.role_id IN (${placeholders}) AND rbac_permissions.enabled = 1
      ORDER BY rbac_permissions.sort_order ASC
    `,
  )
    .bind(...roles.map((role) => role.id))
    .all<{ code: string }>();
  return { roles: roles.map((role) => role.name), permissions: permissions.results.map((item) => item.code) };
}

function mergeSessionRbac<T extends { roleCode: string; roleName: string }>(
  user: T,
  rbac: { roles: string[]; permissions: string[] },
) {
  const hasAdminRole = rbac.roles.some((role) => role === '超级管理员' || role.toLowerCase() === 'admin');
  return {
    ...user,
    roleCode: hasAdminRole ? 'ADMIN' : user.roleCode,
    roles: rbac.roles,
    permissions: rbac.permissions,
    roleName: rbac.roles.length ? rbac.roles.join('、') : user.roleName,
  };
}

function getFeishuRedirectUri(env: Env, provided?: string) {
  return ensureString(provided) || ensureString(env.FEISHU_REDIRECT_URI) || 'https://admin.ostoa.org/mobile/workflow';
}

function getFeishuAuthUrl(env: Env, redirectUri: string, state?: string) {
  const appId = ensureString(env.FEISHU_APP_ID);
  if (!appId) return { error: 'Feishu App ID is not configured.' };
  const authUrl = new URL('https://accounts.feishu.cn/open-apis/authen/v1/authorize');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  const scope = ensureString(env.FEISHU_OAUTH_SCOPE);
  if (scope) authUrl.searchParams.set('scope', scope);
  if (state) authUrl.searchParams.set('state', state);
  return { authUrl: authUrl.toString() };
}

async function exchangeFeishuCode(env: Env, code: string, redirectUri: string) {
  const appId = ensureString(env.FEISHU_APP_ID);
  const appSecret = ensureString(env.FEISHU_APP_SECRET);
  if (!appId || !appSecret) return { error: 'Feishu App ID or App Secret is not configured.' };
  const legacyResult = await exchangeFeishuCodeLegacy(env, code);
  if (legacyResult.accessToken || legacyResult.error) return legacyResult;

  const response = await fetch('https://open.feishu.cn/open-apis/authen/v2/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: appId,
      client_secret: appSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || Number(payload.code ?? 0) !== 0) {
    return { error: ensureString(payload.msg) || ensureString(payload.message) || 'Feishu authorization failed.' };
  }
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const tokenInfo = (data.user_access_token_info ?? data.token_info ?? {}) as Record<string, unknown>;
  const accessToken =
    ensureString(data.access_token) ||
    ensureString(data.user_access_token) ||
    ensureString(tokenInfo.access_token) ||
    ensureString(tokenInfo.user_access_token) ||
    ensureString(payload.access_token) ||
    ensureString(payload.user_access_token);
  if (accessToken) return { accessToken };
  return { error: `Feishu did not return user_access_token. Response fields: ${Object.keys(data).join(', ') || 'empty'}` };
}

async function getFeishuAppAccessToken(env: Env) {
  const appId = ensureString(env.FEISHU_APP_ID);
  const appSecret = ensureString(env.FEISHU_APP_SECRET);
  if (!appId || !appSecret) return { error: 'Feishu App ID or App Secret is not configured.' };
  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || Number(payload.code ?? 0) !== 0) {
    return { error: ensureString(payload.msg) || ensureString(payload.message) || 'Failed to get Feishu app_access_token.' };
  }
  return { appAccessToken: ensureString(payload.app_access_token) };
}

async function exchangeFeishuCodeLegacy(env: Env, code: string) {
  const tokenResult = await getFeishuAppAccessToken(env);
  if (tokenResult.error || !tokenResult.appAccessToken) return tokenResult.error ? { error: tokenResult.error } : {};
  const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenResult.appAccessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ grant_type: 'authorization_code', code }),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || Number(payload.code ?? 0) !== 0) {
    return { error: ensureString(payload.msg) || ensureString(payload.message) || 'Feishu legacy authorization failed.' };
  }
  const data = (payload.data ?? {}) as Record<string, unknown>;
  return { accessToken: ensureString(data.access_token) || ensureString(data.user_access_token) };
}

async function getFeishuUserInfo(accessToken: string) {
  const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || Number(payload.code ?? 0) !== 0) {
    return { error: ensureString(payload.msg) || ensureString(payload.message) || 'Failed to get Feishu user info.' };
  }
  return { user: ((payload.data ?? {}) as Record<string, unknown>) };
}

async function getFeishuTenantAccessToken(env: Env) {
  const appId = ensureString(env.FEISHU_APP_ID);
  const appSecret = ensureString(env.FEISHU_APP_SECRET);
  if (!appId || !appSecret) return { error: 'Feishu App ID or App Secret is not configured.' };
  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || Number(payload.code ?? 0) !== 0) {
    return { error: ensureString(payload.msg) || ensureString(payload.message) || 'Failed to get Feishu tenant_access_token.' };
  }
  return { tenantAccessToken: ensureString(payload.tenant_access_token) };
}

async function getFeishuIdsByContacts(env: Env, contacts: { emails: string[]; mobiles: string[] }) {
  const tokenResult = await getFeishuTenantAccessToken(env);
  if (tokenResult.error) return tokenResult;
  const response = await fetch('https://open.feishu.cn/open-apis/contact/v3/users/batch_get_id?user_id_type=open_id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenResult.tenantAccessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      emails: contacts.emails,
      mobiles: contacts.mobiles,
      include_resigned: false,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || Number(payload.code ?? 0) !== 0) {
    return { error: ensureString(payload.msg) || ensureString(payload.message) || 'Failed to sync Feishu users.' };
  }
  const data = (payload.data ?? {}) as Record<string, unknown>;
  return { users: Array.isArray(data.user_list) ? (data.user_list as Record<string, unknown>[]) : [] };
}

async function syncEmployeeFeishuAccounts(env: Env) {
  const employees = await env.DB.prepare(
    `SELECT id, name, phone, email FROM employees WHERE status = 'ACTIVE' AND (COALESCE(email, '') != '' OR COALESCE(phone, '') != '') ORDER BY name ASC`,
  ).all<{ id: string; name: string; phone?: string | null; email?: string | null }>();
  const emailMap = new Map<string, string>();
  const mobileMap = new Map<string, string>();
  for (const employee of employees.results) {
    const email = ensureString(employee.email).toLowerCase();
    const mobile = ensureString(employee.phone).replace(/\s+/g, '');
    if (email) emailMap.set(email, employee.id);
    if (mobile) mobileMap.set(mobile, employee.id);
  }
  const result = await getFeishuIdsByContacts(env, {
    emails: [...emailMap.keys()],
    mobiles: [...mobileMap.keys()],
  });
  if ('error' in result && result.error) return result;

  let matched = 0;
  const unmatched = employees.results.map((item) => item.id);
  const feishuUsers = 'users' in result ? result.users : [];
  for (const item of feishuUsers) {
    const email = ensureString(item.email).toLowerCase();
    const mobile = ensureString(item.mobile).replace(/\s+/g, '');
    const employeeId = (email && emailMap.get(email)) || (mobile && mobileMap.get(mobile));
    if (!employeeId) continue;
    const returnedUserId = ensureString(item.user_id) || ensureString(item.userId);
    const openId = ensureString(item.open_id) || ensureString(item.openId) || returnedUserId;
    const userId = returnedUserId;
    if (!openId && !userId) continue;
    await env.DB.prepare('UPDATE employees SET feishu_open_id = COALESCE(NULLIF(?, \'\'), feishu_open_id), feishu_user_id = COALESCE(NULLIF(?, \'\'), feishu_user_id), updated_at = ? WHERE id = ?')
      .bind(openId, userId, isoNow(), employeeId)
      .run();
    matched += 1;
    const index = unmatched.indexOf(employeeId);
    if (index >= 0) unmatched.splice(index, 1);
  }
  await recordActivity(env, '同步飞书账号', `同步飞书账号，匹配 ${matched} 个员工。`);
  return { ok: true, total: employees.results.length, matched, unmatched: unmatched.length };
}

function feishuCardContent(todo: {
  title: string;
  customerShortName?: string | null;
  customerName?: string | null;
  projectName?: string | null;
  vehicleNo?: string | null;
  vehicleType?: string | null;
  taskNo?: string | null;
  nodeName?: string | null;
  dueAt?: string | null;
  taskId?: string | null;
  feishuAppId?: string | null;
  template?: string;
  alertText?: string | null;
}) {
  const pagePath = `/mobile/workflow${todo.taskId ? `?taskId=${encodeURIComponent(todo.taskId)}` : ''}`;
  const targetUrl = `https://admin.ostoa.org${pagePath}`;
  const url = todo.feishuAppId
    ? `https://applink.feishu.cn/client/web_app/open?appId=${encodeURIComponent(todo.feishuAppId)}&mode=appCenter&lk_target_url=${encodeURIComponent(targetUrl)}`
    : targetUrl;
  const vehicleText = [ensureString(todo.vehicleNo), ensureString(todo.vehicleType)].filter(Boolean).join(' / ') || '-';
  const customerText = ensureString(todo.customerShortName) || ensureString(todo.customerName) || '-';
  const isAlert = todo.template === 'red' || Boolean(ensureString(todo.alertText));
  const title = todo.title || '运输任务待处理';
  const cardTitle = isAlert && !title.startsWith('🔴') ? `🔴 ${title}` : title;
  const alertText = ensureString(todo.alertText) || (isAlert ? '超时提醒：该节点已超过预计时效，请优先处理。' : '');
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: cardTitle },
      template: isAlert ? 'red' : todo.template || 'blue',
    },
    elements: [
      ...(isAlert
        ? [
            {
              tag: 'markdown',
              content: `<font color="red">**${alertText}**</font>`,
            },
          ]
        : []),
      { tag: 'markdown', content: `**客户**：${customerText}\n**项目**：${todo.projectName || '-'}\n**车牌/车辆**：${vehicleText}\n**任务号**：${todo.taskNo || '-'}\n**当前节点**：${todo.nodeName || '-'}\n**截止时间**：${todo.dueAt ? formatBeijing(todo.dueAt) : '-'}` },
      { tag: 'action', actions: [{ tag: 'button', text: { tag: 'plain_text', content: '打开处理' }, type: 'primary', url }] },
    ],
  };
}

async function sendFeishuMessage(env: Env, openId: string, card: Record<string, unknown>) {
  const tokenResult = await getFeishuTenantAccessToken(env);
  if (tokenResult.error) return tokenResult;
  const response = await fetch('https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenResult.tenantAccessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      receive_id: openId,
      msg_type: 'interactive',
      content: JSON.stringify(card),
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || Number(payload.code ?? 0) !== 0) {
    const code = payload.code === undefined ? '' : `code ${String(payload.code)}`;
    const message = ensureString(payload.msg) || ensureString(payload.message) || 'Failed to send Feishu message.';
    return { error: [code, message].filter(Boolean).join(': ') };
  }
  return { ok: true };
}

async function findEmployeeForFeishu(env: Env, feishuUser: Record<string, unknown>) {
  const openId = ensureString(feishuUser.open_id) || ensureString(feishuUser.openId);
  const userId = ensureString(feishuUser.user_id) || ensureString(feishuUser.userId);
  const unionId = ensureString(feishuUser.union_id) || ensureString(feishuUser.unionId);
  const feishuIds = Array.from(new Set([openId, userId, unionId].filter(Boolean)));
  if (feishuIds.length > 0) {
    const conditions = feishuIds.map(() => 'feishu_open_id = ? OR feishu_user_id = ?').join(' OR ');
    const bindings = feishuIds.flatMap((id) => [id, id]);
    const employee = await env.DB.prepare(
      `SELECT id, name, email, phone, department, position, is_salesperson as isSalesperson, status
       FROM employees
       WHERE status = 'ACTIVE' AND (${conditions})
       LIMIT 1`,
    )
      .bind(...bindings)
      .first<Record<string, unknown>>();
    if (employee) return employee;
  }

  const email = ensureString(feishuUser.email) || ensureString(feishuUser.enterprise_email);
  if (email) {
    const employee = await env.DB.prepare(
      `SELECT id, name, email, phone, department, position, is_salesperson as isSalesperson, status
       FROM employees
       WHERE lower(COALESCE(email, '')) = lower(?) AND status = 'ACTIVE'
       LIMIT 1`,
    )
      .bind(email)
      .first<Record<string, unknown>>();
    if (employee) return employee;
  }

  const name = ensureString(feishuUser.name) || ensureString(feishuUser.en_name);
  if (name) {
    const rows = await env.DB.prepare(
      `SELECT id, name, email, phone, department, position, is_salesperson as isSalesperson, status
       FROM employees
       WHERE name = ? AND status = 'ACTIVE'
       LIMIT 2`,
    )
      .bind(name)
      .all<Record<string, unknown>>();
    if (rows.results.length === 1) return rows.results[0];
  }
  return null;
}

async function updateEmployeeFeishuIdentity(env: Env, employeeId: string, feishuUser: Record<string, unknown>) {
  const openId = ensureString(feishuUser.open_id) || ensureString(feishuUser.openId);
  const userId = ensureString(feishuUser.user_id) || ensureString(feishuUser.userId) || openId;
  if (!employeeId || (!openId && !userId)) return;
  await env.DB.prepare(
    `UPDATE employees
     SET feishu_open_id = COALESCE(NULLIF(?, ''), feishu_open_id),
         feishu_user_id = COALESCE(NULLIF(?, ''), feishu_user_id),
         updated_at = ?
     WHERE id = ?`,
  )
    .bind(openId, userId, isoNow(), employeeId)
    .run();
}

async function getOrCreateUserForEmployee(env: Env, employee: Record<string, unknown>) {
  const email = ensureString(employee.email).toLowerCase();
  if (!email) return { error: '员工缺少邮箱，无法使用飞书免登。' };
  const existing = await env.DB.prepare('SELECT id, email, real_name as realName, role_code as roleCode, role_name as roleName FROM users WHERE lower(email) = lower(?)')
    .bind(email)
    .first<{ id: string; email: string; realName: string; roleCode: string; roleName: string }>();
  if (existing) return { user: existing };

  const isSalesperson = Boolean(employee.isSalesperson);
  const user = {
    id: createId('usr'),
    email,
    realName: ensureString(employee.name),
    roleCode: isSalesperson ? 'SALES' : 'USER',
    roleName: isSalesperson ? '业务员' : '员工',
  };
  await env.DB.prepare('INSERT INTO users (id, email, password_hash, real_name, role_code, role_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(user.id, user.email, await sha256(createId('feishu_pwd')), user.realName, user.roleCode, user.roleName, isoNow())
    .run();
  return { user };
}

async function loginWithFeishu(env: Env, body: FeishuLoginRequest) {
  const code = ensureString(body.code);
  if (!code) return { error: 'Feishu authorization code is required.' };
  const redirectUri = getFeishuRedirectUri(env, body.redirectUri);
  const tokenResult = await exchangeFeishuCode(env, code, redirectUri);
  if (tokenResult.error) return tokenResult;
  if (!tokenResult.accessToken) return { error: 'Feishu did not return user_access_token.' };
  const userInfoResult = await getFeishuUserInfo(tokenResult.accessToken);
  if (userInfoResult.error) return userInfoResult;
  const feishuUser = userInfoResult.user ?? {};
  const employee = await findEmployeeForFeishu(env, feishuUser);
  if (!employee) return { error: '未找到匹配员工。请确认飞书邮箱/姓名已维护到员工管理。' };
  await updateEmployeeFeishuIdentity(env, ensureString(employee.id), feishuUser);
  const systemUserResult = await getOrCreateUserForEmployee(env, employee);
  if (systemUserResult.error || !systemUserResult.user) return systemUserResult;
  const rbac = await getUserRbac(env, systemUserResult.user);
  const sessionUser = mergeSessionRbac(systemUserResult.user, rbac);
  const token = await createToken(sessionUser, env.AUTH_SECRET);
  return {
    token,
    user: sessionUser,
    employee,
    feishuUser: {
      openId: ensureString(feishuUser.open_id),
      unionId: ensureString(feishuUser.union_id),
      name: ensureString(feishuUser.name),
      email: ensureString(feishuUser.email) || ensureString(feishuUser.enterprise_email),
    },
  };
}

async function getEmployeeForSessionUser(env: Env, sessionUser: SessionUser) {
  const email = ensureString(sessionUser.email);
  if (email) {
    const employee = await env.DB.prepare(
      `SELECT id, name, email, phone, feishu_open_id as feishuOpenId, feishu_user_id as feishuUserId
       FROM employees
       WHERE lower(COALESCE(email, '')) = lower(?) AND status = 'ACTIVE'
       LIMIT 1`,
    )
      .bind(email)
      .first<Record<string, unknown>>();
    if (employee) return employee;
  }

  const name = ensureString(sessionUser.realName);
  if (name) {
    const rows = await env.DB.prepare(
      `SELECT id, name, email, phone, feishu_open_id as feishuOpenId, feishu_user_id as feishuUserId
       FROM employees
       WHERE name = ? AND status = 'ACTIVE'
       LIMIT 2`,
    )
      .bind(name)
      .all<Record<string, unknown>>();
    if (rows.results.length === 1) return rows.results[0];
  }
  return null;
}

async function getCurrentFeishuBinding(env: Env, sessionUser: SessionUser) {
  const employee = await getEmployeeForSessionUser(env, sessionUser);
  if (!employee) {
    return {
      bound: false,
      employeeMissing: true,
      message: '未找到当前登录用户对应的员工资料，请先在员工管理维护邮箱或姓名。',
    };
  }

  return {
    bound: Boolean(ensureString(employee.feishuOpenId)),
    employeeId: ensureString(employee.id),
    employeeName: ensureString(employee.name),
    email: ensureString(employee.email),
    feishuOpenId: ensureString(employee.feishuOpenId),
    feishuUserId: ensureString(employee.feishuUserId),
  };
}

async function bindCurrentUserFeishu(env: Env, sessionUser: SessionUser, body: FeishuBindRequest) {
  const code = ensureString(body.code);
  if (!code) return { error: 'Feishu authorization code is required.' };

  const employee = await getEmployeeForSessionUser(env, sessionUser);
  if (!employee) {
    return { error: '未找到当前登录用户对应的员工资料，请先在员工管理维护邮箱或姓名。' };
  }

  const redirectUri = getFeishuRedirectUri(env, body.redirectUri);
  const tokenResult = await exchangeFeishuCode(env, code, redirectUri);
  if (tokenResult.error) return tokenResult;
  if (!tokenResult.accessToken) return { error: 'Feishu did not return user_access_token.' };

  const userInfoResult = await getFeishuUserInfo(tokenResult.accessToken);
  if (userInfoResult.error) return userInfoResult;
  const feishuUser = userInfoResult.user ?? {};
  const openId = ensureString(feishuUser.open_id);
  const userId = ensureString(feishuUser.user_id);
  if (!openId) return { error: '飞书未返回 Open ID，无法绑定。' };

  await env.DB.prepare('UPDATE employees SET feishu_open_id = ?, feishu_user_id = ?, updated_at = ? WHERE id = ?')
    .bind(openId, userId, isoNow(), ensureString(employee.id))
    .run();
  await recordActivity(env, '绑定飞书账号', `员工 ${ensureString(employee.name)} 绑定飞书账号。`);

  return {
    bound: true,
    employeeId: ensureString(employee.id),
    employeeName: ensureString(employee.name),
    feishuOpenId: openId,
    feishuUserId: userId,
  };
}

async function listMobileWorkflowTodos(env: Env, sessionUser: SessionUser) {
  const rows = mergeWorkflowTodoRows(await listWorkflowTodos(env), await listCurrentWorkflowNodeTodos(env));
  if (isAdminUser(sessionUser)) return rows;
  const roleNames = new Set([sessionUser.roleName, ...(sessionUser.roles ?? [])].filter(Boolean));
  return rows.filter((row: Record<string, unknown>) => canViewMobileWorkflowTodo(row, sessionUser, roleNames));
}

function canViewMobileWorkflowTodo(row: Record<string, unknown>, sessionUser: SessionUser, roleNames: Set<string>) {
  const owner = ensureString(row.owner);
  const ownerRoleName = ensureString(row.ownerRoleName);
  return (
    !owner ||
    owner === sessionUser.realName ||
    owner === sessionUser.email ||
    ownerRoleName === sessionUser.roleName ||
    roleNames.has(ownerRoleName)
  );
}

function mergeWorkflowTodoRows(todoRows: Array<Record<string, unknown>>, currentRows: Array<Record<string, unknown>>) {
  const byNode = new Map<string, Record<string, unknown>>();
  for (const row of currentRows) {
    const key = ensureString(row.instanceNodeId) || ensureString(row.id);
    if (key) byNode.set(key, row);
  }
  for (const row of todoRows) {
    const key = ensureString(row.instanceNodeId) || ensureString(row.id);
    if (!key) continue;
    const currentRow = byNode.get(key);
    const currentStatus = ensureString(currentRow?.status);
    const todoStatus = ensureString(row.status);
    if (todoStatus === '已处理' && currentRow && currentStatus !== '已处理') continue;
    byNode.set(key, row);
  }
  return Array.from(byNode.values()).sort((left, right) => {
    const leftTime = new Date(ensureString(left.createdAt) || ensureString(left.dueAt) || 0).getTime();
    const rightTime = new Date(ensureString(right.createdAt) || ensureString(right.dueAt) || 0).getTime();
    return rightTime - leftTime;
  });
}

async function listCurrentWorkflowNodeTodos(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
             ('current-' || workflow_instance_nodes.id) as id,
             workflow_instances.id as instanceId,
             workflow_instance_nodes.id as instanceNodeId,
             workflow_instance_nodes.project_id as projectId,
             workflow_instance_nodes.task_id as taskId,
             (workflow_instance_nodes.node_name || '节点待处理') as title,
             workflow_instance_nodes.owner,
             workflow_instance_nodes.owner_role_id as ownerRoleId,
             workflow_instance_nodes.owner_role_name as ownerRoleName,
             'current_node' as assignmentSource,
             workflow_instance_nodes.timeout_at as dueAt,
             CASE
               WHEN workflow_instance_nodes.status = '已完成' THEN '已处理'
               WHEN workflow_instance_nodes.status = '未开始' THEN '未处理'
               ELSE workflow_instance_nodes.status
             END as status,
             'normal' as priority,
             COALESCE(workflow_instance_nodes.updated_at, workflow_instance_nodes.created_at, workflow_instances.updated_at) as createdAt,
             oversize_projects.name as projectName,
             oversize_projects.customer_name as customerName,
             COALESCE(NULLIF(customers.short_name, ''), oversize_projects.customer_name) as customerShortName,
             oversize_project_tasks.task_no as taskNo,
             oversize_project_tasks.vehicle_no as vehicleNo,
             oversize_project_tasks.vehicle_type as vehicleType,
             workflow_instance_nodes.node_name as nodeName
      FROM workflow_instances
      JOIN workflow_instance_nodes ON workflow_instance_nodes.id = workflow_instances.current_node_id
      JOIN oversize_projects ON oversize_projects.id = workflow_instance_nodes.project_id
      LEFT JOIN customers ON customers.id = oversize_projects.customer_id
      JOIN oversize_project_tasks ON oversize_project_tasks.id = workflow_instance_nodes.task_id
      WHERE workflow_instances.current_node_id IS NOT NULL
        AND COALESCE(workflow_instances.status, '') NOT IN ('已完成', '完成')
        AND COALESCE(oversize_project_tasks.status, '') NOT IN ('已完成', '完成')
        AND COALESCE(workflow_instance_nodes.status, '') NOT IN ('已完成', '已跳过', '已退回')
      ORDER BY workflow_instance_nodes.updated_at DESC
    `,
  ).all<Record<string, unknown>>();
  return rows.results;
}

function executiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function executiveText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '-';
}

function executiveTimeMs(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return 0;
  const raw = value.includes('T') ? value : value.replace(' ', 'T');
  const parsed = new Date(raw);
  const time = parsed.getTime();
  return Number.isFinite(time) ? time : 0;
}

function executiveElapsedHours(start: unknown, end?: unknown) {
  const startMs = executiveTimeMs(start);
  if (!startMs) return 0;
  const endMs = executiveTimeMs(end) || Date.now();
  return Math.max(0, Math.round(((endMs - startMs) / 3600000) * 10) / 10);
}

async function getExecutiveDashboard(env: Env) {
  const activeRows = await env.DB.prepare(
    `
      SELECT
        workflow_instance_nodes.id as nodeId,
        workflow_instance_nodes.node_name as nodeName,
        workflow_instance_nodes.owner as owner,
        workflow_instance_nodes.status as nodeStatus,
        workflow_instance_nodes.started_at as startedAt,
        workflow_instance_nodes.completed_at as completedAt,
        workflow_instance_nodes.planned_duration_hours as plannedDurationHours,
        workflow_instance_nodes.timeout_at as timeoutAt,
        workflow_instance_nodes.sort_order as sortOrder,
        workflow_instances.status as instanceStatus,
        oversize_project_tasks.id as taskId,
        oversize_project_tasks.task_no as taskNo,
        oversize_project_tasks.vehicle_no as vehicleNo,
        oversize_project_tasks.vehicle_type as vehicleType,
        oversize_project_tasks.status as taskStatus,
        oversize_project_tasks.progress as progress,
        oversize_projects.id as projectId,
        oversize_projects.name as projectName,
        oversize_projects.customer_name as customerName,
        COALESCE(NULLIF(customers.short_name, ''), oversize_projects.customer_name) as customerShortName,
        oversize_projects.origin as origin,
        oversize_projects.destination as destination
      FROM workflow_instances
      JOIN workflow_instance_nodes ON workflow_instance_nodes.id = workflow_instances.current_node_id
      JOIN oversize_projects ON oversize_projects.id = workflow_instance_nodes.project_id
      LEFT JOIN customers ON customers.id = oversize_projects.customer_id
      JOIN oversize_project_tasks ON oversize_project_tasks.id = workflow_instance_nodes.task_id
      WHERE workflow_instances.current_node_id IS NOT NULL
        AND COALESCE(workflow_instances.status, '') NOT IN ('已完成', '完成', '已结束', '结束')
        AND COALESCE(oversize_project_tasks.status, '') NOT IN ('已完成', '完成', '已结束', '结束')
      ORDER BY workflow_instance_nodes.updated_at DESC
      LIMIT 180
    `,
  ).all<Record<string, unknown>>();

  const summaryRow = await env.DB.prepare(
    `
      SELECT
        (SELECT COUNT(*) FROM oversize_projects WHERE COALESCE(status, '') NOT IN ('已完成', '完成', '已结束', '结束')) as activeProjects,
        (SELECT COUNT(*) FROM oversize_project_tasks WHERE COALESCE(status, '') NOT IN ('已完成', '完成', '已结束', '结束')) as activeTasks,
        (SELECT COUNT(*) FROM workflow_todos WHERE COALESCE(status, '') NOT IN ('已处理', '已完成', 'completed')) as pendingTodos
    `,
  ).first<Record<string, unknown>>();

  const completedTodayRows = await env.DB.prepare(
    `
      SELECT node_name as nodeName, COUNT(*) as count
      FROM workflow_instance_nodes
      WHERE COALESCE(status, '') IN ('已完成', '完成')
        AND COALESCE(completed_at, '') != ''
        AND date(datetime(completed_at, '+8 hours')) = date(datetime('now', '+8 hours'))
      GROUP BY node_name
    `,
  ).all<Record<string, unknown>>();

  const transitionRows = await env.DB.prepare(
    `
      SELECT workflow_transitions.id as id,
             workflow_transitions.task_id as taskId,
             workflow_transitions.project_id as projectId,
             workflow_transitions.operator as operator,
             workflow_transitions.action as action,
             COALESCE(workflow_transitions.to_node_name, workflow_transitions.from_node_name) as nodeName,
             workflow_transitions.remark as content,
             workflow_transitions.created_at as happenedAt,
             oversize_project_tasks.task_no as taskNo,
             oversize_projects.name as projectName,
             COALESCE(NULLIF(customers.short_name, ''), oversize_projects.customer_name) as customerShortName
      FROM workflow_transitions
      LEFT JOIN oversize_project_tasks ON oversize_project_tasks.id = workflow_transitions.task_id
      LEFT JOIN oversize_projects ON oversize_projects.id = workflow_transitions.project_id
      LEFT JOIN customers ON customers.id = oversize_projects.customer_id
      WHERE date(datetime(workflow_transitions.created_at, '+8 hours')) = date(datetime('now', '+8 hours'))
      ORDER BY workflow_transitions.created_at DESC
      LIMIT 80
    `,
  ).all<Record<string, unknown>>();

  const trackingRows = await env.DB.prepare(
    `
      SELECT workflow_node_tracking_records.id as id,
             workflow_node_tracking_records.task_id as taskId,
             workflow_node_tracking_records.project_id as projectId,
             workflow_node_tracking_records.operator as operator,
             workflow_node_tracking_records.tracking_status as action,
             workflow_node_tracking_records.node_name as nodeName,
             workflow_node_tracking_records.content as content,
             workflow_node_tracking_records.tracked_at as happenedAt,
             oversize_project_tasks.task_no as taskNo,
             oversize_projects.name as projectName,
             COALESCE(NULLIF(customers.short_name, ''), oversize_projects.customer_name) as customerShortName
      FROM workflow_node_tracking_records
      LEFT JOIN oversize_project_tasks ON oversize_project_tasks.id = workflow_node_tracking_records.task_id
      LEFT JOIN oversize_projects ON oversize_projects.id = workflow_node_tracking_records.project_id
      LEFT JOIN customers ON customers.id = oversize_projects.customer_id
      WHERE date(datetime(workflow_node_tracking_records.tracked_at, '+8 hours')) = date(datetime('now', '+8 hours'))
      ORDER BY workflow_node_tracking_records.tracked_at DESC
      LIMIT 80
    `,
  ).all<Record<string, unknown>>();

  const completedByNode = new Map(
    completedTodayRows.results.map((row) => [executiveText(row.nodeName), executiveNumber(row.count)]),
  );
  const nodeStats = new Map<string, { nodeName: string; active: number; processing: number; pending: number; overdue: number; completedToday: number }>();
  const risks: Record<string, unknown>[] = [];
  const runningTasks = new Map<string, Record<string, unknown>>();

  for (const row of activeRows.results) {
    const nodeName = executiveText(row.nodeName);
    const plannedHours = executiveNumber(row.plannedDurationHours);
    const actualHours = executiveElapsedHours(row.startedAt, row.completedAt);
    const overdue = plannedHours > 0 && actualHours > plannedHours && executiveText(row.nodeStatus) !== '已完成';
    const stat = nodeStats.get(nodeName) ?? {
      nodeName,
      active: 0,
      processing: 0,
      pending: 0,
      overdue: 0,
      completedToday: completedByNode.get(nodeName) ?? 0,
    };
    stat.active += 1;
    if (executiveText(row.nodeStatus) === '处理中') stat.processing += 1;
    if (executiveText(row.nodeStatus) === '待处理' || executiveText(row.nodeStatus) === '未开始') stat.pending += 1;
    if (overdue) stat.overdue += 1;
    nodeStats.set(nodeName, stat);

    if (overdue) {
      risks.push({
        taskId: row.taskId,
        taskNo: row.taskNo,
        nodeName,
        owner: row.owner,
        projectName: row.projectName,
        customerShortName: row.customerShortName,
        vehicleNo: row.vehicleNo,
        plannedHours,
        actualHours,
        startedAt: row.startedAt,
      });
    }

    const taskId = executiveText(row.taskId);
    if (!runningTasks.has(taskId)) {
      runningTasks.set(taskId, {
        taskId,
        taskNo: row.taskNo,
        projectName: row.projectName,
        customerShortName: row.customerShortName,
        route: `${executiveText(row.origin)} → ${executiveText(row.destination)}`,
        nodeName,
        owner: row.owner,
        vehicleNo: row.vehicleNo,
        vehicleType: row.vehicleType,
        progress: executiveNumber(row.progress),
        plannedHours,
        actualHours,
        overdue,
      });
    }
  }

  const dynamics = [...transitionRows.results, ...trackingRows.results]
    .map((row) => ({
      ...row,
      happenedAt: row.happenedAt,
      timeValue: executiveTimeMs(row.happenedAt),
    }))
    .sort((a, b) => executiveNumber(b.timeValue) - executiveNumber(a.timeValue))
    .slice(0, 80);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      activeProjects: executiveNumber(summaryRow?.activeProjects),
      activeTasks: executiveNumber(summaryRow?.activeTasks),
      pendingTodos: executiveNumber(summaryRow?.pendingTodos),
      overdueNodes: risks.length,
      todayDynamics: dynamics.length,
    },
    nodeStats: Array.from(nodeStats.values()).sort((a, b) => b.overdue - a.overdue || b.active - a.active),
    risks,
    dynamics,
    runningTasks: Array.from(runningTasks.values()),
  };
}

async function listRbacPermissions(env: Env) {
  await seedRbac(env);
  const rows = await env.DB.prepare(
    `
      SELECT id, code, name, module, action, description, sort_order as sortOrder, enabled, created_at as createdAt, updated_at as updatedAt
      FROM rbac_permissions
      ORDER BY sort_order ASC, module ASC, code ASC
    `,
  ).all<Record<string, unknown>>();
  return rows.results.map((row) => ({ ...row, enabled: Boolean(row.enabled) }));
}

async function listRbacRoles(env: Env) {
  await seedRbac(env);
  const roles = await env.DB.prepare(
    `
      SELECT id, code, name, description, enabled, created_at as createdAt, updated_at as updatedAt
      FROM rbac_roles
      ORDER BY enabled DESC, name ASC
    `,
  ).all<Record<string, unknown>>();
  const permissions = await env.DB.prepare(
    `
      SELECT rbac_role_permissions.role_id as roleId, rbac_permissions.code
      FROM rbac_role_permissions
      JOIN rbac_permissions ON rbac_permissions.id = rbac_role_permissions.permission_id
      ORDER BY rbac_permissions.sort_order ASC
    `,
  ).all<{ roleId: string; code: string }>();
  return roles.results.map((role) => ({
    ...role,
    enabled: Boolean(role.enabled),
    permissionCodes: permissions.results.filter((item) => item.roleId === role.id).map((item) => item.code),
  }));
}

async function saveRbacRole(env: Env, body: RbacRolePayload, roleId?: string) {
  const name = ensureString(body.name);
  if (!name) return { error: '角色名称不能为空。' };
  const code = ensureString(body.code) || name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_');
  const now = isoNow();
  const id = roleId || createId('role');
  if (roleId) {
    await env.DB.prepare('UPDATE rbac_roles SET code = ?, name = ?, description = ?, enabled = ?, updated_at = ? WHERE id = ?')
      .bind(code, name, ensureString(body.description), boolToInt(body.enabled, true), now, roleId)
      .run();
    await env.DB.prepare('DELETE FROM rbac_role_permissions WHERE role_id = ?').bind(roleId).run();
  } else {
    await env.DB.prepare('INSERT INTO rbac_roles (id, code, name, description, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, code, name, ensureString(body.description), boolToInt(body.enabled, true), now, now)
      .run();
  }
  const permissionCodes = uniqueStrings(body.permissionCodes);
  for (const permissionCode of permissionCodes) {
    const permission = await env.DB.prepare('SELECT id FROM rbac_permissions WHERE code = ?').bind(permissionCode).first<{ id: string }>();
    if (permission) {
      await env.DB.prepare('INSERT OR IGNORE INTO rbac_role_permissions (role_id, permission_id) VALUES (?, ?)').bind(id, permission.id).run();
    }
  }
  return { ok: true, id };
}

async function deleteRbacRole(env: Env, roleId: string) {
  const role = await env.DB.prepare('SELECT id, code, name FROM rbac_roles WHERE id = ?').bind(roleId).first<{ id: string; code: string; name: string }>();
  if (!role) return { error: '角色不存在。' };
  if (['admin', 'ADMIN'].includes(role.code)) return { error: '超级管理员角色不能删除。' };
  await env.DB.prepare('DELETE FROM rbac_role_permissions WHERE role_id = ?').bind(roleId).run();
  await env.DB.prepare('DELETE FROM employee_roles WHERE role_id = ?').bind(roleId).run();
  await env.DB.prepare('UPDATE workflow_template_nodes SET default_role_id = NULL, default_role_name = NULL WHERE default_role_id = ?').bind(roleId).run();
  await env.DB.prepare('UPDATE workflow_instance_nodes SET owner_role_id = NULL, owner_role_name = NULL WHERE owner_role_id = ?').bind(roleId).run();
  await env.DB.prepare('UPDATE workflow_todos SET owner_role_id = NULL, owner_role_name = NULL WHERE owner_role_id = ?').bind(roleId).run();
  await env.DB.prepare('DELETE FROM rbac_roles WHERE id = ?').bind(roleId).run();
  return { ok: true };
}

async function updateEmployeeRoles(env: Env, employeeId: string, body: EmployeeRolePayload) {
  const employee = await env.DB.prepare('SELECT id FROM employees WHERE id = ?').bind(employeeId).first<{ id: string }>();
  if (!employee) return { error: '员工不存在。' };
  await env.DB.prepare('DELETE FROM employee_roles WHERE employee_id = ?').bind(employeeId).run();
  for (const roleId of uniqueStrings(body.roleIds)) {
    await env.DB.prepare('INSERT OR IGNORE INTO employee_roles (employee_id, role_id) VALUES (?, ?)').bind(employeeId, roleId).run();
  }
  return { ok: true };
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

async function listEmployees(env: Env, salespeopleOnly = false) {
  await seedRbac(env);
  const rows = await env.DB.prepare(
    `
      SELECT
        id,
        name,
        phone,
        email,
        department,
        position,
        is_salesperson as isSalesperson,
        status,
        notes,
        feishu_open_id as feishuOpenId,
        feishu_user_id as feishuUserId,
        created_at as createdAt,
        updated_at as updatedAt
      FROM employees
      ${salespeopleOnly ? "WHERE is_salesperson = 1 AND status = 'ACTIVE'" : ''}
      ORDER BY status ASC, is_salesperson DESC, department ASC, name ASC
    `,
  ).all<Record<string, unknown>>();
  const roleRows = await env.DB.prepare(
    `
      SELECT employee_roles.employee_id as employeeId, rbac_roles.id, rbac_roles.name, rbac_roles.code
      FROM employee_roles
      JOIN rbac_roles ON rbac_roles.id = employee_roles.role_id
      ORDER BY rbac_roles.name ASC
    `,
  ).all<{ employeeId: string; id: string; name: string; code: string }>();

  return rows.results.map((row) => ({
    ...row,
    isSalesperson: Boolean(row.isSalesperson),
    roles: roleRows.results.filter((role) => role.employeeId === row.id).map((role) => ({ id: role.id, name: role.name, code: role.code })),
    roleIds: roleRows.results.filter((role) => role.employeeId === row.id).map((role) => role.id),
  }));
}

async function createEmployee(env: Env, body: EmployeePayload) {
  const name = ensureString(body.name);
  if (!name) {
    return { error: '员工姓名不能为空。' };
  }

  const id = createId('emp');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO employees (
        id, name, phone, email, department, position, is_salesperson, status, notes, feishu_open_id, feishu_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      name,
      ensureString(body.phone),
      ensureString(body.email),
      ensureString(body.department),
      ensureString(body.position),
      body.isSalesperson ? 1 : 0,
      ensureString(body.status) || 'ACTIVE',
      ensureString(body.notes),
      ensureString(body.feishuOpenId),
      ensureString(body.feishuUserId),
      now,
      now,
    )
    .run();

  await recordActivity(env, '新增员工', `新增基础信息员工 ${name}。`);
  return { id };
}

async function updateEmployee(env: Env, employeeId: string, body: EmployeePayload) {
  const existing = await env.DB.prepare('SELECT id FROM employees WHERE id = ?').bind(employeeId).first();
  if (!existing) {
    return { error: '员工不存在。' };
  }

  const name = ensureString(body.name);
  if (!name) {
    return { error: '员工姓名不能为空。' };
  }

  await env.DB.prepare(
    `
      UPDATE employees
      SET name = ?,
          phone = ?,
          email = ?,
          department = ?,
          position = ?,
          is_salesperson = ?,
          status = ?,
          notes = ?,
          feishu_open_id = ?,
          feishu_user_id = ?,
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      name,
      ensureString(body.phone),
      ensureString(body.email),
      ensureString(body.department),
      ensureString(body.position),
      body.isSalesperson ? 1 : 0,
      ensureString(body.status) || 'ACTIVE',
      ensureString(body.notes),
      ensureString(body.feishuOpenId),
      ensureString(body.feishuUserId),
      isoNow(),
      employeeId,
    )
    .run();

  await recordActivity(env, '更新员工', `更新基础信息员工 ${name}。`);
  return { ok: true };
}

async function resetEmployeePassword(env: Env, employeeId: string) {
  const employee = await env.DB.prepare(
    'SELECT id, name, email, is_salesperson as isSalesperson FROM employees WHERE id = ?',
  )
    .bind(employeeId)
    .first<{ id: string; name: string; email: string | null; isSalesperson: number }>();
  if (!employee) {
    return { error: '员工不存在。' };
  }
  const email = ensureString(employee.email).toLowerCase();
  if (!email) {
    return { error: '该员工没有邮箱，无法生成登录账号。' };
  }

  const passwordHash = await sha256('ost987456');
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>();
  if (existing) {
    await env.DB.prepare(
      'UPDATE users SET password_hash = ?, real_name = ?, role_code = COALESCE(NULLIF(role_code, \'\'), ?), role_name = COALESCE(NULLIF(role_name, \'\'), ?) WHERE id = ?',
    )
      .bind(passwordHash, employee.name, employee.isSalesperson ? 'SALES' : 'USER', employee.isSalesperson ? '业务员' : '员工', existing.id)
      .run();
  } else {
    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, real_name, role_code, role_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(
        createId('usr'),
        email,
        passwordHash,
        employee.name,
        employee.isSalesperson ? 'SALES' : 'USER',
        employee.isSalesperson ? '业务员' : '员工',
        isoNow(),
      )
      .run();
  }
  await recordActivity(env, '重置员工密码', `员工 ${employee.name} 的登录密码已重置。`);
  return { ok: true, defaultPassword: 'ost987456' };
}

async function listVehicleTypes(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        id,
        sequence_no as sequenceNo,
        category,
        name,
        line_count as lineCount,
        axle_count as axleCount,
        effective_length as effectiveLength,
        effective_width as effectiveWidth,
        effective_height as effectiveHeight,
        effective_volume as effectiveVolume,
        payload_weight as payloadWeight,
        tare_weight as tareWeight,
        is_closed as isClosed,
        price_sort as priceSort,
        COALESCE(price_weight, price_sort) as priceWeight,
        scenario,
        photo_files as photoFiles,
        created_at as createdAt,
        updated_at as updatedAt
      FROM vehicle_types
      ORDER BY sequence_no ASC, category ASC, name ASC
    `,
  ).all();

  return rows.results;
}

async function createVehicleType(env: Env, body: VehicleTypePayload) {
  const category = ensureString(body.category);
  const name = ensureString(body.name);
  if (!category || !name) {
    return { error: '车型分类和车型名称不能为空。' };
  }

  const id = createId('vtype');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO vehicle_types (
        id, sequence_no, category, name, line_count, axle_count, effective_length,
        effective_width, effective_height, effective_volume, payload_weight, tare_weight, is_closed, price_sort, price_weight,
        scenario, photo_files, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      toInteger(body.sequenceNo) ?? 0,
      category,
      name,
      toInteger(body.lineCount),
      toInteger(body.axleCount),
      toNumber(body.effectiveLength),
      toNumber(body.effectiveWidth),
      toNumber(body.effectiveHeight),
      toNumber(body.effectiveVolume),
      toNumber(body.payloadWeight),
      toNumber(body.tareWeight),
      toBooleanInt(body.isClosed),
      toInteger(body.priceSort ?? body.priceWeight),
      toInteger(body.priceWeight ?? body.priceSort),
      ensureString(body.scenario),
      normalizeFiles(body.photoFiles),
      now,
      now,
    )
    .run();

  await recordActivity(env, '新增车型', `新增车型 ${name}。`);
  return { id };
}

async function updateVehicleType(env: Env, vehicleTypeId: string, body: VehicleTypePayload) {
  const existing = await env.DB.prepare('SELECT id FROM vehicle_types WHERE id = ?').bind(vehicleTypeId).first();
  if (!existing) {
    return { error: '车型不存在。' };
  }

  const category = ensureString(body.category);
  const name = ensureString(body.name);
  if (!category || !name) {
    return { error: '车型分类和车型名称不能为空。' };
  }

  await env.DB.prepare(
    `
      UPDATE vehicle_types
      SET sequence_no = ?,
          category = ?,
          name = ?,
          line_count = ?,
          axle_count = ?,
          effective_length = ?,
          effective_width = ?,
          effective_height = ?,
          effective_volume = ?,
          payload_weight = ?,
          tare_weight = ?,
          is_closed = ?,
          price_sort = ?,
          price_weight = ?,
          scenario = ?,
          photo_files = ?,
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      toInteger(body.sequenceNo) ?? 0,
      category,
      name,
      toInteger(body.lineCount),
      toInteger(body.axleCount),
      toNumber(body.effectiveLength),
      toNumber(body.effectiveWidth),
      toNumber(body.effectiveHeight),
      toNumber(body.effectiveVolume),
      toNumber(body.payloadWeight),
      toNumber(body.tareWeight),
      toBooleanInt(body.isClosed),
      toInteger(body.priceSort ?? body.priceWeight),
      toInteger(body.priceWeight ?? body.priceSort),
      ensureString(body.scenario),
      normalizeFiles(body.photoFiles),
      isoNow(),
      vehicleTypeId,
    )
    .run();

  await recordActivity(env, '更新车型', `更新车型 ${name}。`);
  return { ok: true };
}

async function listVehicleTypeQuotes(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        id,
        quote_batch as quoteBatch,
        quote_date as quoteDate,
        origin_country as originCountry,
        origin_city as originCity,
        destination_country as destinationCountry,
        destination_city as destinationCity,
        vehicle_type_id as vehicleTypeId,
        vehicle_type_name as vehicleTypeName,
        price,
        currency,
        remark,
        created_at as createdAt,
        updated_at as updatedAt
      FROM vehicle_type_quotes
      ORDER BY quote_date DESC, updated_at DESC, destination_country ASC, destination_city ASC, vehicle_type_name ASC
    `,
  ).all();

  return (rows.results ?? []).map((row) => ({
    ...row,
    photoFiles: jsonArray((row as Record<string, unknown>).photoFiles as string | null, []),
  }));
}

async function resolveVehicleTypeName(env: Env, body: VehicleTypeQuotePayload) {
  const explicitName = ensureString(body.vehicleTypeName);
  const vehicleTypeId = ensureString(body.vehicleTypeId);
  if (!vehicleTypeId) {
    return { vehicleTypeId: null, vehicleTypeName: explicitName };
  }
  const vehicle = await env.DB.prepare('SELECT id, category, name FROM vehicle_types WHERE id = ?').bind(vehicleTypeId).first();
  if (!vehicle) {
    return { vehicleTypeId: null, vehicleTypeName: explicitName };
  }
  const category = ensureString(vehicle.category);
  const name = ensureString(vehicle.name);
  return {
    vehicleTypeId,
    vehicleTypeName: explicitName || (category ? `${category} / ${name}` : name),
  };
}

async function createVehicleTypeQuote(env: Env, body: VehicleTypeQuotePayload) {
  const quoteDate = ensureString(body.quoteDate) || isoNow().slice(0, 10);
  const quoteBatch = ensureString(body.quoteBatch) || quoteDate;
  const originCountry = ensureString(body.originCountry) || '中国';
  const originCity = ensureString(body.originCity) || '霍尔果斯';
  const destinationCountry = ensureString(body.destinationCountry);
  const destinationCity = ensureString(body.destinationCity);
  const price = toNumber(body.price);
  const currency = ensureString(body.currency) || 'USD';
  const vehicle = await resolveVehicleTypeName(env, body);

  if (!destinationCountry || !destinationCity) {
    return { error: '终点国家和终点城市不能为空。' };
  }
  if (!vehicle.vehicleTypeName) {
    return { error: '车型不能为空。' };
  }
  if (price === null || price < 0) {
    return { error: '价格必须为有效数字。' };
  }

  const id = createId('vquote');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO vehicle_type_quotes (
        id, quote_batch, quote_date, origin_country, origin_city, destination_country, destination_city,
        vehicle_type_id, vehicle_type_name, price, currency, remark, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      quoteBatch,
      quoteDate,
      originCountry,
      originCity,
      destinationCountry,
      destinationCity,
      vehicle.vehicleTypeId,
      vehicle.vehicleTypeName,
      price,
      currency,
      ensureString(body.remark),
      now,
      now,
    )
    .run();

  await recordActivity(env, '新增车型报价', `${originCity} 到 ${destinationCity} ${vehicle.vehicleTypeName} ${price} ${currency}。`);
  return { id };
}

async function updateVehicleTypeQuote(env: Env, quoteId: string, body: VehicleTypeQuotePayload) {
  const existing = await env.DB.prepare('SELECT id FROM vehicle_type_quotes WHERE id = ?').bind(quoteId).first();
  if (!existing) {
    return { error: '车型报价不存在。' };
  }

  const quoteDate = ensureString(body.quoteDate) || isoNow().slice(0, 10);
  const quoteBatch = ensureString(body.quoteBatch) || quoteDate;
  const originCountry = ensureString(body.originCountry) || '中国';
  const originCity = ensureString(body.originCity) || '霍尔果斯';
  const destinationCountry = ensureString(body.destinationCountry);
  const destinationCity = ensureString(body.destinationCity);
  const price = toNumber(body.price);
  const currency = ensureString(body.currency) || 'USD';
  const vehicle = await resolveVehicleTypeName(env, body);

  if (!destinationCountry || !destinationCity) {
    return { error: '终点国家和终点城市不能为空。' };
  }
  if (!vehicle.vehicleTypeName) {
    return { error: '车型不能为空。' };
  }
  if (price === null || price < 0) {
    return { error: '价格必须为有效数字。' };
  }

  await env.DB.prepare(
    `
      UPDATE vehicle_type_quotes
      SET quote_batch = ?,
          quote_date = ?,
          origin_country = ?,
          origin_city = ?,
          destination_country = ?,
          destination_city = ?,
          vehicle_type_id = ?,
          vehicle_type_name = ?,
          price = ?,
          currency = ?,
          remark = ?,
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      quoteBatch,
      quoteDate,
      originCountry,
      originCity,
      destinationCountry,
      destinationCity,
      vehicle.vehicleTypeId,
      vehicle.vehicleTypeName,
      price,
      currency,
      ensureString(body.remark),
      isoNow(),
      quoteId,
    )
    .run();

  await recordActivity(env, '更新车型报价', `${originCity} 到 ${destinationCity} ${vehicle.vehicleTypeName} ${price} ${currency}。`);
  return { ok: true };
}

async function deleteVehicleTypeQuote(env: Env, quoteId: string) {
  const existing = await env.DB.prepare('SELECT id FROM vehicle_type_quotes WHERE id = ?').bind(quoteId).first();
  if (!existing) {
    return { error: '车型报价不存在。' };
  }
  await env.DB.prepare('DELETE FROM vehicle_type_quotes WHERE id = ?').bind(quoteId).run();
  await recordActivity(env, '删除车型报价', `删除车型报价 ${quoteId}。`);
  return { ok: true };
}

function normalizeExchangeRate(row: Record<string, unknown>) {
  return {
    id: row.id,
    currencyCode: row.currencyCode,
    currencyName: row.currencyName,
    rateToCny: Number(row.rateToCny ?? 1),
    source: row.source,
    syncedAt: row.syncedAt,
    enabled: Boolean(row.enabled),
    remark: row.remark,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function listExchangeRates(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        id,
        currency_code as currencyCode,
        currency_name as currencyName,
        rate_to_cny as rateToCny,
        source,
        synced_at as syncedAt,
        enabled,
        remark,
        created_at as createdAt,
        updated_at as updatedAt
      FROM exchange_rates
      ORDER BY CASE currency_code
        WHEN 'CNY' THEN 0
        WHEN 'USD' THEN 1
        WHEN 'KZT' THEN 2
        WHEN 'RUB' THEN 3
        ELSE 99
      END, currency_code ASC
    `,
  ).all();

  return (rows.results ?? []).map((row) => normalizeExchangeRate(row as Record<string, unknown>));
}

async function saveExchangeRate(env: Env, body: ExchangeRatePayload, rateId?: string) {
  const currencyCode = ensureString(body.currencyCode).toUpperCase();
  const currencyName = ensureString(body.currencyName);
  const rateToCny = toNumber(body.rateToCny);
  if (!currencyCode) return { error: '币种不能为空。' };
  if (rateToCny === null || rateToCny <= 0) return { error: '兑CNY汇率必须为正数。' };

  const now = isoNow();
  const syncedAt = ensureString(body.syncedAt) || now;
  if (rateId) {
    const existing = await env.DB.prepare('SELECT id FROM exchange_rates WHERE id = ?').bind(rateId).first();
    if (!existing) return { error: '汇率不存在。' };

    await env.DB.prepare(
      `
        UPDATE exchange_rates
        SET currency_code = ?,
            currency_name = ?,
            rate_to_cny = ?,
            source = ?,
            synced_at = ?,
            enabled = ?,
            remark = ?,
            updated_at = ?
        WHERE id = ?
      `,
    )
      .bind(
        currencyCode,
        currencyName,
        rateToCny,
        ensureString(body.source),
        syncedAt,
        toBooleanInt(body.enabled ?? true),
        ensureString(body.remark),
        now,
        rateId,
      )
      .run();

    await recordActivity(env, '更新汇率', `${currencyCode} = ${rateToCny} CNY。`);
    return { ok: true };
  }

  const id = createId('exr');
  await env.DB.prepare(
    `
      INSERT INTO exchange_rates (
        id, currency_code, currency_name, rate_to_cny, source, synced_at, enabled, remark, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(currency_code) DO UPDATE SET
        currency_name = excluded.currency_name,
        rate_to_cny = excluded.rate_to_cny,
        source = excluded.source,
        synced_at = excluded.synced_at,
        enabled = excluded.enabled,
        remark = excluded.remark,
        updated_at = excluded.updated_at
    `,
  )
    .bind(
      id,
      currencyCode,
      currencyName,
      rateToCny,
      ensureString(body.source),
      syncedAt,
      toBooleanInt(body.enabled ?? true),
      ensureString(body.remark),
      now,
      now,
    )
    .run();

  await recordActivity(env, '新增汇率', `${currencyCode} = ${rateToCny} CNY。`);
  return { id };
}

async function deleteExchangeRate(env: Env, rateId: string) {
  const existing = await env.DB.prepare('SELECT id, currency_code as currencyCode FROM exchange_rates WHERE id = ?')
    .bind(rateId)
    .first();
  if (!existing) return { error: '汇率不存在。' };

  await env.DB.prepare('UPDATE exchange_rates SET enabled = 0, updated_at = ? WHERE id = ?').bind(isoNow(), rateId).run();
  await recordActivity(env, '停用汇率', `停用汇率 ${ensureString(existing.currencyCode)}。`);
  return { ok: true };
}

async function syncExchangeRates(env: Env) {
  try {
    const existingRates = await listExchangeRates(env);
    const targetCodes = Array.from(
      new Set([...existingRates.map((row) => ensureString(row.currencyCode).toUpperCase()), 'CNY', 'USD', 'KZT', 'RUB']),
    );
    const response = await fetch('https://open.er-api.com/v6/latest/CNY', {
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return { error: `汇率同步失败：${response.status}` };

    const data = (await response.json()) as { result?: string; rates?: Record<string, number> };
    if (data.result !== 'success' || !data.rates) return { error: '汇率同步失败：汇率源返回异常。' };

    const now = isoNow();
    for (const code of targetCodes) {
      const sourceRate = code === 'CNY' ? 1 : data.rates[code];
      const rateToCny = code === 'CNY' ? 1 : sourceRate ? 1 / sourceRate : null;
      if (!rateToCny || !Number.isFinite(rateToCny)) continue;

      await env.DB.prepare(
        `
          INSERT INTO exchange_rates (
            id, currency_code, currency_name, rate_to_cny, source, synced_at, enabled, remark, created_at, updated_at
          ) VALUES (?, ?, COALESCE((SELECT currency_name FROM exchange_rates WHERE currency_code = ?), ?), ?, 'open.er-api.com', ?, 1, COALESCE((SELECT remark FROM exchange_rates WHERE currency_code = ?), ''), ?, ?)
          ON CONFLICT(currency_code) DO UPDATE SET
            rate_to_cny = excluded.rate_to_cny,
            source = excluded.source,
            synced_at = excluded.synced_at,
            enabled = 1,
            updated_at = excluded.updated_at
        `,
      )
        .bind(createId('exr'), code, code, code, rateToCny, now, code, now, now)
        .run();
    }

    await recordActivity(env, '同步汇率', '同步互联网最新汇率。');
    return { items: await listExchangeRates(env) };
  } catch (error) {
    return { error: `汇率同步失败：${(error as Error).message}` };
  }
}

function normalizeLoadingRule(row: Record<string, unknown>) {
  return {
    id: row.id,
    ruleCode: row.ruleCode,
    ruleName: row.ruleName,
    category: row.category,
    valueType: row.valueType,
    ruleValue: row.ruleValue,
    unit: row.unit,
    enabled: Boolean(row.enabled),
    description: row.description,
    sortOrder: Number(row.sortOrder ?? 0),
    applicableCountries: jsonArray<string>(ensureString(row.applicableCountries)),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function listLoadingRules(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        id,
        rule_code as ruleCode,
        rule_name as ruleName,
        category,
        value_type as valueType,
        rule_value as ruleValue,
        unit,
        enabled,
        description,
        sort_order as sortOrder,
        applicable_countries as applicableCountries,
        created_at as createdAt,
        updated_at as updatedAt
      FROM loading_rules
      ORDER BY sort_order ASC, rule_name ASC
    `,
  ).all<Record<string, unknown>>();
  return rows.results.map(normalizeLoadingRule);
}

async function saveLoadingRule(env: Env, body: LoadingRulePayload, loadingRuleId?: string) {
  const ruleCode = ensureString(body.ruleCode);
  const ruleName = ensureString(body.ruleName);
  if (!ruleCode || !ruleName) {
    return { error: '规则编码和规则名称不能为空。' };
  }

  const now = isoNow();
  const id = loadingRuleId || createId('lrule');
  const values = [
    ruleCode,
    ruleName,
    ensureString(body.category) || '通用规则',
    ensureString(body.valueType) || 'number',
    ensureString(body.ruleValue),
    ensureString(body.unit),
    boolToInt(body.enabled, true),
    ensureString(body.description),
    toInteger(body.sortOrder) ?? 0,
    JSON.stringify(uniqueStrings(body.applicableCountries)),
    now,
  ];

  if (loadingRuleId) {
    const existing = await env.DB.prepare('SELECT id FROM loading_rules WHERE id = ?').bind(loadingRuleId).first();
    if (!existing) return { error: '配载规则不存在。' };
    await env.DB.prepare(
      `
        UPDATE loading_rules
        SET rule_code = ?, rule_name = ?, category = ?, value_type = ?, rule_value = ?,
            unit = ?, enabled = ?, description = ?, sort_order = ?, applicable_countries = ?, updated_at = ?
        WHERE id = ?
      `,
    )
      .bind(...values, loadingRuleId)
      .run();
    await recordActivity(env, '更新配载规则', `更新配载规则 ${ruleName}。`);
  } else {
    await env.DB.prepare(
      `
        INSERT INTO loading_rules (
          id, rule_code, rule_name, category, value_type, rule_value, unit, enabled,
          description, sort_order, applicable_countries, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(id, ...values, now)
      .run();
    await recordActivity(env, '新增配载规则', `新增配载规则 ${ruleName}。`);
  }
  return { id, ok: true };
}

async function deleteLoadingRule(env: Env, loadingRuleId: string) {
  const existing = await env.DB.prepare('SELECT rule_name as ruleName FROM loading_rules WHERE id = ?')
    .bind(loadingRuleId)
    .first<{ ruleName: string }>();
  if (!existing) return { error: '配载规则不存在。' };
  await env.DB.prepare('DELETE FROM loading_rules WHERE id = ?').bind(loadingRuleId).run();
  await recordActivity(env, '删除配载规则', `删除配载规则 ${existing.ruleName}。`);
  return { ok: true };
}

function normalizeWorkingPeriod(row: Record<string, unknown>) {
  return {
    id: row.id,
    ruleId: row.ruleId,
    weekday: Number(row.weekday ?? 0),
    startTime: row.startTime,
    endTime: row.endTime,
  };
}

function normalizeWorkingTimeRule(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    location: row.location,
    nodeName: row.nodeName,
    timezone: row.timezone || 'Asia/Shanghai',
    enabled: Boolean(row.enabled),
    remark: row.remark,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    periods: [] as Array<ReturnType<typeof normalizeWorkingPeriod>>,
  };
}

function normalizeWorkingCalendarDay(row: Record<string, unknown>) {
  return {
    id: row.id,
    country: row.country,
    location: row.location,
    date: row.date,
    dayType: row.dayType,
    name: row.name,
    allDay: Boolean(row.allDay),
    periods: jsonArray<{ startTime: string; endTime: string }>(ensureString(row.periodsJson), []),
    enabled: Boolean(row.enabled),
    remark: row.remark,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function listWorkingTimeRules(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT id, name, country, location, node_name as nodeName, timezone, enabled, remark,
             created_at as createdAt, updated_at as updatedAt
      FROM working_time_rules
      ORDER BY enabled DESC, country ASC, node_name ASC, name ASC
    `,
  ).all<Record<string, unknown>>();
  const periods = await env.DB.prepare(
    `
      SELECT id, rule_id as ruleId, weekday, start_time as startTime, end_time as endTime
      FROM working_time_periods
      ORDER BY weekday ASC, start_time ASC
    `,
  ).all<Record<string, unknown>>();
  const mapped = rows.results.map(normalizeWorkingTimeRule);
  for (const rule of mapped) {
    rule.periods = periods.results.filter((period) => String(period.ruleId) === String(rule.id)).map(normalizeWorkingPeriod);
  }
  return mapped;
}

async function saveWorkingTimeRule(env: Env, body: WorkingTimeRulePayload, ruleId?: string) {
  const name = ensureString(body.name);
  if (!name) return { error: '规则名称不能为空。' };
  const now = isoNow();
  const id = ruleId || createId('wtr');
  const periods = (body.periods ?? [])
    .map((period) => ({
      weekday: toInteger(period.weekday),
      startTime: ensureString(period.startTime),
      endTime: ensureString(period.endTime),
    }))
    .filter((period) => period.weekday && period.weekday >= 1 && period.weekday <= 7 && period.startTime && period.endTime);
  if (!periods.length) return { error: '至少需要配置一个工作时段。' };

  if (ruleId) {
    const existing = await env.DB.prepare('SELECT id FROM working_time_rules WHERE id = ?').bind(ruleId).first();
    if (!existing) return { error: '工作时间规则不存在。' };
    await env.DB.prepare(
      `
        UPDATE working_time_rules
        SET name = ?, country = ?, location = ?, node_name = ?, timezone = ?, enabled = ?, remark = ?, updated_at = ?
        WHERE id = ?
      `,
    )
      .bind(name, ensureString(body.country), ensureString(body.location), ensureString(body.nodeName), ensureString(body.timezone) || 'Asia/Shanghai', boolToInt(body.enabled, true), ensureString(body.remark), now, ruleId)
      .run();
    await env.DB.prepare('DELETE FROM working_time_periods WHERE rule_id = ?').bind(ruleId).run();
  } else {
    await env.DB.prepare(
      `
        INSERT INTO working_time_rules (id, name, country, location, node_name, timezone, enabled, remark, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(id, name, ensureString(body.country), ensureString(body.location), ensureString(body.nodeName), ensureString(body.timezone) || 'Asia/Shanghai', boolToInt(body.enabled, true), ensureString(body.remark), now, now)
      .run();
  }

  for (const period of periods) {
    await env.DB.prepare(
      `
        INSERT INTO working_time_periods (id, rule_id, weekday, start_time, end_time, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(createId('wtp'), id, period.weekday, period.startTime, period.endTime, now, now)
      .run();
  }
  await recordActivity(env, ruleId ? '更新节点工作时间' : '新增节点工作时间', `${ruleId ? '更新' : '新增'}节点工作时间规则 ${name}。`);
  return { id, ok: true };
}

async function deleteWorkingTimeRule(env: Env, ruleId: string) {
  const used = await env.DB.prepare('SELECT id FROM workflow_template_nodes WHERE working_time_rule_id = ? LIMIT 1').bind(ruleId).first();
  if (used) return { error: '该规则已被流程节点引用，不能删除，可改为停用。' };
  await env.DB.prepare('DELETE FROM working_time_rules WHERE id = ?').bind(ruleId).run();
  await env.DB.prepare('DELETE FROM working_time_periods WHERE rule_id = ?').bind(ruleId).run();
  return { ok: true };
}

async function listWorkingCalendarDays(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT id, country, location, date, day_type as dayType, name, all_day as allDay,
             periods_json as periodsJson, enabled, remark, created_at as createdAt, updated_at as updatedAt
      FROM working_calendar_days
      ORDER BY date DESC, country ASC, location ASC
    `,
  ).all<Record<string, unknown>>();
  return rows.results.map(normalizeWorkingCalendarDay);
}

async function saveWorkingCalendarDay(env: Env, body: WorkingCalendarDayPayload, dayId?: string) {
  const date = ensureString(body.date);
  if (!date) return { error: '日期不能为空。' };
  const now = isoNow();
  const id = dayId || createId('wcd');
  const periods = (body.periods ?? [])
    .map((period) => ({ startTime: ensureString(period.startTime), endTime: ensureString(period.endTime) }))
    .filter((period) => period.startTime && period.endTime);
  const values = [
    ensureString(body.country),
    ensureString(body.location),
    date,
    ensureString(body.dayType) || '节假日',
    ensureString(body.name),
    boolToInt(body.allDay, true),
    JSON.stringify(periods),
    boolToInt(body.enabled, true),
    ensureString(body.remark),
    now,
  ];
  if (dayId) {
    const existing = await env.DB.prepare('SELECT id FROM working_calendar_days WHERE id = ?').bind(dayId).first();
    if (!existing) return { error: '节假日记录不存在。' };
    await env.DB.prepare(
      `
        UPDATE working_calendar_days
        SET country = ?, location = ?, date = ?, day_type = ?, name = ?, all_day = ?, periods_json = ?,
            enabled = ?, remark = ?, updated_at = ?
        WHERE id = ?
      `,
    )
      .bind(...values, dayId)
      .run();
  } else {
    await env.DB.prepare(
      `
        INSERT INTO working_calendar_days (
          id, country, location, date, day_type, name, all_day, periods_json, enabled, remark, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(id, ...values, now)
      .run();
  }
  return { id, ok: true };
}

async function deleteWorkingCalendarDay(env: Env, dayId: string) {
  await env.DB.prepare('DELETE FROM working_calendar_days WHERE id = ?').bind(dayId).run();
  return { ok: true };
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

function toBooleanInt(value: unknown) {
  if (value === true || value === 1 || value === '1' || value === 'true' || value === '是') {
    return 1;
  }
  return 0;
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

const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

function beijingParts(date: Date) {
  const shifted = new Date(date.getTime() + BEIJING_OFFSET_MS);
  const dateKey = shifted.toISOString().slice(0, 10);
  const minutes = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
  const weekday = shifted.getUTCDay() === 0 ? 7 : shifted.getUTCDay();
  return { dateKey, minutes, weekday };
}

function fromBeijingDateMinutes(dateKey: string, minutes: number) {
  const [year, month, day] = dateKey.split('-').map((item) => Number(item));
  return new Date(Date.UTC(year, month - 1, day, 0, minutes, 0, 0) - BEIJING_OFFSET_MS);
}

function nextBeijingDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map((item) => Number(item));
  return new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0) - BEIJING_OFFSET_MS);
}

function parseTimeToMinutes(value: unknown) {
  const text = ensureString(value);
  const match = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

async function calculatePlannedWindow(
  env: Env,
  start: Date,
  durationHours: number | null,
  workingTimeRuleId?: unknown,
): Promise<{ start: Date; end: Date; workingTimeApplied: boolean }> {
  if (!durationHours || durationHours <= 0) return { start, end: start, workingTimeApplied: false };
  const ruleId = ensureString(workingTimeRuleId);
  if (!ruleId) return { start, end: new Date(start.getTime() + durationHours * 60 * 60 * 1000), workingTimeApplied: false };

  const rule = await env.DB.prepare(
    'SELECT id, country, location, enabled FROM working_time_rules WHERE id = ? LIMIT 1',
  )
    .bind(ruleId)
    .first<{ id: string; country?: string | null; location?: string | null; enabled?: number }>();
  if (!rule || !rule.enabled) return { start, end: new Date(start.getTime() + durationHours * 60 * 60 * 1000), workingTimeApplied: false };

  const periodsRows = await env.DB.prepare(
    'SELECT weekday, start_time as startTime, end_time as endTime FROM working_time_periods WHERE rule_id = ? ORDER BY weekday ASC, start_time ASC',
  )
    .bind(ruleId)
    .all<Record<string, unknown>>();
  const periodMap = new Map<number, Array<{ start: number; end: number }>>();
  for (const period of periodsRows.results) {
    const weekday = toInteger(period.weekday);
    const startMinutes = parseTimeToMinutes(period.startTime);
    const endMinutes = parseTimeToMinutes(period.endTime);
    if (!weekday || startMinutes === null || endMinutes === null || endMinutes <= startMinutes) continue;
    const list = periodMap.get(weekday) ?? [];
    list.push({ start: startMinutes, end: endMinutes });
    periodMap.set(weekday, list);
  }
  if (!periodMap.size) return { start, end: new Date(start.getTime() + durationHours * 60 * 60 * 1000), workingTimeApplied: false };

  const startKey = beijingParts(start).dateKey;
  const maxKey = beijingParts(new Date(start.getTime() + 180 * 24 * 60 * 60 * 1000)).dateKey;
  const holidays = await env.DB.prepare(
    `
      SELECT date, day_type as dayType, all_day as allDay, periods_json as periodsJson
      FROM working_calendar_days
      WHERE enabled = 1
        AND date >= ?
        AND date <= ?
        AND (country = '' OR country IS NULL OR country = ?)
        AND (location = '' OR location IS NULL OR location = ?)
    `,
  )
    .bind(startKey, maxKey, ensureString(rule.country), ensureString(rule.location))
    .all<Record<string, unknown>>();
  const holidayMap = new Map<string, Record<string, unknown>>();
  for (const day of holidays.results) {
    holidayMap.set(ensureString(day.date), day);
  }

  let remaining = Math.ceil(durationHours * 60);
  let cursor = start;
  let plannedStart: Date | null = null;
  for (let guard = 0; guard < 400; guard += 1) {
    const { dateKey, minutes, weekday } = beijingParts(cursor);
    const calendarDay = holidayMap.get(dateKey);
    let dayPeriods = periodMap.get(weekday) ?? [];
    if (calendarDay) {
      const overridePeriods = jsonArray<{ startTime?: string; endTime?: string }>(ensureString(calendarDay.periodsJson), [])
        .map((period) => ({ start: parseTimeToMinutes(period.startTime), end: parseTimeToMinutes(period.endTime) }))
        .filter((period): period is { start: number; end: number } => period.start !== null && period.end !== null && period.end > period.start);
      const dayType = ensureString(calendarDay.dayType);
      if (overridePeriods.length) {
        dayPeriods = overridePeriods;
      } else if (Boolean(calendarDay.allDay) && ['节假日', '调休日', '临时休息'].includes(dayType)) {
        dayPeriods = [];
      }
    }

    for (const period of dayPeriods) {
      const effectiveStart = Math.max(period.start, minutes);
      if (effectiveStart >= period.end) continue;
      if (!plannedStart) plannedStart = fromBeijingDateMinutes(dateKey, effectiveStart);
      const available = period.end - effectiveStart;
      if (remaining <= available) {
        return { start: plannedStart, end: fromBeijingDateMinutes(dateKey, effectiveStart + remaining), workingTimeApplied: true };
      }
      remaining -= available;
    }
    cursor = nextBeijingDate(dateKey);
  }
  return { start, end: new Date(start.getTime() + durationHours * 60 * 60 * 1000), workingTimeApplied: false };
}

async function calculatePlannedEndAt(env: Env, start: Date, durationHours: number | null, workingTimeRuleId?: unknown) {
  const plannedWindow = await calculatePlannedWindow(env, start, durationHours, workingTimeRuleId);
  return plannedWindow.end;
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
    salesperson: row.salesperson,
    serviceItems: jsonArray<string>(row.serviceItems as string | null),
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
    quoteAmount: row.quoteAmount,
    quoteCurrency: row.quoteCurrency,
    quoteRemark: row.quoteRemark,
    quoteFiles: jsonArray(row.quoteFiles as string | null),
    solutionFiles: jsonArray(row.solutionFiles as string | null),
    quotedAt: row.quotedAt,
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
        transport_inquiries.salesperson as salesperson,
        transport_inquiries.service_items as serviceItems,
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
        transport_inquiries.quote_amount as quoteAmount,
        transport_inquiries.quote_currency as quoteCurrency,
        transport_inquiries.quote_remark as quoteRemark,
        transport_inquiries.quote_files as quoteFiles,
        transport_inquiries.solution_files as solutionFiles,
        transport_inquiries.quoted_at as quotedAt,
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
  const serviceItems = uniqueStrings(body.serviceItems);
  if (!customerName || !cargoName || !origin || !destination) {
    return { error: '客户、货物、起运地和目的地不能为空。' };
  }
  if (serviceItems.length === 0) {
    return { error: '服务项目至少选择一项。' };
  }

  const id = createId('tinq');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO transport_inquiries (
        id, inquiry_no, customer_id, customer_name, salesperson, service_items, contact_name, contact_phone, cargo_name, cargo_type,
        origin, destination, weight_kg, volume_cbm, package_count, ready_date, target_arrival_date,
        customs_mode, temperature_requirement, special_requirement, cargo_files, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      businessNo('INQ'),
      customerId || null,
      customerName,
      ensureString(body.salesperson),
      JSON.stringify(serviceItems),
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

async function updateTransportInquiry(env: Env, inquiryId: string, body: TransportInquiryPayload) {
  const existing = await getTransportInquiry(env, inquiryId);
  if (!existing) {
    return { error: '询单不存在。' };
  }

  const customerId = ensureString(body.customerId);
  let customerName = ensureString(body.customerName);
  if (customerId && !customerName) {
    const customer = await env.DB.prepare('SELECT name FROM customers WHERE id = ?').bind(customerId).first<{ name: string }>();
    customerName = customer?.name ?? '';
  }

  const cargoName = ensureString(body.cargoName);
  const origin = ensureString(body.origin);
  const destination = ensureString(body.destination);
  const serviceItems = uniqueStrings(body.serviceItems);
  if (!customerName || !cargoName || !origin || !destination) {
    return { error: '客户、货物、起运地和目的地不能为空。' };
  }
  if (serviceItems.length === 0) {
    return { error: '服务项目至少选择一项。' };
  }

  await env.DB.prepare(
    `
      UPDATE transport_inquiries
      SET customer_id = ?,
          customer_name = ?,
          salesperson = ?,
          service_items = ?,
          contact_name = ?,
          contact_phone = ?,
          cargo_name = ?,
          cargo_type = ?,
          origin = ?,
          destination = ?,
          weight_kg = ?,
          volume_cbm = ?,
          package_count = ?,
          ready_date = ?,
          target_arrival_date = ?,
          customs_mode = ?,
          temperature_requirement = ?,
          special_requirement = ?,
          cargo_files = ?,
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      customerId || null,
      customerName,
      ensureString(body.salesperson),
      JSON.stringify(serviceItems),
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
      JSON.stringify(body.cargoFiles ?? existing.cargoFiles ?? []),
      isoNow(),
      inquiryId,
    )
    .run();

  await recordActivity(env, '更新运输询单', `${customerName}：${origin} -> ${destination}，货物：${cargoName}`);
  return { ok: true };
}

async function deleteTransportInquiry(env: Env, inquiryId: string) {
  const existing = await getTransportInquiry(env, inquiryId);
  if (!existing) {
    return { error: '询单不存在。' };
  }

  await env.DB.prepare('DELETE FROM transport_plans WHERE inquiry_id = ?').bind(inquiryId).run();
  await env.DB.prepare('DELETE FROM transport_inquiries WHERE id = ?').bind(inquiryId).run();
  await recordActivity(env, '删除运输询单', `删除询单 ${existing.inquiryNo}。`);
  return { ok: true };
}

async function quoteTransportInquiry(env: Env, inquiryId: string, body: QuoteTransportInquiryPayload) {
  const existing = await getTransportInquiry(env, inquiryId);
  if (!existing) {
    return { error: '询单不存在。' };
  }

  const now = isoNow();
  await env.DB.prepare(
    `
      UPDATE transport_inquiries
      SET quote_amount = ?,
          quote_currency = ?,
          quote_remark = ?,
          quote_files = ?,
          solution_files = ?,
          quoted_at = ?,
          status = ?,
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      toNumber(body.quoteAmount),
      ensureString(body.quoteCurrency) || 'USD',
      ensureString(body.quoteRemark),
      JSON.stringify(body.quoteFiles ?? []),
      JSON.stringify(body.solutionFiles ?? []),
      now,
      'QUOTED',
      now,
      inquiryId,
    )
    .run();

  await recordActivity(env, '完成报价', `询单 ${existing.inquiryNo} 已完成报价。`);
  return { ok: true };
}

type InquiryTaskDbRow = Record<string, unknown>;

function currentUserName(user: SessionUser) {
  return user.realName || user.email || user.id;
}

function inquiryTaskUserTokens(user: SessionUser) {
  return [user.roleCode, user.roleName, user.realName, user.email, ...(user.roles ?? []), ...(user.permissions ?? [])]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
}

function canManageInquiryTasks(user: SessionUser) {
  if (isAdminUser(user)) {
    return true;
  }
  const managerTokens = ['admin', 'manager', 'fleet', 'quote', 'quotation', '报价', '车队', 'inquiry.manage', 'inquiry_task.manage'];
  return inquiryTaskUserTokens(user).some((token) => managerTokens.some((key) => token.includes(key)));
}

function canAccessInquiryTask(row: InquiryTaskDbRow, user: SessionUser) {
  if (canManageInquiryTasks(user)) {
    return true;
  }
  const ids = [row.created_by_id, row.salesperson_id].filter(Boolean).map(String);
  const names = [row.created_by_name, row.salesperson_name].filter(Boolean).map(String);
  return ids.includes(user.id) || names.includes(user.realName) || names.includes(user.email);
}

function normalizeInquiryTask(row: InquiryTaskDbRow) {
  return {
    id: String(row.id ?? ''),
    taskNo: String(row.task_no ?? ''),
    inquiryId: (row.inquiry_id as string | null) ?? null,
    customerId: (row.customer_id as string | null) ?? null,
    customerName: String(row.customer_name ?? ''),
    contactName: (row.contact_name as string | null) ?? '',
    contactPhone: (row.contact_phone as string | null) ?? '',
    salespersonId: (row.salesperson_id as string | null) ?? null,
    salespersonName: (row.salesperson_name as string | null) ?? '',
    serviceItems: jsonArray<string>(row.service_items as string | null),
    cargoName: String(row.cargo_name ?? ''),
    cargoType: (row.cargo_type as string | null) ?? '',
    origin: String(row.origin ?? ''),
    destination: String(row.destination ?? ''),
    weightKg: row.weight_kg === null || row.weight_kg === undefined ? null : Number(row.weight_kg),
    volumeCbm: row.volume_cbm === null || row.volume_cbm === undefined ? null : Number(row.volume_cbm),
    packageCount: row.package_count === null || row.package_count === undefined ? null : Number(row.package_count),
    readyDate: (row.ready_date as string | null) ?? '',
    targetArrivalDate: (row.target_arrival_date as string | null) ?? '',
    customsMode: (row.customs_mode as string | null) ?? '',
    temperatureRequirement: (row.temperature_requirement as string | null) ?? '',
    specialRequirement: (row.special_requirement as string | null) ?? '',
    cargoFiles: jsonArray<Record<string, unknown>>(row.cargo_files as string | null),
    quoteAmount: row.quote_amount === null || row.quote_amount === undefined ? null : Number(row.quote_amount),
    quoteCurrency: String(row.quote_currency ?? 'USD'),
    quoteRemark: (row.quote_remark as string | null) ?? '',
    quoteFiles: jsonArray<Record<string, unknown>>(row.quote_files as string | null),
    solutionFiles: jsonArray<Record<string, unknown>>(row.solution_files as string | null),
    salesConfirmNote: (row.sales_confirm_note as string | null) ?? '',
    status: String(row.status ?? ''),
    currentNode: String(row.current_node ?? ''),
    createdById: (row.created_by_id as string | null) ?? null,
    createdByName: (row.created_by_name as string | null) ?? '',
    submittedAt: (row.submitted_at as string | null) ?? '',
    quotedAt: (row.quoted_at as string | null) ?? '',
    confirmedAt: (row.confirmed_at as string | null) ?? '',
    completedAt: (row.completed_at as string | null) ?? '',
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

function normalizeInquiryTaskLog(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ''),
    taskId: String(row.task_id ?? ''),
    action: String(row.action ?? ''),
    fromStatus: (row.from_status as string | null) ?? '',
    toStatus: (row.to_status as string | null) ?? '',
    operatorId: (row.operator_id as string | null) ?? '',
    operatorName: (row.operator_name as string | null) ?? '',
    remark: (row.remark as string | null) ?? '',
    createdAt: String(row.created_at ?? ''),
  };
}

async function recordInquiryTaskLog(
  env: Env,
  taskId: string,
  action: string,
  fromStatus: string | null,
  toStatus: string | null,
  user: SessionUser,
  remark = '',
) {
  await env.DB.prepare(
    `
      INSERT INTO inquiry_task_logs
        (id, task_id, action, from_status, to_status, operator_id, operator_name, remark, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(createId('inqtasklog'), taskId, action, fromStatus, toStatus, user.id, currentUserName(user), remark, isoNow())
    .run();
}

async function listInquiryTasks(env: Env, user: SessionUser) {
  if (canManageInquiryTasks(user)) {
    const { results } = await env.DB.prepare('SELECT * FROM inquiry_tasks ORDER BY created_at DESC').all<InquiryTaskDbRow>();
    return results.map(normalizeInquiryTask);
  }

  const { results } = await env.DB.prepare(
    `
      SELECT *
      FROM inquiry_tasks
      WHERE created_by_id = ?
         OR salesperson_id = ?
         OR created_by_name IN (?, ?)
         OR salesperson_name IN (?, ?)
      ORDER BY created_at DESC
    `,
  )
    .bind(user.id, user.id, user.realName, user.email, user.realName, user.email)
    .all<InquiryTaskDbRow>();
  return results.map(normalizeInquiryTask);
}

async function getInquiryTask(env: Env, id: string, user: SessionUser) {
  const row = await env.DB.prepare('SELECT * FROM inquiry_tasks WHERE id = ?').bind(id).first<InquiryTaskDbRow>();
  if (!row || !canAccessInquiryTask(row, user)) {
    return null;
  }
  const { results: logs } = await env.DB.prepare('SELECT * FROM inquiry_task_logs WHERE task_id = ? ORDER BY created_at DESC')
    .bind(id)
    .all<Record<string, unknown>>();
  return { ...normalizeInquiryTask(row), logs: logs.map(normalizeInquiryTaskLog) };
}

async function createInquiryTask(env: Env, user: SessionUser, body: InquiryTaskPayload) {
  const customerName = ensureString(body.customerName);
  const cargoName = ensureString(body.cargoName);
  const origin = ensureString(body.origin);
  const destination = ensureString(body.destination);
  const serviceItems = uniqueStrings(body.serviceItems ?? []);
  if (!customerName) {
    return { error: '客户名称不能为空。' };
  }
  if (!cargoName) {
    return { error: '货物名称不能为空。' };
  }
  if (!origin || !destination) {
    return { error: '起运地和目的地不能为空。' };
  }
  if (!serviceItems.length) {
    return { error: '服务项目至少选择一个。' };
  }

  const now = isoNow();
  const id = createId('inqtask');
  const salespersonName = ensureString(body.salespersonName) || ensureString(body.salesperson) || currentUserName(user);
  const salespersonId = ensureString(body.salespersonId) || user.id;

  await env.DB.prepare(
    `
      INSERT INTO inquiry_tasks (
        id, task_no, customer_id, customer_name, contact_name, contact_phone,
        salesperson_id, salesperson_name, service_items, cargo_name, cargo_type,
        origin, destination, weight_kg, volume_cbm, package_count, ready_date,
        target_arrival_date, customs_mode, temperature_requirement, special_requirement,
        cargo_files, status, current_node, created_by_id, created_by_name,
        submitted_at, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      businessNo('INQTASK'),
      ensureString(body.customerId) || null,
      customerName,
      ensureString(body.contactName),
      ensureString(body.contactPhone),
      salespersonId,
      salespersonName,
      JSON.stringify(serviceItems),
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
      '待车队报价',
      '车队报价',
      user.id,
      currentUserName(user),
      now,
      now,
      now,
    )
    .run();

  await recordInquiryTaskLog(env, id, '提交询单任务', null, '待车队报价', user, `${customerName}：${origin} -> ${destination}`);
  await recordActivity(env, '提交询单任务', `${customerName}：${origin} -> ${destination}，货物：${cargoName}`);
  return { id };
}

async function quoteInquiryTask(env: Env, user: SessionUser, id: string, body: InquiryTaskQuotePayload) {
  if (!canManageInquiryTasks(user)) {
    return { error: '当前用户无权报价。' };
  }
  const row = await env.DB.prepare('SELECT * FROM inquiry_tasks WHERE id = ?').bind(id).first<InquiryTaskDbRow>();
  if (!row) {
    return { error: '询单任务不存在。' };
  }
  const currentStatus = String(row.status ?? '');
  if (currentStatus !== '待车队报价') {
    return { error: '当前状态不能报价。' };
  }

  const now = isoNow();
  await env.DB.prepare(
    `
      UPDATE inquiry_tasks
      SET quote_amount = ?,
          quote_currency = ?,
          quote_remark = ?,
          quote_files = ?,
          solution_files = ?,
          status = ?,
          current_node = ?,
          quoted_at = ?,
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      toNumber(body.quoteAmount),
      ensureString(body.quoteCurrency) || 'USD',
      ensureString(body.quoteRemark),
      JSON.stringify(body.quoteFiles ?? []),
      JSON.stringify(body.solutionFiles ?? []),
      '待销售确认',
      '销售确认',
      now,
      now,
      id,
    )
    .run();
  await recordInquiryTaskLog(env, id, '车队报价', currentStatus, '待销售确认', user, ensureString(body.quoteRemark));
  return { ok: true };
}

async function confirmInquiryTask(env: Env, user: SessionUser, id: string, body: InquiryTaskConfirmPayload) {
  const detail = await getInquiryTask(env, id, user);
  if (!detail) {
    return { error: '询单任务不存在。' };
  }
  if (detail.status !== '待销售确认') {
    return { error: '当前状态不能销售确认。' };
  }

  const created = await createTransportInquiry(env, {
    customerId: detail.customerId ?? undefined,
    customerName: detail.customerName,
    salesperson: detail.salespersonName,
    serviceItems: detail.serviceItems,
    contactName: detail.contactName,
    contactPhone: detail.contactPhone,
    cargoName: detail.cargoName,
    cargoType: detail.cargoType,
    origin: detail.origin,
    destination: detail.destination,
    weightKg: detail.weightKg,
    volumeCbm: detail.volumeCbm,
    packageCount: detail.packageCount,
    readyDate: detail.readyDate,
    targetArrivalDate: detail.targetArrivalDate,
    customsMode: detail.customsMode,
    temperatureRequirement: detail.temperatureRequirement,
    specialRequirement: detail.specialRequirement,
    cargoFiles: detail.cargoFiles as InquiryFilePayload[],
  });
  if (created.error !== undefined) {
    return { error: created.error };
  }
  if (detail.quoteAmount !== null || detail.quoteRemark || detail.quoteFiles.length || detail.solutionFiles.length) {
    const quoted = await quoteTransportInquiry(env, created.id, {
      quoteAmount: detail.quoteAmount,
      quoteCurrency: detail.quoteCurrency,
      quoteRemark: detail.quoteRemark,
      quoteFiles: detail.quoteFiles as InquiryFilePayload[],
      solutionFiles: detail.solutionFiles as InquiryFilePayload[],
    });
    if (quoted.error !== undefined) {
      return { error: quoted.error };
    }
  }

  const now = isoNow();
  await env.DB.prepare(
    `
      UPDATE inquiry_tasks
      SET inquiry_id = ?,
          sales_confirm_note = ?,
          status = ?,
          current_node = ?,
          confirmed_at = ?,
          completed_at = ?,
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(created.id, ensureString(body.remark), '已完成', '完成', now, now, now, id)
    .run();
  await recordInquiryTaskLog(env, id, '销售确认', '待销售确认', '已完成', user, ensureString(body.remark));
  await recordActivity(env, '询单任务销售确认', `询单任务 ${detail.taskNo} 已生成正式询单。`);
  return { id, inquiryId: created.id };
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

async function listLoadingPlans(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        id,
        plan_no as planNo,
        title,
        cargo_items as cargoItems,
        vehicle_ids as vehicleIds,
        plan_result as planResult,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM loading_plans
      ORDER BY created_at DESC
    `,
  ).all<Record<string, unknown>>();

  return rows.results.map((row) => ({
    ...row,
    cargoItems: jsonArray(row.cargoItems as string | null),
    vehicleIds: jsonArray<string>(row.vehicleIds as string | null),
    planResult: row.planResult ? JSON.parse(row.planResult as string) : {},
  }));
}

async function createLoadingPlan(env: Env, body: LoadingPlanPayload) {
  const title = ensureString(body.title);
  if (!title) {
    return { error: '配载方案标题不能为空。' };
  }
  if (!Array.isArray(body.cargoItems) || body.cargoItems.length === 0) {
    return { error: '配载方案至少需要一条货物信息。' };
  }
  if (!Array.isArray(body.vehicleIds) || body.vehicleIds.length === 0) {
    return { error: '配载方案至少需要选择一辆车。' };
  }

  const id = createId('load');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO loading_plans (
        id, plan_no, title, cargo_items, vehicle_ids, plan_result, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      businessNo('LOAD'),
      title,
      JSON.stringify(body.cargoItems),
      JSON.stringify(uniqueStrings(body.vehicleIds)),
      JSON.stringify(body.planResult ?? {}),
      'SAVED',
      now,
      now,
    )
    .run();

  await recordActivity(env, '保存配载方案', `保存配载方案 ${title}。`);
  return { id };
}

function maskSecret(value?: string | null) {
  if (!value) return '';
  if (value.length <= 10) return '已配置';
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function mapLoadingAiConfig(row: Record<string, unknown> | null, env: Env) {
  const dbKey = ensureString(row?.apiKey);
  const envKey = ensureString(env.OPENAI_API_KEY);
  const activeKey = dbKey || envKey;
  return {
    id: ensureString(row?.id) || 'default',
    provider: ensureString(row?.provider) || 'openai',
    apiBaseUrl: ensureString(row?.apiBaseUrl) || 'https://api.openai.com/v1/responses',
    model: ensureString(row?.model) || 'gpt-4.1-mini',
    enabled: row?.enabled === undefined ? true : Boolean(row.enabled),
    systemPrompt: ensureString(row?.systemPrompt),
    temperature: Number(row?.temperature ?? 0.2),
    maxOutputTokens: Number(row?.maxOutputTokens ?? 2000),
    notes: ensureString(row?.notes),
    hasApiKey: Boolean(activeKey),
    apiKeyMasked: maskSecret(activeKey),
    keySource: dbKey ? '数据库配置' : envKey ? 'Cloudflare Secret' : '',
    updatedAt: ensureString(row?.updatedAt),
  };
}

async function getLoadingAiConfig(env: Env) {
  const row = await env.DB.prepare(
    `
      SELECT
        id,
        provider,
        api_base_url as apiBaseUrl,
        api_key as apiKey,
        model,
        enabled,
        system_prompt as systemPrompt,
        temperature,
        max_output_tokens as maxOutputTokens,
        notes,
        updated_at as updatedAt
      FROM loading_ai_config
      WHERE id = 'default'
      LIMIT 1
    `,
  ).first<Record<string, unknown>>();
  return mapLoadingAiConfig(row, env);
}

async function saveLoadingAiConfig(env: Env, body: LoadingAiConfigPayload) {
  const current = await env.DB.prepare('SELECT api_key as apiKey FROM loading_ai_config WHERE id = ?').bind('default').first<{ apiKey?: string | null }>();
  const provider = ensureString(body.provider) || 'openai';
  const apiBaseUrl = ensureString(body.apiBaseUrl) || 'https://api.openai.com/v1/responses';
  const model = ensureString(body.model) || 'gpt-4.1-mini';
  const apiKey = ensureString(body.apiKey) || ensureString(current?.apiKey);
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO loading_ai_config (
        id, provider, api_base_url, api_key, model, enabled, system_prompt, temperature, max_output_tokens, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        provider = excluded.provider,
        api_base_url = excluded.api_base_url,
        api_key = excluded.api_key,
        model = excluded.model,
        enabled = excluded.enabled,
        system_prompt = excluded.system_prompt,
        temperature = excluded.temperature,
        max_output_tokens = excluded.max_output_tokens,
        notes = excluded.notes,
        updated_at = excluded.updated_at
    `,
  )
    .bind(
      'default',
      provider,
      apiBaseUrl,
      apiKey || null,
      model,
      boolToInt(body.enabled, true),
      ensureString(body.systemPrompt),
      Number(body.temperature ?? 0.2),
      Number(body.maxOutputTokens ?? 2000),
      ensureString(body.notes),
      now,
      now,
    )
    .run();
  return getLoadingAiConfig(env);
}

async function listMarketInfo(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        id,
        collected_at as collectedAt,
        whatsapp_number as whatsappNumber,
        source_group as sourceGroup,
        foreign_text as foreignText,
        chinese_translation as chineseTranslation,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM market_info
      WHERE status != 'INVALID'
      ORDER BY collected_at DESC, created_at DESC
    `,
  ).all<Record<string, unknown>>();
  return rows.results;
}

async function createMarketInfo(env: Env, body: MarketInfoPayload) {
  const foreignText = ensureString(body.foreignText);
  if (!foreignText) return { error: '外语原文不能为空。' };
  const id = createId('market');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO market_info (
        id, collected_at, whatsapp_number, source_group, foreign_text, chinese_translation, status, raw_payload, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      ensureString(body.collectedAt) || now,
      ensureString(body.whatsappNumber),
      ensureString(body.sourceGroup),
      foreignText,
      ensureString(body.chineseTranslation),
      'VALID',
      body.rawPayload === undefined ? JSON.stringify(body) : JSON.stringify(body.rawPayload),
      now,
      now,
    )
    .run();
  return { ok: true, id };
}

async function invalidateMarketInfo(env: Env, id: string) {
  await env.DB.prepare('UPDATE market_info SET status = ?, updated_at = ? WHERE id = ?').bind('INVALID', isoNow(), id).run();
  return { ok: true };
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
        customers.contact_name as contactName,
        customers.detailed_address as detailedAddress,
        customers.industry,
        customers.phone,
        customers.contract_status as contractStatus,
        customers.contract_files as contractFiles,
        customers.invoice_info as invoiceInfo,
        customers.notes,
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
      contractFiles: jsonArray(customer.contractFiles as string | null, []),
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
        contact_name as contactName,
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
        contract_status as contractStatus,
        contract_files as contractFiles,
        invoice_info as invoiceInfo,
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
    contractFiles: jsonArray(customer.contractFiles as string | null, []),
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
      customers.contact_name as contactName,
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
      customers.contract_status as contractStatus,
      customers.contract_files as contractFiles,
      customers.notes
    FROM customers
    WHERE (
      lower(customers.name) LIKE ? OR
      lower(COALESCE(customers.customer_code, '')) LIKE ? OR
      lower(COALESCE(customers.short_name, '')) LIKE ? OR
      lower(COALESCE(customers.contact_name, '')) LIKE ? OR
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
  const binds: unknown[] = [keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword];

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
        id, name, customer_code, short_name, contact_name, detailed_address, company_profile, industry, phone, email, website, instagram, whatsapp, linkedin, facebook, region, cooperation_status, contract_status, contract_files, invoice_info, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      name,
      ensureString(body.customerCode),
      ensureString(body.shortName),
      ensureString(body.contactName),
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
      ensureString(body.contractStatus) || '未签署',
      normalizeFiles(body.contractFiles),
      ensureString(body.invoiceInfo),
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
        contact_name = ?,
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
        contract_status = ?,
        contract_files = ?,
        invoice_info = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      name,
      ensureString(body.customerCode),
      ensureString(body.shortName),
      ensureString(body.contactName),
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
      ensureString(body.contractStatus) || '未签署',
      normalizeFiles(body.contractFiles),
      ensureString(body.invoiceInfo),
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

function normalizeFiles(files: SupplierFilePayload[] | undefined) {
  return JSON.stringify(Array.isArray(files) ? files : []);
}

function normalizeSupplierTypes(types: string[] | undefined, fallback?: string) {
  const values = uniqueStrings([...(Array.isArray(types) ? types : []), ensureString(fallback)].map((item) => ensureString(item))).filter(Boolean);
  return values;
}

function mapSupplier(row: Record<string, unknown>): Record<string, unknown> {
  const types = jsonArray<string>(row.types as string | null, []);
  const normalizedTypes = types.length ? types : normalizeSupplierTypes(undefined, ensureString(row.type));
  return {
    ...row,
    type: normalizedTypes[0] || ensureString(row.type),
    types: normalizedTypes,
    attachments: jsonArray(row.attachments as string | null),
    contractFiles: jsonArray(row.contractFiles as string | null),
  };
}

function mapSupplierVehicle(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    drivingLicenseFiles: jsonArray(row.drivingLicenseFiles as string | null),
    vehiclePhotoFiles: jsonArray(row.vehiclePhotoFiles as string | null),
    otherFiles: jsonArray(row.otherFiles as string | null),
  };
}

function mapSupplierDriver(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    idFrontFiles: jsonArray(row.idFrontFiles as string | null),
    idBackFiles: jsonArray(row.idBackFiles as string | null),
    driverLicenseFiles: jsonArray(row.driverLicenseFiles as string | null),
    insuranceFiles: jsonArray(row.insuranceFiles as string | null),
    internationalRoadPermitFiles: jsonArray(row.internationalRoadPermitFiles as string | null),
  };
}

async function listSupplierVehicles(env: Env, supplierId?: string) {
  const where = supplierId ? 'WHERE supplier_id = ?' : '';
  const statement = env.DB.prepare(
    `
      SELECT
        id,
        supplier_id as supplierId,
        plate_no as plateNo,
        vehicle_type as vehicleType,
        required_vehicle_type as requiredVehicleType,
        vehicle_length as vehicleLength,
        axle,
        driving_license_files as drivingLicenseFiles,
        brand_model as brandModel,
        road_transport_cert_no as roadTransportCertNo,
        experience_license_no as experienceLicenseNo,
        inspection_valid_until as inspectionValidUntil,
        operation_cert_review_date as operationCertReviewDate,
        mandatory_scrap_date as mandatoryScrapDate,
        vehicle_photo_files as vehiclePhotoFiles,
        other_files as otherFiles,
        created_at as createdAt,
        updated_at as updatedAt
      FROM supplier_vehicles
      ${where}
      ORDER BY updated_at DESC, plate_no ASC
    `,
  );
  const rows = supplierId ? await statement.bind(supplierId).all() : await statement.all();
  return (rows.results as Array<Record<string, unknown>>).map(mapSupplierVehicle);
}

async function listSupplierDrivers(env: Env, supplierId?: string) {
  const where = supplierId ? 'WHERE supplier_id = ?' : '';
  const statement = env.DB.prepare(
    `
      SELECT
        id,
        supplier_id as supplierId,
        name,
        phone,
        telegram_id as telegramId,
        id_card_no as idCardNo,
        notes,
        payee,
        bank_phone as bankPhone,
        bank_card_no as bankCardNo,
        bank_name as bankName,
        id_front_files as idFrontFiles,
        id_back_files as idBackFiles,
        driver_license_files as driverLicenseFiles,
        insurance_files as insuranceFiles,
        international_road_permit_files as internationalRoadPermitFiles,
        created_at as createdAt,
        updated_at as updatedAt
      FROM supplier_drivers
      ${where}
      ORDER BY updated_at DESC, name ASC
    `,
  );
  const rows = supplierId ? await statement.bind(supplierId).all() : await statement.all();
  return (rows.results as Array<Record<string, unknown>>).map(mapSupplierDriver);
}

async function listSuppliers(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        id,
        name,
        supplier_code as supplierCode,
        type,
        types,
        contact_info as contactInfo,
        payee,
        bank_phone as bankPhone,
        bank_card_no as bankCardNo,
        bank_name as bankName,
        notes,
        contract_status as contractStatus,
        contract_files as contractFiles,
        attachments,
        created_at as createdAt,
        updated_at as updatedAt
      FROM suppliers
      ORDER BY updated_at DESC, name ASC
    `,
  ).all();

  const suppliers = (rows.results as Array<Record<string, unknown>>).map(mapSupplier);
  const vehicles = await listSupplierVehicles(env);
  const drivers = await listSupplierDrivers(env);
  return suppliers.map((supplier) => ({
    ...supplier,
    vehicles: vehicles.filter((item) => String(item.supplierId) === String(supplier.id)),
    drivers: drivers.filter((item) => String(item.supplierId) === String(supplier.id)),
  }));
}

async function createSupplier(env: Env, body: SupplierPayload) {
  const name = ensureString(body.name);
  const types = normalizeSupplierTypes(body.types, body.type);
  const type = types[0] || '';
  if (!name || !types.length) {
    return { error: '供应商名称和类型不能为空。' };
  }

  const id = createId('sup');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO suppliers (
        id, name, supplier_code, type, types, contact_info, payee, bank_phone, bank_card_no, bank_name, notes, contract_status, contract_files, attachments, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      name,
      businessNo('SUP'),
      type,
      JSON.stringify(types),
      ensureString(body.contactInfo),
      ensureString(body.payee),
      ensureString(body.bankPhone),
      ensureString(body.bankCardNo),
      ensureString(body.bankName),
      ensureString(body.notes),
      ensureString(body.contractStatus) || '未签署',
      normalizeFiles(body.contractFiles),
      normalizeFiles(body.attachments),
      now,
      now,
    )
    .run();
  await recordActivity(env, '新增供应商', `新增供应商 ${name}。`);
  return { id };
}

async function updateSupplier(env: Env, supplierId: string, body: SupplierPayload) {
  const name = ensureString(body.name);
  const types = normalizeSupplierTypes(body.types, body.type);
  const type = types[0] || '';
  if (!name || !types.length) {
    return { error: '供应商名称和类型不能为空。' };
  }
  const existing = await env.DB.prepare('SELECT id FROM suppliers WHERE id = ?').bind(supplierId).first();
  if (!existing) {
    return { error: '供应商不存在。' };
  }

  await env.DB.prepare(
    `
      UPDATE suppliers
      SET name = ?,
          type = ?,
          types = ?,
          contact_info = ?,
          payee = ?,
          bank_phone = ?,
          bank_card_no = ?,
          bank_name = ?,
          notes = ?,
          contract_status = ?,
          contract_files = ?,
          attachments = ?,
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      name,
      type,
      JSON.stringify(types),
      ensureString(body.contactInfo),
      ensureString(body.payee),
      ensureString(body.bankPhone),
      ensureString(body.bankCardNo),
      ensureString(body.bankName),
      ensureString(body.notes),
      ensureString(body.contractStatus) || '未签署',
      normalizeFiles(body.contractFiles),
      normalizeFiles(body.attachments),
      isoNow(),
      supplierId,
    )
    .run();
  return { ok: true };
}

async function deleteSupplier(env: Env, supplierId: string) {
  const existing = await env.DB.prepare('SELECT id, name FROM suppliers WHERE id = ?').bind(supplierId).first<{ id: string; name: string }>();
  if (!existing) {
    return { error: '供应商不存在。' };
  }
  await env.DB.prepare('DELETE FROM supplier_drivers WHERE supplier_id = ?').bind(supplierId).run();
  await env.DB.prepare('DELETE FROM supplier_vehicles WHERE supplier_id = ?').bind(supplierId).run();
  await env.DB.prepare('DELETE FROM suppliers WHERE id = ?').bind(supplierId).run();
  await recordActivity(env, '删除供应商', `删除供应商 ${existing.name}。`);
  return { ok: true };
}

async function createSupplierVehicle(env: Env, supplierId: string, body: SupplierVehiclePayload) {
  const existing = await env.DB.prepare('SELECT id FROM suppliers WHERE id = ?').bind(supplierId).first();
  if (!existing) return { error: '供应商不存在。' };
  const id = createId('sveh');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO supplier_vehicles (
        id, supplier_id, plate_no, vehicle_type, required_vehicle_type, vehicle_length, axle,
        driving_license_files, brand_model, road_transport_cert_no, experience_license_no,
        inspection_valid_until, operation_cert_review_date, mandatory_scrap_date,
        vehicle_photo_files, other_files, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      supplierId,
      ensureString(body.plateNo),
      ensureString(body.vehicleType),
      ensureString(body.requiredVehicleType),
      ensureString(body.vehicleLength),
      ensureString(body.axle),
      normalizeFiles(body.drivingLicenseFiles),
      ensureString(body.brandModel),
      ensureString(body.roadTransportCertNo),
      ensureString(body.experienceLicenseNo),
      ensureString(body.inspectionValidUntil),
      ensureString(body.operationCertReviewDate),
      ensureString(body.mandatoryScrapDate),
      normalizeFiles(body.vehiclePhotoFiles),
      normalizeFiles(body.otherFiles),
      now,
      now,
    )
    .run();
  return { id };
}

async function updateSupplierVehicle(env: Env, vehicleId: string, body: SupplierVehiclePayload) {
  const existing = await env.DB.prepare('SELECT id FROM supplier_vehicles WHERE id = ?').bind(vehicleId).first();
  if (!existing) return { error: '车辆不存在。' };
  await env.DB.prepare(
    `
      UPDATE supplier_vehicles
      SET plate_no = ?,
          vehicle_type = ?,
          required_vehicle_type = ?,
          vehicle_length = ?,
          axle = ?,
          driving_license_files = ?,
          brand_model = ?,
          road_transport_cert_no = ?,
          experience_license_no = ?,
          inspection_valid_until = ?,
          operation_cert_review_date = ?,
          mandatory_scrap_date = ?,
          vehicle_photo_files = ?,
          other_files = ?,
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      ensureString(body.plateNo),
      ensureString(body.vehicleType),
      ensureString(body.requiredVehicleType),
      ensureString(body.vehicleLength),
      ensureString(body.axle),
      normalizeFiles(body.drivingLicenseFiles),
      ensureString(body.brandModel),
      ensureString(body.roadTransportCertNo),
      ensureString(body.experienceLicenseNo),
      ensureString(body.inspectionValidUntil),
      ensureString(body.operationCertReviewDate),
      ensureString(body.mandatoryScrapDate),
      normalizeFiles(body.vehiclePhotoFiles),
      normalizeFiles(body.otherFiles),
      isoNow(),
      vehicleId,
    )
    .run();
  return { ok: true };
}

async function deleteSupplierVehicle(env: Env, vehicleId: string) {
  await env.DB.prepare('DELETE FROM supplier_vehicles WHERE id = ?').bind(vehicleId).run();
  return { ok: true };
}

async function createSupplierDriver(env: Env, supplierId: string, body: SupplierDriverPayload) {
  const existing = await env.DB.prepare('SELECT id FROM suppliers WHERE id = ?').bind(supplierId).first();
  if (!existing) return { error: '供应商不存在。' };
  const name = ensureString(body.name);
  if (!name) return { error: '司机名称不能为空。' };
  const id = createId('sdrv');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO supplier_drivers (
        id, supplier_id, name, phone, telegram_id, id_card_no, notes, payee, bank_phone, bank_card_no, bank_name,
        id_front_files, id_back_files, driver_license_files, insurance_files, international_road_permit_files,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      supplierId,
      name,
      ensureString(body.phone),
      ensureString(body.telegramId),
      ensureString(body.idCardNo),
      ensureString(body.notes),
      ensureString(body.payee),
      ensureString(body.bankPhone),
      ensureString(body.bankCardNo),
      ensureString(body.bankName),
      normalizeFiles(body.idFrontFiles),
      normalizeFiles(body.idBackFiles),
      normalizeFiles(body.driverLicenseFiles),
      normalizeFiles(body.insuranceFiles),
      normalizeFiles(body.internationalRoadPermitFiles),
      now,
      now,
    )
    .run();
  return { id };
}

async function updateSupplierDriver(env: Env, driverId: string, body: SupplierDriverPayload) {
  const existing = await env.DB.prepare('SELECT id FROM supplier_drivers WHERE id = ?').bind(driverId).first();
  if (!existing) return { error: '司机不存在。' };
  const name = ensureString(body.name);
  if (!name) return { error: '司机名称不能为空。' };
  await env.DB.prepare(
    `
      UPDATE supplier_drivers
      SET name = ?,
          phone = ?,
          telegram_id = ?,
          id_card_no = ?,
          notes = ?,
          payee = ?,
          bank_phone = ?,
          bank_card_no = ?,
          bank_name = ?,
          id_front_files = ?,
          id_back_files = ?,
          driver_license_files = ?,
          insurance_files = ?,
          international_road_permit_files = ?,
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      name,
      ensureString(body.phone),
      ensureString(body.telegramId),
      ensureString(body.idCardNo),
      ensureString(body.notes),
      ensureString(body.payee),
      ensureString(body.bankPhone),
      ensureString(body.bankCardNo),
      ensureString(body.bankName),
      normalizeFiles(body.idFrontFiles),
      normalizeFiles(body.idBackFiles),
      normalizeFiles(body.driverLicenseFiles),
      normalizeFiles(body.insuranceFiles),
      normalizeFiles(body.internationalRoadPermitFiles),
      isoNow(),
      driverId,
    )
    .run();
  return { ok: true };
}

async function deleteSupplierDriver(env: Env, driverId: string) {
  await env.DB.prepare('DELETE FROM supplier_drivers WHERE id = ?').bind(driverId).run();
  return { ok: true };
}

const oversizeDefaultNodeNames = ['国内运输', '境外车预定', '接车验货', '装车报关', '转关', '国际运输', '清关', '卸货'];

function normalizeServiceScope(scope: string[] | undefined) {
  const values = uniqueStrings((scope ?? []).map((item) => ensureString(item))).filter(Boolean);
  return JSON.stringify(values.length ? values : oversizeDefaultNodeNames);
}

function mapOversizeProject(row: Record<string, unknown>) {
  return {
    id: row.id,
    projectNo: row.projectNo,
    name: row.name,
    customerId: row.customerId,
    customerName: row.customerName,
    customerShortName: row.customerShortName,
    origin: row.origin,
    destination: row.destination,
    startDate: row.startDate,
    endDate: row.endDate,
    manager: row.manager,
    status: row.status,
    serviceScope: jsonArray<string>(row.serviceScope as string | null, []),
    workflowTemplateId: row.workflowTemplateId,
    workflowNodeIds: jsonArray<string>(row.workflowNodeIds as string | null, []),
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapOversizeTask(row: Record<string, unknown>) {
  return {
    id: row.id,
    projectId: row.projectId,
    taskNo: row.taskNo,
    vehicleNo: row.vehicleNo,
    vehicleType: row.vehicleType,
    driverName: row.driverName,
    driverPhone: row.driverPhone,
    cargoSummary: row.cargoSummary,
    plannedDepartureDate: row.plannedDepartureDate,
    status: row.status,
    progress: row.progress,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    nodes: [] as Record<string, unknown>[],
  };
}

function mapOversizeNode(row: Record<string, unknown>) {
  return {
    id: row.id,
    projectId: row.projectId,
    taskId: row.taskId,
    nodeName: row.nodeName,
    sortOrder: row.sortOrder,
    status: row.status,
    owner: row.owner,
    plannedDate: row.plannedDate,
    completedAt: row.completedAt,
    notes: row.notes,
    files: jsonArray(row.files as string | null, []),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapOversizeTodo(row: Record<string, unknown>) {
  return {
    id: row.id,
    projectId: row.projectId,
    taskId: row.taskId,
    nodeId: row.nodeId,
    title: row.title,
    owner: row.owner,
    dueDate: row.dueDate,
    status: row.status,
    priority: row.priority,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapOversizeException(row: Record<string, unknown>) {
  return {
    id: row.id,
    projectId: row.projectId,
    taskId: row.taskId,
    nodeId: row.nodeId,
    title: row.title,
    level: row.level,
    status: row.status,
    owner: row.owner,
    description: row.description,
    resolution: row.resolution,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function enrichOversizeProjects(
  projects: Record<string, unknown>[],
  tasks: Record<string, unknown>[],
  nodes: Record<string, unknown>[],
  todos: Record<string, unknown>[],
  exceptions: Record<string, unknown>[],
  workflows: Record<string, unknown>[] = [],
  workflowNodes: Record<string, unknown>[] = [],
) {
  return projects.map((project) => {
    const projectId = String(project.id);
    const projectTasks = tasks.filter((task) => String(task.projectId) === projectId);
    const projectNodes = nodes.filter((node) => String(node.projectId) === projectId);
    const projectTodos = todos.filter((todo) => String(todo.projectId) === projectId);
    const projectExceptions = exceptions.filter((exception) => String(exception.projectId) === projectId);
    const tasksWithNodes = projectTasks.map((task) => ({
      ...task,
      ...(workflows.find((workflow) => String(workflow.taskId) === String(task.id)) ?? {}),
      nodes: projectNodes.filter((node) => String(node.taskId) === String(task.id)),
      workflowNodes: workflowNodes.filter((node) => String(node.taskId) === String(task.id)),
    }));
    const completedNodes = projectNodes.filter((node) => node.status === '已完成').length;
    const progress = projectNodes.length ? Math.round((completedNodes / projectNodes.length) * 100) : 0;

    return {
      ...project,
      tasks: tasksWithNodes,
      todos: projectTodos,
      exceptions: projectExceptions,
      totalTasks: projectTasks.length,
      completedTasks: projectTasks.filter((task) => task.status === '已完成').length,
      pendingTodoCount: projectTodos.filter((todo) => todo.status !== '已完成').length,
      abnormalCount: projectExceptions.filter((exception) => exception.status !== '已关闭').length,
      progress,
    };
  });
}

async function listOversizeProjects(env: Env) {
  const projectRows = await env.DB.prepare(
    `
      SELECT oversize_projects.id, oversize_projects.project_no as projectNo, oversize_projects.name,
             oversize_projects.customer_id as customerId, oversize_projects.customer_name as customerName,
             COALESCE(NULLIF(customers.short_name, ''), oversize_projects.customer_name) as customerShortName,
             oversize_projects.origin, oversize_projects.destination,
             oversize_projects.start_date as startDate, oversize_projects.end_date as endDate,
             oversize_projects.manager, oversize_projects.status,
             oversize_projects.service_scope as serviceScope,
             oversize_projects.workflow_template_id as workflowTemplateId,
             oversize_projects.workflow_node_ids as workflowNodeIds,
             oversize_projects.notes,
             oversize_projects.created_at as createdAt,
             oversize_projects.updated_at as updatedAt
      FROM oversize_projects
      LEFT JOIN customers ON customers.id = oversize_projects.customer_id
      ORDER BY oversize_projects.updated_at DESC, oversize_projects.created_at DESC
    `,
  ).all();
  const taskRows = await env.DB.prepare(
    `
      SELECT id, project_id as projectId, task_no as taskNo, vehicle_no as vehicleNo, vehicle_type as vehicleType,
             driver_name as driverName, driver_phone as driverPhone, cargo_summary as cargoSummary,
             planned_departure_date as plannedDepartureDate, status, progress, notes,
             created_at as createdAt, updated_at as updatedAt
      FROM oversize_project_tasks
      ORDER BY created_at ASC
    `,
  ).all();
  const nodeRows = await env.DB.prepare(
    `
      SELECT id, project_id as projectId, task_id as taskId, node_name as nodeName, sort_order as sortOrder,
             status, owner, planned_date as plannedDate, completed_at as completedAt, notes, files,
             created_at as createdAt, updated_at as updatedAt
      FROM oversize_task_nodes
      ORDER BY sort_order ASC
    `,
  ).all();
  const todoRows = await env.DB.prepare(
    `
      SELECT id, project_id as projectId, task_id as taskId, node_id as nodeId, title, owner, due_date as dueDate,
             status, priority, notes, created_at as createdAt, updated_at as updatedAt
      FROM oversize_project_todos
      ORDER BY due_date ASC, created_at DESC
    `,
  ).all();
  const exceptionRows = await env.DB.prepare(
    `
      SELECT id, project_id as projectId, task_id as taskId, node_id as nodeId, title, level, status, owner,
             description, resolution, created_at as createdAt, updated_at as updatedAt
      FROM oversize_project_exceptions
      ORDER BY created_at DESC
    `,
  ).all();
  const existingWorkflowRows = await env.DB.prepare('SELECT task_id as taskId FROM workflow_instances').all<Record<string, unknown>>();
  const workflowTaskIds = new Set(existingWorkflowRows.results.map((row) => String(row.taskId)));
  for (const task of taskRows.results as Array<Record<string, unknown>>) {
    if (!workflowTaskIds.has(String(task.id))) {
      await startWorkflowForTask(env, String(task.id));
    }
  }
  const workflowRows = await env.DB.prepare(
    `
      SELECT workflow_instances.task_id as taskId,
             workflow_instances.id as workflowInstanceId,
             workflow_instances.status as workflowStatus,
             workflow_instances.current_node_id as workflowCurrentNodeId,
             workflow_instance_nodes.node_name as workflowCurrentNodeName,
             workflow_instance_nodes.status as workflowCurrentNodeStatus,
             workflow_instance_nodes.owner as workflowCurrentNodeOwner,
             workflow_instance_nodes.owner_role_name as workflowCurrentNodeOwnerRoleName
      FROM workflow_instances
      LEFT JOIN workflow_instance_nodes ON workflow_instance_nodes.id = workflow_instances.current_node_id
    `,
  ).all();
  const workflowNodeRows = await env.DB.prepare(
    `
      SELECT workflow_instance_nodes.id, workflow_instance_nodes.instance_id as instanceId,
             workflow_instance_nodes.task_id as taskId, workflow_instance_nodes.project_id as projectId,
             workflow_instance_nodes.template_node_id as templateNodeId,
             workflow_instance_nodes.node_name as nodeName, workflow_instance_nodes.sort_order as sortOrder,
             workflow_instance_nodes.node_type as nodeType, workflow_instance_nodes.owner,
             workflow_instance_nodes.owner_role_id as ownerRoleId, workflow_instance_nodes.owner_role_name as ownerRoleName,
             workflow_instance_nodes.status, workflow_instance_nodes.timeout_at as timeoutAt,
             workflow_instance_nodes.require_supplier as requireSupplier, workflow_instance_nodes.supplier_types as supplierTypes,
             workflow_instance_nodes.require_vehicle as requireVehicle, workflow_instance_nodes.require_driver as requireDriver,
             workflow_instance_nodes.require_gps as requireGps,
             workflow_instance_nodes.gps_provider_id as gpsProviderId,
             gps_providers.short_name as gpsProviderShortName,
             gps_providers.name as gpsProviderName,
             workflow_instance_nodes.gps_device_no as gpsDeviceNo,
             workflow_instance_nodes.supplier_id as supplierId, workflow_instance_nodes.supplier_name as supplierName,
             workflow_instance_nodes.supplier_type as supplierType, workflow_instance_nodes.supplier_vehicle_id as supplierVehicleId,
             workflow_instance_nodes.vehicle_plate_no as vehiclePlateNo, workflow_instance_nodes.supplier_driver_id as supplierDriverId,
             workflow_instance_nodes.driver_name as driverName, workflow_instance_nodes.driver_phone as driverPhone,
             workflow_instance_nodes.service_cost as serviceCost, workflow_instance_nodes.service_currency as serviceCurrency,
             workflow_instance_nodes.service_exchange_rate as serviceExchangeRate, workflow_instance_nodes.service_remark as serviceRemark,
             workflow_instance_nodes.planned_start_at as plannedStartAt, workflow_instance_nodes.planned_end_at as plannedEndAt,
             workflow_instance_nodes.planned_duration_hours as plannedDurationHours,
             workflow_instance_nodes.warning_before_hours as warningBeforeHours,
             workflow_instance_nodes.schedule_remark as scheduleRemark,
             workflow_instance_nodes.schedule_updated_at as scheduleUpdatedAt,
             workflow_instance_nodes.started_at as startedAt, workflow_instance_nodes.completed_at as completedAt,
             workflow_instance_nodes.notes
      FROM workflow_instance_nodes
      LEFT JOIN gps_providers ON gps_providers.id = workflow_instance_nodes.gps_provider_id
      ORDER BY workflow_instance_nodes.sort_order ASC
    `,
  ).all();

  return enrichOversizeProjects(
    (projectRows.results as Array<Record<string, unknown>>).map(mapOversizeProject),
    (taskRows.results as Array<Record<string, unknown>>).map(mapOversizeTask),
    (nodeRows.results as Array<Record<string, unknown>>).map(mapOversizeNode),
    (todoRows.results as Array<Record<string, unknown>>).map(mapOversizeTodo),
    (exceptionRows.results as Array<Record<string, unknown>>).map(mapOversizeException),
    workflowRows.results as Array<Record<string, unknown>>,
    (workflowNodeRows.results as Array<Record<string, unknown>>).map(mapWorkflowInstanceNode),
  );
}

async function createOversizeProject(env: Env, body: OversizeProjectPayload) {
  const name = ensureString(body.name);
  const origin = ensureString(body.origin);
  const destination = ensureString(body.destination);
  if (!name || !origin || !destination) {
    return { error: '项目名称、起运地和目的地不能为空。' };
  }

  let customerName = ensureString(body.customerName);
  const customerId = ensureString(body.customerId) || null;
  if (customerId) {
    const customer = await env.DB.prepare('SELECT name FROM customers WHERE id = ?').bind(customerId).first<{ name: string }>();
    customerName = customer?.name ?? customerName;
  }

  const id = createId('osp');
  const now = isoNow();
  const workflowTemplateId = ensureString(body.workflowTemplateId) || 'wft_oversize_standard';
  const workflowNodeIds = uniqueStrings(body.workflowNodeIds ?? []);
  await env.DB.prepare(
    `
      INSERT INTO oversize_projects (
        id, project_no, name, customer_id, customer_name, origin, destination, start_date, end_date,
        manager, status, service_scope, workflow_template_id, workflow_node_ids, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      businessNo('PROJ'),
      name,
      customerId,
      customerName,
      origin,
      destination,
      ensureString(body.startDate) || null,
      ensureString(body.endDate) || null,
      ensureString(body.manager),
      ensureString(body.status) || '待启动',
      normalizeServiceScope(body.serviceScope),
      workflowTemplateId,
      JSON.stringify(workflowNodeIds),
      ensureString(body.notes),
      now,
      now,
    )
    .run();

  await recordActivity(env, '创建大件项目', `创建项目 ${name}。`);
  const vehicleCount = Math.max(0, Math.min(200, toInteger(body.vehicleCount) ?? 0));
  for (let index = 0; index < vehicleCount; index += 1) {
    await createOversizeTask(env, id, {
      vehicleNo: `车辆${index + 1}`,
      status: '待发运',
      progress: 0,
    });
  }
  return { id };
}

async function updateOversizeProject(env: Env, projectId: string, body: OversizeProjectPayload) {
  const name = ensureString(body.name);
  const origin = ensureString(body.origin);
  const destination = ensureString(body.destination);
  if (!name || !origin || !destination) {
    return { error: '项目名称、起运地和目的地不能为空。' };
  }
  const existing = await env.DB.prepare('SELECT id FROM oversize_projects WHERE id = ?').bind(projectId).first();
  if (!existing) return { error: '项目不存在。' };

  let customerName = ensureString(body.customerName);
  const customerId = ensureString(body.customerId) || null;
  if (customerId) {
    const customer = await env.DB.prepare('SELECT name FROM customers WHERE id = ?').bind(customerId).first<{ name: string }>();
    customerName = customer?.name ?? customerName;
  }

  await env.DB.prepare(
    `
      UPDATE oversize_projects
      SET name = ?, customer_id = ?, customer_name = ?, origin = ?, destination = ?, start_date = ?, end_date = ?,
          manager = ?, status = ?, service_scope = ?, workflow_template_id = ?, workflow_node_ids = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      name,
      customerId,
      customerName,
      origin,
      destination,
      ensureString(body.startDate) || null,
      ensureString(body.endDate) || null,
      ensureString(body.manager),
      ensureString(body.status) || '待启动',
      normalizeServiceScope(body.serviceScope),
      ensureString(body.workflowTemplateId) || 'wft_oversize_standard',
      JSON.stringify(uniqueStrings(body.workflowNodeIds ?? [])),
      ensureString(body.notes),
      isoNow(),
      projectId,
    )
    .run();

  return { ok: true };
}

async function deleteOversizeProject(env: Env, projectId: string) {
  const project = await env.DB.prepare('SELECT project_no as projectNo, name FROM oversize_projects WHERE id = ?')
    .bind(projectId)
    .first<{ projectNo: string; name: string }>();
  if (!project) return { error: '项目不存在。' };

  const taskRows = await env.DB.prepare('SELECT id FROM oversize_project_tasks WHERE project_id = ?')
    .bind(projectId)
    .all<{ id: string }>();
  const taskIds = uniqueStrings(taskRows.results.map((item) => item.id));

  const instanceRows = await env.DB.prepare('SELECT id FROM workflow_instances WHERE project_id = ?')
    .bind(projectId)
    .all<{ id: string }>();
  const instanceIds = uniqueStrings(instanceRows.results.map((item) => item.id));

  const instanceNodeRows = await env.DB.prepare('SELECT id FROM workflow_instance_nodes WHERE project_id = ?')
    .bind(projectId)
    .all<{ id: string }>();
  const instanceNodeIds = uniqueStrings(instanceNodeRows.results.map((item) => item.id));

  const financeFilters = ['project_id = ?'];
  const financeBinds: unknown[] = [projectId];
  if (taskIds.length) {
    financeFilters.push(`task_id IN (${taskIds.map(() => '?').join(',')})`);
    financeBinds.push(...taskIds);
  }
  if (instanceNodeIds.length) {
    financeFilters.push(`workflow_instance_node_id IN (${instanceNodeIds.map(() => '?').join(',')})`);
    financeBinds.push(...instanceNodeIds);
  }
  const financeRows = await env.DB.prepare(`SELECT id FROM finance_items WHERE ${financeFilters.join(' OR ')}`)
    .bind(...financeBinds)
    .all<{ id: string }>();
  const financeItemIds = uniqueStrings(financeRows.results.map((item) => item.id));

  await deleteRowsByIds(env, 'workflow_node_form_values', 'instance_node_id', instanceNodeIds);
  await deleteRowsByIds(env, 'workflow_node_files', 'instance_node_id', instanceNodeIds);
  await deleteRowsByIds(env, 'workflow_node_tracking_records', 'instance_node_id', instanceNodeIds);
  await env.DB.prepare('DELETE FROM workflow_node_tracking_records WHERE project_id = ?').bind(projectId).run();
  await deleteRowsByIds(env, 'workflow_transitions', 'instance_id', instanceIds);
  await deleteRowsByIds(env, 'workflow_transitions', 'task_id', taskIds);
  await env.DB.prepare('DELETE FROM workflow_transitions WHERE project_id = ?').bind(projectId).run();
  await deleteRowsByIds(env, 'workflow_todos', 'instance_id', instanceIds);
  await deleteRowsByIds(env, 'workflow_todos', 'task_id', taskIds);
  await env.DB.prepare('DELETE FROM workflow_todos WHERE project_id = ?').bind(projectId).run();

  await deleteRowsByIds(env, 'finance_bill_items', 'item_id', financeItemIds);
  await deleteRowsByIds(env, 'finance_payment_request_items', 'item_id', financeItemIds);
  await deleteRowsByIds(env, 'finance_items', 'id', financeItemIds);

  await env.DB.prepare('DELETE FROM oversize_project_todos WHERE project_id = ?').bind(projectId).run();
  await env.DB.prepare('DELETE FROM oversize_project_exceptions WHERE project_id = ?').bind(projectId).run();
  await env.DB.prepare('DELETE FROM oversize_task_nodes WHERE project_id = ?').bind(projectId).run();
  await deleteRowsByIds(env, 'workflow_instance_nodes', 'id', instanceNodeIds);
  await deleteRowsByIds(env, 'workflow_instances', 'id', instanceIds);
  await env.DB.prepare('DELETE FROM oversize_project_tasks WHERE project_id = ?').bind(projectId).run();
  await env.DB.prepare('DELETE FROM oversize_projects WHERE id = ?').bind(projectId).run();
  await recordActivity(env, '删除大件项目', `${project.projectNo} ${project.name}`);
  return { ok: true };
}

async function createOversizeTaskNodes(env: Env, projectId: string, taskId: string) {
  const project = await env.DB.prepare('SELECT service_scope as serviceScope, workflow_template_id as workflowTemplateId, workflow_node_ids as workflowNodeIds FROM oversize_projects WHERE id = ?')
    .bind(projectId)
    .first<{ serviceScope: string | null; workflowTemplateId?: string | null; workflowNodeIds?: string | null }>();
  let nodes = jsonArray<string>(project?.serviceScope, oversizeDefaultNodeNames);
  const selectedNodeIds = jsonArray<string>(project?.workflowNodeIds, []);
  if (project?.workflowTemplateId && selectedNodeIds.length) {
    const workflowNodes = await env.DB.prepare(
      `SELECT node_name as nodeName FROM workflow_template_nodes WHERE template_id = ? AND id IN (${selectedNodeIds.map(() => '?').join(',')}) ORDER BY sort_order ASC`,
    )
      .bind(project.workflowTemplateId, ...selectedNodeIds)
      .all<{ nodeName: string }>();
    nodes = workflowNodes.results.map((item) => item.nodeName);
  }
  const now = isoNow();
  for (const [index, nodeName] of nodes.entries()) {
    await env.DB.prepare(
      `
        INSERT INTO oversize_task_nodes (
          id, project_id, task_id, node_name, sort_order, status, files, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(createId('osn'), projectId, taskId, nodeName, index + 1, '未开始', '[]', now, now)
      .run();
  }
}

async function createOversizeTask(env: Env, projectId: string, body: OversizeTaskPayload) {
  const project = await env.DB.prepare('SELECT id FROM oversize_projects WHERE id = ?').bind(projectId).first();
  if (!project) return { error: '项目不存在。' };
  const id = createId('ost');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO oversize_project_tasks (
        id, project_id, task_no, vehicle_no, vehicle_type, driver_name, driver_phone, cargo_summary,
        planned_departure_date, status, progress, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      projectId,
      businessNo('TASK'),
      ensureString(body.vehicleNo),
      ensureString(body.vehicleType),
      ensureString(body.driverName),
      ensureString(body.driverPhone),
      ensureString(body.cargoSummary),
      ensureString(body.plannedDepartureDate) || null,
      ensureString(body.status) || '待发运',
      toInteger(body.progress) ?? 0,
      ensureString(body.notes),
      now,
      now,
    )
    .run();
  await createOversizeTaskNodes(env, projectId, id);
  await startWorkflowForTask(env, id);
  await env.DB.prepare('UPDATE oversize_projects SET updated_at = ? WHERE id = ?').bind(isoNow(), projectId).run();
  return { id };
}

async function updateOversizeTask(env: Env, taskId: string, body: OversizeTaskPayload) {
  const existing = await env.DB.prepare('SELECT project_id as projectId, status FROM oversize_project_tasks WHERE id = ?')
    .bind(taskId)
    .first<{ projectId: string; status: string }>();
  if (!existing) return { error: '车次任务不存在。' };
  if (existing.status === '已完成' || existing.status === '完成') return { error: '运输任务已完成，不能再编辑。' };
  await env.DB.prepare(
    `
      UPDATE oversize_project_tasks
      SET vehicle_no = ?, vehicle_type = ?, driver_name = ?, driver_phone = ?, cargo_summary = ?,
          planned_departure_date = ?, status = ?, progress = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      ensureString(body.vehicleNo),
      ensureString(body.vehicleType),
      ensureString(body.driverName),
      ensureString(body.driverPhone),
      ensureString(body.cargoSummary),
      ensureString(body.plannedDepartureDate) || null,
      ensureString(body.status) || '待发运',
      toInteger(body.progress) ?? 0,
      ensureString(body.notes),
      isoNow(),
      taskId,
    )
    .run();
  await env.DB.prepare('UPDATE oversize_projects SET updated_at = ? WHERE id = ?').bind(isoNow(), existing.projectId).run();
  return { ok: true };
}

async function deleteOversizeTask(env: Env, taskId: string) {
  const existing = await env.DB.prepare('SELECT project_id as projectId, status FROM oversize_project_tasks WHERE id = ?')
    .bind(taskId)
    .first<{ projectId: string; status: string }>();
  if (existing && (existing.status === '已完成' || existing.status === '完成')) return { error: '运输任务已完成，不能再操作。' };
  await env.DB.prepare('DELETE FROM oversize_project_tasks WHERE id = ?').bind(taskId).run();
  if (existing) {
    await env.DB.prepare('UPDATE oversize_projects SET updated_at = ? WHERE id = ?').bind(isoNow(), existing.projectId).run();
  }
  return { ok: true };
}

function financeAmountCny(amount: unknown, exchangeRate: unknown) {
  const parsedAmount = toNumber(amount) ?? 0;
  const parsedRate = toNumber(exchangeRate) ?? 1;
  return Number((parsedAmount * parsedRate).toFixed(2));
}

function mapFinanceItem(row: Record<string, unknown>) {
  return {
    ...row,
    amount: Number(row.amount ?? 0),
    exchangeRate: Number(row.exchangeRate ?? 1),
    amountCny: Number(row.amountCny ?? 0),
    files: jsonArray(row.filesJson as string | null, []),
  };
}

async function listFinanceItems(env: Env, params: URLSearchParams) {
  const filters: string[] = [];
  const binds: unknown[] = [];
  const direction = ensureString(params.get('direction'));
  const status = ensureString(params.get('status'));
  const taskId = ensureString(params.get('taskId'));
  const projectId = ensureString(params.get('projectId'));
  const keyword = ensureString(params.get('keyword')).toLowerCase();
  if (direction) {
    filters.push('finance_items.direction = ?');
    binds.push(direction);
  }
  if (status) {
    filters.push('finance_items.status = ?');
    binds.push(status);
  }
  if (taskId) {
    filters.push('finance_items.task_id = ?');
    binds.push(taskId);
  }
  if (projectId) {
    filters.push('finance_items.project_id = ?');
    binds.push(projectId);
  }
  if (keyword) {
    filters.push(
      `(lower(finance_items.item_no) LIKE ? OR lower(finance_items.fee_name) LIKE ? OR lower(COALESCE(oversize_project_tasks.task_no, '')) LIKE ? OR lower(COALESCE(oversize_projects.name, '')) LIKE ? OR lower(COALESCE(finance_items.customer_name, '')) LIKE ? OR lower(COALESCE(finance_items.supplier_name, '')) LIKE ?)`,
    );
    const like = `%${keyword}%`;
    binds.push(like, like, like, like, like, like);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const rows = await env.DB.prepare(
    `
      SELECT
        finance_items.id,
        finance_items.item_no as itemNo,
        finance_items.direction,
        finance_items.project_id as projectId,
        finance_items.task_id as taskId,
        finance_items.customer_id as customerId,
        finance_items.customer_name as customerName,
        finance_items.supplier_id as supplierId,
        finance_items.supplier_name as supplierName,
        finance_items.fee_name as feeName,
        finance_items.currency,
        finance_items.amount,
        finance_items.exchange_rate as exchangeRate,
        finance_items.amount_cny as amountCny,
        finance_items.status,
        finance_items.source_type as sourceType,
        finance_items.occurrence_stage as occurrenceStage,
        finance_items.bill_id as billId,
        finance_items.payment_request_id as paymentRequestId,
        finance_items.workflow_instance_node_id as workflowInstanceNodeId,
        finance_items.voucher_files_json as filesJson,
        finance_items.confirmed_at as confirmedAt,
        finance_items.notes,
        finance_items.created_at as createdAt,
        finance_items.updated_at as updatedAt,
        oversize_projects.project_no as projectNo,
        oversize_projects.name as projectName,
        oversize_project_tasks.task_no as taskNo
      FROM finance_items
      LEFT JOIN oversize_projects ON oversize_projects.id = finance_items.project_id
      LEFT JOIN oversize_project_tasks ON oversize_project_tasks.id = finance_items.task_id
      ${where}
      ORDER BY finance_items.updated_at DESC, finance_items.created_at DESC
    `,
  )
    .bind(...binds)
    .all();
  return (rows.results as Array<Record<string, unknown>>).map(mapFinanceItem);
}

async function createFinanceItem(env: Env, body: FinanceItemPayload) {
  const direction = body.direction === 'payable' ? 'payable' : 'receivable';
  const feeName = ensureString(body.feeName);
  if (!feeName) return { error: '费用名称不能为空。' };
  const amount = toNumber(body.amount);
  if (amount === null || amount <= 0) return { error: '金额必须大于0。' };
  const exchangeRate = toNumber(body.exchangeRate) ?? 1;
  if (exchangeRate <= 0) return { error: '汇率必须大于0。' };

  const projectId = ensureString(body.projectId) || null;
  const taskId = ensureString(body.taskId) || null;
  let workflowInstanceNodeId = ensureString(body.workflowInstanceNodeId) || null;
  let customerId = ensureString(body.customerId) || null;
  let customerName = ensureString(body.customerName);
  let supplierId = ensureString(body.supplierId) || null;
  let supplierName = ensureString(body.supplierName);
  if (taskId) {
    const task = await env.DB.prepare(
      `
        SELECT oversize_project_tasks.project_id as projectId, oversize_projects.customer_id as customerId,
               oversize_projects.customer_name as customerName
        FROM oversize_project_tasks
        JOIN oversize_projects ON oversize_projects.id = oversize_project_tasks.project_id
        WHERE oversize_project_tasks.id = ?
      `,
    )
      .bind(taskId)
      .first<{ projectId: string; customerId: string | null; customerName: string | null }>();
    if (task) {
      customerId = customerId || task.customerId || null;
      customerName = customerName || task.customerName || '';
    }
  }
  if (customerId && !customerName) {
    const customer = await env.DB.prepare('SELECT name FROM customers WHERE id = ?').bind(customerId).first<{ name: string }>();
    customerName = customer?.name ?? '';
  }
  if (supplierId) {
    const supplier = await env.DB.prepare('SELECT name FROM suppliers WHERE id = ?').bind(supplierId).first<{ name: string }>();
    supplierName = supplier?.name ?? supplierName;
  }
  if (workflowInstanceNodeId) {
    const node = await env.DB.prepare('SELECT node_name as nodeName, supplier_id as supplierId, supplier_name as supplierName FROM workflow_instance_nodes WHERE id = ?')
      .bind(workflowInstanceNodeId)
      .first<{ nodeName: string; supplierId?: string | null; supplierName?: string | null }>();
    if (node) {
      supplierId = supplierId || node.supplierId || null;
      supplierName = supplierName || node.supplierName || '';
    } else {
      workflowInstanceNodeId = null;
    }
  }

  const now = isoNow();
  const status = ensureString(body.status) || 'draft';
  const id = createId('fin');
  await env.DB.prepare(
    `
      INSERT INTO finance_items (
        id, item_no, direction, project_id, task_id, customer_id, customer_name, supplier_id, supplier_name,
        fee_name, currency, amount, exchange_rate, amount_cny, status, source_type, occurrence_stage,
        workflow_instance_node_id, voucher_files_json, confirmed_at, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      businessNo(direction === 'payable' ? 'PAY' : 'REC'),
      direction,
      projectId,
      taskId,
      customerId,
      customerName,
      supplierId,
      supplierName,
      feeName,
      ensureString(body.currency) || 'CNY',
      amount,
      exchangeRate,
      financeAmountCny(amount, exchangeRate),
      status,
      ensureString(body.sourceType) || 'manual',
      ensureString(body.occurrenceStage),
      workflowInstanceNodeId,
      normalizeFiles(body.files),
      status === 'confirmed' ? now : null,
      ensureString(body.notes),
      now,
      now,
    )
    .run();
  return { id };
}

async function updateFinanceItem(env: Env, itemId: string, body: FinanceItemPayload) {
  const existing = await env.DB.prepare('SELECT id, bill_id as billId, payment_request_id as paymentRequestId FROM finance_items WHERE id = ?')
    .bind(itemId)
    .first<{ id: string; billId?: string | null; paymentRequestId?: string | null }>();
  if (!existing) return { error: '费用记录不存在。' };
  if (existing.billId || existing.paymentRequestId) return { error: '已进入账单或付款申请的费用不能直接修改。' };
  const direction = body.direction === 'payable' ? 'payable' : 'receivable';
  const feeName = ensureString(body.feeName);
  if (!feeName) return { error: '费用名称不能为空。' };
  const amount = toNumber(body.amount);
  if (amount === null || amount <= 0) return { error: '金额必须大于0。' };
  const exchangeRate = toNumber(body.exchangeRate) ?? 1;
  if (exchangeRate <= 0) return { error: '汇率必须大于0。' };
  const status = ensureString(body.status) || 'draft';
  const now = isoNow();
  await env.DB.prepare(
    `
      UPDATE finance_items
      SET direction = ?, project_id = ?, task_id = ?, customer_id = ?, customer_name = ?, supplier_id = ?,
          supplier_name = ?, fee_name = ?, currency = ?, amount = ?, exchange_rate = ?, amount_cny = ?,
          status = ?, source_type = ?, occurrence_stage = ?, workflow_instance_node_id = ?, voucher_files_json = ?,
          confirmed_at = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      direction,
      ensureString(body.projectId) || null,
      ensureString(body.taskId) || null,
      ensureString(body.customerId) || null,
      ensureString(body.customerName),
      ensureString(body.supplierId) || null,
      ensureString(body.supplierName),
      feeName,
      ensureString(body.currency) || 'CNY',
      amount,
      exchangeRate,
      financeAmountCny(amount, exchangeRate),
      status,
      ensureString(body.sourceType) || 'manual',
      ensureString(body.occurrenceStage),
      ensureString(body.workflowInstanceNodeId) || null,
      normalizeFiles(body.files),
      status === 'confirmed' ? now : null,
      ensureString(body.notes),
      now,
      itemId,
    )
    .run();
  return { ok: true };
}

async function deleteFinanceItem(env: Env, itemId: string) {
  const existing = await env.DB.prepare('SELECT bill_id as billId, payment_request_id as paymentRequestId FROM finance_items WHERE id = ?')
    .bind(itemId)
    .first<{ billId?: string | null; paymentRequestId?: string | null }>();
  if (existing?.billId || existing?.paymentRequestId) return { error: '已进入账单或付款申请的费用不能删除。' };
  await env.DB.prepare('DELETE FROM finance_items WHERE id = ?').bind(itemId).run();
  return { ok: true };
}

async function listFinanceBills(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT id, bill_no as billNo, customer_id as customerId, customer_name as customerName, title,
             currency, total_amount as totalAmount, total_amount_cny as totalAmountCny, status,
             confirmed_at as confirmedAt, notes, created_at as createdAt, updated_at as updatedAt
      FROM finance_bills
      ORDER BY updated_at DESC, created_at DESC
    `,
  ).all();
  const bills = rows.results as Array<Record<string, unknown>>;
  for (const bill of bills) {
    const itemRows = await env.DB.prepare(
      `
        SELECT finance_items.item_no as itemNo, finance_items.fee_name as feeName, finance_items.amount,
               finance_items.currency, finance_items.amount_cny as amountCny, oversize_project_tasks.task_no as taskNo
        FROM finance_bill_items
        JOIN finance_items ON finance_items.id = finance_bill_items.item_id
        LEFT JOIN oversize_project_tasks ON oversize_project_tasks.id = finance_items.task_id
        WHERE finance_bill_items.bill_id = ?
        ORDER BY finance_items.created_at ASC
      `,
    )
      .bind(String(bill.id))
      .all();
    bill.items = itemRows.results.map(mapFinanceItem);
    bill.totalAmount = Number(bill.totalAmount ?? 0);
    bill.totalAmountCny = Number(bill.totalAmountCny ?? 0);
  }
  return bills;
}

async function createFinanceBill(env: Env, body: FinanceBillPayload) {
  const itemIds = uniqueStrings(body.itemIds ?? []);
  const title = ensureString(body.title);
  if (!title) return { error: '账单标题不能为空。' };
  if (!itemIds.length) return { error: '请至少选择一条应收费用。' };
  const rows = await env.DB.prepare(
    `SELECT * FROM finance_items WHERE direction = 'receivable' AND id IN (${itemIds.map(() => '?').join(',')})`,
  )
    .bind(...itemIds)
    .all<Record<string, unknown>>();
  if (rows.results.length !== itemIds.length) return { error: '选择的应收费用不存在。' };
  if (rows.results.some((item) => item.bill_id)) return { error: '存在已出账单的费用。' };
  const customerId = ensureString(body.customerId) || String(rows.results[0].customer_id ?? '') || null;
  const customerName = ensureString(body.customerName) || String(rows.results[0].customer_name ?? '');
  const totalAmountCny = rows.results.reduce((sum, item) => sum + Number(item.amount_cny ?? 0), 0);
  const totalAmount = rows.results.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
  const now = isoNow();
  const status = ensureString(body.status) || 'confirmed';
  const id = createId('fbill');
  await env.DB.prepare(
    `
      INSERT INTO finance_bills (
        id, bill_no, customer_id, customer_name, title, currency, total_amount, total_amount_cny,
        status, confirmed_at, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(id, businessNo('BILL'), customerId, customerName, title, 'CNY', totalAmount, totalAmountCny, status, status === 'confirmed' ? now : null, ensureString(body.notes), now, now)
    .run();
  for (const itemId of itemIds) {
    await env.DB.prepare('INSERT INTO finance_bill_items (bill_id, item_id, created_at) VALUES (?, ?, ?)').bind(id, itemId, now).run();
    await env.DB.prepare('UPDATE finance_items SET bill_id = ?, status = ?, updated_at = ? WHERE id = ?').bind(id, 'billed', now, itemId).run();
  }
  return { id };
}

async function updateFinanceBill(env: Env, billId: string, body: FinanceBillPayload) {
  const status = ensureString(body.status);
  const existing = await env.DB.prepare('SELECT id FROM finance_bills WHERE id = ?').bind(billId).first<{ id: string }>();
  if (!existing) return { error: '客户账单不存在。' };
  const now = isoNow();
  await env.DB.prepare(
    `
      UPDATE finance_bills
      SET status = COALESCE(NULLIF(?, ''), status),
          notes = COALESCE(NULLIF(?, ''), notes),
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(status, ensureString(body.notes), now, billId)
    .run();
  if (status === 'partial_received' || status === 'received') {
    await env.DB.prepare(
      `
        UPDATE finance_items
        SET status = ?, updated_at = ?
        WHERE id IN (SELECT item_id FROM finance_bill_items WHERE bill_id = ?)
      `,
    )
      .bind(status, now, billId)
      .run();
  }
  return { ok: true };
}

async function syncWorkflowNodePayable(env: Env, nodeId: string) {
  const node = await env.DB.prepare(
    `
      SELECT id, project_id as projectId, task_id as taskId, node_name as nodeName,
             supplier_id as supplierId, supplier_name as supplierName, service_cost as serviceCost,
             service_currency as serviceCurrency, service_exchange_rate as serviceExchangeRate, service_remark as serviceRemark
      FROM workflow_instance_nodes
      WHERE id = ?
    `,
  )
    .bind(nodeId)
    .first<{
      id: string;
      projectId: string;
      taskId: string;
      nodeName: string;
      supplierId?: string | null;
      supplierName?: string | null;
      serviceCost?: number | null;
      serviceCurrency?: string | null;
      serviceExchangeRate?: number | null;
      serviceRemark?: string | null;
    }>();
  if (!node || !node.supplierId || !node.serviceCost || Number(node.serviceCost) <= 0) return;
  const now = isoNow();
  const existing = await env.DB.prepare('SELECT id, payment_request_id as paymentRequestId FROM finance_items WHERE workflow_instance_node_id = ?')
    .bind(nodeId)
    .first<{ id: string; paymentRequestId?: string | null }>();
  if (existing?.paymentRequestId) return;
  const amount = Number(node.serviceCost);
  const currency = node.serviceCurrency || 'CNY';
  const exchangeRate = Number(node.serviceExchangeRate || 1);
  if (existing) {
    await env.DB.prepare(
      `
        UPDATE finance_items
        SET project_id = ?, task_id = ?, supplier_id = ?, supplier_name = ?, fee_name = ?,
            currency = ?, amount = ?, exchange_rate = ?, amount_cny = ?, status = ?,
            source_type = ?, occurrence_stage = ?, confirmed_at = ?, notes = ?, updated_at = ?
        WHERE id = ?
      `,
    )
      .bind(
        node.projectId,
        node.taskId,
        node.supplierId,
        node.supplierName || '',
        `${node.nodeName}服务费`,
        currency,
        amount,
        exchangeRate,
        financeAmountCny(amount, exchangeRate),
        'confirmed',
        'workflow',
        node.nodeName,
        now,
        node.serviceRemark || '',
        now,
        existing.id,
      )
      .run();
    return;
  }
  await env.DB.prepare(
    `
      INSERT INTO finance_items (
        id, item_no, direction, project_id, task_id, supplier_id, supplier_name, fee_name,
        currency, amount, exchange_rate, amount_cny, status, source_type, occurrence_stage,
        workflow_instance_node_id, confirmed_at, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      createId('fin'),
      businessNo('PAY'),
      'payable',
      node.projectId,
      node.taskId,
      node.supplierId,
      node.supplierName || '',
      `${node.nodeName}服务费`,
      currency,
      amount,
      exchangeRate,
      financeAmountCny(amount, exchangeRate),
      'confirmed',
      'workflow',
      node.nodeName,
      nodeId,
      now,
      node.serviceRemark || '',
      now,
      now,
    )
    .run();
}

async function listFinancePaymentRequests(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT id, request_no as requestNo, supplier_id as supplierId, supplier_name as supplierName, title,
             total_amount_cny as totalAmountCny, status, submitted_at as submittedAt, approved_at as approvedAt,
             paid_at as paidAt, notes, created_at as createdAt, updated_at as updatedAt
      FROM finance_payment_requests
      ORDER BY updated_at DESC, created_at DESC
    `,
  ).all();
  const requests = rows.results as Array<Record<string, unknown>>;
  for (const request of requests) {
    const itemRows = await env.DB.prepare(
      `
        SELECT finance_items.item_no as itemNo, finance_items.fee_name as feeName, finance_items.amount,
               finance_items.currency, finance_items.amount_cny as amountCny, oversize_project_tasks.task_no as taskNo
        FROM finance_payment_request_items
        JOIN finance_items ON finance_items.id = finance_payment_request_items.item_id
        LEFT JOIN oversize_project_tasks ON oversize_project_tasks.id = finance_items.task_id
        WHERE finance_payment_request_items.request_id = ?
        ORDER BY finance_items.created_at ASC
      `,
    )
      .bind(String(request.id))
      .all();
    request.items = itemRows.results.map(mapFinanceItem);
    request.totalAmountCny = Number(request.totalAmountCny ?? 0);
  }
  return requests;
}

async function createFinancePaymentRequest(env: Env, body: FinancePaymentRequestPayload) {
  const itemIds = uniqueStrings(body.itemIds ?? []);
  const title = ensureString(body.title);
  if (!title) return { error: '付款申请标题不能为空。' };
  if (!itemIds.length) return { error: '请至少选择一条应付费用。' };
  const rows = await env.DB.prepare(
    `SELECT * FROM finance_items WHERE direction = 'payable' AND id IN (${itemIds.map(() => '?').join(',')})`,
  )
    .bind(...itemIds)
    .all<Record<string, unknown>>();
  if (rows.results.length !== itemIds.length) return { error: '选择的应付费用不存在。' };
  if (rows.results.some((item) => item.payment_request_id)) return { error: '存在已申请付款的费用。' };
  const supplierId = ensureString(body.supplierId) || String(rows.results[0].supplier_id ?? '') || null;
  const supplierName = ensureString(body.supplierName) || String(rows.results[0].supplier_name ?? '');
  const totalAmountCny = rows.results.reduce((sum, item) => sum + Number(item.amount_cny ?? 0), 0);
  const now = isoNow();
  const status = ensureString(body.status) || 'submitted';
  const id = createId('fpay');
  await env.DB.prepare(
    `
      INSERT INTO finance_payment_requests (
        id, request_no, supplier_id, supplier_name, title, total_amount_cny, status,
        submitted_at, approved_at, paid_at, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(id, businessNo('FPR'), supplierId, supplierName, title, totalAmountCny, status, now, status === 'approved' ? now : null, status === 'paid' ? now : null, ensureString(body.notes), now, now)
    .run();
  for (const itemId of itemIds) {
    await env.DB.prepare('INSERT INTO finance_payment_request_items (request_id, item_id, created_at) VALUES (?, ?, ?)').bind(id, itemId, now).run();
    await env.DB.prepare('UPDATE finance_items SET payment_request_id = ?, status = ?, updated_at = ? WHERE id = ?').bind(id, 'payment_applied', now, itemId).run();
  }
  return { id };
}

async function updateFinancePaymentRequest(env: Env, requestId: string, body: FinancePaymentRequestPayload) {
  const status = ensureString(body.status);
  const existing = await env.DB.prepare('SELECT id FROM finance_payment_requests WHERE id = ?').bind(requestId).first<{ id: string }>();
  if (!existing) return { error: '付款申请不存在。' };
  const now = isoNow();
  await env.DB.prepare(
    `
      UPDATE finance_payment_requests
      SET status = COALESCE(NULLIF(?, ''), status),
          approved_at = CASE WHEN ? = 'approved' THEN ? ELSE approved_at END,
          paid_at = CASE WHEN ? = 'paid' THEN ? ELSE paid_at END,
          notes = COALESCE(NULLIF(?, ''), notes),
          updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(status, status, now, status, now, ensureString(body.notes), now, requestId)
    .run();
  if (status === 'paid') {
    await env.DB.prepare(
      `
        UPDATE finance_items
        SET status = 'paid', updated_at = ?
        WHERE id IN (SELECT item_id FROM finance_payment_request_items WHERE request_id = ?)
      `,
    )
      .bind(now, requestId)
      .run();
  }
  return { ok: true };
}

async function financeSummary(env: Env) {
  const row = await env.DB.prepare(
    `
      SELECT
        SUM(CASE WHEN direction = 'receivable' AND status IN ('confirmed', 'billed', 'partial_received', 'received') THEN amount_cny ELSE 0 END) as confirmedReceivable,
        SUM(CASE WHEN direction = 'payable' AND status IN ('confirmed', 'payment_applied', 'paid') THEN amount_cny ELSE 0 END) as confirmedPayable,
        SUM(CASE WHEN direction = 'receivable' AND status IN ('billed', 'partial_received') THEN amount_cny ELSE 0 END) as unreceived,
        SUM(CASE WHEN direction = 'payable' AND status IN ('confirmed', 'payment_applied') THEN amount_cny ELSE 0 END) as unpaid
      FROM finance_items
    `,
  ).first<Record<string, unknown>>();
  const confirmedReceivable = Number(row?.confirmedReceivable ?? 0);
  const confirmedPayable = Number(row?.confirmedPayable ?? 0);
  return {
    confirmedReceivable,
    confirmedPayable,
    grossProfit: Number((confirmedReceivable - confirmedPayable).toFixed(2)),
    unreceived: Number(row?.unreceived ?? 0),
    unpaid: Number(row?.unpaid ?? 0),
  };
}

async function financeContext(env: Env) {
  const tasks = await env.DB.prepare(
    `
      SELECT oversize_project_tasks.id, oversize_project_tasks.task_no as taskNo,
             oversize_project_tasks.project_id as projectId, oversize_projects.project_no as projectNo,
             oversize_projects.name as projectName, oversize_projects.customer_id as customerId,
             oversize_projects.customer_name as customerName
      FROM oversize_project_tasks
      JOIN oversize_projects ON oversize_projects.id = oversize_project_tasks.project_id
      ORDER BY oversize_project_tasks.created_at DESC
    `,
  ).all();
  return {
    tasks: tasks.results,
    customers: await listCustomers(env),
    suppliers: await listSuppliers(env),
  };
}

async function updateOversizeNode(env: Env, nodeId: string, body: OversizeNodePayload) {
  const existing = await env.DB.prepare('SELECT project_id as projectId FROM oversize_task_nodes WHERE id = ?')
    .bind(nodeId)
    .first<{ projectId: string }>();
  if (!existing) return { error: '节点不存在。' };
  const status = ensureString(body.status) || '未开始';
  await env.DB.prepare(
    `
      UPDATE oversize_task_nodes
      SET status = ?, owner = ?, planned_date = ?, completed_at = ?, notes = ?, files = ?, updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      status,
      ensureString(body.owner),
      ensureString(body.plannedDate) || null,
      ensureString(body.completedAt) || (status === '已完成' ? isoNow() : null),
      ensureString(body.notes),
      normalizeFiles(body.files),
      isoNow(),
      nodeId,
    )
    .run();
  await env.DB.prepare('UPDATE oversize_projects SET updated_at = ? WHERE id = ?').bind(isoNow(), existing.projectId).run();
  return { ok: true };
}

async function createOversizeTodo(env: Env, projectId: string, body: OversizeTodoPayload) {
  const title = ensureString(body.title);
  if (!title) return { error: '待办标题不能为空。' };
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO oversize_project_todos (
        id, project_id, task_id, node_id, title, owner, due_date, status, priority, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      createId('ostd'),
      projectId,
      ensureString(body.taskId) || null,
      ensureString(body.nodeId) || null,
      title,
      ensureString(body.owner),
      ensureString(body.dueDate) || null,
      ensureString(body.status) || '待处理',
      ensureString(body.priority) || '普通',
      ensureString(body.notes),
      now,
      now,
    )
    .run();
  await env.DB.prepare('UPDATE oversize_projects SET updated_at = ? WHERE id = ?').bind(isoNow(), projectId).run();
  return { ok: true };
}

async function updateOversizeTodo(env: Env, todoId: string, body: OversizeTodoPayload) {
  const title = ensureString(body.title);
  if (!title) return { error: '待办标题不能为空。' };
  const existing = await env.DB.prepare('SELECT project_id as projectId FROM oversize_project_todos WHERE id = ?')
    .bind(todoId)
    .first<{ projectId: string }>();
  if (!existing) return { error: '待办不存在。' };
  await env.DB.prepare(
    `
      UPDATE oversize_project_todos
      SET task_id = ?, node_id = ?, title = ?, owner = ?, due_date = ?, status = ?, priority = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      ensureString(body.taskId) || null,
      ensureString(body.nodeId) || null,
      title,
      ensureString(body.owner),
      ensureString(body.dueDate) || null,
      ensureString(body.status) || '待处理',
      ensureString(body.priority) || '普通',
      ensureString(body.notes),
      isoNow(),
      todoId,
    )
    .run();
  await env.DB.prepare('UPDATE oversize_projects SET updated_at = ? WHERE id = ?').bind(isoNow(), existing.projectId).run();
  return { ok: true };
}

async function deleteOversizeTodo(env: Env, todoId: string) {
  await env.DB.prepare('DELETE FROM oversize_project_todos WHERE id = ?').bind(todoId).run();
  return { ok: true };
}

async function createOversizeException(env: Env, projectId: string, body: OversizeExceptionPayload) {
  const title = ensureString(body.title);
  if (!title) return { error: '异常标题不能为空。' };
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO oversize_project_exceptions (
        id, project_id, task_id, node_id, title, level, status, owner, description, resolution, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      createId('ose'),
      projectId,
      ensureString(body.taskId) || null,
      ensureString(body.nodeId) || null,
      title,
      ensureString(body.level) || '一般',
      ensureString(body.status) || '处理中',
      ensureString(body.owner),
      ensureString(body.description),
      ensureString(body.resolution),
      now,
      now,
    )
    .run();
  await env.DB.prepare('UPDATE oversize_projects SET status = ?, updated_at = ? WHERE id = ?').bind('异常', isoNow(), projectId).run();
  return { ok: true };
}

async function updateOversizeException(env: Env, exceptionId: string, body: OversizeExceptionPayload) {
  const title = ensureString(body.title);
  if (!title) return { error: '异常标题不能为空。' };
  const existing = await env.DB.prepare('SELECT project_id as projectId FROM oversize_project_exceptions WHERE id = ?')
    .bind(exceptionId)
    .first<{ projectId: string }>();
  if (!existing) return { error: '异常记录不存在。' };
  await env.DB.prepare(
    `
      UPDATE oversize_project_exceptions
      SET task_id = ?, node_id = ?, title = ?, level = ?, status = ?, owner = ?, description = ?, resolution = ?, updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      ensureString(body.taskId) || null,
      ensureString(body.nodeId) || null,
      title,
      ensureString(body.level) || '一般',
      ensureString(body.status) || '处理中',
      ensureString(body.owner),
      ensureString(body.description),
      ensureString(body.resolution),
      isoNow(),
      exceptionId,
    )
    .run();
  await env.DB.prepare('UPDATE oversize_projects SET updated_at = ? WHERE id = ?').bind(isoNow(), existing.projectId).run();
  return { ok: true };
}

async function deleteOversizeException(env: Env, exceptionId: string) {
  await env.DB.prepare('DELETE FROM oversize_project_exceptions WHERE id = ?').bind(exceptionId).run();
  return { ok: true };
}

function boolToInt(value: unknown, fallback = false) {
  return value === undefined || value === null ? (fallback ? 1 : 0) : value ? 1 : 0;
}

function mapWorkflowTemplateNode(row: Record<string, unknown>) {
  return {
    id: row.id,
    templateId: row.templateId,
    nodeName: row.nodeName,
    sortOrder: row.sortOrder,
    nodeType: row.nodeType,
    defaultOwner: row.defaultOwner,
    defaultRoleId: row.defaultRoleId,
    defaultRoleName: row.defaultRoleName,
    required: Boolean(row.required),
    allowSkip: Boolean(row.allowSkip),
    allowReturn: Boolean(row.allowReturn),
    requireCustomerConfirm: Boolean(row.requireCustomerConfirm),
    requireAttachment: Boolean(row.requireAttachment),
    requireSupplier: Boolean(row.requireSupplier),
    supplierTypes: jsonArray<string>(row.supplierTypes as string | null, []),
    requireVehicle: Boolean(row.requireVehicle),
    requireDriver: Boolean(row.requireDriver),
    requireGps: Boolean(row.requireGps),
    gpsProviderId: row.gpsProviderId,
    gpsProviderShortName: row.gpsProviderShortName,
    gpsProviderName: row.gpsProviderName,
    gpsDeviceNo: row.gpsDeviceNo,
    timeoutHours: row.timeoutHours,
    workingTimeRuleId: row.workingTimeRuleId,
    workingTimeRuleName: row.workingTimeRuleName,
    description: row.description,
    formFields: [] as Record<string, unknown>[],
    fileRequirements: [] as Record<string, unknown>[],
  };
}

function mapWorkflowInstanceNode(row: Record<string, unknown>) {
  return {
    id: row.id,
    instanceId: row.instanceId,
    taskId: row.taskId,
    projectId: row.projectId,
    templateNodeId: row.templateNodeId,
    nodeName: row.nodeName,
    sortOrder: row.sortOrder,
    nodeType: row.nodeType,
    owner: row.owner,
    ownerRoleId: row.ownerRoleId,
    ownerRoleName: row.ownerRoleName,
    status: row.status,
    required: Boolean(row.required),
    allowSkip: Boolean(row.allowSkip),
    allowReturn: Boolean(row.allowReturn),
    requireCustomerConfirm: Boolean(row.requireCustomerConfirm),
    requireSupplier: Boolean(row.requireSupplier),
    supplierTypes: jsonArray<string>(row.supplierTypes as string | null, []),
    requireVehicle: Boolean(row.requireVehicle),
    requireDriver: Boolean(row.requireDriver),
    requireGps: Boolean(row.requireGps),
    gpsProviderId: row.gpsProviderId,
    gpsProviderShortName: row.gpsProviderShortName,
    gpsProviderName: row.gpsProviderName,
    gpsDeviceNo: row.gpsDeviceNo,
    supplierId: row.supplierId,
    supplierName: row.supplierName,
    supplierType: row.supplierType,
    supplierVehicleId: row.supplierVehicleId,
    vehiclePlateNo: row.vehiclePlateNo,
    supplierDriverId: row.supplierDriverId,
    driverName: row.driverName,
    driverPhone: row.driverPhone,
    serviceCost: row.serviceCost,
    serviceCurrency: row.serviceCurrency,
    serviceExchangeRate: row.serviceExchangeRate,
    serviceRemark: row.serviceRemark,
    timeoutAt: row.timeoutAt,
    plannedStartAt: row.plannedStartAt,
    plannedEndAt: row.plannedEndAt,
    plannedDurationHours: row.plannedDurationHours,
    workingTimeRuleId: row.workingTimeRuleId,
    workingTimeRuleName: row.workingTimeRuleName,
    warningBeforeHours: row.warningBeforeHours,
    scheduleRemark: row.scheduleRemark,
    scheduleUpdatedAt: row.scheduleUpdatedAt,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    notes: row.notes,
    formFields: [] as Record<string, unknown>[],
    formValues: [] as Record<string, unknown>[],
    files: [] as Record<string, unknown>[],
    fileRequirements: [] as Record<string, unknown>[],
    trackingRecords: [] as Record<string, unknown>[],
  };
}

async function listWorkflowTemplates(env: Env) {
  const templates = await env.DB.prepare(
    `
      SELECT id, name, business_type as businessType, enabled, remark, created_by as createdBy,
             created_at as createdAt, updated_at as updatedAt
      FROM workflow_templates
      ORDER BY enabled DESC, updated_at DESC
    `,
  ).all();
  const nodes = await env.DB.prepare(
    `
      SELECT workflow_template_nodes.id as id,
             workflow_template_nodes.template_id as templateId,
             workflow_template_nodes.node_name as nodeName,
             workflow_template_nodes.sort_order as sortOrder,
             workflow_template_nodes.node_type as nodeType,
             workflow_template_nodes.default_owner as defaultOwner,
             workflow_template_nodes.default_role_id as defaultRoleId,
             workflow_template_nodes.default_role_name as defaultRoleName,
             workflow_template_nodes.required,
             workflow_template_nodes.allow_skip as allowSkip,
             workflow_template_nodes.allow_return as allowReturn,
             workflow_template_nodes.require_customer_confirm as requireCustomerConfirm,
             workflow_template_nodes.require_attachment as requireAttachment,
             workflow_template_nodes.require_supplier as requireSupplier,
             workflow_template_nodes.supplier_types as supplierTypes,
             workflow_template_nodes.require_vehicle as requireVehicle,
             workflow_template_nodes.require_driver as requireDriver,
             workflow_template_nodes.require_gps as requireGps,
             workflow_template_nodes.gps_provider_id as gpsProviderId,
             gps_providers.short_name as gpsProviderShortName,
             gps_providers.name as gpsProviderName,
             workflow_template_nodes.gps_device_no as gpsDeviceNo,
             workflow_template_nodes.timeout_hours as timeoutHours,
             workflow_template_nodes.working_time_rule_id as workingTimeRuleId,
             working_time_rules.name as workingTimeRuleName, description
      FROM workflow_template_nodes
      LEFT JOIN working_time_rules ON working_time_rules.id = workflow_template_nodes.working_time_rule_id
      LEFT JOIN gps_providers ON gps_providers.id = workflow_template_nodes.gps_provider_id
      ORDER BY sort_order ASC
    `,
  ).all();
  const fields = await env.DB.prepare(
    `
      SELECT id, template_node_id as templateNodeId, field_name as fieldName, field_key as fieldKey,
             field_type as fieldType, required, options_json as optionsJson, sort_order as sortOrder
      FROM workflow_node_form_fields
      ORDER BY sort_order ASC
    `,
  ).all();
  const fileRequirements = await env.DB.prepare(
    `
      SELECT id, template_node_id as templateNodeId, file_name as fileName, required,
             allowed_types as allowedTypes, max_count as maxCount, customer_visible as customerVisible,
             downloadable
      FROM workflow_node_file_requirements
      ORDER BY file_name ASC
    `,
  ).all();
  const mappedNodes = (nodes.results as Array<Record<string, unknown>>).map(mapWorkflowTemplateNode);
  for (const node of mappedNodes) {
    node.formFields = (fields.results as Array<Record<string, unknown>>)
      .filter((field) => String(field.templateNodeId) === String(node.id))
      .map((field) => ({
        ...field,
        required: Boolean(field.required),
        options: jsonArray<string>(field.optionsJson as string | null),
      }));
    node.fileRequirements = (fileRequirements.results as Array<Record<string, unknown>>)
      .filter((file) => String(file.templateNodeId) === String(node.id))
      .map((file) => ({
        ...file,
        required: Boolean(file.required),
        customerVisible: Boolean(file.customerVisible),
        downloadable: Boolean(file.downloadable),
      }));
  }
  return (templates.results as Array<Record<string, unknown>>).map((template) => ({
    ...template,
    enabled: Boolean(template.enabled),
    nodes: mappedNodes.filter((node) => String(node.templateId) === String(template.id)),
  }));
}

async function createWorkflowTemplate(env: Env, body: WorkflowTemplatePayload) {
  const name = ensureString(body.name);
  if (!name) return { error: '流程模板名称不能为空。' };
  const id = createId('wft');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO workflow_templates (id, name, business_type, enabled, remark, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(id, name, ensureString(body.businessType) || '大件运输', boolToInt(body.enabled, true), ensureString(body.remark), 'system', now, now)
    .run();
  return { id };
}

async function updateWorkflowTemplate(env: Env, templateId: string, body: WorkflowTemplatePayload) {
  const name = ensureString(body.name);
  if (!name) return { error: '流程模板名称不能为空。' };
  await env.DB.prepare(
    `
      UPDATE workflow_templates
      SET name = ?, business_type = ?, enabled = ?, remark = ?, updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(name, ensureString(body.businessType) || '大件运输', boolToInt(body.enabled, true), ensureString(body.remark), isoNow(), templateId)
    .run();
  return { ok: true };
}

async function deleteWorkflowTemplate(env: Env, templateId: string) {
  const existing = await env.DB.prepare('SELECT id FROM workflow_instances WHERE template_id = ? LIMIT 1').bind(templateId).first();
  if (existing) {
    return { error: '该模板已有流程实例，不能删除，可改为停用。' };
  }
  await env.DB.prepare('DELETE FROM workflow_templates WHERE id = ?').bind(templateId).run();
  return { ok: true };
}

async function createWorkflowTemplateNode(env: Env, templateId: string, body: WorkflowTemplateNodePayload) {
  const nodeName = ensureString(body.nodeName);
  if (!nodeName) return { error: '节点名称不能为空。' };
  const id = createId('wftn');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO workflow_template_nodes (
        id, template_id, node_name, sort_order, node_type, default_owner, default_role_id, default_role_name, required, allow_skip,
        allow_return, require_customer_confirm, require_attachment, require_supplier, supplier_types,
        require_vehicle, require_driver, require_gps, gps_provider_id, gps_device_no, timeout_hours, working_time_rule_id, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      id,
      templateId,
      nodeName,
      toInteger(body.sortOrder) ?? 0,
      ensureString(body.nodeType) || '普通节点',
      ensureString(body.defaultOwner),
      ensureString(body.defaultRoleId),
      ensureString(body.defaultRoleName),
      boolToInt(body.required, true),
      boolToInt(body.allowSkip),
      boolToInt(body.allowReturn, true),
      boolToInt(body.requireCustomerConfirm),
      boolToInt(body.requireAttachment),
      boolToInt(body.requireSupplier),
      JSON.stringify(uniqueStrings(body.supplierTypes ?? [])),
      boolToInt(body.requireVehicle),
      boolToInt(body.requireDriver),
      boolToInt(body.requireGps),
      null,
      null,
      toInteger(body.timeoutHours),
      ensureString(body.workingTimeRuleId),
      ensureString(body.description),
      now,
      now,
    )
    .run();
  return { id };
}

async function updateWorkflowTemplateNode(env: Env, nodeId: string, body: WorkflowTemplateNodePayload) {
  const nodeName = ensureString(body.nodeName);
  if (!nodeName) return { error: '节点名称不能为空。' };
  await env.DB.prepare(
    `
      UPDATE workflow_template_nodes
      SET node_name = ?, sort_order = ?, node_type = ?, default_owner = ?, default_role_id = ?, default_role_name = ?, required = ?, allow_skip = ?,
          allow_return = ?, require_customer_confirm = ?, require_attachment = ?, require_supplier = ?, supplier_types = ?,
          require_vehicle = ?, require_driver = ?, require_gps = ?, gps_provider_id = ?, gps_device_no = ?, timeout_hours = ?, working_time_rule_id = ?, description = ?, updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      nodeName,
      toInteger(body.sortOrder) ?? 0,
      ensureString(body.nodeType) || '普通节点',
      ensureString(body.defaultOwner),
      ensureString(body.defaultRoleId),
      ensureString(body.defaultRoleName),
      boolToInt(body.required, true),
      boolToInt(body.allowSkip),
      boolToInt(body.allowReturn, true),
      boolToInt(body.requireCustomerConfirm),
      boolToInt(body.requireAttachment),
      boolToInt(body.requireSupplier),
      JSON.stringify(uniqueStrings(body.supplierTypes ?? [])),
      boolToInt(body.requireVehicle),
      boolToInt(body.requireDriver),
      boolToInt(body.requireGps),
      null,
      null,
      toInteger(body.timeoutHours),
      ensureString(body.workingTimeRuleId),
      ensureString(body.description),
      isoNow(),
      nodeId,
    )
    .run();
  await env.DB.prepare(
    `
      UPDATE workflow_instance_nodes
      SET require_gps = ?, gps_provider_id = NULL, gps_device_no = NULL, updated_at = ?
      WHERE template_node_id = ? AND status NOT IN ('已完成', '已跳过')
    `,
  )
    .bind(boolToInt(body.requireGps), isoNow(), nodeId)
    .run();
  return { ok: true };
}

async function deleteWorkflowTemplateNode(env: Env, nodeId: string) {
  await env.DB.prepare('DELETE FROM workflow_template_nodes WHERE id = ?').bind(nodeId).run();
  return { ok: true };
}

async function createWorkflowFormField(env: Env, nodeId: string, body: WorkflowFormFieldPayload) {
  const fieldName = ensureString(body.fieldName);
  const fieldKey = ensureString(body.fieldKey);
  if (!fieldName || !fieldKey) return { error: '字段名称和字段标识不能为空。' };
  await env.DB.prepare(
    `
      INSERT INTO workflow_node_form_fields (
        id, template_node_id, field_name, field_key, field_type, required, options_json, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(createId('wfff'), nodeId, fieldName, fieldKey, ensureString(body.fieldType) || 'text', boolToInt(body.required), JSON.stringify(body.options ?? []), toInteger(body.sortOrder) ?? 0)
    .run();
  return { ok: true };
}

async function updateWorkflowFormField(env: Env, fieldId: string, body: WorkflowFormFieldPayload) {
  const fieldName = ensureString(body.fieldName);
  const fieldKey = ensureString(body.fieldKey);
  if (!fieldName || !fieldKey) return { error: '字段名称和字段标识不能为空。' };
  await env.DB.prepare(
    `
      UPDATE workflow_node_form_fields
      SET field_name = ?, field_key = ?, field_type = ?, required = ?, options_json = ?, sort_order = ?
      WHERE id = ?
    `,
  )
    .bind(fieldName, fieldKey, ensureString(body.fieldType) || 'text', boolToInt(body.required), JSON.stringify(body.options ?? []), toInteger(body.sortOrder) ?? 0, fieldId)
    .run();
  return { ok: true };
}

async function deleteWorkflowFormField(env: Env, fieldId: string) {
  await env.DB.prepare('DELETE FROM workflow_node_form_fields WHERE id = ?').bind(fieldId).run();
  return { ok: true };
}

async function createWorkflowFileRequirement(env: Env, nodeId: string, body: WorkflowFileRequirementPayload) {
  const fileName = ensureString(body.fileName);
  if (!fileName) return { error: '附件名称不能为空。' };
  await env.DB.prepare(
    `
      INSERT INTO workflow_node_file_requirements (
        id, template_node_id, file_name, required, allowed_types, max_count, customer_visible, downloadable
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(createId('wffr'), nodeId, fileName, boolToInt(body.required), ensureString(body.allowedTypes) || 'jpg,png,pdf,xlsx,docx', toInteger(body.maxCount) ?? 20, boolToInt(body.customerVisible), boolToInt(body.downloadable, true))
    .run();
  return { ok: true };
}

async function updateWorkflowFileRequirement(env: Env, fileRequirementId: string, body: WorkflowFileRequirementPayload) {
  const fileName = ensureString(body.fileName);
  if (!fileName) return { error: '附件名称不能为空。' };
  await env.DB.prepare(
    `
      UPDATE workflow_node_file_requirements
      SET file_name = ?, required = ?, allowed_types = ?, max_count = ?, customer_visible = ?, downloadable = ?
      WHERE id = ?
    `,
  )
    .bind(fileName, boolToInt(body.required), ensureString(body.allowedTypes) || 'jpg,png,pdf,xlsx,docx', toInteger(body.maxCount) ?? 20, boolToInt(body.customerVisible), boolToInt(body.downloadable, true), fileRequirementId)
    .run();
  return { ok: true };
}

async function deleteWorkflowFileRequirement(env: Env, fileRequirementId: string) {
  await env.DB.prepare('DELETE FROM workflow_node_file_requirements WHERE id = ?').bind(fileRequirementId).run();
  return { ok: true };
}

async function resolveWorkflowTodoAssignee(
  env: Env,
  node: { projectId: string; owner?: string | null; ownerRoleId?: string | null; ownerRoleName?: string | null },
) {
  const owner = ensureString(node.owner);
  if (owner) return { owner, ownerRoleId: '', ownerRoleName: '', assignmentSource: 'default_owner' };
  const ownerRoleId = ensureString(node.ownerRoleId);
  const ownerRoleName = ensureString(node.ownerRoleName);
  if (ownerRoleId || ownerRoleName) return { owner: '', ownerRoleId, ownerRoleName, assignmentSource: 'default_role' };
  const project = await env.DB.prepare('SELECT manager FROM oversize_projects WHERE id = ?').bind(node.projectId).first<{ manager?: string | null }>();
  const projectManager = ensureString(project?.manager);
  if (projectManager) return { owner: projectManager, ownerRoleId: '', ownerRoleName: '', assignmentSource: 'project_salesperson' };
  const adminRole = await env.DB.prepare('SELECT id, name FROM rbac_roles WHERE code = ? LIMIT 1').bind('admin').first<{ id: string; name: string }>();
  return {
    owner: '',
    ownerRoleId: adminRole?.id ?? 'role_admin',
    ownerRoleName: adminRole?.name ?? '超级管理员',
    assignmentSource: 'admin_fallback',
  };
}

async function getFeishuRecipientsForTodoAssignee(
  env: Env,
  assignee: { owner?: string; ownerRoleId?: string; ownerRoleName?: string },
) {
  const owner = ensureString(assignee.owner);
  if (owner) {
    const rows = await env.DB.prepare(
      `SELECT id, name, feishu_open_id as feishuOpenId
       FROM employees
       WHERE status = 'ACTIVE'
         AND COALESCE(feishu_open_id, '') != ''
         AND (name = ? OR lower(COALESCE(email, '')) = lower(?))
       LIMIT 5`,
    )
      .bind(owner, owner)
      .all<{ id: string; name: string; feishuOpenId: string }>();
    return rows.results ?? [];
  }

  const ownerRoleId = ensureString(assignee.ownerRoleId);
  const ownerRoleName = ensureString(assignee.ownerRoleName);
  if (!ownerRoleId && !ownerRoleName) return [];
  const rows = await env.DB.prepare(
    `SELECT DISTINCT employees.id, employees.name, employees.feishu_open_id as feishuOpenId
     FROM employees
     JOIN employee_roles ON employee_roles.employee_id = employees.id
     JOIN rbac_roles ON rbac_roles.id = employee_roles.role_id
     WHERE employees.status = 'ACTIVE'
       AND COALESCE(employees.feishu_open_id, '') != ''
       AND (rbac_roles.id = ? OR rbac_roles.name = ?)
     ORDER BY employees.name ASC
     LIMIT 20`,
  )
    .bind(ownerRoleId, ownerRoleName)
    .all<{ id: string; name: string; feishuOpenId: string }>();
  return (rows.results ?? []).map((row) => ({
    ...row,
    photoFiles: jsonArray((row as Record<string, unknown>).photoFiles as string | null, []),
  }));
}

type FeishuRecipient = { id: string; name: string; feishuOpenId: string };

function uniqueFeishuRecipients(recipients: Array<Partial<FeishuRecipient>>) {
  const seen = new Set<string>();
  const result: FeishuRecipient[] = [];
  for (const recipient of recipients) {
    const feishuOpenId = ensureString(recipient.feishuOpenId);
    if (!feishuOpenId || seen.has(feishuOpenId)) continue;
    seen.add(feishuOpenId);
    result.push({
      id: ensureString(recipient.id),
      name: ensureString(recipient.name) || '员工',
      feishuOpenId,
    });
  }
  return result;
}

async function getFeishuAdminRecipients(env: Env) {
  const rows = await env.DB.prepare(
    `SELECT DISTINCT employees.id, employees.name, employees.feishu_open_id as feishuOpenId
     FROM employees
     JOIN employee_roles ON employee_roles.employee_id = employees.id
     JOIN rbac_roles ON rbac_roles.id = employee_roles.role_id
     WHERE employees.status = 'ACTIVE'
       AND COALESCE(employees.feishu_open_id, '') != ''
       AND (
         rbac_roles.code IN ('admin', 'super_admin')
         OR rbac_roles.name IN ('超级管理员', '管理员')
         OR lower(COALESCE(rbac_roles.name, '')) IN ('admin', 'administrator', 'super_admin')
         OR lower(COALESCE(rbac_roles.name, '')) LIKE '%admin%'
       )
     ORDER BY employees.name ASC
     LIMIT 20`,
  ).all<FeishuRecipient>();
  return rows.results ?? [];
}

async function notifyWorkflowTodoByFeishu(
  env: Env,
  todo: {
    id: string;
    projectId: string;
    taskId: string;
    nodeName: string;
    dueAt?: string | null;
    assignee: { owner?: string; ownerRoleId?: string; ownerRoleName?: string };
  },
) {
  const recipients = await getFeishuRecipientsForTodoAssignee(env, todo.assignee);
  if (!recipients.length) return { ok: true, sent: 0 };
  const detail = await env.DB.prepare(
    `SELECT oversize_projects.customer_name as customerName,
            COALESCE(NULLIF(customers.short_name, ''), oversize_projects.customer_name) as customerShortName,
            oversize_projects.name as projectName,
            oversize_project_tasks.task_no as taskNo,
            oversize_project_tasks.vehicle_no as vehicleNo,
            oversize_project_tasks.vehicle_type as vehicleType
      FROM oversize_projects
      LEFT JOIN customers ON customers.id = oversize_projects.customer_id
      JOIN oversize_project_tasks ON oversize_project_tasks.project_id = oversize_projects.id
      WHERE oversize_project_tasks.id = ?
        AND oversize_projects.id = ?`,
  )
    .bind(todo.taskId, todo.projectId)
    .first<{
      customerName?: string | null;
      customerShortName?: string | null;
      projectName?: string | null;
      taskNo?: string | null;
      vehicleNo?: string | null;
      vehicleType?: string | null;
    }>();
  const card = feishuCardContent({
    title: `${todo.nodeName}节点待处理`,
    customerShortName: detail?.customerShortName,
    customerName: detail?.customerName,
    projectName: detail?.projectName,
    vehicleNo: detail?.vehicleNo,
    vehicleType: detail?.vehicleType,
    taskNo: detail?.taskNo,
    nodeName: todo.nodeName,
    dueAt: todo.dueAt,
    taskId: todo.taskId,
    feishuAppId: ensureString(env.FEISHU_APP_ID),
  });
  let sent = 0;
  for (const recipient of recipients) {
    const result = await sendFeishuMessage(env, recipient.feishuOpenId, card);
    if (!('error' in result)) sent += 1;
  }
  return { ok: true, sent };
}

function dashboardAdminTipCard(params: { operatorName?: string | null; createdAt: string; feishuAppId?: string | null }) {
  const targetUrl = 'https://admin.ostoa.org/mobile/executive-dashboard';
  const url = params.feishuAppId
    ? `https://applink.feishu.cn/client/web_app/open?appId=${encodeURIComponent(params.feishuAppId)}&mode=appCenter&lk_target_url=${encodeURIComponent(targetUrl)}`
    : targetUrl;
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '首页运营中控台提示' },
      template: 'blue',
    },
    elements: [
      {
        tag: 'markdown',
        content: [
          `**操作人**：${ensureString(params.operatorName) || '系统用户'}`,
          `**发送时间**：${formatBeijing(params.createdAt)}`,
          '**提示内容**：请查看首页运营中控台，关注待办、异常和运行任务情况。',
        ].join('\n'),
      },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: { tag: 'plain_text', content: '打开中控台' },
            type: 'primary',
            url,
          },
        ],
      },
    ],
  };
}

async function sendDashboardAdminTip(env: Env, sessionUser: SessionUser) {
  const recipients = uniqueFeishuRecipients(await getFeishuAdminRecipients(env));
  if (!recipients.length) {
    return { error: '未找到可接收飞书提示的管理员，请先同步飞书账号或维护管理员角色。' };
  }
  const card = dashboardAdminTipCard({
    operatorName: sessionUser.realName || sessionUser.email,
    createdAt: isoNow(),
    feishuAppId: ensureString(env.FEISHU_APP_ID),
  });
  let sent = 0;
  const errors: string[] = [];
  for (const recipient of recipients) {
    const result = await sendFeishuMessage(env, recipient.feishuOpenId, card);
    if (!('error' in result)) {
      sent += 1;
    } else {
      errors.push(`${recipient.name}：${result.error}`);
    }
  }
  await recordActivity(env, '首页提示', `从首页运营中控台发送管理员提示，成功 ${sent} 个，失败 ${errors.length} 个。`);
  if (!sent) return { error: errors.join('；') || '飞书提示发送失败。' };
  return { ok: true, sent, failed: errors.length, errors };
}

async function remindWorkflowNodeByFeishu(env: Env, nodeId: string) {
  const node = await env.DB.prepare(
    `SELECT id, project_id as projectId, task_id as taskId, node_name as nodeName, owner,
            owner_role_id as ownerRoleId, owner_role_name as ownerRoleName,
            timeout_at as timeoutAt, planned_end_at as plannedEndAt, started_at as startedAt,
            planned_duration_hours as plannedDurationHours, status
     FROM workflow_instance_nodes
     WHERE id = ?`,
  )
    .bind(nodeId)
    .first<{
      id: string;
      projectId: string;
      taskId: string;
      nodeName: string;
      owner?: string | null;
      ownerRoleId?: string | null;
      ownerRoleName?: string | null;
      timeoutAt?: string | null;
      plannedEndAt?: string | null;
      startedAt?: string | null;
      plannedDurationHours?: number | null;
      status: string;
    }>();
  if (!node) return { error: '流程节点不存在。' };
  if (['已完成', '已跳过', '已退回'].includes(node.status)) return { error: '该节点已完成流转，不能催办。' };
  const assignee = await resolveWorkflowTodoAssignee(env, node);
  const recipients = await getFeishuRecipientsForTodoAssignee(env, assignee);
  if (!recipients.length) return { error: '未找到可接收飞书催办的员工，请先同步飞书账号或维护负责人。' };
  const detail = await env.DB.prepare(
    `SELECT oversize_projects.customer_name as customerName,
            COALESCE(NULLIF(customers.short_name, ''), oversize_projects.customer_name) as customerShortName,
            oversize_projects.name as projectName,
            oversize_project_tasks.task_no as taskNo,
            oversize_project_tasks.vehicle_no as vehicleNo,
            oversize_project_tasks.vehicle_type as vehicleType
     FROM oversize_projects
     LEFT JOIN customers ON customers.id = oversize_projects.customer_id
     JOIN oversize_project_tasks ON oversize_project_tasks.id = ?
     WHERE oversize_projects.id = ?`,
  )
    .bind(node.taskId, node.projectId)
    .first<{
      customerName?: string | null;
      customerShortName?: string | null;
      projectName?: string | null;
      taskNo?: string | null;
      vehicleNo?: string | null;
      vehicleType?: string | null;
    }>();
  const isOverdue = isWorkflowNodeReminderOverdue(node);
  const card = feishuCardContent({
    title: `${isOverdue ? '超时催办' : '催办'}：${node.nodeName}节点待处理`,
    customerShortName: detail?.customerShortName,
    customerName: detail?.customerName,
    projectName: detail?.projectName,
    vehicleNo: detail?.vehicleNo,
    vehicleType: detail?.vehicleType,
    taskNo: detail?.taskNo,
    nodeName: node.nodeName,
    dueAt: resolveWorkflowReminderDueAt(node),
    taskId: node.taskId,
    feishuAppId: ensureString(env.FEISHU_APP_ID),
    template: isOverdue ? 'red' : 'blue',
    alertText: isOverdue ? '超时提醒：该节点实际耗时已超过预计时效，请优先处理。' : null,
  });
  let sent = 0;
  const errors: string[] = [];
  for (const recipient of recipients) {
    const result = await sendFeishuMessage(env, recipient.feishuOpenId, card);
    if (!('error' in result)) {
      sent += 1;
    } else {
      errors.push(`${recipient.name}：${result.error}`);
    }
  }
  if (!sent) return { error: `飞书催办发送失败：${errors.join('；') || '请检查应用发消息权限。'}` };
  await recordActivity(env, '飞书催办', `已发送 ${detail?.taskNo ?? node.taskId} ${node.nodeName} 节点催办。`);
  return { ok: true, sent };
}

const WORKFLOW_TIMEOUT_REMINDER_LIMIT = 10;

function parseWorkflowTimeoutDate(value: string) {
  const text = value.trim();
  if (!text) return null;
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(text) ? `${text.replace(' ', 'T')}+08:00` : text;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function computeWorkflowExpectedEndAt(startedAt?: string | null, plannedDurationHours?: number | string | null) {
  const startedDate = startedAt ? parseWorkflowTimeoutDate(startedAt) : null;
  const durationHours = Number(plannedDurationHours || 0);
  if (!startedDate || !Number.isFinite(durationHours) || durationHours <= 0) return '';
  return new Date(startedDate.getTime() + durationHours * 60 * 60 * 1000).toISOString();
}

function resolveWorkflowReminderDueAt(node: {
  timeoutAt?: string | null;
  plannedEndAt?: string | null;
  startedAt?: string | null;
  plannedDurationHours?: number | string | null;
}) {
  return (
    ensureString(node.plannedEndAt) ||
    computeWorkflowExpectedEndAt(node.startedAt, node.plannedDurationHours) ||
    ensureString(node.timeoutAt)
  );
}

function isWorkflowNodeReminderOverdue(node: {
  timeoutAt?: string | null;
  plannedEndAt?: string | null;
  startedAt?: string | null;
  plannedDurationHours?: number | string | null;
  status?: string | null;
}) {
  if (!['待处理', '处理中'].includes(node.status || '')) return false;
  const now = Date.now();
  const expectedEndAt = ensureString(node.plannedEndAt) || computeWorkflowExpectedEndAt(node.startedAt, node.plannedDurationHours);
  const expectedEndDate = expectedEndAt ? parseWorkflowTimeoutDate(expectedEndAt) : null;
  if (expectedEndDate && expectedEndDate.getTime() <= now) return true;

  const timeoutDate = node.timeoutAt ? parseWorkflowTimeoutDate(node.timeoutAt) : null;
  return Boolean(timeoutDate && timeoutDate.getTime() <= now);
}

async function countWorkflowTimeoutReminderSends(env: Env, nodeId: string) {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) as count
     FROM state_machine_logs
     JOIN state_machine_events ON state_machine_events.id = state_machine_logs.event_id
     WHERE state_machine_events.ref_id = ?
       AND state_machine_events.event_type = 'workflow.node.timeout'
       AND state_machine_logs.action_type = 'feishu_card'
       AND state_machine_logs.status = 'success'`,
  )
    .bind(nodeId)
    .first<{ count: number }>();
  return Number(row?.count ?? 0);
}

function isWorkflowNodeHeld(status?: string | null) {
  return ['已挂起', '挂起', '暂停', 'held', 'hold', 'on_hold'].includes(ensureString(status));
}

async function sendWorkflowTimeoutReminderByFeishu(env: Env, nodeId: string) {
  const sentCount = await countWorkflowTimeoutReminderSends(env, nodeId);
  if (sentCount >= WORKFLOW_TIMEOUT_REMINDER_LIMIT) {
    return { skipped: true, sent: 0, message: `该节点超时提醒已达到 ${WORKFLOW_TIMEOUT_REMINDER_LIMIT} 次上限。` };
  }

  const node = await env.DB.prepare(
    `SELECT id, project_id as projectId, task_id as taskId, node_name as nodeName, owner,
            owner_role_id as ownerRoleId, owner_role_name as ownerRoleName,
            timeout_at as timeoutAt, planned_end_at as plannedEndAt,
            started_at as startedAt, planned_duration_hours as plannedDurationHours, status
     FROM workflow_instance_nodes
     WHERE id = ?`,
  )
    .bind(nodeId)
    .first<{
      id: string;
      projectId: string;
      taskId: string;
      nodeName: string;
      owner?: string | null;
      ownerRoleId?: string | null;
      ownerRoleName?: string | null;
      timeoutAt?: string | null;
      plannedEndAt?: string | null;
      startedAt?: string | null;
      plannedDurationHours?: number | string | null;
      status: string;
    }>();
  if (!node) return { error: '流程节点不存在。' };
  if (isWorkflowNodeHeld(node.status)) return { skipped: true, sent: 0, message: '该节点已挂起，跳过超时提醒。' };
  if (['已完成', '已跳过', '已退回'].includes(node.status)) return { skipped: true, sent: 0, message: '该节点已完成流转，跳过超时提醒。' };

  const assignee = await resolveWorkflowTodoAssignee(env, node);
  const assigneeRecipients = await getFeishuRecipientsForTodoAssignee(env, assignee);
  const adminRecipients = await getFeishuAdminRecipients(env);
  const recipients = uniqueFeishuRecipients([...assigneeRecipients, ...adminRecipients]);
  if (!recipients.length) return { error: '未找到可接收飞书超时提醒的员工，请先同步飞书账号、维护节点负责人或配置管理员角色。' };

  const detail = await env.DB.prepare(
    `SELECT oversize_projects.customer_name as customerName,
            COALESCE(NULLIF(customers.short_name, ''), oversize_projects.customer_name) as customerShortName,
            oversize_projects.name as projectName,
            oversize_project_tasks.task_no as taskNo,
            oversize_project_tasks.vehicle_no as vehicleNo,
            oversize_project_tasks.vehicle_type as vehicleType
     FROM oversize_projects
     LEFT JOIN customers ON customers.id = oversize_projects.customer_id
     JOIN oversize_project_tasks ON oversize_project_tasks.id = ?
     WHERE oversize_projects.id = ?`,
  )
    .bind(node.taskId, node.projectId)
    .first<{
      customerName?: string | null;
      customerShortName?: string | null;
      projectName?: string | null;
      taskNo?: string | null;
      vehicleNo?: string | null;
      vehicleType?: string | null;
    }>();
  const dueAt = resolveWorkflowReminderDueAt(node);
  const card = feishuCardContent({
    title: `超时提醒：${node.nodeName}节点待处理`,
    customerShortName: detail?.customerShortName,
    customerName: detail?.customerName,
    projectName: detail?.projectName,
    vehicleNo: detail?.vehicleNo,
    vehicleType: detail?.vehicleType,
    taskNo: detail?.taskNo,
    nodeName: node.nodeName,
    dueAt,
    taskId: node.taskId,
    feishuAppId: ensureString(env.FEISHU_APP_ID),
    template: 'red',
    alertText: '超时提醒：该节点实际耗时已超过预计时效，请优先处理。',
  });
  let sent = 0;
  const errors: string[] = [];
  for (const recipient of recipients) {
    const result = await sendFeishuMessage(env, recipient.feishuOpenId, card);
    if (!('error' in result)) {
      sent += 1;
    } else {
      errors.push(`${recipient.name}：${result.error}`);
    }
  }
  if (!sent) return { error: `飞书超时提醒发送失败：${errors.join('；') || '请检查应用发消息权限。'}` };
  await recordActivity(env, '状态机超时提醒', `已发送 ${detail?.taskNo ?? node.taskId} ${node.nodeName} 节点超时提醒，第 ${sentCount + 1} 次。`);
  return { ok: true, sent };
}

async function createWorkflowTodo(
  env: Env,
  node: {
    id: string;
    instanceId: string;
    projectId: string;
    taskId: string;
    nodeName: string;
    owner?: string | null;
    ownerRoleId?: string | null;
    ownerRoleName?: string | null;
    timeoutAt?: string | null;
  },
) {
  const now = isoNow();
  const assignee = await resolveWorkflowTodoAssignee(env, node);
  const todoId = createId('wftd');
  await env.DB.prepare(
    `
      INSERT INTO workflow_todos (
        id, instance_id, instance_node_id, project_id, task_id, title, owner, owner_role_id, owner_role_name,
        assignment_source, due_at, status, priority, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      todoId,
      node.instanceId,
      node.id,
      node.projectId,
      node.taskId,
      `${node.nodeName}节点待处理`,
      assignee.owner,
      assignee.ownerRoleId,
      assignee.ownerRoleName,
      assignee.assignmentSource,
      node.timeoutAt ?? null,
      '未处理',
      '普通',
      now,
      now,
    )
    .run();
  try {
    await notifyWorkflowTodoByFeishu(env, {
      id: todoId,
      projectId: node.projectId,
      taskId: node.taskId,
      nodeName: node.nodeName,
      dueAt: node.timeoutAt ?? null,
      assignee,
    });
  } catch (error) {
    console.warn('Feishu todo notification failed.', error);
  }
}

async function resolveWorkflowNodeTimeoutAt(env: Env, nodeId: string) {
  const node = await env.DB.prepare(
    `
      SELECT workflow_instance_nodes.timeout_at as timeoutAt,
             workflow_instance_nodes.planned_end_at as plannedEndAt,
             workflow_template_nodes.timeout_hours as timeoutHours
      FROM workflow_instance_nodes
      LEFT JOIN workflow_template_nodes ON workflow_template_nodes.id = workflow_instance_nodes.template_node_id
      WHERE workflow_instance_nodes.id = ?
    `,
  )
    .bind(nodeId)
    .first<{ timeoutAt?: string | null; plannedEndAt?: string | null; timeoutHours?: number | string | null }>();
  const plannedEndAt = ensureString(node?.plannedEndAt);
  if (plannedEndAt) return plannedEndAt;
  const existingTimeoutAt = ensureString(node?.timeoutAt);
  if (existingTimeoutAt) return existingTimeoutAt;
  const timeoutHours = toInteger(node?.timeoutHours);
  return timeoutHours ? new Date(Date.now() + timeoutHours * 60 * 60 * 1000).toISOString() : null;
}

async function activateWorkflowNodeAndTodo(
  env: Env,
  node: {
    id: string;
    instanceId: string;
    projectId: string;
    taskId: string;
    nodeName: string;
    owner?: string | null;
    ownerRoleId?: string | null;
    ownerRoleName?: string | null;
  },
  now: string,
) {
  const timeoutAt = await resolveWorkflowNodeTimeoutAt(env, node.id);
  await env.DB.prepare('UPDATE workflow_instance_nodes SET status = ?, timeout_at = COALESCE(timeout_at, ?), updated_at = ? WHERE id = ?').bind('待处理', timeoutAt, now, node.id).run();
  await env.DB.prepare('UPDATE workflow_instances SET current_node_id = ?, updated_at = ? WHERE id = ?').bind(node.id, now, node.instanceId).run();
  await createWorkflowTodo(env, { ...node, timeoutAt });
}

async function updateWorkflowSchedulePlan(
  env: Env,
  taskId: string,
  body: { nodes?: Array<Record<string, unknown>> },
) {
  const task = await env.DB.prepare('SELECT id FROM oversize_project_tasks WHERE id = ?').bind(taskId).first<{ id: string }>();
  if (!task) return { error: '运输任务不存在。' };
  const nodes = Array.isArray(body.nodes) ? body.nodes : [];
  const now = isoNow();
  for (const node of nodes) {
    const nodeId = ensureString(node.id);
    if (!nodeId) continue;
    const plannedStartAt = ensureString(node.plannedStartAt) || null;
    const plannedEndAt = ensureString(node.plannedEndAt) || null;
    const plannedDurationHours = toNumber(node.plannedDurationHours);
    const warningBeforeHours = toNumber(node.warningBeforeHours);
    const scheduleRemark = ensureString(node.scheduleRemark);
    await env.DB.prepare(
      `
        UPDATE workflow_instance_nodes
        SET planned_start_at = ?,
            planned_end_at = ?,
            planned_duration_hours = ?,
            warning_before_hours = ?,
            schedule_remark = ?,
            timeout_at = CASE
              WHEN status IN ('待处理', '处理中') THEN COALESCE(?, timeout_at)
              ELSE timeout_at
            END,
            schedule_updated_at = ?,
            updated_at = ?
        WHERE id = ? AND task_id = ?
      `,
    )
      .bind(
        plannedStartAt,
        plannedEndAt,
        plannedDurationHours,
        warningBeforeHours,
        scheduleRemark,
        plannedEndAt,
        now,
        now,
        nodeId,
        taskId,
      )
      .run();
  }
  return { ok: true };
}

function latestDateFromRows(rows: Array<Record<string, unknown>>, fields: string[]) {
  let latest: Date | null = null;
  for (const row of rows) {
    for (const field of fields) {
      const value = ensureString(row[field]);
      if (!value) continue;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) continue;
      if (!latest || parsed.getTime() > latest.getTime()) latest = parsed;
    }
  }
  return latest;
}

async function predictWorkflowSchedulePlan(env: Env, taskId: string, apply = false) {
  const task = await env.DB.prepare('SELECT id FROM oversize_project_tasks WHERE id = ?').bind(taskId).first<{ id: string }>();
  if (!task) return { error: '运输任务不存在。' };
  const workflow = await getWorkflowByTask(env, taskId);
  if (!workflow || !Array.isArray(workflow.nodes) || !workflow.nodes.length) return { error: '流程实例不存在。' };

  const nodes = workflow.nodes as Array<Record<string, unknown>>;
  const nodeIds = nodes.map((node) => ensureString(node.id)).filter(Boolean);
  const workflowInstanceId = ensureString(nodes[0]?.instanceId);
  const placeholders = nodeIds.map(() => '?').join(',');
  const trackingRows = placeholders
    ? await env.DB.prepare(
        `SELECT tracked_at as trackedAt, created_at as createdAt FROM workflow_node_tracking_records WHERE instance_node_id IN (${placeholders})`,
      )
        .bind(...nodeIds)
        .all<Record<string, unknown>>()
    : { results: [] as Record<string, unknown>[] };
  const transitionRows = await env.DB.prepare(
    'SELECT created_at as createdAt FROM workflow_transitions WHERE task_id = ? OR instance_id = ?',
  )
    .bind(taskId, workflowInstanceId)
    .all<Record<string, unknown>>();

  const actualLatest =
    latestDateFromRows(nodes, ['completedAt', 'startedAt']) ??
    latestDateFromRows(trackingRows.results, ['trackedAt', 'createdAt']) ??
    latestDateFromRows(transitionRows.results, ['createdAt']) ??
    new Date();

  const firstUnfinishedIndex = nodes.findIndex((node) => !['已完成', '已跳过'].includes(ensureString(node.status)));
  if (firstUnfinishedIndex < 0) return { ok: true, items: nodes, baseTime: actualLatest.toISOString() };

  const now = isoNow();
  let cursor = actualLatest;
  const updatedItems: Array<Record<string, unknown>> = [];
  for (const [index, node] of nodes.entries()) {
    if (index < firstUnfinishedIndex) {
      updatedItems.push(node);
      continue;
    }
    const nodeId = ensureString(node.id);
    const durationHours = toNumber(node.plannedDurationHours) ?? toNumber(node.timeoutHours);
    const plannedWindow = await calculatePlannedWindow(env, cursor, durationHours, node.workingTimeRuleId);
    const plannedStartAt = plannedWindow.start.toISOString();
    const plannedEndAt = plannedWindow.end.toISOString();
    cursor = plannedWindow.end;
    if (apply) {
      await env.DB.prepare(
        `
          UPDATE workflow_instance_nodes
          SET planned_start_at = ?,
              planned_end_at = ?,
              timeout_at = CASE
                WHEN status IN ('待处理', '处理中') THEN ?
                ELSE timeout_at
              END,
              schedule_remark = CASE
                WHEN schedule_remark IS NULL OR schedule_remark = '' THEN '系统时效预测'
                ELSE schedule_remark
              END,
              schedule_updated_at = ?,
              updated_at = ?
          WHERE id = ? AND task_id = ?
        `,
      )
        .bind(plannedStartAt, plannedEndAt, plannedEndAt, now, now, nodeId, taskId)
        .run();
    }
    updatedItems.push({ ...node, plannedStartAt, plannedEndAt });
  }
  return { ok: true, applied: apply, items: updatedItems, baseTime: actualLatest.toISOString() };
}

async function startWorkflowForTask(env: Env, taskId: string, templateId?: string | null) {
  const existing = await env.DB.prepare('SELECT id FROM workflow_instances WHERE task_id = ?').bind(taskId).first<{ id: string }>();
  if (existing) return { id: existing.id };

  const task = await env.DB.prepare(
    `
      SELECT oversize_project_tasks.id, oversize_project_tasks.project_id as projectId,
             oversize_projects.workflow_template_id as workflowTemplateId,
             oversize_projects.workflow_node_ids as workflowNodeIds
      FROM oversize_project_tasks
      JOIN oversize_projects ON oversize_projects.id = oversize_project_tasks.project_id
      WHERE oversize_project_tasks.id = ?
    `,
  )
    .bind(taskId)
    .first<{ id: string; projectId: string; workflowTemplateId?: string | null; workflowNodeIds?: string | null }>();
  if (!task) return { error: '运输任务不存在。' };

  const effectiveTemplateId = templateId || task.workflowTemplateId;
  const selectedNodeIds = jsonArray<string>(task.workflowNodeIds, []);
  const template = effectiveTemplateId
    ? await env.DB.prepare('SELECT id FROM workflow_templates WHERE id = ?').bind(effectiveTemplateId).first<{ id: string }>()
    : await env.DB.prepare('SELECT id FROM workflow_templates WHERE enabled = 1 ORDER BY updated_at DESC LIMIT 1').first<{ id: string }>();
  if (!template) return { error: '没有可用的流程模板。' };

  const templateNodes = await env.DB.prepare(
    `
      SELECT id, node_name as nodeName, sort_order as sortOrder, node_type as nodeType, default_owner as defaultOwner,
             default_role_id as defaultRoleId, default_role_name as defaultRoleName,
             required, allow_skip as allowSkip, allow_return as allowReturn,
             require_customer_confirm as requireCustomerConfirm, require_supplier as requireSupplier,
             supplier_types as supplierTypes, require_vehicle as requireVehicle, require_driver as requireDriver,
             require_gps as requireGps, gps_provider_id as gpsProviderId, gps_device_no as gpsDeviceNo,
             timeout_hours as timeoutHours, working_time_rule_id as workingTimeRuleId
      FROM workflow_template_nodes
      WHERE template_id = ?
      ${selectedNodeIds.length ? `AND id IN (${selectedNodeIds.map(() => '?').join(',')})` : ''}
      ORDER BY sort_order ASC
    `,
  )
    .bind(template.id, ...selectedNodeIds)
    .all<Record<string, unknown>>();
  if (!templateNodes.results.length) return { error: '流程模板没有配置节点。' };

  const instanceId = createId('wfi');
  const now = isoNow();
  let plannedCursor = new Date(now);
  await env.DB.prepare(
    `
      INSERT INTO workflow_instances (id, task_id, project_id, template_id, status, started_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(instanceId, taskId, task.projectId, template.id, '进行中', now, now, now)
    .run();

  let firstNodeId = '';
  for (const [index, node] of templateNodes.results.entries()) {
    const nodeId = createId('wfin');
    if (index === 0) firstNodeId = nodeId;
    const timeoutHours = toInteger(node.timeoutHours);
    const plannedWindow = await calculatePlannedWindow(env, plannedCursor, timeoutHours, node.workingTimeRuleId);
    const plannedStartAt = plannedWindow.start.toISOString();
    const plannedEndAt = plannedWindow.end.toISOString();
    plannedCursor = plannedWindow.end;
    const timeoutAt = index === 0 ? plannedEndAt : null;
    await env.DB.prepare(
      `
        INSERT INTO workflow_instance_nodes (
          id, instance_id, task_id, project_id, template_node_id, node_name, sort_order, node_type, owner, owner_role_id, owner_role_name,
          status, required, allow_skip, allow_return, require_customer_confirm, require_supplier, supplier_types,
          require_vehicle, require_driver, require_gps, gps_provider_id, gps_device_no, working_time_rule_id, timeout_at, planned_start_at, planned_end_at, planned_duration_hours, warning_before_hours,
          schedule_updated_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(
        nodeId,
        instanceId,
        taskId,
        task.projectId,
        node.id,
        node.nodeName,
        node.sortOrder,
        node.nodeType,
        node.defaultOwner,
        node.defaultRoleId,
        node.defaultRoleName,
        index === 0 ? '待处理' : '未开始',
        node.required,
        node.allowSkip,
        node.allowReturn,
        node.requireCustomerConfirm,
        node.requireSupplier,
        node.supplierTypes || '[]',
        node.requireVehicle,
        node.requireDriver,
        node.requireGps,
        null,
        null,
        ensureString(node.workingTimeRuleId),
        timeoutAt,
        plannedStartAt,
        plannedEndAt,
        timeoutHours,
        0,
        now,
        now,
        now,
      )
      .run();
  }
  await env.DB.prepare('UPDATE workflow_instances SET current_node_id = ?, updated_at = ? WHERE id = ?').bind(firstNodeId, isoNow(), instanceId).run();
  const firstNode = await env.DB.prepare(
    'SELECT id, instance_id as instanceId, project_id as projectId, task_id as taskId, node_name as nodeName, owner, owner_role_id as ownerRoleId, owner_role_name as ownerRoleName, timeout_at as timeoutAt FROM workflow_instance_nodes WHERE id = ?',
  )
    .bind(firstNodeId)
    .first<{ id: string; instanceId: string; projectId: string; taskId: string; nodeName: string; owner?: string | null; ownerRoleId?: string | null; ownerRoleName?: string | null; timeoutAt?: string | null }>();
  if (firstNode) await createWorkflowTodo(env, firstNode);
  return { id: instanceId };
}

async function getWorkflowByTask(env: Env, taskId: string) {
  await startWorkflowForTask(env, taskId);
  const instance = await env.DB.prepare(
    `
      SELECT workflow_instances.id, task_id as taskId, project_id as projectId, template_id as templateId,
             status, current_node_id as currentNodeId, started_at as startedAt, completed_at as completedAt,
             created_at as createdAt, updated_at as updatedAt
      FROM workflow_instances
      WHERE task_id = ?
    `,
  )
    .bind(taskId)
    .first<Record<string, unknown>>();
  if (!instance) return null;
  const nodes = await env.DB.prepare(
    `
      SELECT workflow_instance_nodes.id, workflow_instance_nodes.instance_id as instanceId,
             workflow_instance_nodes.task_id as taskId, workflow_instance_nodes.project_id as projectId,
             workflow_instance_nodes.template_node_id as templateNodeId,
             workflow_instance_nodes.node_name as nodeName, workflow_instance_nodes.sort_order as sortOrder,
             workflow_instance_nodes.node_type as nodeType, workflow_instance_nodes.owner,
             workflow_instance_nodes.status, workflow_instance_nodes.required,
             workflow_instance_nodes.allow_skip as allowSkip,
             workflow_instance_nodes.allow_return as allowReturn,
             workflow_instance_nodes.require_customer_confirm as requireCustomerConfirm,
             workflow_instance_nodes.require_supplier as requireSupplier,
             workflow_instance_nodes.supplier_types as supplierTypes,
             workflow_instance_nodes.require_vehicle as requireVehicle,
             workflow_instance_nodes.require_driver as requireDriver,
             workflow_instance_nodes.require_gps as requireGps,
             workflow_instance_nodes.gps_provider_id as gpsProviderId,
             gps_providers.short_name as gpsProviderShortName,
             gps_providers.name as gpsProviderName,
             workflow_instance_nodes.gps_device_no as gpsDeviceNo,
             COALESCE(workflow_instance_nodes.working_time_rule_id, workflow_template_nodes.working_time_rule_id) as workingTimeRuleId,
             working_time_rules.name as workingTimeRuleName,
             workflow_instance_nodes.supplier_id as supplierId,
             workflow_instance_nodes.supplier_name as supplierName,
             workflow_instance_nodes.supplier_type as supplierType,
             workflow_instance_nodes.supplier_vehicle_id as supplierVehicleId,
             workflow_instance_nodes.vehicle_plate_no as vehiclePlateNo,
             workflow_instance_nodes.supplier_driver_id as supplierDriverId,
             workflow_instance_nodes.driver_name as driverName,
             workflow_instance_nodes.driver_phone as driverPhone,
             workflow_instance_nodes.service_cost as serviceCost,
             workflow_instance_nodes.service_currency as serviceCurrency,
             workflow_instance_nodes.service_exchange_rate as serviceExchangeRate,
             workflow_instance_nodes.service_remark as serviceRemark,
             workflow_instance_nodes.planned_start_at as plannedStartAt,
             workflow_instance_nodes.planned_end_at as plannedEndAt,
             workflow_instance_nodes.planned_duration_hours as plannedDurationHours,
             workflow_instance_nodes.warning_before_hours as warningBeforeHours,
             workflow_instance_nodes.schedule_remark as scheduleRemark,
             workflow_instance_nodes.schedule_updated_at as scheduleUpdatedAt,
             workflow_instance_nodes.timeout_at as timeoutAt,
             workflow_instance_nodes.started_at as startedAt,
             workflow_instance_nodes.completed_at as completedAt,
             workflow_instance_nodes.notes
      FROM workflow_instance_nodes
      LEFT JOIN workflow_template_nodes ON workflow_template_nodes.id = workflow_instance_nodes.template_node_id
      LEFT JOIN working_time_rules ON working_time_rules.id = COALESCE(workflow_instance_nodes.working_time_rule_id, workflow_template_nodes.working_time_rule_id)
      LEFT JOIN gps_providers ON gps_providers.id = workflow_instance_nodes.gps_provider_id
      WHERE workflow_instance_nodes.instance_id = ?
      ORDER BY workflow_instance_nodes.sort_order ASC
    `,
  )
    .bind(instance.id)
    .all<Record<string, unknown>>();
  const values = await env.DB.prepare(
    'SELECT instance_node_id as instanceNodeId, field_key as fieldKey, field_name as fieldName, field_type as fieldType, field_value as fieldValue FROM workflow_node_form_values WHERE instance_node_id IN (SELECT id FROM workflow_instance_nodes WHERE instance_id = ?)',
  )
    .bind(instance.id)
    .all<Record<string, unknown>>();
  const fields = await env.DB.prepare(
    `
      SELECT DISTINCT workflow_instance_nodes.id as instanceNodeId, workflow_node_form_fields.field_name as fieldName,
             workflow_node_form_fields.field_key as fieldKey, workflow_node_form_fields.field_type as fieldType,
             workflow_node_form_fields.required, workflow_node_form_fields.options_json as optionsJson,
             workflow_node_form_fields.sort_order as sortOrder
      FROM workflow_instance_nodes
      JOIN workflow_instances ON workflow_instances.id = workflow_instance_nodes.instance_id
      JOIN workflow_template_nodes ON (
        workflow_template_nodes.id = workflow_instance_nodes.template_node_id
        OR (
          workflow_template_nodes.template_id = workflow_instances.template_id
          AND workflow_template_nodes.node_name = workflow_instance_nodes.node_name
        )
      )
      JOIN workflow_node_form_fields ON workflow_node_form_fields.template_node_id = workflow_template_nodes.id
      WHERE workflow_instance_nodes.instance_id = ?
      ORDER BY workflow_instance_nodes.sort_order ASC, workflow_node_form_fields.sort_order ASC
    `,
  )
    .bind(instance.id)
    .all<Record<string, unknown>>();
  const fileRequirements = await env.DB.prepare(
    `
      SELECT DISTINCT workflow_instance_nodes.id as instanceNodeId, workflow_node_file_requirements.id,
             workflow_node_file_requirements.file_name as fileName, workflow_node_file_requirements.required,
             workflow_node_file_requirements.allowed_types as allowedTypes, workflow_node_file_requirements.max_count as maxCount,
             workflow_node_file_requirements.customer_visible as customerVisible, workflow_node_file_requirements.downloadable
      FROM workflow_instance_nodes
      JOIN workflow_instances ON workflow_instances.id = workflow_instance_nodes.instance_id
      JOIN workflow_template_nodes ON (
        workflow_template_nodes.id = workflow_instance_nodes.template_node_id
        OR (
          workflow_template_nodes.template_id = workflow_instances.template_id
          AND workflow_template_nodes.node_name = workflow_instance_nodes.node_name
        )
      )
      JOIN workflow_node_file_requirements ON workflow_node_file_requirements.template_node_id = workflow_template_nodes.id
      WHERE workflow_instance_nodes.instance_id = ?
      ORDER BY workflow_instance_nodes.sort_order ASC, workflow_node_file_requirements.file_name ASC
    `,
  )
    .bind(instance.id)
    .all<Record<string, unknown>>();
  const files = await env.DB.prepare(
    'SELECT id as key, instance_node_id as instanceNodeId, file_name as fileName, file_type as fileType, file_size as fileSize, file_url as fileUrl, customer_visible as customerVisible, visibility_level as visibilityLevel, created_at as createdAt FROM workflow_node_files WHERE instance_node_id IN (SELECT id FROM workflow_instance_nodes WHERE instance_id = ?)',
  )
    .bind(instance.id)
    .all<Record<string, unknown>>();
  const transitions = await env.DB.prepare(
    'SELECT id, operator, action, from_node_name as fromNodeName, to_node_name as toNodeName, from_status as fromStatus, to_status as toStatus, remark, created_at as createdAt FROM workflow_transitions WHERE instance_id = ? ORDER BY created_at DESC',
  )
    .bind(instance.id)
    .all<Record<string, unknown>>();
  const trackingRecords = await env.DB.prepare(
    `
      SELECT id, instance_id as instanceId, instance_node_id as instanceNodeId, project_id as projectId, task_id as taskId,
             node_name as nodeName, tracked_at as trackedAt, location, tracking_status as trackingStatus, content,
             operator, customer_visible as customerVisible, visibility_level as visibilityLevel, files_json as filesJson,
             remark, created_at as createdAt, updated_at as updatedAt
      FROM workflow_node_tracking_records
      WHERE instance_id = ?
      ORDER BY tracked_at DESC, created_at DESC
    `,
  )
    .bind(instance.id)
    .all<Record<string, unknown>>();
  const mappedNodes = nodes.results.map(mapWorkflowInstanceNode);
  for (const node of mappedNodes) {
    node.formFields = fields.results
      .filter((item) => String(item.instanceNodeId) === String(node.id))
      .map((item) => ({
        ...item,
        required: Boolean(item.required),
        options: jsonArray<string>(item.optionsJson as string | null),
      }));
    node.formValues = values.results.filter((item) => String(item.instanceNodeId) === String(node.id));
    node.files = files.results.filter((item) => String(item.instanceNodeId) === String(node.id));
    node.fileRequirements = fileRequirements.results
      .filter((item) => String(item.instanceNodeId) === String(node.id))
      .map((item) => ({
        ...item,
        required: Boolean(item.required),
        customerVisible: Boolean(item.customerVisible),
        downloadable: Boolean(item.downloadable),
      }));
    node.trackingRecords = trackingRecords.results
      .filter((item) => String(item.instanceNodeId) === String(node.id))
      .map(mapWorkflowTrackingRecord);
  }
  return { ...instance, nodes: mappedNodes, transitions: transitions.results, trackingRecords: trackingRecords.results.map(mapWorkflowTrackingRecord) };
}

function mapWorkflowTrackingRecord(row: Record<string, unknown>) {
  return {
    ...row,
    customerVisible: Boolean(row.customerVisible),
    files: jsonArray(row.filesJson as string | null, []),
  };
}

function mapGpsProvider(row: Record<string, unknown>) {
  return {
    id: row.id,
    shortName: row.shortName,
    name: row.name,
    website: row.website,
    phone: row.phone,
    apiUrl: row.apiUrl,
    apiKey: row.apiKey,
    apiToken: row.apiToken,
    username: row.username,
    passwordMd5: row.passwordMd5,
    hasPasswordMd5: Boolean(row.passwordMd5),
    loginToken: row.loginToken ? '已缓存' : '',
    serverId: row.serverId,
    tokenExpiresAt: row.tokenExpiresAt,
    lastQueryPositionTime: row.lastQueryPositionTime,
    enabled: Boolean(row.enabled),
    remark: row.remark,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function listGpsProviders(env: Env) {
  const result = await env.DB.prepare(
    `
      SELECT id, short_name as shortName, name, website, phone, api_url as apiUrl, api_key as apiKey,
             api_token as apiToken, username, password_md5 as passwordMd5, login_token as loginToken,
             server_id as serverId, token_expires_at as tokenExpiresAt,
             last_query_position_time as lastQueryPositionTime, enabled, remark, created_at as createdAt, updated_at as updatedAt
      FROM gps_providers
      ORDER BY enabled DESC, short_name ASC, created_at DESC
    `,
  ).all<Record<string, unknown>>();
  return result.results.map(mapGpsProvider);
}

async function saveGpsProvider(env: Env, body: GpsProviderPayload, id?: string) {
  const shortName = ensureString(body.shortName);
  const name = ensureString(body.name);
  if (!shortName) return { error: '服务商简称不能为空。' };
  if (!name) return { error: '服务商名称不能为空。' };
  const now = isoNow();
  const recordId = id || createId('gps');
  if (id) {
    const existing = await env.DB.prepare('SELECT id FROM gps_providers WHERE id = ?').bind(id).first<{ id: string }>();
    if (!existing) return { error: 'GPS服务商不存在。' };
  }
  await env.DB.prepare(
    `
      INSERT INTO gps_providers (
        id, short_name, name, website, phone, api_url, api_key, api_token, username, password_md5,
        enabled, remark, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        short_name = excluded.short_name,
        name = excluded.name,
        website = excluded.website,
        phone = excluded.phone,
        api_url = excluded.api_url,
        api_key = excluded.api_key,
        api_token = excluded.api_token,
        username = excluded.username,
        password_md5 = excluded.password_md5,
        enabled = excluded.enabled,
        remark = excluded.remark,
        updated_at = excluded.updated_at
    `,
  )
    .bind(
      recordId,
      shortName,
      name,
      ensureString(body.website),
      ensureString(body.phone),
      ensureString(body.apiUrl),
      ensureString(body.apiKey),
      ensureString(body.apiToken),
      ensureString(body.username),
      ensureString(body.passwordMd5),
      boolToInt(body.enabled, true),
      ensureString(body.remark),
      now,
      now,
    )
    .run();
  return { id: recordId };
}

async function deleteGpsProvider(env: Env, id: string) {
  const existing = await env.DB.prepare('SELECT id FROM gps_providers WHERE id = ?').bind(id).first<{ id: string }>();
  if (!existing) return { error: 'GPS服务商不存在。' };
  await env.DB.prepare('DELETE FROM gps_providers WHERE id = ?').bind(id).run();
  return { ok: true };
}

async function saveWorkflowNodeData(env: Env, nodeId: string, body: WorkflowActionPayload) {
  const now = isoNow();
  await env.DB.prepare(
    `
      UPDATE workflow_instance_nodes
      SET supplier_id = ?, supplier_name = ?, supplier_type = ?, supplier_vehicle_id = ?, vehicle_plate_no = ?,
          supplier_driver_id = ?, driver_name = ?, driver_phone = ?, service_cost = ?, service_currency = ?,
          service_exchange_rate = ?, service_remark = ?, updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      ensureString(body.supplierId) || null,
      ensureString(body.supplierName),
      ensureString(body.supplierType),
      ensureString(body.supplierVehicleId) || null,
      ensureString(body.vehiclePlateNo),
      ensureString(body.supplierDriverId) || null,
      ensureString(body.driverName),
      ensureString(body.driverPhone),
      toNumber(body.serviceCost),
      ensureString(body.serviceCurrency) || 'CNY',
      toNumber(body.serviceExchangeRate) ?? 1,
      ensureString(body.serviceRemark),
      now,
      nodeId,
    )
    .run();
  for (const value of body.formValues ?? []) {
    const fieldKey = ensureString(value.fieldKey);
    if (!fieldKey) continue;
    await env.DB.prepare(
      `
        INSERT INTO workflow_node_form_values (id, instance_node_id, field_key, field_name, field_type, field_value, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(instance_node_id, field_key) DO UPDATE SET field_name = excluded.field_name, field_type = excluded.field_type, field_value = excluded.field_value, updated_at = excluded.updated_at
      `,
    )
      .bind(createId('wffv'), nodeId, fieldKey, ensureString(value.fieldName), ensureString(value.fieldType) || 'text', ensureString(value.fieldValue), now, now)
      .run();
  }
  for (const file of body.files ?? []) {
    const fileName = ensureString(file.fileName);
    const fileUrlValue = ensureString(file.fileUrl);
    if (!fileName || !fileUrlValue) continue;
    await env.DB.prepare(
      `
        INSERT INTO workflow_node_files (
          id, instance_node_id, file_name, file_type, file_size, file_url, customer_visible, visibility_level, uploaded_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(
        createId('wff'),
        nodeId,
        fileName,
        ensureString(file.fileType),
        toInteger(file.fileSize),
        fileUrlValue,
        boolToInt(file.customerVisible ?? body.customerVisible),
        ensureString(file.visibilityLevel) || ensureString(body.visibilityLevel) || '内部资料',
        ensureString(body.operator),
        now,
      )
      .run();
  }
}

async function deleteWorkflowNodeFile(env: Env, fileId: string) {
  const file = await env.DB.prepare(
    `
      SELECT workflow_node_files.id, workflow_node_files.file_url as fileUrl,
             workflow_instance_nodes.task_id as taskId,
             workflow_instances.status as workflowStatus,
             transport_tasks.status as taskStatus
      FROM workflow_node_files
      JOIN workflow_instance_nodes ON workflow_instance_nodes.id = workflow_node_files.instance_node_id
      JOIN workflow_instances ON workflow_instances.id = workflow_instance_nodes.instance_id
      LEFT JOIN transport_tasks ON transport_tasks.id = workflow_instance_nodes.task_id
      WHERE workflow_node_files.id = ?
    `,
  )
    .bind(fileId)
    .first<{ id: string; fileUrl?: string | null; taskStatus?: string | null; workflowStatus?: string | null }>();
  if (!file) return { error: '节点附件不存在。' };
  if (['已完成', '完成'].includes(String(file.taskStatus ?? '')) || ['已完成', '完成'].includes(String(file.workflowStatus ?? ''))) {
    return { error: '运输任务已完成，不能删除节点附件。' };
  }

  const fileUrlValue = ensureString(file.fileUrl);
  const uploadPrefix = '/api/uploads/';
  if (env.ASSETS && fileUrlValue.includes(uploadPrefix)) {
    const objectKey = decodeURIComponent(fileUrlValue.slice(fileUrlValue.indexOf(uploadPrefix) + uploadPrefix.length));
    if (objectKey) {
      await (env.ASSETS as R2Bucket & { delete: (key: string) => Promise<void> }).delete(objectKey);
    }
  }
  await env.DB.prepare('DELETE FROM workflow_node_files WHERE id = ?').bind(fileId).run();
  return { ok: true };
}

async function validateWorkflowNodeSubmit(env: Env, nodeId: string) {
  const node = await env.DB.prepare(
    'SELECT require_supplier as requireSupplier, require_vehicle as requireVehicle, require_driver as requireDriver, require_gps as requireGps, gps_provider_id as gpsProviderId, gps_device_no as gpsDeviceNo, supplier_id as supplierId, supplier_vehicle_id as supplierVehicleId, supplier_driver_id as supplierDriverId FROM workflow_instance_nodes WHERE id = ?',
  )
    .bind(nodeId)
    .first<Record<string, unknown>>();
  if (node?.requireSupplier && !node.supplierId) return { error: '请选择当前节点服务供应商。' };
  if (node?.requireVehicle && !node.supplierVehicleId) return { error: '请选择当前节点服务车辆。' };
  if (node?.requireDriver && !node.supplierDriverId) return { error: '请选择当前节点服务司机。' };
  if (node?.requireGps) {
    const gpsValues = await env.DB.prepare(
      `
        SELECT field_key as fieldKey, field_value as fieldValue
        FROM workflow_node_form_values
        WHERE instance_node_id = ? AND field_key IN ('gpsProviderId', 'gpsDeviceNo', 'gpsDeviceId', 'deviceNo')
      `,
    )
      .bind(nodeId)
      .all<{ fieldKey: string; fieldValue: string | null }>();
    const valueMap = Object.fromEntries(gpsValues.results.map((item) => [item.fieldKey, ensureString(item.fieldValue)]));
    const gpsProviderId = valueMap.gpsProviderId || ensureString(node.gpsProviderId);
    const gpsDeviceNo = valueMap.gpsDeviceNo || valueMap.gpsDeviceId || valueMap.deviceNo || ensureString(node.gpsDeviceNo);
    if (!gpsProviderId || !gpsDeviceNo) return { error: '该节点需要填写GPS服务商和GPS设备号。' };
  }
  const requiredFields = await env.DB.prepare(
    `
      SELECT DISTINCT workflow_node_form_fields.field_key as fieldKey, workflow_node_form_fields.field_name as fieldName
      FROM workflow_instance_nodes
      JOIN workflow_instances ON workflow_instances.id = workflow_instance_nodes.instance_id
      JOIN workflow_template_nodes ON (
        workflow_template_nodes.id = workflow_instance_nodes.template_node_id
        OR (
          workflow_template_nodes.template_id = workflow_instances.template_id
          AND workflow_template_nodes.node_name = workflow_instance_nodes.node_name
        )
      )
      JOIN workflow_node_form_fields ON workflow_node_form_fields.template_node_id = workflow_template_nodes.id
      WHERE workflow_instance_nodes.id = ? AND workflow_node_form_fields.required = 1
    `,
  )
    .bind(nodeId)
    .all<Record<string, unknown>>();
  for (const field of requiredFields.results) {
    const value = await env.DB.prepare('SELECT field_value as fieldValue FROM workflow_node_form_values WHERE instance_node_id = ? AND field_key = ?')
      .bind(nodeId, field.fieldKey)
      .first<{ fieldValue: string | null }>();
    if (!value?.fieldValue) return { error: `请填写必填字段：${field.fieldName}` };
  }
  const requiredFiles = await env.DB.prepare(
    `
      SELECT DISTINCT workflow_node_file_requirements.file_name as fileName
      FROM workflow_instance_nodes
      JOIN workflow_instances ON workflow_instances.id = workflow_instance_nodes.instance_id
      JOIN workflow_template_nodes ON (
        workflow_template_nodes.id = workflow_instance_nodes.template_node_id
        OR (
          workflow_template_nodes.template_id = workflow_instances.template_id
          AND workflow_template_nodes.node_name = workflow_instance_nodes.node_name
        )
      )
      JOIN workflow_node_file_requirements ON workflow_node_file_requirements.template_node_id = workflow_template_nodes.id
      WHERE workflow_instance_nodes.id = ? AND workflow_node_file_requirements.required = 1
    `,
  )
    .bind(nodeId)
    .all<Record<string, unknown>>();
  if (requiredFiles.results.length) {
    const count = await env.DB.prepare('SELECT COUNT(*) as count FROM workflow_node_files WHERE instance_node_id = ?').bind(nodeId).first<{ count: number }>();
    if (!count?.count) return { error: '请上传当前节点必传附件。' };
  }
  return { ok: true };
}

type StateMachineRulePayload = {
  ruleName?: string;
  scope?: string;
  eventType?: string;
  conditionJson?: string | Record<string, unknown>;
  actionType?: string;
  actionConfigJson?: string | Record<string, unknown>;
  enabled?: boolean | number;
  remark?: string;
};

type StateMachineEventPayload = {
  source?: string;
  scope?: string;
  eventType?: string;
  refId?: string;
  payload?: Record<string, unknown>;
};

type StateMachineRuleRecord = {
  id: string;
  ruleName: string;
  scope: string;
  eventType: string;
  conditionJson: string;
  actionType: string;
  actionConfigJson: string;
  enabled: boolean;
  remark?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function normalizeJsonText(value: unknown, fallback = '{}') {
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return fallback;
    try {
      JSON.parse(text);
      return text;
    } catch {
      return fallback;
    }
  }
  if (value && typeof value === 'object') return JSON.stringify(value);
  return fallback;
}

function parseJsonRecord(value: string | null | undefined) {
  if (!value) return {} as Record<string, unknown>;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function workflowActionEventType(action: string) {
  const map: Record<string, string> = {
    start: 'workflow.node.started',
    save: 'workflow.node.saved',
    submit: 'workflow.node.completed',
    return: 'workflow.node.returned',
    skip: 'workflow.node.skipped',
    hold: 'workflow.node.held',
    exception: 'workflow.node.exception',
    reassign: 'workflow.node.reassigned',
  };
  return map[action] ?? `workflow.node.${action}`;
}

function matchesStateMachineCondition(condition: Record<string, unknown>, event: Record<string, unknown>) {
  const payload = parseJsonRecord(ensureString(event.payloadJson));
  return Object.entries(condition).every(([key, expected]) => {
    if (expected === undefined || expected === null || expected === '') return true;
    const actual = key in event ? event[key] : payload[key];
    if (Array.isArray(expected)) return expected.map(String).includes(String(actual ?? ''));
    return String(actual ?? '') === String(expected);
  });
}

async function listStateMachineRules(env: Env): Promise<StateMachineRuleRecord[]> {
  const rows = await env.DB.prepare(
    `
      SELECT id, rule_name as ruleName, scope, event_type as eventType, condition_json as conditionJson,
             action_type as actionType, action_config_json as actionConfigJson, enabled, remark,
             created_at as createdAt, updated_at as updatedAt
      FROM state_machine_rules
      ORDER BY enabled DESC, updated_at DESC, created_at DESC
    `,
  ).all<Record<string, unknown>>();
  return rows.results.map((row) => ({
    id: ensureString(row.id),
    ruleName: ensureString(row.ruleName),
    scope: ensureString(row.scope),
    eventType: ensureString(row.eventType),
    conditionJson: ensureString(row.conditionJson) || '{}',
    actionType: ensureString(row.actionType),
    actionConfigJson: ensureString(row.actionConfigJson) || '{}',
    enabled: Number(row.enabled ?? 0) === 1,
    remark: row.remark == null ? null : ensureString(row.remark),
    createdAt: row.createdAt == null ? null : ensureString(row.createdAt),
    updatedAt: row.updatedAt == null ? null : ensureString(row.updatedAt),
  }));
}

async function upsertStateMachineRule(env: Env, payload: StateMachineRulePayload, id?: string) {
  const ruleId = id ?? createId('smr');
  const ruleName = ensureString(payload.ruleName);
  if (!ruleName) return { error: '请填写规则名称。' };
  const now = isoNow();
  const existing = id ? await env.DB.prepare('SELECT id FROM state_machine_rules WHERE id = ?').bind(id).first<{ id: string }>() : null;
  const values = [
    ruleId,
    ruleName,
    ensureString(payload.scope) || 'workflow_node',
    ensureString(payload.eventType) || 'workflow.node.completed',
    normalizeJsonText(payload.conditionJson),
    ensureString(payload.actionType) || 'log_only',
    normalizeJsonText(payload.actionConfigJson),
    payload.enabled === false || payload.enabled === 0 ? 0 : 1,
    ensureString(payload.remark),
    now,
  ] as const;
  if (existing) {
    await env.DB.prepare(
      `
        UPDATE state_machine_rules
        SET rule_name = ?, scope = ?, event_type = ?, condition_json = ?, action_type = ?,
            action_config_json = ?, enabled = ?, remark = ?, updated_at = ?
        WHERE id = ?
      `,
    )
      .bind(values[1], values[2], values[3], values[4], values[5], values[6], values[7], values[8], values[9], ruleId)
      .run();
  } else {
    await env.DB.prepare(
      `
        INSERT INTO state_machine_rules (
          id, rule_name, scope, event_type, condition_json, action_type, action_config_json,
          enabled, remark, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
      .bind(...values, now)
      .run();
  }
  return { item: (await listStateMachineRules(env)).find((item) => item.id === ruleId) };
}

async function deleteStateMachineRule(env: Env, id: string) {
  await env.DB.prepare('DELETE FROM state_machine_rules WHERE id = ?').bind(id).run();
  return { ok: true };
}

async function listStateMachineEvents(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT id, source, scope, event_type as eventType, ref_id as refId, payload_json as payloadJson,
             status, created_at as createdAt, processed_at as processedAt
      FROM state_machine_events
      ORDER BY created_at DESC
      LIMIT 200
    `,
  ).all<Record<string, unknown>>();
  return rows.results;
}

async function listStateMachineLogs(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT state_machine_logs.id, state_machine_logs.rule_id as ruleId, state_machine_rules.rule_name as ruleName,
             state_machine_logs.event_id as eventId, state_machine_logs.action_type as actionType,
             state_machine_logs.status, state_machine_logs.message, state_machine_logs.created_at as createdAt
      FROM state_machine_logs
      LEFT JOIN state_machine_rules ON state_machine_rules.id = state_machine_logs.rule_id
      ORDER BY state_machine_logs.created_at DESC
      LIMIT 300
    `,
  ).all<Record<string, unknown>>();
  return rows.results;
}

async function appendStateMachineLog(env: Env, eventId: string, ruleId: string | null, actionType: string, status: string, message: string) {
  await env.DB.prepare(
    'INSERT INTO state_machine_logs (id, rule_id, event_id, action_type, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(createId('sml'), ruleId, eventId, actionType, status, message, isoNow())
    .run();
}

async function executeStateMachineRule(env: Env, event: Record<string, unknown>, rule: Record<string, unknown>) {
  const actionType = ensureString(rule.actionType) || 'log_only';
  const eventId = ensureString(event.id);
  const ruleId = ensureString(rule.id);
  if (actionType === 'log_only' || actionType === 'todo_reminder') {
    await appendStateMachineLog(env, eventId, ruleId, actionType, 'success', actionType === 'todo_reminder' ? '待办提醒动作已记录，后续版本执行。' : '规则已匹配。');
    return;
  }
  if (actionType === 'feishu_card') {
    const refId = ensureString(event.refId);
    if (ensureString(event.scope) === 'workflow_node' && refId) {
      const result =
        ensureString(event.eventType) === 'workflow.node.timeout'
          ? await sendWorkflowTimeoutReminderByFeishu(env, refId)
          : await remindWorkflowNodeByFeishu(env, refId);
      if ('skipped' in result && result.skipped) {
        await appendStateMachineLog(env, eventId, ruleId, actionType, 'skipped', ensureString(result.message) || '已跳过。');
        return;
      }
      if ('error' in result && result.error) {
        await appendStateMachineLog(env, eventId, ruleId, actionType, 'failed', ensureString(result.error));
        return;
      }
      await appendStateMachineLog(env, eventId, ruleId, actionType, 'success', `飞书卡片已发送：${Number((result as { sent?: number }).sent ?? 0)} 人。`);
      return;
    }
    await appendStateMachineLog(env, eventId, ruleId, actionType, 'skipped', '当前事件没有可通知的流程节点。');
    return;
  }
  await appendStateMachineLog(env, eventId, ruleId, actionType, 'skipped', `暂不支持的动作：${actionType}`);
}

async function processStateMachineEvent(env: Env, eventId: string) {
  const event = await env.DB.prepare(
    `
      SELECT id, source, scope, event_type as eventType, ref_id as refId, payload_json as payloadJson,
             status, created_at as createdAt
      FROM state_machine_events
      WHERE id = ?
    `,
  )
    .bind(eventId)
    .first<Record<string, unknown>>();
  if (!event) return { error: '状态机事件不存在。' };
  const rules = await env.DB.prepare(
    `
      SELECT id, rule_name as ruleName, scope, event_type as eventType, condition_json as conditionJson,
             action_type as actionType, action_config_json as actionConfigJson
      FROM state_machine_rules
      WHERE enabled = 1
        AND (scope = ? OR scope = 'all')
        AND (event_type = ? OR event_type = '*' OR event_type = 'any')
      ORDER BY updated_at DESC
    `,
  )
    .bind(event.scope, event.eventType)
    .all<Record<string, unknown>>();
  let matched = 0;
  for (const rule of rules.results) {
    const condition = parseJsonRecord(ensureString(rule.conditionJson));
    if (!matchesStateMachineCondition(condition, event)) continue;
    matched += 1;
    await executeStateMachineRule(env, event, rule);
  }
  const now = isoNow();
  await env.DB.prepare('UPDATE state_machine_events SET status = ?, processed_at = ? WHERE id = ?').bind('processed', now, eventId).run();
  if (!matched) await appendStateMachineLog(env, eventId, null, 'none', 'skipped', '没有匹配到启用规则。');
  return { ok: true, matched };
}

async function createStateMachineEvent(env: Env, payload: StateMachineEventPayload) {
  const eventType = ensureString(payload.eventType);
  if (!eventType) return { error: '请填写事件类型。' };
  const eventId = createId('sme');
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO state_machine_events (
        id, source, scope, event_type, ref_id, payload_json, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      eventId,
      ensureString(payload.source) || 'system',
      ensureString(payload.scope) || 'workflow_node',
      eventType,
      ensureString(payload.refId),
      normalizeJsonText(payload.payload),
      'pending',
      now,
    )
    .run();
  await processStateMachineEvent(env, eventId);
  return { id: eventId };
}

async function scanWorkflowTimeoutEvents(env: Env) {
  const now = new Date();
  const rows = await env.DB.prepare(
    `SELECT workflow_instance_nodes.id, workflow_instance_nodes.node_name as nodeName,
            workflow_instance_nodes.timeout_at as timeoutAt,
            workflow_instance_nodes.planned_end_at as plannedEndAt,
            workflow_instance_nodes.started_at as startedAt,
            workflow_instance_nodes.planned_duration_hours as plannedDurationHours,
            workflow_instance_nodes.status, workflow_instance_nodes.task_id as taskId,
            workflow_instance_nodes.project_id as projectId,
            oversize_project_tasks.task_no as taskNo,
            oversize_project_tasks.status as taskStatus
     FROM workflow_instance_nodes
     JOIN oversize_project_tasks ON oversize_project_tasks.id = workflow_instance_nodes.task_id
     WHERE workflow_instance_nodes.status IN ('待处理', '处理中')
       AND COALESCE(workflow_instance_nodes.started_at, '') != ''
       AND COALESCE(workflow_instance_nodes.planned_duration_hours, 0) > 0
       AND COALESCE(oversize_project_tasks.status, '') NOT IN ('完成', '已完成', '取消', '已取消')
     ORDER BY workflow_instance_nodes.started_at ASC
     LIMIT 300`,
  ).all<{
    id: string;
    nodeName?: string | null;
    timeoutAt?: string | null;
    plannedEndAt?: string | null;
    startedAt?: string | null;
    plannedDurationHours?: number | string | null;
    status?: string | null;
    taskId?: string | null;
    projectId?: string | null;
    taskNo?: string | null;
    taskStatus?: string | null;
  }>();

  let overdue = 0;
  let emitted = 0;
  let skippedLimit = 0;
  let invalidPlan = 0;
  for (const node of rows.results ?? []) {
    if (isWorkflowNodeHeld(node.status)) continue;
    const startedAt = ensureString(node.startedAt);
    const startedDate = parseWorkflowTimeoutDate(startedAt);
    const plannedDurationHours = Number(node.plannedDurationHours || 0);
    if (!startedDate || !Number.isFinite(plannedDurationHours) || plannedDurationHours <= 0) {
      invalidPlan += 1;
      continue;
    }
    const expectedEndDate = new Date(startedDate.getTime() + plannedDurationHours * 60 * 60 * 1000);
    if (expectedEndDate.getTime() > now.getTime()) continue;
    overdue += 1;
    const reminderCount = await countWorkflowTimeoutReminderSends(env, node.id);
    if (reminderCount >= WORKFLOW_TIMEOUT_REMINDER_LIMIT) {
      skippedLimit += 1;
      continue;
    }
    const dueAt = resolveWorkflowReminderDueAt({
      timeoutAt: node.timeoutAt,
      plannedEndAt: node.plannedEndAt,
      startedAt,
      plannedDurationHours,
    }) || expectedEndDate.toISOString();
    await createStateMachineEvent(env, {
      source: 'scheduler',
      scope: 'workflow_node',
      eventType: 'workflow.node.timeout',
      refId: node.id,
      payload: {
        nodeName: node.nodeName,
        timeoutAt: dueAt,
        plannedEndAt: dueAt,
        startedAt,
        plannedDurationHours,
        overdueByMinutes: Math.max(0, Math.round((now.getTime() - expectedEndDate.getTime()) / 60000)),
        taskId: node.taskId,
        projectId: node.projectId,
        taskNo: node.taskNo,
        reminderCountBefore: reminderCount,
        maxReminders: WORKFLOW_TIMEOUT_REMINDER_LIMIT,
      },
    });
    emitted += 1;
  }

  return {
    ok: true,
    scanned: rows.results?.length ?? 0,
    overdue,
    emitted,
    skippedLimit,
    invalidTimeout: invalidPlan,
    invalidPlan,
  };
}

async function workflowNodeAction(env: Env, nodeId: string, action: string, body: WorkflowActionPayload) {
  const node = await env.DB.prepare(
    'SELECT id, instance_id as instanceId, task_id as taskId, project_id as projectId, node_name as nodeName, sort_order as sortOrder, status, allow_skip as allowSkip, allow_return as allowReturn, owner FROM workflow_instance_nodes WHERE id = ?',
  )
    .bind(nodeId)
    .first<{ id: string; instanceId: string; taskId: string; projectId: string; nodeName: string; sortOrder: number; status: string; allowSkip: number; allowReturn: number; owner?: string | null }>();
  if (!node) return { error: '流程节点不存在。' };
  const instance = await env.DB.prepare('SELECT status, current_node_id as currentNodeId FROM workflow_instances WHERE id = ?')
    .bind(node.instanceId)
    .first<{ status: string; currentNodeId: string | null }>();
  if (instance?.status === '已完成' || instance?.status === '完成') {
    return { error: '运输任务已完成，不能再操作流程。' };
  }
  if (!instance || instance.currentNodeId !== node.id) {
    return { error: '只能操作当前待处理节点，历史节点不可再操作。' };
  }
  if (['已完成', '已跳过', '已退回'].includes(node.status)) {
    return { error: '该节点已流转完成，不能继续操作。' };
  }
  await saveWorkflowNodeData(env, nodeId, body);

  const now = isoNow();
  const actionTime = ensureString(body.operationTime) || now;
  const operator = ensureString(body.operator) || ensureString(node.owner);
  const operatorOwner = operator || null;
  let nextNode: { id: string; nodeName: string; owner?: string | null; ownerRoleId?: string | null; ownerRoleName?: string | null } | null = null;
  let nextStatus = node.status;
  let toNodeName = node.nodeName;
  let workflowCompleted = false;
  let activatedNodeId: string | null = null;
  if (action === 'start') {
    nextStatus = '处理中';
    await env.DB.prepare('UPDATE workflow_instance_nodes SET status = ?, owner = COALESCE(?, owner), started_at = COALESCE(started_at, ?), updated_at = ? WHERE id = ?').bind(nextStatus, operatorOwner, actionTime, now, nodeId).run();
  } else if (action === 'save') {
    nextStatus = node.status;
    await env.DB.prepare('UPDATE workflow_instance_nodes SET owner = COALESCE(?, owner), notes = ?, updated_at = ? WHERE id = ?').bind(operatorOwner, ensureString(body.remark), now, nodeId).run();
  } else if (action === 'submit') {
    const validation = await validateWorkflowNodeSubmit(env, nodeId);
    if (validation.error) return validation;
    nextStatus = '已完成';
    await env.DB.prepare('UPDATE workflow_instance_nodes SET status = ?, owner = COALESCE(?, owner), completed_at = ?, notes = ?, updated_at = ? WHERE id = ?').bind(nextStatus, operatorOwner, actionTime, ensureString(body.remark), now, nodeId).run();
    await syncWorkflowNodePayable(env, nodeId);
    nextNode = await env.DB.prepare(
      'SELECT id, node_name as nodeName, owner, owner_role_id as ownerRoleId, owner_role_name as ownerRoleName FROM workflow_instance_nodes WHERE instance_id = ? AND sort_order > ? AND status NOT IN (?, ?) ORDER BY sort_order ASC LIMIT 1',
    )
      .bind(node.instanceId, node.sortOrder, '已跳过', '已完成')
      .first<{ id: string; nodeName: string; owner?: string | null; ownerRoleId?: string | null; ownerRoleName?: string | null }>();
    if (nextNode) {
      toNodeName = nextNode.nodeName;
      await activateWorkflowNodeAndTodo(env, { ...nextNode, instanceId: node.instanceId, projectId: node.projectId, taskId: node.taskId }, now);
      activatedNodeId = nextNode.id;
    } else {
      toNodeName = '完成';
      await env.DB.prepare('UPDATE workflow_instances SET status = ?, current_node_id = NULL, completed_at = ?, updated_at = ? WHERE id = ?').bind('已完成', actionTime, now, node.instanceId).run();
      await env.DB.prepare('UPDATE oversize_project_tasks SET status = ?, progress = ?, updated_at = ? WHERE id = ?').bind('已完成', 100, now, node.taskId).run();
      workflowCompleted = true;
    }
  } else if (action === 'return') {
    if (!node.allowReturn) return { error: '当前节点不允许退回。' };
    nextStatus = '已退回';
    const prevNode = await env.DB.prepare('SELECT id, node_name as nodeName, owner, owner_role_id as ownerRoleId, owner_role_name as ownerRoleName FROM workflow_instance_nodes WHERE instance_id = ? AND sort_order < ? ORDER BY sort_order DESC LIMIT 1')
      .bind(node.instanceId, node.sortOrder)
      .first<{ id: string; nodeName: string; owner?: string | null; ownerRoleId?: string | null; ownerRoleName?: string | null }>();
    if (!prevNode) return { error: '没有可退回的上一节点。' };
    toNodeName = prevNode.nodeName;
    await env.DB.prepare('UPDATE workflow_instance_nodes SET status = ?, owner = COALESCE(?, owner), notes = ?, updated_at = ? WHERE id = ?').bind(nextStatus, operatorOwner, ensureString(body.remark), now, nodeId).run();
    await activateWorkflowNodeAndTodo(env, { ...prevNode, instanceId: node.instanceId, projectId: node.projectId, taskId: node.taskId }, now);
    activatedNodeId = prevNode.id;
  } else if (action === 'skip') {
    if (!node.allowSkip) return { error: '当前节点不允许跳过。' };
    nextStatus = '已跳过';
    await env.DB.prepare('UPDATE workflow_instance_nodes SET status = ?, owner = COALESCE(?, owner), notes = ?, updated_at = ? WHERE id = ?').bind(nextStatus, operatorOwner, ensureString(body.remark), now, nodeId).run();
    nextNode = await env.DB.prepare(
      'SELECT id, node_name as nodeName, owner, owner_role_id as ownerRoleId, owner_role_name as ownerRoleName FROM workflow_instance_nodes WHERE instance_id = ? AND sort_order > ? AND status NOT IN (?, ?) ORDER BY sort_order ASC LIMIT 1',
    )
      .bind(node.instanceId, node.sortOrder, '已跳过', '已完成')
      .first<{ id: string; nodeName: string; owner?: string | null; ownerRoleId?: string | null; ownerRoleName?: string | null }>();
    if (nextNode) {
      toNodeName = nextNode.nodeName;
      await activateWorkflowNodeAndTodo(env, { ...nextNode, instanceId: node.instanceId, projectId: node.projectId, taskId: node.taskId }, now);
      activatedNodeId = nextNode.id;
    } else {
      toNodeName = '完成';
      await env.DB.prepare('UPDATE workflow_instances SET status = ?, current_node_id = NULL, completed_at = ?, updated_at = ? WHERE id = ?').bind('已完成', actionTime, now, node.instanceId).run();
      await env.DB.prepare('UPDATE oversize_project_tasks SET status = ?, progress = ?, updated_at = ? WHERE id = ?').bind('已完成', 100, now, node.taskId).run();
      workflowCompleted = true;
    }
  } else if (action === 'hold') {
    nextStatus = '已挂起';
    await env.DB.prepare('UPDATE workflow_instance_nodes SET status = ?, owner = COALESCE(?, owner), notes = ?, updated_at = ? WHERE id = ?').bind(nextStatus, operatorOwner, ensureString(body.remark), now, nodeId).run();
  } else if (action === 'exception') {
    nextStatus = '异常';
    await env.DB.prepare('UPDATE workflow_instance_nodes SET status = ?, owner = COALESCE(?, owner), notes = ?, updated_at = ? WHERE id = ?').bind(nextStatus, operatorOwner, ensureString(body.remark), now, nodeId).run();
    await createOversizeException(env, node.projectId, { taskId: node.taskId, nodeId, title: `${node.nodeName}节点异常`, level: '重要', status: '处理中', description: ensureString(body.remark) });
  } else if (action === 'reassign') {
    nextStatus = node.status;
    await env.DB.prepare('UPDATE workflow_instance_nodes SET owner = ?, notes = ?, updated_at = ? WHERE id = ?').bind(ensureString(body.owner), ensureString(body.remark), now, nodeId).run();
  }

  await env.DB.prepare(
    `
      INSERT INTO workflow_transitions (
        id, instance_id, instance_node_id, task_id, project_id, operator, action, from_node_name, to_node_name,
        from_status, to_status, remark, attachments_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(createId('wftx'), node.instanceId, nodeId, node.taskId, node.projectId, operator, action, node.nodeName, toNodeName, node.status, nextStatus, ensureString(body.remark), normalizeFiles(body.files), actionTime)
    .run();
  await env.DB.prepare('UPDATE workflow_todos SET status = ?, updated_at = ? WHERE instance_node_id = ? AND status != ?').bind('已处理', now, nodeId, '已处理').run();
  const actionLabelMap: Record<string, string> = {
    start: '开始处理',
    save: '保存草稿',
    submit: '提交完成',
    return: '退回上一步',
    skip: '跳过节点',
    hold: '挂起流程',
    exception: '标记异常',
    reassign: '重新分配',
  };
  const actionLabel = actionLabelMap[action] ?? action;
  await createWorkflowTrackingRecord(env, nodeId, {
    trackedAt: actionTime,
    trackingStatus: actionLabel,
    content: ensureString(body.remark) || `${node.nodeName}：${actionLabel}`,
    operator,
    customerVisible: false,
    visibilityLevel: '内部资料',
    files: body.files,
    remark: toNodeName !== node.nodeName ? `流转至：${toNodeName}` : '',
  });
  if (workflowCompleted) {
    await createWorkflowTrackingRecord(env, nodeId, {
      trackedAt: actionTime,
      trackingStatus: '完成',
      content: '项目完成',
      operator,
      customerVisible: true,
      visibilityLevel: '客户可见资料',
      files: [],
      remark: '流程所有节点已完成',
    });
  }
  const progressRow = await env.DB.prepare(
    `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('已完成', '已跳过') THEN 1 ELSE 0 END) as completed
      FROM workflow_instance_nodes
      WHERE instance_id = ?
    `,
  )
    .bind(node.instanceId)
    .first<{ total: number; completed: number | null }>();
  const total = Number(progressRow?.total ?? 0);
  const completed = Number(progressRow?.completed ?? 0);
  const taskProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const refreshedInstance = await env.DB.prepare('SELECT status FROM workflow_instances WHERE id = ?')
    .bind(node.instanceId)
    .first<{ status: string }>();
  const nextTaskStatus =
    refreshedInstance?.status === '已完成'
      ? '已完成'
      : nextStatus === '异常'
        ? '异常'
        : nextStatus === '已挂起'
          ? '暂停'
          : action === 'save' || action === 'reassign'
            ? null
            : '运输中';
  if (nextTaskStatus) {
    await env.DB.prepare('UPDATE oversize_project_tasks SET status = ?, progress = ?, updated_at = ? WHERE id = ?')
      .bind(nextTaskStatus, taskProgress, now, node.taskId)
      .run();
  }
  await createStateMachineEvent(env, {
    source: 'workflow',
    scope: 'workflow_node',
    eventType: workflowActionEventType(action),
    refId: nodeId,
    payload: {
      instanceId: node.instanceId,
      taskId: node.taskId,
      projectId: node.projectId,
      nodeName: node.nodeName,
      action,
      fromStatus: node.status,
      toStatus: nextStatus,
      toNodeName,
      operator: ensureString(body.operator),
      operationTime: actionTime,
      remark: ensureString(body.remark),
    },
  });
  if (activatedNodeId) {
    await createStateMachineEvent(env, {
      source: 'workflow',
      scope: 'workflow_node',
      eventType: 'workflow.node.waiting',
      refId: activatedNodeId,
      payload: {
        instanceId: node.instanceId,
        taskId: node.taskId,
        projectId: node.projectId,
        fromNodeName: node.nodeName,
        nodeName: toNodeName,
        operator: ensureString(body.operator),
        operationTime: actionTime,
      },
    });
  }
  return { ok: true };
}

async function listWorkflowTrackingRecords(env: Env, nodeId: string) {
  const rows = await env.DB.prepare(
    `
      SELECT id, instance_id as instanceId, instance_node_id as instanceNodeId, project_id as projectId, task_id as taskId,
             node_name as nodeName, tracked_at as trackedAt, location, tracking_status as trackingStatus, content,
             operator, customer_visible as customerVisible, visibility_level as visibilityLevel, files_json as filesJson,
             remark, created_at as createdAt, updated_at as updatedAt
      FROM workflow_node_tracking_records
      WHERE instance_node_id = ?
      ORDER BY tracked_at DESC, created_at DESC
    `,
  )
    .bind(nodeId)
    .all<Record<string, unknown>>();
  return rows.results.map(mapWorkflowTrackingRecord);
}

async function searchTaskTrackingRecords(env: Env, keyword: string) {
  const searchText = ensureString(keyword);
  if (!searchText) return { error: '请输入任务号或查询关键字。' };
  const likeKeyword = `%${searchText.toLowerCase()}%`;
  const tasks = await env.DB.prepare(
    `
      SELECT oversize_project_tasks.id as taskId,
             oversize_project_tasks.task_no as taskNo,
             oversize_project_tasks.status,
             oversize_project_tasks.progress,
             oversize_project_tasks.vehicle_no as vehicleNo,
             oversize_project_tasks.vehicle_type as vehicleType,
             oversize_project_tasks.driver_name as driverName,
             oversize_project_tasks.driver_phone as driverPhone,
             oversize_project_tasks.cargo_summary as cargoSummary,
             oversize_projects.id as projectId,
             oversize_projects.project_no as projectNo,
             oversize_projects.name as projectName,
             oversize_projects.customer_name as customerName,
             oversize_projects.origin,
             oversize_projects.destination
      FROM oversize_project_tasks
      JOIN oversize_projects ON oversize_projects.id = oversize_project_tasks.project_id
      WHERE lower(oversize_project_tasks.task_no) LIKE ?
         OR lower(COALESCE(oversize_projects.customer_name, '')) LIKE ?
         OR lower(COALESCE(oversize_projects.name, '')) LIKE ?
         OR lower(COALESCE(oversize_projects.project_no, '')) LIKE ?
      ORDER BY oversize_project_tasks.updated_at DESC, oversize_project_tasks.created_at DESC
      LIMIT 20
    `,
  )
    .bind(likeKeyword, likeKeyword, likeKeyword, likeKeyword)
    .all<Record<string, unknown>>();

  const items = [];
  for (const task of tasks.results) {
    await startWorkflowForTask(env, String(task.taskId));
    const workflow = await env.DB.prepare(
      `
        SELECT workflow_instances.id as workflowInstanceId,
               workflow_instances.status as workflowStatus,
               workflow_instances.current_node_id as workflowCurrentNodeId,
               workflow_instance_nodes.node_name as workflowCurrentNodeName,
               workflow_instance_nodes.status as workflowCurrentNodeStatus,
               workflow_instance_nodes.owner as workflowCurrentNodeOwner,
               workflow_instance_nodes.owner_role_name as workflowCurrentNodeOwnerRoleName
        FROM workflow_instances
        LEFT JOIN workflow_instance_nodes ON workflow_instance_nodes.id = workflow_instances.current_node_id
        WHERE workflow_instances.task_id = ?
      `,
    )
      .bind(task.taskId)
      .first<Record<string, unknown>>();
    const trackingRows = await env.DB.prepare(
      `
        SELECT id, instance_id as instanceId, instance_node_id as instanceNodeId, project_id as projectId, task_id as taskId,
               node_name as nodeName, tracked_at as trackedAt, location, tracking_status as trackingStatus, content,
               operator, customer_visible as customerVisible, visibility_level as visibilityLevel, files_json as filesJson,
               remark, created_at as createdAt, updated_at as updatedAt
        FROM workflow_node_tracking_records
        WHERE task_id = ?
        ORDER BY tracked_at DESC, created_at DESC
      `,
    )
      .bind(task.taskId)
      .all<Record<string, unknown>>();
    items.push({
      ...task,
      ...(workflow ?? {}),
      trackingRecords: trackingRows.results.map(mapWorkflowTrackingRecord),
    });
  }
  return { items };
}

async function createWorkflowTrackingRecord(env: Env, nodeId: string, body: WorkflowTrackingPayload) {
  const node = await env.DB.prepare(
    'SELECT id, instance_id as instanceId, task_id as taskId, project_id as projectId, node_name as nodeName FROM workflow_instance_nodes WHERE id = ?',
  )
    .bind(nodeId)
    .first<{ id: string; instanceId: string; taskId: string; projectId: string; nodeName: string }>();
  if (!node) return { error: '流程节点不存在。' };
  const content = ensureString(body.content);
  if (!content) return { error: '跟踪内容不能为空。' };
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO workflow_node_tracking_records (
        id, instance_id, instance_node_id, project_id, task_id, node_name, tracked_at, location,
        tracking_status, content, operator, customer_visible, visibility_level, files_json, remark, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      createId('wftr'),
      node.instanceId,
      nodeId,
      node.projectId,
      node.taskId,
      node.nodeName,
      ensureString(body.trackedAt) || now,
      ensureString(body.location),
      ensureString(body.trackingStatus),
      content,
      ensureString(body.operator),
      boolToInt(body.customerVisible),
      ensureString(body.visibilityLevel) || '内部资料',
      normalizeFiles(body.files),
      ensureString(body.remark),
      now,
      now,
    )
    .run();
  return { ok: true };
}

function gpsEndpoint(apiUrl: string, action: string, params: Record<string, string> = {}) {
  const url = new URL(apiUrl);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}

async function postGpsJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { status: -1, cause: text || 'GPS服务商返回非JSON内容。' };
  }
  if (!response.ok) {
    const cause = typeof data === 'object' && data && 'cause' in data ? String((data as { cause?: unknown }).cause ?? '') : response.statusText;
    throw new Error(`GPS接口请求失败：${response.status} ${cause}`);
  }
  return data as T;
}

async function postGpsJsonForTest<T>(url: string, body: unknown): Promise<{ data: T; rawText: string; statusCode: number }> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const rawText = await response.text();
  let data: unknown = {};
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = { status: -1, cause: rawText || 'GPS服务商返回非JSON内容。' };
  }
  return { data: data as T, rawText, statusCode: response.status };
}

function gpsTimeText(value: unknown) {
  const text = ensureString(value);
  if (!text) return '';
  if (/^\d{13}$/.test(text)) return new Date(Number(text)).toISOString();
  if (/^\d{10}$/.test(text)) return new Date(Number(text) * 1000).toISOString();
  return text;
}

function gpsLoginStatusMessage(status: unknown, cause?: unknown) {
  const code = Number(status);
  const causeText = ensureString(cause);
  if (causeText && causeText !== String(status)) return causeText;
  const map: Record<number, string> = {
    [-1]: '登录失败',
    1: '密码错误，请填写32位小写MD5，不是明文密码',
    2: '禁止登录',
    3: '账号已停用',
    4: '设备到期',
    5: '设备过期',
    9903: 'Token过期',
    9906: '账号已在其他地方登录',
  };
  return map[code] || `状态码 ${status || '未知'}`;
}

function gpsResponseSummary(data: unknown, rawText: string) {
  if (typeof data === 'object' && data) {
    const keys = Object.keys(data as Record<string, unknown>);
    if (keys.length) return `返回字段：${keys.slice(0, 8).join(', ')}`;
  }
  const text = rawText.replace(/\s+/g, ' ').trim();
  return text ? `返回摘要：${text.slice(0, 160)}` : '返回内容为空';
}

async function loginGpsProvider(env: Env, provider: Record<string, unknown>) {
  const apiUrl = ensureString(provider.apiUrl);
  const username = ensureString(provider.username);
  const passwordMd5 = ensureString(provider.passwordMd5);
  if (!apiUrl) return { error: '请先维护GPS服务商API地址。' };
  if (!username) return { error: '请先维护GPS服务商登录账号。' };
  if (!passwordMd5) return { error: '请先维护GPS服务商密码MD5。' };
  let loginUrl = '';
  try {
    loginUrl = gpsEndpoint(apiUrl, 'login');
  } catch {
    return { error: 'GPS服务商API地址格式不正确，请填写完整URL。' };
  }
  const result = await postGpsJson<{ status?: number; cause?: string; token?: string; serverid?: string }>(loginUrl, {
    type: 'USER',
    from: 'web',
    username,
    password: passwordMd5,
    browser: 'OST-TMS',
  });
  if (Number(result.status ?? 0) !== 0 || !result.token) {
    return { error: `GPS登录失败：${gpsLoginStatusMessage(result.status, result.cause)}` };
  }
  const expiresAt = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare('UPDATE gps_providers SET login_token = ?, server_id = ?, token_expires_at = ?, updated_at = ? WHERE id = ?')
    .bind(result.token, result.serverid || '', expiresAt, isoNow(), provider.id)
    .run();
  return { token: result.token, serverId: result.serverid || '' };
}

async function testGpsProviderConnection(body: GpsProviderPayload) {
  const apiUrl = ensureString(body.apiUrl);
  const username = ensureString(body.username);
  const passwordMd5 = ensureString(body.passwordMd5);
  if (!apiUrl) return { error: '请先填写GPS服务商API地址。' };
  if (!username) return { error: '请先填写GPS服务商登录账号。' };
  if (!passwordMd5) return { error: '请先填写GPS服务商密码MD5。' };
  let loginUrl = '';
  try {
    loginUrl = gpsEndpoint(apiUrl, 'login');
  } catch {
    return { error: 'GPS服务商API地址格式不正确，请填写完整URL。' };
  }
  const { data: result, rawText, statusCode } = await postGpsJsonForTest<{ status?: number; cause?: string; token?: string; serverid?: string }>(loginUrl, {
    type: 'USER',
    from: 'web',
    username,
    password: passwordMd5,
    browser: 'OST-TMS',
  });
  if (statusCode < 200 || statusCode >= 300) {
    return { error: `GPS登录测试失败：HTTP ${statusCode}。请检查API地址。${gpsResponseSummary(result, rawText)}` };
  }
  if (Number(result.status ?? 0) !== 0 || !result.token) {
    return { error: `GPS登录测试失败：${gpsLoginStatusMessage(result.status, result.cause)}。请求地址：${loginUrl}。${gpsResponseSummary(result, rawText)}` };
  }
  return { ok: true, serverId: result.serverid || '', message: result.serverid ? 'GPS登录测试成功。' : 'GPS登录测试成功，服务商未返回serverid，后续查询将只使用token。' };
}

function mapMapConfig(row: Record<string, unknown> | null | undefined) {
  return {
    id: ensureString(row?.id) || 'default',
    provider: ensureString(row?.provider) || 'amap',
    amapWebKey: ensureString(row?.amapWebKey ?? row?.amap_web_key),
    amapRestKey: ensureString(row?.amapRestKey ?? row?.amap_rest_key),
    amapSecurityJsCode: ensureString(row?.amapSecurityJsCode ?? row?.amap_security_js_code),
    enabled: Number(row?.enabled ?? 1) === 1,
    remark: ensureString(row?.remark),
    createdAt: ensureString(row?.createdAt ?? row?.created_at),
    updatedAt: ensureString(row?.updatedAt ?? row?.updated_at),
  };
}

async function getMapConfig(env: Env) {
  const row = await env.DB.prepare(
    `
      SELECT id, provider, amap_web_key as amapWebKey, amap_rest_key as amapRestKey,
             amap_security_js_code as amapSecurityJsCode, enabled, remark, created_at as createdAt, updated_at as updatedAt
      FROM map_configs
      WHERE id = 'default'
    `,
  ).first<Record<string, unknown>>();
  if (row) return mapMapConfig(row);
  const now = isoNow();
  await env.DB.prepare('INSERT INTO map_configs (id, provider, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .bind('default', 'amap', 1, now, now)
    .run();
  return mapMapConfig({ id: 'default', provider: 'amap', enabled: 1, createdAt: now, updatedAt: now });
}

async function saveMapConfig(env: Env, body: Record<string, unknown>) {
  const now = isoNow();
  await env.DB.prepare(
    `
      INSERT INTO map_configs (
        id, provider, amap_web_key, amap_rest_key, amap_security_js_code, enabled, remark, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        provider = excluded.provider,
        amap_web_key = excluded.amap_web_key,
        amap_rest_key = excluded.amap_rest_key,
        amap_security_js_code = excluded.amap_security_js_code,
        enabled = excluded.enabled,
        remark = excluded.remark,
        updated_at = excluded.updated_at
    `,
  )
    .bind(
      'default',
      'amap',
      ensureString(body.amapWebKey),
      ensureString(body.amapRestKey),
      ensureString(body.amapSecurityJsCode),
      boolToInt(body.enabled, true),
      ensureString(body.remark),
      now,
      now,
    )
    .run();
  return getMapConfig(env);
}

function gpsNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function gpsCoordinates(record: Record<string, unknown>) {
  return {
    latitude: gpsNumber(record.callat ?? record.lat ?? record.latitude),
    longitude: gpsNumber(record.callon ?? record.lng ?? record.lon ?? record.longitude),
  };
}

async function reverseGeocodeAmap(env: Env, latitude: number, longitude: number) {
  const config = await getMapConfig(env);
  const key = config.enabled ? config.amapRestKey || config.amapWebKey : '';
  if (!key) return '';
  const endpoint = new URL('https://restapi.amap.com/v3/geocode/regeo');
  endpoint.searchParams.set('key', key);
  endpoint.searchParams.set('location', `${longitude},${latitude}`);
  endpoint.searchParams.set('extensions', 'base');
  endpoint.searchParams.set('radius', '1000');
  try {
    const response = await fetch(endpoint.toString());
    const data = (await response.json()) as { status?: string; regeocode?: { formatted_address?: string } };
    return data.status === '1' ? ensureString(data.regeocode?.formatted_address) : '';
  } catch {
    return '';
  }
}

async function upsertTaskGpsLocation(
  env: Env,
  params: {
    taskId: string;
    projectId?: string | null;
    nodeId?: string | null;
    providerId?: string | null;
    deviceNo?: string | null;
    latitude: number | null;
    longitude: number | null;
    locatedAt?: string | null;
    rawData?: Record<string, unknown> | null;
  },
) {
  if (!params.taskId || params.latitude === null || params.longitude === null) return null;
  const now = isoNow();
  const address = await reverseGeocodeAmap(env, params.latitude, params.longitude);
  const existing = await env.DB.prepare('SELECT id FROM task_gps_locations WHERE task_id = ?')
    .bind(params.taskId)
    .first<{ id: string }>();
  const id = existing?.id || createId('gpsloc');
  await env.DB.prepare(
    `
      INSERT INTO task_gps_locations (
        id, task_id, project_id, instance_node_id, provider_id, gps_device_no,
        latitude, longitude, address, located_at, raw_data, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(task_id) DO UPDATE SET
        project_id = excluded.project_id,
        instance_node_id = excluded.instance_node_id,
        provider_id = excluded.provider_id,
        gps_device_no = excluded.gps_device_no,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        address = excluded.address,
        located_at = excluded.located_at,
        raw_data = excluded.raw_data,
        updated_at = excluded.updated_at
    `,
  )
    .bind(
      id,
      params.taskId,
      params.projectId || null,
      params.nodeId || null,
      params.providerId || null,
      params.deviceNo || null,
      params.latitude,
      params.longitude,
      address,
      params.locatedAt || now,
      JSON.stringify(params.rawData || {}),
      now,
      now,
    )
    .run();
  return { id, address, latitude: params.latitude, longitude: params.longitude, locatedAt: params.locatedAt || now };
}

async function fetchGpsLatestPosition(env: Env, nodeId: string) {
  const node = await env.DB.prepare(
    'SELECT id, instance_id as instanceId, task_id as taskId, project_id as projectId, node_name as nodeName, require_gps as requireGps, gps_provider_id as gpsProviderId, gps_device_no as gpsDeviceNo FROM workflow_instance_nodes WHERE id = ?',
  )
    .bind(nodeId)
    .first<{ id: string; instanceId: string; taskId: string; projectId: string; nodeName: string; requireGps?: number | boolean; gpsProviderId?: string | null; gpsDeviceNo?: string | null }>();
  if (!node) return { error: '流程节点不存在。' };
  if (!node.requireGps) return { error: '当前节点未启用GPS轨迹。' };

  const formValues = await env.DB.prepare(
    `
      SELECT field_key as fieldKey, field_value as fieldValue
      FROM workflow_node_form_values
      WHERE instance_node_id = ? AND field_key IN ('gpsProviderId', 'gpsDeviceNo', 'gpsDeviceId', 'deviceNo')
    `,
  )
    .bind(nodeId)
    .all<{ fieldKey: string; fieldValue: string | null }>();
  const valueMap = Object.fromEntries(formValues.results.map((item) => [item.fieldKey, ensureString(item.fieldValue)]));
  const deviceNo = valueMap.gpsDeviceNo || valueMap.gpsDeviceId || valueMap.deviceNo || ensureString(node.gpsDeviceNo);
  if (!deviceNo) return { error: '请先在当前节点填写GPS设备号。' };

  const provider =
    ((valueMap.gpsProviderId || ensureString(node.gpsProviderId))
      ? await env.DB.prepare(
          `
            SELECT id, short_name as shortName, name, api_url as apiUrl, username, password_md5 as passwordMd5,
                   login_token as loginToken, server_id as serverId, token_expires_at as tokenExpiresAt,
                   last_query_position_time as lastQueryPositionTime, enabled
            FROM gps_providers WHERE id = ?
          `,
        )
          .bind(valueMap.gpsProviderId || ensureString(node.gpsProviderId))
          .first<Record<string, unknown>>()
      : null) ||
    (await env.DB.prepare(
      `
        SELECT id, short_name as shortName, name, api_url as apiUrl, username, password_md5 as passwordMd5,
               login_token as loginToken, server_id as serverId, token_expires_at as tokenExpiresAt,
               last_query_position_time as lastQueryPositionTime, enabled
        FROM gps_providers WHERE enabled = 1 ORDER BY short_name ASC LIMIT 1
      `,
    ).first<Record<string, unknown>>());
  if (!provider || !provider.enabled) return { error: '未找到启用的GPS服务商。' };

  let token = ensureString(provider.loginToken);
  let serverId = ensureString(provider.serverId);
  const tokenExpiresAt = ensureString(provider.tokenExpiresAt);
  if (!token || !serverId || (tokenExpiresAt && Date.parse(tokenExpiresAt) <= Date.now())) {
    const login = await loginGpsProvider(env, provider);
    if ('error' in login) return login;
    token = login.token;
    serverId = login.serverId;
  }

  const apiUrl = ensureString(provider.apiUrl);
  let positionUrl = '';
  try {
    positionUrl = gpsEndpoint(apiUrl, 'lastposition', { token, serverid: serverId });
  } catch {
    return { error: 'GPS服务商API地址格式不正确，请填写完整URL。' };
  }

  const requestBody = {
    username: ensureString(provider.username),
    deviceids: [deviceNo],
    lastquerypositiontime: Number(provider.lastQueryPositionTime ?? 0) || 0,
  };
  let result = await postGpsJson<{
    status?: number;
    cause?: string;
    lastquerypositiontime?: number;
    records?: Array<Record<string, unknown>>;
  }>(positionUrl, requestBody);
  if (Number(result.status ?? 0) !== 0) {
    const login = await loginGpsProvider(env, provider);
    if ('error' in login) return { error: `GPS位置查询失败：${result.cause || result.status}` };
    positionUrl = gpsEndpoint(apiUrl, 'lastposition', { token: login.token, serverid: login.serverId });
    result = await postGpsJson(positionUrl, requestBody);
  }
  if (Number(result.status ?? 0) !== 0) return { error: `GPS位置查询失败：${result.cause || result.status || '未知错误'}` };
  if (result.lastquerypositiontime !== undefined) {
    await env.DB.prepare('UPDATE gps_providers SET last_query_position_time = ?, updated_at = ? WHERE id = ?')
      .bind(Number(result.lastquerypositiontime) || 0, isoNow(), provider.id)
      .run();
  }
  const record = (result.records ?? []).find((item) => ensureString(item.deviceid) === deviceNo) ?? result.records?.[0];
  if (!record) return { error: 'GPS服务商未返回该设备的最新位置。' };

  const { latitude, longitude } = gpsCoordinates(record);
  const gpsTime = gpsTimeText(record.validpoistiontime ?? record.devicetime ?? record.updatetime ?? record.arrivedtime);
  const locatedAt = gpsTime || isoNow();
  const speed = record.speed !== undefined ? `${record.speed} km/h` : '-';
  const location = latitude !== null && longitude !== null ? `${latitude}, ${longitude}` : '';
  const content = [
    `GPS设备：${deviceNo}`,
    gpsTime ? `定位时间：${gpsTime}` : '',
    latitude !== null && longitude !== null ? `坐标：${latitude}, ${longitude}` : '',
    `速度：${speed}`,
    record.strstatus ? `状态：${record.strstatus}` : '',
    record.stralarm ? `报警：${record.stralarm}` : '',
  ]
    .filter(Boolean)
    .join('；');

  await createWorkflowTrackingRecord(env, nodeId, {
    trackedAt: isoNow(),
    location,
    trackingStatus: 'GPS最新位置',
    content,
    operator: 'GPS同步',
    customerVisible: true,
    visibilityLevel: '客户可见资料',
    remark: `服务商：${provider.shortName || provider.name}`,
  });
  const latestLocation = await upsertTaskGpsLocation(env, {
    taskId: node.taskId,
    projectId: node.projectId,
    nodeId,
    providerId: ensureString(provider.id),
    deviceNo,
    latitude,
    longitude,
    locatedAt,
    rawData: record,
  });
  return { ok: true, provider: mapGpsProvider(provider), deviceNo, position: record, location: latestLocation };
}

async function listTaskMapItems(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        oversize_project_tasks.id,
        oversize_project_tasks.task_no as taskNo,
        oversize_project_tasks.status,
        oversize_project_tasks.progress,
        oversize_project_tasks.vehicle_no as vehicleNo,
        oversize_project_tasks.vehicle_type as vehicleType,
        oversize_project_tasks.driver_name as driverName,
        oversize_project_tasks.driver_phone as driverPhone,
        oversize_projects.id as projectId,
        oversize_projects.project_no as projectNo,
        oversize_projects.name as projectName,
        oversize_projects.customer_name as customerName,
        COALESCE(NULLIF(customers.short_name, ''), oversize_projects.customer_name) as customerShortName,
        oversize_projects.origin,
        oversize_projects.destination,
        workflow_instances.current_node_id as currentNodeId,
        workflow_instance_nodes.node_name as currentNodeName,
        workflow_instance_nodes.status as currentNodeStatus,
        workflow_instance_nodes.owner as currentOwner,
        workflow_instance_nodes.require_gps as requireGps,
        task_gps_locations.latitude,
        task_gps_locations.longitude,
        task_gps_locations.address,
        task_gps_locations.located_at as locatedAt,
        task_gps_locations.updated_at as locationUpdatedAt,
        task_gps_locations.gps_device_no as gpsDeviceNo,
        gps_providers.short_name as gpsProviderShortName
      FROM oversize_project_tasks
      JOIN oversize_projects ON oversize_projects.id = oversize_project_tasks.project_id
      LEFT JOIN customers ON customers.id = oversize_projects.customer_id
      LEFT JOIN workflow_instances ON workflow_instances.task_id = oversize_project_tasks.id
      LEFT JOIN workflow_instance_nodes ON workflow_instance_nodes.id = workflow_instances.current_node_id
      LEFT JOIN task_gps_locations ON task_gps_locations.task_id = oversize_project_tasks.id
      LEFT JOIN gps_providers ON gps_providers.id = task_gps_locations.provider_id
      WHERE COALESCE(oversize_project_tasks.status, '') NOT IN ('已完成', '完成', 'COMPLETED', 'DONE', '取消', '已取消')
        AND COALESCE(oversize_project_tasks.progress, 0) < 100
      ORDER BY oversize_project_tasks.updated_at DESC, oversize_project_tasks.created_at DESC
    `,
  ).all<Record<string, unknown>>();
  return rows.results.map((row) => ({
    id: ensureString(row.id),
    taskNo: ensureString(row.taskNo),
    status: ensureString(row.status),
    progress: Number(row.progress ?? 0) || 0,
    vehicleNo: ensureString(row.vehicleNo),
    vehicleType: ensureString(row.vehicleType),
    driverName: ensureString(row.driverName),
    driverPhone: ensureString(row.driverPhone),
    projectId: ensureString(row.projectId),
    projectNo: ensureString(row.projectNo),
    projectName: ensureString(row.projectName),
    customerName: ensureString(row.customerName),
    customerShortName: ensureString(row.customerShortName),
    origin: ensureString(row.origin),
    destination: ensureString(row.destination),
    currentNodeId: ensureString(row.currentNodeId),
    currentNodeName: ensureString(row.currentNodeName),
    currentNodeStatus: ensureString(row.currentNodeStatus),
    currentOwner: ensureString(row.currentOwner),
    requireGps: Number(row.requireGps ?? 0) === 1,
    latitude: gpsNumber(row.latitude),
    longitude: gpsNumber(row.longitude),
    address: ensureString(row.address),
    locatedAt: ensureString(row.locatedAt),
    locationUpdatedAt: ensureString(row.locationUpdatedAt),
    gpsDeviceNo: ensureString(row.gpsDeviceNo),
    gpsProviderShortName: ensureString(row.gpsProviderShortName),
  }));
}

async function refreshTaskGpsLocation(env: Env, taskId: string) {
  const node = await env.DB.prepare(
    `
      SELECT workflow_instance_nodes.id
      FROM workflow_instances
      JOIN workflow_instance_nodes ON workflow_instance_nodes.instance_id = workflow_instances.id
      WHERE workflow_instances.task_id = ? AND workflow_instance_nodes.require_gps = 1
      ORDER BY
        CASE WHEN workflow_instance_nodes.status IN ('处理中', '待处理') THEN 0 ELSE 1 END,
        workflow_instance_nodes.sort_order DESC
      LIMIT 1
    `,
  )
    .bind(taskId)
    .first<{ id: string }>();
  if (!node) return { error: '当前任务没有启用GPS的流程节点。' };
  return fetchGpsLatestPosition(env, node.id);
}

async function updateWorkflowTrackingRecord(env: Env, recordId: string, body: WorkflowTrackingPayload) {
  const existing = await env.DB.prepare('SELECT id FROM workflow_node_tracking_records WHERE id = ?').bind(recordId).first<{ id: string }>();
  if (!existing) return { error: '跟踪记录不存在。' };
  const content = ensureString(body.content);
  if (!content) return { error: '跟踪内容不能为空。' };
  await env.DB.prepare(
    `
      UPDATE workflow_node_tracking_records
      SET tracked_at = ?, location = ?, tracking_status = ?, content = ?, operator = ?,
          customer_visible = ?, visibility_level = ?, files_json = ?, remark = ?, updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(
      ensureString(body.trackedAt) || isoNow(),
      ensureString(body.location),
      ensureString(body.trackingStatus),
      content,
      ensureString(body.operator),
      boolToInt(body.customerVisible),
      ensureString(body.visibilityLevel) || '内部资料',
      normalizeFiles(body.files),
      ensureString(body.remark),
      isoNow(),
      recordId,
    )
    .run();
  return { ok: true };
}

async function deleteWorkflowTrackingRecord(env: Env, recordId: string) {
  await env.DB.prepare('DELETE FROM workflow_node_tracking_records WHERE id = ?').bind(recordId).run();
  return { ok: true };
}

async function listWorkflowTodos(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT workflow_todos.id, workflow_todos.instance_id as instanceId, workflow_todos.instance_node_id as instanceNodeId,
             workflow_todos.project_id as projectId, workflow_todos.task_id as taskId,
             workflow_todos.title, workflow_todos.owner,
             workflow_todos.owner_role_id as ownerRoleId, workflow_todos.owner_role_name as ownerRoleName,
             workflow_todos.assignment_source as assignmentSource, workflow_todos.due_at as dueAt,
             workflow_todos.status, workflow_todos.priority, workflow_todos.created_at as createdAt,
             oversize_projects.name as projectName, oversize_projects.customer_name as customerName,
             COALESCE(NULLIF(customers.short_name, ''), oversize_projects.customer_name) as customerShortName,
             oversize_project_tasks.task_no as taskNo,
             oversize_project_tasks.vehicle_no as vehicleNo,
             oversize_project_tasks.vehicle_type as vehicleType,
             workflow_instance_nodes.node_name as nodeName
      FROM workflow_todos
      JOIN oversize_projects ON oversize_projects.id = workflow_todos.project_id
      LEFT JOIN customers ON customers.id = oversize_projects.customer_id
      JOIN oversize_project_tasks ON oversize_project_tasks.id = workflow_todos.task_id
      JOIN workflow_instance_nodes ON workflow_instance_nodes.id = workflow_todos.instance_node_id
      ORDER BY workflow_todos.created_at DESC
    `,
  ).all();
  return rows.results;
}

async function updateWorkflowTodo(env: Env, todoId: string, body: { status?: string; owner?: string; priority?: string }) {
  await env.DB.prepare(
    `
      UPDATE workflow_todos
      SET status = ?, owner = COALESCE(NULLIF(?, ''), owner), priority = COALESCE(NULLIF(?, ''), priority), updated_at = ?
      WHERE id = ?
    `,
  )
    .bind(ensureString(body.status) || '未处理', ensureString(body.owner), ensureString(body.priority), isoNow(), todoId)
    .run();
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

function publicUploadPath(key: string) {
  const safePath = key.split('/').map((part) => encodeURIComponent(part)).join('/');
  return `/api/uploads/${safePath}`;
}

function publicUploadUrl(request: Request, key: string) {
  const url = new URL(request.url);
  return `${url.origin}${publicUploadPath(key)}`;
}

function xmlEscape(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function beijingTimeText(date = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

type GoogleAddress = {
  formattedAddress: string;
  country?: string;
  city?: string;
  raw?: unknown;
};

function parseGoogleAddress(data: any): GoogleAddress {
  const result = Array.isArray(data?.results) ? data.results[0] : null;
  const components = Array.isArray(result?.address_components) ? result.address_components : [];
  const findComponent = (...types: string[]) =>
    components.find((component: any) => Array.isArray(component.types) && types.some((type) => component.types.includes(type)))?.long_name ?? '';
  return {
    formattedAddress: ensureString(result?.formatted_address),
    country: findComponent('country'),
    city: findComponent('locality', 'administrative_area_level_1', 'administrative_area_level_2'),
    raw: data,
  };
}

async function reverseGeocode(env: Env, latitude: number, longitude: number, language: 'ru' | 'zh-CN') {
  if (!env.GOOGLE_MAPS_API_KEY) {
    return { formattedAddress: '', raw: { skipped: 'GOOGLE_MAPS_API_KEY is not configured' } } satisfies GoogleAddress;
  }
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('latlng', `${latitude},${longitude}`);
  url.searchParams.set('language', language);
  url.searchParams.set('key', env.GOOGLE_MAPS_API_KEY);
  const response = await fetch(url.toString());
  if (!response.ok) return { formattedAddress: '', raw: { error: `Google geocode failed: ${response.status}` } } satisfies GoogleAddress;
  return parseGoogleAddress(await response.json());
}

async function saveStaticMap(env: Env, request: Request, checkpointId: string, latitude: number, longitude: number) {
  if (!env.ASSETS || !env.GOOGLE_MAPS_API_KEY) return { key: '', url: '' };
  const mapUrl = new URL('https://maps.googleapis.com/maps/api/staticmap');
  mapUrl.searchParams.set('center', `${latitude},${longitude}`);
  mapUrl.searchParams.set('zoom', '13');
  mapUrl.searchParams.set('size', '360x220');
  mapUrl.searchParams.set('scale', '2');
  mapUrl.searchParams.set('language', 'ru');
  mapUrl.searchParams.set('markers', `color:red|${latitude},${longitude}`);
  mapUrl.searchParams.set('key', env.GOOGLE_MAPS_API_KEY);
  const response = await fetch(mapUrl.toString());
  if (!response.ok) return { key: '', url: '' };
  const key = `driver-checkpoints/${checkpointId}-map.png`;
  await env.ASSETS.put(key, await response.arrayBuffer(), { httpMetadata: { contentType: 'image/png' } });
  return { key, url: publicUploadUrl(request, key) };
}

function createWatermarkSvg(input: {
  originalImageUrl: string;
  mapImageUrl?: string;
  timeText: string;
  addressRu: string;
  addressZh: string;
  latitude: number;
  longitude: number;
  plateNo?: string;
}) {
  const lines = [
    `Время / 时间: ${input.timeText}`,
    `Место / 地点 RU: ${input.addressRu || '-'}`,
    `Место / 地点 CN: ${input.addressZh || '-'}`,
    `Координаты / 坐标: ${input.latitude.toFixed(6)}, ${input.longitude.toFixed(6)}`,
    `Номер машины / 车牌号: ${input.plateNo || 'Не распознано / 未识别'}`,
  ];
  const textSpans = lines
    .map((line, index) => `<text x="44" y="${720 - (lines.length - index - 1) * 36}" fill="#fff" font-size="23" font-family="Arial, sans-serif">${xmlEscape(line)}</text>`)
    .join('\n');
  const map = input.mapImageUrl
    ? `<image href="${xmlEscape(input.mapImageUrl)}" x="844" y="36" width="360" height="220" preserveAspectRatio="xMidYMid slice"/><rect x="844" y="36" width="360" height="220" fill="none" stroke="#fff" stroke-width="4"/>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="800" viewBox="0 0 1240 800">
  <rect width="1240" height="800" fill="#111827"/>
  <image href="${xmlEscape(input.originalImageUrl)}" x="0" y="0" width="1240" height="800" preserveAspectRatio="xMidYMid slice"/>
  <rect x="24" y="500" width="920" height="264" rx="24" fill="#000" opacity="0.62"/>
  ${textSpans}
  ${map}
</svg>`;
}

function recognizePlatePlaceholder() {
  return '';
}

async function uploadDriverCheckpoint(env: Env, request: Request) {
  if (!env.ASSETS) return { error: 'R2 bucket is not configured yet.' };
  const formData = await request.formData();
  const image = formData.get('image_file');
  if (!(image instanceof File)) return { error: 'image_file is required.' };
  const tgId = ensureString(formData.get('tg_id'));
  if (!tgId) return { error: 'tg_id is required.' };
  const initData = ensureString(formData.get('init_data'));
  if (env.TELEGRAM_BOT_TOKEN) {
    const verified = await verifyTelegramInitData(initData, env.TELEGRAM_BOT_TOKEN);
    if (!verified.ok) return { error: verified.error };
    const verifiedTgId = verified.user?.id ? String(verified.user.id) : '';
    if (verifiedTgId && verifiedTgId !== tgId) return { error: 'Telegram user does not match tg_id.' };
  }
  const latitude = Number(formData.get('latitude'));
  const longitude = Number(formData.get('longitude'));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return { error: 'GPS coordinates are required.' };

  const checkpointId = createId('drvcp');
  const now = new Date();
  const checkinAt = now.toISOString();
  const timeText = beijingTimeText(now);
  const originalExt = image.type.includes('png') ? 'png' : 'jpg';
  const originalKey = `driver-checkpoints/${checkpointId}-original.${originalExt}`;
  await env.ASSETS.put(originalKey, await image.arrayBuffer(), {
    httpMetadata: { contentType: image.type || 'image/jpeg' },
  });
  const originalImageUrl = publicUploadUrl(request, originalKey);

  const [addressRu, addressZh, mapImage] = await Promise.all([
    reverseGeocode(env, latitude, longitude, 'ru'),
    reverseGeocode(env, latitude, longitude, 'zh-CN'),
    saveStaticMap(env, request, checkpointId, latitude, longitude),
  ]);
  const plateNo = recognizePlatePlaceholder();
  const svg = createWatermarkSvg({
    originalImageUrl,
    mapImageUrl: mapImage.url,
    timeText,
    addressRu: addressRu.formattedAddress,
    addressZh: addressZh.formattedAddress,
    latitude,
    longitude,
    plateNo,
  });
  const watermarkedKey = `driver-checkpoints/${checkpointId}-watermarked.svg`;
  const svgBytes = encoder.encode(svg);
  await env.ASSETS.put(watermarkedKey, svgBytes.buffer.slice(svgBytes.byteOffset, svgBytes.byteOffset + svgBytes.byteLength), {
    httpMetadata: { contentType: 'image/svg+xml' },
  });
  const watermarkedImageUrl = publicUploadUrl(request, watermarkedKey);

  await env.DB.prepare(
    `
      INSERT INTO driver_checkpoints (
        id, tg_id, tg_name, latitude, longitude, checkin_at, address_ru, address_zh,
        country_ru, country_zh, city_ru, city_zh, plate_no,
        original_image_key, original_image_url, watermarked_image_key, watermarked_image_url,
        map_image_key, map_image_url, raw_google_ru, raw_google_zh, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      checkpointId,
      tgId,
      ensureString(formData.get('tg_name')),
      latitude,
      longitude,
      checkinAt,
      addressRu.formattedAddress,
      addressZh.formattedAddress,
      addressRu.country || '',
      addressZh.country || '',
      addressRu.city || '',
      addressZh.city || '',
      plateNo,
      originalKey,
      originalImageUrl,
      watermarkedKey,
      watermarkedImageUrl,
      mapImage.key,
      mapImage.url,
      JSON.stringify(addressRu.raw ?? {}),
      JSON.stringify(addressZh.raw ?? {}),
      'VALID',
      checkinAt,
      checkinAt,
    )
    .run();

  return {
    ok: true,
    id: checkpointId,
    tgId,
    checkinAt,
    timeText,
    latitude,
    longitude,
    addressRu: addressRu.formattedAddress,
    addressZh: addressZh.formattedAddress,
    plateNo,
    originalImageUrl,
    watermarkedImageUrl,
    mapImageUrl: mapImage.url,
  };
}

async function listDriverCheckpoints(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT
        id,
        tg_id as tgId,
        tg_name as tgName,
        latitude,
        longitude,
        checkin_at as checkinAt,
        address_ru as addressRu,
        address_zh as addressZh,
        country_ru as countryRu,
        country_zh as countryZh,
        city_ru as cityRu,
        city_zh as cityZh,
        plate_no as plateNo,
        original_image_url as originalImageUrl,
        watermarked_image_url as watermarkedImageUrl,
        map_image_url as mapImageUrl,
        status,
        created_at as createdAt
      FROM driver_checkpoints
      ORDER BY checkin_at DESC, created_at DESC
      LIMIT 200
    `,
  ).all<Record<string, unknown>>();
  return rows.results;
}

async function refreshDriverCheckpointAddresses(env: Env) {
  const rows = await env.DB.prepare(
    `
      SELECT id, latitude, longitude
      FROM driver_checkpoints
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND (COALESCE(address_zh, '') = '' OR COALESCE(address_ru, '') = '')
      ORDER BY checkin_at DESC, created_at DESC
      LIMIT 50
    `,
  ).all<{ id: string; latitude: number; longitude: number }>();

  let updated = 0;
  for (const row of rows.results ?? []) {
    const latitude = Number(row.latitude);
    const longitude = Number(row.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    const [addressRu, addressZh] = await Promise.all([
      reverseGeocode(env, latitude, longitude, 'ru'),
      reverseGeocode(env, latitude, longitude, 'zh-CN'),
    ]);
    if (!addressRu.formattedAddress && !addressZh.formattedAddress) continue;
    await env.DB.prepare(
      `
        UPDATE driver_checkpoints
        SET address_ru = COALESCE(NULLIF(address_ru, ''), ?),
            address_zh = COALESCE(NULLIF(address_zh, ''), ?),
            country_ru = COALESCE(NULLIF(country_ru, ''), ?),
            country_zh = COALESCE(NULLIF(country_zh, ''), ?),
            city_ru = COALESCE(NULLIF(city_ru, ''), ?),
            city_zh = COALESCE(NULLIF(city_zh, ''), ?),
            raw_google_ru = COALESCE(NULLIF(raw_google_ru, ''), ?),
            raw_google_zh = COALESCE(NULLIF(raw_google_zh, ''), ?),
            updated_at = ?
        WHERE id = ?
      `,
    )
      .bind(
        addressRu.formattedAddress,
        addressZh.formattedAddress,
        addressRu.country || '',
        addressZh.country || '',
        addressRu.city || '',
        addressZh.city || '',
        JSON.stringify(addressRu.raw ?? {}),
        JSON.stringify(addressZh.raw ?? {}),
        new Date().toISOString(),
        row.id,
      )
      .run();
    updated += 1;
  }

  return { updated, scanned: rows.results?.length ?? 0 };
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
    fileUrl: publicUploadPath(key),
  };
}

export default {
  async scheduled(_controller: unknown, env: Env, ctx: { waitUntil(promise: Promise<unknown>): void }): Promise<void> {
    ctx.waitUntil(scanWorkflowTimeoutEvents(env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = corsOrigin(request, env);
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      const headers = new Headers();
      headers.set('access-control-allow-origin', origin);
      headers.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      headers.set('access-control-allow-headers', 'content-type,authorization,x-market-token');
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
      const fileName = decodeURIComponent(uploadMatch[1]).split('/').pop() || 'attachment';
      if (!headers.has('content-type')) {
        headers.set('content-type', 'application/octet-stream');
      }
      headers.set('content-disposition', `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`);
      headers.set('cache-control', 'private, max-age=3600');
      headers.set('access-control-allow-origin', origin);
      return new Response(object.body, {
        status: 200,
        headers,
      });
    }

    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      const body = await parseBody<LoginRequest>(request);
      const loginEmail = String(body.email ?? '').trim().toLowerCase();
      const loginPassword = String(body.password ?? '');
      if (!loginEmail || !loginPassword) {
        return badRequest(origin, 'Email and password are required.');
      }

      const user = await env.DB.prepare(
        'SELECT id, email, password_hash, real_name, role_code, role_name FROM users WHERE lower(email) = ? LIMIT 1',
      )
        .bind(loginEmail)
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

      const hashed = await sha256(loginPassword);
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
      const rbac = await getUserRbac(env, sessionUser);
      const enrichedSessionUser = mergeSessionRbac(sessionUser, rbac);

      const token = await createToken(enrichedSessionUser, env.AUTH_SECRET);
      return json({ token, user: enrichedSessionUser }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/feishu/auth-url' && request.method === 'GET') {
      const redirectUri = getFeishuRedirectUri(env, url.searchParams.get('redirect') ?? undefined);
      const result = getFeishuAuthUrl(env, redirectUri, url.searchParams.get('state') ?? undefined);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/feishu/mobile-login' && request.method === 'POST') {
      const result = await loginWithFeishu(env, await parseBody<FeishuLoginRequest>(request));
      if ('error' in result && result.error !== undefined) return json({ error: result.error }, { status: 401 }, origin);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/market-info/collect' && request.method === 'POST') {
      const expectedToken = ensureString(env.MARKET_IMPORT_TOKEN);
      const providedToken = ensureString(request.headers.get('x-market-token')) || ensureString(request.headers.get('authorization')).replace(/^Bearer\s+/i, '');
      if (expectedToken && providedToken !== expectedToken) return unauthorized(origin);
      const result = await createMarketInfo(env, await parseBody<MarketInfoPayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    if (url.pathname === '/api/driver/upload-checkpoint' && request.method === 'POST') {
      try {
        const result = await uploadDriverCheckpoint(env, request);
        if (result.error !== undefined) return badRequest(origin, result.error);
        return json(result, { status: 201 }, origin);
      } catch (error) {
        return badRequest(origin, error instanceof Error ? error.message : 'Driver checkpoint upload failed.');
      }
    }

    const sessionUser = await getUserFromRequest(request, env);
    if (!sessionUser) {
      return unauthorized(origin);
    }

    if (url.pathname === '/api/auth/me' && request.method === 'GET') {
      const rbac = await getUserRbac(env, sessionUser);
      return json({ user: mergeSessionRbac(sessionUser, rbac) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/feishu/binding' && request.method === 'GET') {
      return json(await getCurrentFeishuBinding(env, sessionUser), { status: 200 }, origin);
    }

    if (url.pathname === '/api/feishu/bind' && request.method === 'POST') {
      const result = await bindCurrentUserFeishu(env, sessionUser, await parseBody<FeishuBindRequest>(request));
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/mobile/workflow-todos' && request.method === 'GET') {
      return json({ items: await listMobileWorkflowTodos(env, sessionUser) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/driver/checkpoints' && request.method === 'GET') {
      return json({ items: await listDriverCheckpoints(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/driver/checkpoints/refresh-addresses' && request.method === 'POST') {
      return json(await refreshDriverCheckpointAddresses(env), { status: 200 }, origin);
    }

    if (url.pathname === '/api/rbac/permissions' && request.method === 'GET') {
      if (!isAdminUser(sessionUser)) return unauthorized(origin);
      return json({ items: await listRbacPermissions(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/rbac/roles' && request.method === 'GET') {
      if (!isAdminUser(sessionUser)) return unauthorized(origin);
      return json({ items: await listRbacRoles(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/rbac/roles' && request.method === 'POST') {
      if (!isAdminUser(sessionUser)) return unauthorized(origin);
      const result = await saveRbacRole(env, await parseBody<RbacRolePayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const rbacRoleMatch = url.pathname.match(/^\/api\/rbac\/roles\/([^/]+)$/);
    if (rbacRoleMatch && request.method === 'PUT') {
      if (!isAdminUser(sessionUser)) return unauthorized(origin);
      const result = await saveRbacRole(env, await parseBody<RbacRolePayload>(request), rbacRoleMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (rbacRoleMatch && request.method === 'DELETE') {
      if (!isAdminUser(sessionUser)) return unauthorized(origin);
      const result = await deleteRbacRole(env, rbacRoleMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/loading-ai-config' && request.method === 'GET') {
      return json(await getLoadingAiConfig(env), { status: 200 }, origin);
    }

    if (url.pathname === '/api/loading-ai-config' && request.method === 'PUT') {
      const result = await saveLoadingAiConfig(env, await parseBody<LoadingAiConfigPayload>(request));
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/market-info' && request.method === 'GET') {
      return json({ items: await listMarketInfo(env) }, { status: 200 }, origin);
    }

    const marketInfoMatch = url.pathname.match(/^\/api\/market-info\/([^/]+)$/);
    if (marketInfoMatch && request.method === 'DELETE') {
      return json(await invalidateMarketInfo(env, marketInfoMatch[1]), { status: 200 }, origin);
    }

    const employeeRolesMatch = url.pathname.match(/^\/api\/employees\/([^/]+)\/roles$/);
    if (employeeRolesMatch && request.method === 'PUT') {
      if (!isAdminUser(sessionUser)) return unauthorized(origin);
      const result = await updateEmployeeRoles(env, employeeRolesMatch[1], await parseBody<EmployeeRolePayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/employees/sync-feishu' && request.method === 'POST') {
      if (!isAdminUser(sessionUser)) return unauthorized(origin);
      const result = await syncEmployeeFeishuAccounts(env);
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
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

    if (url.pathname === '/api/executive-dashboard' && request.method === 'GET') {
      return json(await getExecutiveDashboard(env), { status: 200 }, origin);
    }

    if (url.pathname === '/api/dashboard/admin-tip' && request.method === 'POST') {
      const result = await sendDashboardAdminTip(env, sessionUser);
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/dashboard' && request.method === 'GET') {
      const totals = await env.DB.prepare(
        `
          SELECT
            (SELECT COUNT(*) FROM transport_inquiries) AS inquiryCount,
            (SELECT COUNT(*) FROM transport_inquiries WHERE status NOT IN ('完成报价', '已完成', '完成')) AS pendingQuoteCount,
            (SELECT COUNT(*) FROM oversize_projects) AS projectCount,
            (SELECT COUNT(*) FROM oversize_project_tasks) AS taskCount,
            (SELECT COUNT(*) FROM oversize_project_tasks WHERE status NOT IN ('已完成', '完成')) AS activeTaskCount,
            (SELECT COUNT(*) FROM workflow_todos WHERE status NOT IN ('已处理', 'completed')) AS todoCount,
            (SELECT COUNT(*) FROM oversize_project_exceptions WHERE status NOT IN ('已处理', '已关闭', '完成')) AS exceptionCount
        `,
      ).first<{
        inquiryCount: number;
        pendingQuoteCount: number;
        projectCount: number;
        taskCount: number;
        activeTaskCount: number;
        todoCount: number;
        exceptionCount: number;
      }>();

      const taskStatus = await env.DB.prepare(
        `
          SELECT status, COUNT(*) as count
          FROM oversize_project_tasks
          GROUP BY status
          ORDER BY count DESC
        `,
      ).all<{ status: string; count: number }>();

      const nodeStatus = await env.DB.prepare(
        `
          SELECT workflow_instance_nodes.node_name as nodeName, COUNT(*) as count
          FROM workflow_instances
          JOIN workflow_instance_nodes ON workflow_instance_nodes.id = workflow_instances.current_node_id
          WHERE workflow_instances.current_node_id IS NOT NULL
          GROUP BY workflow_instance_nodes.node_name
          ORDER BY workflow_instance_nodes.sort_order ASC
        `,
      ).all<{ nodeName: string; count: number }>();

      const recentTasks = await env.DB.prepare(
        `
          SELECT oversize_project_tasks.id, oversize_project_tasks.task_no as taskNo,
                 oversize_projects.name as projectName, oversize_projects.customer_name as customerName,
                 COALESCE(workflow_instance_nodes.node_name, '') as currentNode,
                 oversize_project_tasks.status, oversize_project_tasks.progress,
                 oversize_project_tasks.updated_at as updatedAt
          FROM oversize_project_tasks
          JOIN oversize_projects ON oversize_projects.id = oversize_project_tasks.project_id
          LEFT JOIN workflow_instances ON workflow_instances.task_id = oversize_project_tasks.id
          LEFT JOIN workflow_instance_nodes ON workflow_instance_nodes.id = workflow_instances.current_node_id
          ORDER BY oversize_project_tasks.updated_at DESC
          LIMIT 8
        `,
      ).all();

      const todos = await env.DB.prepare(
        `
          SELECT workflow_todos.id, workflow_todos.title, workflow_todos.status, workflow_todos.created_at as createdAt,
                 oversize_projects.name as projectName, oversize_projects.customer_name as customerName,
                 oversize_project_tasks.task_no as taskNo, workflow_instance_nodes.node_name as nodeName
          FROM workflow_todos
          JOIN oversize_projects ON oversize_projects.id = workflow_todos.project_id
          JOIN oversize_project_tasks ON oversize_project_tasks.id = workflow_todos.task_id
          JOIN workflow_instance_nodes ON workflow_instance_nodes.id = workflow_todos.instance_node_id
          WHERE workflow_todos.status NOT IN ('已处理', 'completed')
          ORDER BY workflow_todos.created_at DESC
          LIMIT 6
        `,
      ).all();

      const trackingRecords = await env.DB.prepare(
        `
          SELECT workflow_node_tracking_records.id, workflow_node_tracking_records.location,
                 workflow_node_tracking_records.tracking_status as trackingStatus,
                 workflow_node_tracking_records.content, workflow_node_tracking_records.tracked_at as trackedAt,
                 oversize_project_tasks.task_no as taskNo, workflow_instance_nodes.node_name as nodeName
          FROM workflow_node_tracking_records
          JOIN workflow_instance_nodes ON workflow_instance_nodes.id = workflow_node_tracking_records.instance_node_id
          JOIN oversize_project_tasks ON oversize_project_tasks.id = workflow_instance_nodes.task_id
          ORDER BY workflow_node_tracking_records.tracked_at DESC, workflow_node_tracking_records.created_at DESC
          LIMIT 8
        `,
      ).all();

      const finance = await financeSummary(env);

      return json(
        {
          totals: {
            inquiryCount: Number(totals?.inquiryCount ?? 0),
            pendingQuoteCount: Number(totals?.pendingQuoteCount ?? 0),
            projectCount: Number(totals?.projectCount ?? 0),
            taskCount: Number(totals?.taskCount ?? 0),
            activeTaskCount: Number(totals?.activeTaskCount ?? 0),
            todoCount: Number(totals?.todoCount ?? 0),
            exceptionCount: Number(totals?.exceptionCount ?? 0),
          },
          finance,
          taskStatus: taskStatus.results.map((item) => ({ status: item.status, count: Number(item.count) })),
          nodeStatus: nodeStatus.results.map((item) => ({ nodeName: item.nodeName, count: Number(item.count) })),
          recentTasks: recentTasks.results,
          todos: todos.results,
          trackingRecords: trackingRecords.results,
        },
        { status: 200 },
        origin,
      );
    }

    if (url.pathname === '/api/inquiry-tasks' && request.method === 'GET') {
      return json({ items: await listInquiryTasks(env, sessionUser) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/inquiry-tasks' && request.method === 'POST') {
      const result = await createInquiryTask(env, sessionUser, await parseBody<InquiryTaskPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(await getInquiryTask(env, result.id, sessionUser), { status: 201 }, origin);
    }

    const inquiryTaskActionMatch = url.pathname.match(/^\/api\/inquiry-tasks\/([^/]+)\/(quote|confirm)$/);
    if (inquiryTaskActionMatch && request.method === 'POST') {
      const [, id, action] = inquiryTaskActionMatch;
      const body = await parseBody<InquiryTaskQuotePayload & InquiryTaskConfirmPayload>(request);
      const result =
        action === 'quote'
          ? await quoteInquiryTask(env, sessionUser, id, body)
          : await confirmInquiryTask(env, sessionUser, id, body);
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(await getInquiryTask(env, id, sessionUser), { status: 200 }, origin);
    }

    const inquiryTaskMatch = url.pathname.match(/^\/api\/inquiry-tasks\/([^/]+)$/);
    if (inquiryTaskMatch && request.method === 'GET') {
      const item = await getInquiryTask(env, inquiryTaskMatch[1], sessionUser);
      if (!item) {
        return notFound(origin, 'Inquiry task not found.');
      }
      return json(item, { status: 200 }, origin);
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

    if (transportInquiryMatch && request.method === 'PUT') {
      const result = await updateTransportInquiry(
        env,
        transportInquiryMatch[1],
        await parseBody<TransportInquiryPayload>(request),
      );
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(await getTransportInquiry(env, transportInquiryMatch[1]), { status: 200 }, origin);
    }

    if (transportInquiryMatch && request.method === 'DELETE') {
      const result = await deleteTransportInquiry(env, transportInquiryMatch[1]);
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    const transportQuoteMatch = url.pathname.match(/^\/api\/transport-inquiries\/([^/]+)\/quote$/);
    if (transportQuoteMatch && request.method === 'POST') {
      const result = await quoteTransportInquiry(
        env,
        transportQuoteMatch[1],
        await parseBody<QuoteTransportInquiryPayload>(request),
      );
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(await getTransportInquiry(env, transportQuoteMatch[1]), { status: 200 }, origin);
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

    if (url.pathname === '/api/loading-plans' && request.method === 'GET') {
      return json({ items: await listLoadingPlans(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/loading-plans' && request.method === 'POST') {
      const result = await createLoadingPlan(env, await parseBody<LoadingPlanPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    if (url.pathname === '/api/employees' && request.method === 'GET') {
      return json({ items: await listEmployees(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/vehicle-types' && request.method === 'GET') {
      return json({ items: await listVehicleTypes(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/vehicle-type-quotes' && request.method === 'GET') {
      return json({ items: await listVehicleTypeQuotes(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/vehicle-type-quotes' && request.method === 'POST') {
      const result = await createVehicleTypeQuote(env, await parseBody<VehicleTypeQuotePayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const vehicleTypeQuoteMatch = url.pathname.match(/^\/api\/vehicle-type-quotes\/([^/]+)$/);
    if (vehicleTypeQuoteMatch && request.method === 'PUT') {
      const result = await updateVehicleTypeQuote(
        env,
        vehicleTypeQuoteMatch[1],
        await parseBody<VehicleTypeQuotePayload>(request),
      );
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (vehicleTypeQuoteMatch && request.method === 'DELETE') {
      const result = await deleteVehicleTypeQuote(env, vehicleTypeQuoteMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/exchange-rates' && request.method === 'GET') {
      return json({ items: await listExchangeRates(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/exchange-rates' && request.method === 'POST') {
      const result = await saveExchangeRate(env, await parseBody<ExchangeRatePayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    if (url.pathname === '/api/exchange-rates/sync' && request.method === 'POST') {
      const result = await syncExchangeRates(env);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    const exchangeRateMatch = url.pathname.match(/^\/api\/exchange-rates\/([^/]+)$/);
    if (exchangeRateMatch && request.method === 'PUT') {
      const result = await saveExchangeRate(env, await parseBody<ExchangeRatePayload>(request), exchangeRateMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (exchangeRateMatch && request.method === 'DELETE') {
      const result = await deleteExchangeRate(env, exchangeRateMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/loading-rules' && request.method === 'GET') {
      return json({ items: await listLoadingRules(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/loading-rules' && request.method === 'POST') {
      const result = await saveLoadingRule(env, await parseBody<LoadingRulePayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const loadingRuleMatch = url.pathname.match(/^\/api\/loading-rules\/([^/]+)$/);
    if (loadingRuleMatch && request.method === 'PUT') {
      const result = await saveLoadingRule(env, await parseBody<LoadingRulePayload>(request), loadingRuleMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (loadingRuleMatch && request.method === 'DELETE') {
      const result = await deleteLoadingRule(env, loadingRuleMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/working-time-rules' && request.method === 'GET') {
      return json({ items: await listWorkingTimeRules(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/working-time-rules' && request.method === 'POST') {
      const result = await saveWorkingTimeRule(env, await parseBody<WorkingTimeRulePayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const workingTimeRuleMatch = url.pathname.match(/^\/api\/working-time-rules\/([^/]+)$/);
    if (workingTimeRuleMatch && request.method === 'PUT') {
      const result = await saveWorkingTimeRule(env, await parseBody<WorkingTimeRulePayload>(request), workingTimeRuleMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (workingTimeRuleMatch && request.method === 'DELETE') {
      const result = await deleteWorkingTimeRule(env, workingTimeRuleMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/working-calendar-days' && request.method === 'GET') {
      return json({ items: await listWorkingCalendarDays(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/working-calendar-days' && request.method === 'POST') {
      const result = await saveWorkingCalendarDay(env, await parseBody<WorkingCalendarDayPayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const workingCalendarDayMatch = url.pathname.match(/^\/api\/working-calendar-days\/([^/]+)$/);
    if (workingCalendarDayMatch && request.method === 'PUT') {
      const result = await saveWorkingCalendarDay(env, await parseBody<WorkingCalendarDayPayload>(request), workingCalendarDayMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (workingCalendarDayMatch && request.method === 'DELETE') {
      const result = await deleteWorkingCalendarDay(env, workingCalendarDayMatch[1]);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/gps-providers' && request.method === 'GET') {
      return json({ items: await listGpsProviders(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/gps-providers' && request.method === 'POST') {
      const result = await saveGpsProvider(env, await parseBody<GpsProviderPayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    if (url.pathname === '/api/gps-providers/test' && request.method === 'POST') {
      const result = await testGpsProviderConnection(await parseBody<GpsProviderPayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    const gpsProviderMatch = url.pathname.match(/^\/api\/gps-providers\/([^/]+)$/);
    if (gpsProviderMatch && request.method === 'PUT') {
      const result = await saveGpsProvider(env, await parseBody<GpsProviderPayload>(request), gpsProviderMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (gpsProviderMatch && request.method === 'DELETE') {
      const result = await deleteGpsProvider(env, gpsProviderMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/vehicle-types' && request.method === 'POST') {
      const result = await createVehicleType(env, await parseBody<VehicleTypePayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    const vehicleTypeMatch = url.pathname.match(/^\/api\/vehicle-types\/([^/]+)$/);
    if (vehicleTypeMatch && request.method === 'PUT') {
      const result = await updateVehicleType(
        env,
        vehicleTypeMatch[1],
        await parseBody<VehicleTypePayload>(request),
      );
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/salespeople' && request.method === 'GET') {
      return json({ items: await listEmployees(env, true) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/employees' && request.method === 'POST') {
      const result = await createEmployee(env, await parseBody<EmployeePayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    const employeeResetPasswordMatch = url.pathname.match(/^\/api\/employees\/([^/]+)\/reset-password$/);
    if (employeeResetPasswordMatch && request.method === 'POST') {
      const result = await resetEmployeePassword(env, employeeResetPasswordMatch[1]);
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    const employeeMatch = url.pathname.match(/^\/api\/employees\/([^/]+)$/);
    if (employeeMatch && request.method === 'PUT') {
      const result = await updateEmployee(env, employeeMatch[1], await parseBody<EmployeePayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/customers' && request.method === 'GET') {
      return json({ items: await listCustomers(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/suppliers' && request.method === 'GET') {
      return json({ items: await listSuppliers(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/suppliers' && request.method === 'POST') {
      const result = await createSupplier(env, await parseBody<SupplierPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    if (url.pathname === '/api/finance/context' && request.method === 'GET') {
      return json(await financeContext(env), { status: 200 }, origin);
    }

    if (url.pathname === '/api/finance/summary' && request.method === 'GET') {
      return json(await financeSummary(env), { status: 200 }, origin);
    }

    if (url.pathname === '/api/finance/items' && request.method === 'GET') {
      return json({ items: await listFinanceItems(env, url.searchParams) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/finance/items' && request.method === 'POST') {
      const result = await createFinanceItem(env, await parseBody<FinanceItemPayload>(request));
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const financeItemMatch = url.pathname.match(/^\/api\/finance\/items\/([^/]+)$/);
    if (financeItemMatch) {
      if (request.method === 'PUT') {
        const result = await updateFinanceItem(env, financeItemMatch[1], await parseBody<FinanceItemPayload>(request));
        if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
        return json(result, { status: 200 }, origin);
      }
      if (request.method === 'DELETE') {
        const result = await deleteFinanceItem(env, financeItemMatch[1]);
        if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
        return json(result, { status: 200 }, origin);
      }
    }

    if (url.pathname === '/api/finance/bills' && request.method === 'GET') {
      return json({ items: await listFinanceBills(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/finance/bills' && request.method === 'POST') {
      const result = await createFinanceBill(env, await parseBody<FinanceBillPayload>(request));
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const financeBillMatch = url.pathname.match(/^\/api\/finance\/bills\/([^/]+)$/);
    if (financeBillMatch && request.method === 'PUT') {
      const result = await updateFinanceBill(env, financeBillMatch[1], await parseBody<FinanceBillPayload>(request));
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/finance/payment-requests' && request.method === 'GET') {
      return json({ items: await listFinancePaymentRequests(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/finance/payment-requests' && request.method === 'POST') {
      const result = await createFinancePaymentRequest(env, await parseBody<FinancePaymentRequestPayload>(request));
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const financePaymentRequestMatch = url.pathname.match(/^\/api\/finance\/payment-requests\/([^/]+)$/);
    if (financePaymentRequestMatch && request.method === 'PUT') {
      const result = await updateFinancePaymentRequest(env, financePaymentRequestMatch[1], await parseBody<FinancePaymentRequestPayload>(request));
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/oversize-projects' && request.method === 'GET') {
      return json({ items: await listOversizeProjects(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/oversize-projects' && request.method === 'POST') {
      const result = await createOversizeProject(env, await parseBody<OversizeProjectPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    if (url.pathname === '/api/workflow/templates' && request.method === 'GET') {
      return json({ items: await listWorkflowTemplates(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/workflow/templates' && request.method === 'POST') {
      const result = await createWorkflowTemplate(env, await parseBody<WorkflowTemplatePayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const workflowTemplateMatch = url.pathname.match(/^\/api\/workflow\/templates\/([^/]+)$/);
    if (workflowTemplateMatch && request.method === 'PUT') {
      const result = await updateWorkflowTemplate(env, workflowTemplateMatch[1], await parseBody<WorkflowTemplatePayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (workflowTemplateMatch && request.method === 'DELETE') {
      const result = await deleteWorkflowTemplate(env, workflowTemplateMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    const workflowTemplateNodeCreateMatch = url.pathname.match(/^\/api\/workflow\/templates\/([^/]+)\/nodes$/);
    if (workflowTemplateNodeCreateMatch && request.method === 'POST') {
      const result = await createWorkflowTemplateNode(env, workflowTemplateNodeCreateMatch[1], await parseBody<WorkflowTemplateNodePayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const workflowTemplateNodeMatch = url.pathname.match(/^\/api\/workflow\/template-nodes\/([^/]+)$/);
    if (workflowTemplateNodeMatch && request.method === 'PUT') {
      const result = await updateWorkflowTemplateNode(env, workflowTemplateNodeMatch[1], await parseBody<WorkflowTemplateNodePayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (workflowTemplateNodeMatch && request.method === 'DELETE') {
      return json(await deleteWorkflowTemplateNode(env, workflowTemplateNodeMatch[1]), { status: 200 }, origin);
    }

    const workflowFormFieldCreateMatch = url.pathname.match(/^\/api\/workflow\/template-nodes\/([^/]+)\/form-fields$/);
    if (workflowFormFieldCreateMatch && request.method === 'POST') {
      const result = await createWorkflowFormField(env, workflowFormFieldCreateMatch[1], await parseBody<WorkflowFormFieldPayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const workflowFormFieldMatch = url.pathname.match(/^\/api\/workflow\/form-fields\/([^/]+)$/);
    if (workflowFormFieldMatch && request.method === 'PUT') {
      const result = await updateWorkflowFormField(env, workflowFormFieldMatch[1], await parseBody<WorkflowFormFieldPayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (workflowFormFieldMatch && request.method === 'DELETE') {
      return json(await deleteWorkflowFormField(env, workflowFormFieldMatch[1]), { status: 200 }, origin);
    }

    const workflowFileRequirementCreateMatch = url.pathname.match(/^\/api\/workflow\/template-nodes\/([^/]+)\/file-requirements$/);
    if (workflowFileRequirementCreateMatch && request.method === 'POST') {
      const result = await createWorkflowFileRequirement(env, workflowFileRequirementCreateMatch[1], await parseBody<WorkflowFileRequirementPayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const workflowFileRequirementMatch = url.pathname.match(/^\/api\/workflow\/file-requirements\/([^/]+)$/);
    if (workflowFileRequirementMatch && request.method === 'PUT') {
      const result = await updateWorkflowFileRequirement(env, workflowFileRequirementMatch[1], await parseBody<WorkflowFileRequirementPayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (workflowFileRequirementMatch && request.method === 'DELETE') {
      return json(await deleteWorkflowFileRequirement(env, workflowFileRequirementMatch[1]), { status: 200 }, origin);
    }

    if (url.pathname === '/api/workflow/todos' && request.method === 'GET') {
      return json({ items: await listWorkflowTodos(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/task-tracking' && request.method === 'GET') {
      const result = await searchTaskTrackingRecords(env, url.searchParams.get('taskNo') ?? url.searchParams.get('keyword') ?? '');
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/map-config' && request.method === 'GET') {
      return json(await getMapConfig(env), { status: 200 }, origin);
    }

    if (url.pathname === '/api/map-config' && request.method === 'PUT') {
      return json(await saveMapConfig(env, await parseBody<Record<string, unknown>>(request)), { status: 200 }, origin);
    }

    if (url.pathname === '/api/task-map' && request.method === 'GET') {
      return json({ items: await listTaskMapItems(env), mapConfig: await getMapConfig(env) }, { status: 200 }, origin);
    }

    const taskMapRefreshMatch = url.pathname.match(/^\/api\/task-map\/([^/]+)\/refresh-gps$/);
    if (taskMapRefreshMatch && request.method === 'POST') {
      const result = await refreshTaskGpsLocation(env, taskMapRefreshMatch[1]);
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/state-machine/rules' && request.method === 'GET') {
      return json({ items: await listStateMachineRules(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/state-machine/rules' && request.method === 'POST') {
      const result = await upsertStateMachineRule(env, await parseBody<StateMachineRulePayload>(request));
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const stateMachineRuleMatch = url.pathname.match(/^\/api\/state-machine\/rules\/([^/]+)$/);
    if (stateMachineRuleMatch && request.method === 'PUT') {
      const result = await upsertStateMachineRule(env, await parseBody<StateMachineRulePayload>(request), stateMachineRuleMatch[1]);
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (stateMachineRuleMatch && request.method === 'DELETE') {
      return json(await deleteStateMachineRule(env, stateMachineRuleMatch[1]), { status: 200 }, origin);
    }

    if (url.pathname === '/api/state-machine/events' && request.method === 'GET') {
      return json({ items: await listStateMachineEvents(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/state-machine/events' && request.method === 'POST') {
      const result = await createStateMachineEvent(env, await parseBody<StateMachineEventPayload>(request));
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const stateMachineEventProcessMatch = url.pathname.match(/^\/api\/state-machine\/events\/([^/]+)\/process$/);
    if (stateMachineEventProcessMatch && request.method === 'POST') {
      const result = await processStateMachineEvent(env, stateMachineEventProcessMatch[1]);
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (url.pathname === '/api/state-machine/logs' && request.method === 'GET') {
      return json({ items: await listStateMachineLogs(env) }, { status: 200 }, origin);
    }

    if (url.pathname === '/api/state-machine/scan-timeouts' && request.method === 'POST') {
      return json(await scanWorkflowTimeoutEvents(env), { status: 200 }, origin);
    }

    const workflowTodoMatch = url.pathname.match(/^\/api\/workflow\/todos\/([^/]+)$/);
    if (workflowTodoMatch && request.method === 'PUT') {
      return json(await updateWorkflowTodo(env, workflowTodoMatch[1], await parseBody<{ status?: string; owner?: string; priority?: string }>(request)), { status: 200 }, origin);
    }

    const taskWorkflowStartMatch = url.pathname.match(/^\/api\/transport-tasks\/([^/]+)\/workflow\/start$/);
    if (taskWorkflowStartMatch && request.method === 'POST') {
      const result = await startWorkflowForTask(env, taskWorkflowStartMatch[1]);
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const taskWorkflowScheduleMatch = url.pathname.match(/^\/api\/transport-tasks\/([^/]+)\/workflow\/schedule$/);
    if (taskWorkflowScheduleMatch && request.method === 'PUT') {
      const result = await updateWorkflowSchedulePlan(env, taskWorkflowScheduleMatch[1], await parseBody<{ nodes?: Array<Record<string, unknown>> }>(request));
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    const taskWorkflowSchedulePredictMatch = url.pathname.match(/^\/api\/transport-tasks\/([^/]+)\/workflow\/schedule\/predict$/);
    if (taskWorkflowSchedulePredictMatch && request.method === 'POST') {
      const result = await predictWorkflowSchedulePlan(
        env,
        taskWorkflowSchedulePredictMatch[1],
        ['1', 'true', 'yes'].includes((url.searchParams.get('apply') ?? '').toLowerCase()),
      );
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    const taskWorkflowMatch = url.pathname.match(/^\/api\/transport-tasks\/([^/]+)\/workflow$/);
    if (taskWorkflowMatch && request.method === 'GET') {
      const item = await getWorkflowByTask(env, taskWorkflowMatch[1]);
      if (!item) return notFound(origin, '流程实例不存在。');
      return json({ item }, { status: 200 }, origin);
    }

    const workflowNodeActionMatch = url.pathname.match(/^\/api\/workflow\/instance-nodes\/([^/]+)\/(start|save|submit|return|skip|hold|exception|reassign)$/);
    if (workflowNodeActionMatch && request.method === 'POST') {
      const result = await workflowNodeAction(env, workflowNodeActionMatch[1], workflowNodeActionMatch[2], await parseBody<WorkflowActionPayload>(request));
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    const workflowNodeRemindMatch = url.pathname.match(/^\/api\/workflow\/instance-nodes\/([^/]+)\/remind$/);
    if (workflowNodeRemindMatch && request.method === 'POST') {
      const result = await remindWorkflowNodeByFeishu(env, workflowNodeRemindMatch[1]);
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    const workflowNodeGpsMatch = url.pathname.match(/^\/api\/workflow\/instance-nodes\/([^/]+)\/gps\/latest-position$/);
    if (workflowNodeGpsMatch && request.method === 'POST') {
      const result = await fetchGpsLatestPosition(env, workflowNodeGpsMatch[1]);
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    const workflowNodeFileMatch = url.pathname.match(/^\/api\/workflow\/node-files\/([^/]+)$/);
    if (workflowNodeFileMatch && request.method === 'DELETE') {
      const result = await deleteWorkflowNodeFile(env, workflowNodeFileMatch[1]);
      if ('error' in result && result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    const workflowTrackingCreateMatch = url.pathname.match(/^\/api\/workflow\/instance-nodes\/([^/]+)\/tracking-records$/);
    if (workflowTrackingCreateMatch && request.method === 'GET') {
      return json({ items: await listWorkflowTrackingRecords(env, workflowTrackingCreateMatch[1]) }, { status: 200 }, origin);
    }

    if (workflowTrackingCreateMatch && request.method === 'POST') {
      const result = await createWorkflowTrackingRecord(env, workflowTrackingCreateMatch[1], await parseBody<WorkflowTrackingPayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 201 }, origin);
    }

    const workflowTrackingMatch = url.pathname.match(/^\/api\/workflow\/tracking-records\/([^/]+)$/);
    if (workflowTrackingMatch && request.method === 'PUT') {
      const result = await updateWorkflowTrackingRecord(env, workflowTrackingMatch[1], await parseBody<WorkflowTrackingPayload>(request));
      if (result.error !== undefined) return badRequest(origin, result.error);
      return json(result, { status: 200 }, origin);
    }

    if (workflowTrackingMatch && request.method === 'DELETE') {
      return json(await deleteWorkflowTrackingRecord(env, workflowTrackingMatch[1]), { status: 200 }, origin);
    }

    const oversizeProjectMatch = url.pathname.match(/^\/api\/oversize-projects\/([^/]+)$/);
    if (oversizeProjectMatch && request.method === 'PUT') {
      const result = await updateOversizeProject(env, oversizeProjectMatch[1], await parseBody<OversizeProjectPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    if (oversizeProjectMatch && request.method === 'DELETE') {
      const result = await deleteOversizeProject(env, oversizeProjectMatch[1]);
      return json(result, { status: 200 }, origin);
    }

    const oversizeTaskCreateMatch = url.pathname.match(/^\/api\/oversize-projects\/([^/]+)\/tasks$/);
    if (oversizeTaskCreateMatch && request.method === 'POST') {
      const result = await createOversizeTask(env, oversizeTaskCreateMatch[1], await parseBody<OversizeTaskPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    const oversizeTaskMatch = url.pathname.match(/^\/api\/oversize-project-tasks\/([^/]+)$/);
    if (oversizeTaskMatch && request.method === 'PUT') {
      const result = await updateOversizeTask(env, oversizeTaskMatch[1], await parseBody<OversizeTaskPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    if (oversizeTaskMatch && request.method === 'DELETE') {
      const result = await deleteOversizeTask(env, oversizeTaskMatch[1]);
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    const oversizeNodeMatch = url.pathname.match(/^\/api\/oversize-task-nodes\/([^/]+)$/);
    if (oversizeNodeMatch && request.method === 'PUT') {
      const result = await updateOversizeNode(env, oversizeNodeMatch[1], await parseBody<OversizeNodePayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    const oversizeTodoCreateMatch = url.pathname.match(/^\/api\/oversize-projects\/([^/]+)\/todos$/);
    if (oversizeTodoCreateMatch && request.method === 'POST') {
      const result = await createOversizeTodo(env, oversizeTodoCreateMatch[1], await parseBody<OversizeTodoPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    const oversizeTodoMatch = url.pathname.match(/^\/api\/oversize-project-todos\/([^/]+)$/);
    if (oversizeTodoMatch && request.method === 'PUT') {
      const result = await updateOversizeTodo(env, oversizeTodoMatch[1], await parseBody<OversizeTodoPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    if (oversizeTodoMatch && request.method === 'DELETE') {
      const result = await deleteOversizeTodo(env, oversizeTodoMatch[1]);
      return json(result, { status: 200 }, origin);
    }

    const oversizeExceptionCreateMatch = url.pathname.match(/^\/api\/oversize-projects\/([^/]+)\/exceptions$/);
    if (oversizeExceptionCreateMatch && request.method === 'POST') {
      const result = await createOversizeException(env, oversizeExceptionCreateMatch[1], await parseBody<OversizeExceptionPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    const oversizeExceptionMatch = url.pathname.match(/^\/api\/oversize-project-exceptions\/([^/]+)$/);
    if (oversizeExceptionMatch && request.method === 'PUT') {
      const result = await updateOversizeException(env, oversizeExceptionMatch[1], await parseBody<OversizeExceptionPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    if (oversizeExceptionMatch && request.method === 'DELETE') {
      const result = await deleteOversizeException(env, oversizeExceptionMatch[1]);
      return json(result, { status: 200 }, origin);
    }

    const supplierMatch = url.pathname.match(/^\/api\/suppliers\/([^/]+)$/);
    if (supplierMatch && request.method === 'PUT') {
      const result = await updateSupplier(env, supplierMatch[1], await parseBody<SupplierPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    if (supplierMatch && request.method === 'DELETE') {
      const result = await deleteSupplier(env, supplierMatch[1]);
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    const supplierVehiclesMatch = url.pathname.match(/^\/api\/suppliers\/([^/]+)\/vehicles$/);
    if (supplierVehiclesMatch && request.method === 'POST') {
      const result = await createSupplierVehicle(env, supplierVehiclesMatch[1], await parseBody<SupplierVehiclePayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    const supplierVehicleMatch = url.pathname.match(/^\/api\/supplier-vehicles\/([^/]+)$/);
    if (supplierVehicleMatch && request.method === 'PUT') {
      const result = await updateSupplierVehicle(env, supplierVehicleMatch[1], await parseBody<SupplierVehiclePayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    if (supplierVehicleMatch && request.method === 'DELETE') {
      return json(await deleteSupplierVehicle(env, supplierVehicleMatch[1]), { status: 200 }, origin);
    }

    const supplierDriversMatch = url.pathname.match(/^\/api\/suppliers\/([^/]+)\/drivers$/);
    if (supplierDriversMatch && request.method === 'POST') {
      const result = await createSupplierDriver(env, supplierDriversMatch[1], await parseBody<SupplierDriverPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 201 }, origin);
    }

    const supplierDriverMatch = url.pathname.match(/^\/api\/supplier-drivers\/([^/]+)$/);
    if (supplierDriverMatch && request.method === 'PUT') {
      const result = await updateSupplierDriver(env, supplierDriverMatch[1], await parseBody<SupplierDriverPayload>(request));
      if (result.error !== undefined) {
        return badRequest(origin, result.error);
      }
      return json(result, { status: 200 }, origin);
    }

    if (supplierDriverMatch && request.method === 'DELETE') {
      return json(await deleteSupplierDriver(env, supplierDriverMatch[1]), { status: 200 }, origin);
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
