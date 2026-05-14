import type { SessionUser } from './auth';

type MockDatabase = {
  users: Array<SessionUser & { password: string }>;
  roles: any[];
  ports: any[];
  operationLogs: any[];
  customers: any[];
  inquiries: any[];
  projects: any[];
  oversizeCountryRules: any[];
  oversizeVehicleTemplates: any[];
  oversizeQuotes: any[];
  tariffHistory: any[];
  tariffCache: any[];
};

const DB_KEY = 'heavy-cargo-mock-db';

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function ok<T>(data: T): Promise<T> {
  return Promise.resolve(data);
}

function parseBody(init?: RequestInit) {
  if (!init?.body || typeof init.body !== 'string') {
    return {};
  }

  try {
    return JSON.parse(init.body);
  } catch {
    return {};
  }
}

function paged<T>(items: T[], page = 1, pageSize = 20) {
  return { items, total: items.length, page, pageSize };
}

function buildCustomerSeed() {
  const names = [
    '新疆中联重科设备有限公司',
    '霍尔果斯跨境物流有限公司',
    '云陆供应链（深圳）有限公司',
    '吉尔吉斯天远有限公司',
    '環遠光電有限公司',
    '霍尔果斯盛时国际货运代理有限公司',
    '中国外运华中有限公司威海分公司',
    '河南全程物流有限公司',
    '深圳市畅航物流有限公司',
    '北京蓝海亿达国际物流有限公司',
    '阿拉山口市凯祥国际货运代理有限公司',
    '上海曦华国际物流有限公司苏州分公司',
    '运易通科技有限公司',
    '邦邦达',
    '新翎航',
    '互帮国际',
    '私人-艾克',
    '盈福通',
    '叶总-EKAY',
    '泽川',
    '杨总-私人',
    '港运-私人',
    '赛力克-私人',
    '上海万移物流科技有限公司',
    '新疆厚德国际货运代理有限公司',
    '深圳市安途卡航供应链有限公司',
    '阿拉山口拓飞贸易有限公司',
    '深圳市欧萌供应链管理有限公司',
    '迅城',
    '大疆国际（私人）',
    '私人（哈那提找的货）',
    'ETT FREIGH',
    '霍尔果斯迅诚国际货运代理有限公司',
    '私人-巴库',
    '私人-叶尔夏',
    '私人-努库斯',
    '西路畅行',
    '特兰滋特-私人',
    '新疆丰禾汇谷国际物流有限公司',
    '私人-夏特克',
    '河北蒂艾斯',
    '创美程',
    '盛时',
    '仁宇通达',
    'EET-FREGH',
    '叶尔买克-塔勒德库尔干728',
    '新翎航/俄罗斯-别尔哥罗德-15车',
    '波拉提-私人',
    '香港纬成国际贸易有限公司（乌兹别克6车）',
    '鹰擎国际',
    '叶尔波力（私人）',
    '叶尔买克-私人',
    '欧拉时代',
    '青岛海雍',
    '新疆振坤物流股份有限公司',
    '威海外运',
    '私人',
    '香港纬成国际',
    '上海新翎航-别尔哥罗德6车',
    '上海德威航空国际代理有限公司',
    '728私人-DAURAN',
    '大明国际',
    '上海建工集团',
    '保定深达',
    'Транслайн Интернэшнл -公司-781',
    'Ebrayim-私人-728',
    '迪克-第6单',
    '私人-Rafayil',
    '新翎航-14车-别尔哥罗德',
    '新翎航-2车-别尔哥罗德',
    '香港纬成国际/安集延-钢卷14车',
    '迪克-第5单',
    'ETT FREIGH-河北廊坊-霍尔果斯',
  ];

  return names.map((name, index) => ({
    id: `customer_seed_${String(index + 1).padStart(3, '0')}`,
    name,
    shortName: name,
    phone: '',
    contactPerson: '',
    address: '',
    remark: '',
    createdAt: '2026-04-18 10:30:00',
  }));
}

function mergeCustomers(existing: any[] = [], seeded: any[] = []) {
  const customerMap = new Map<string, any>();

  [...seeded, ...existing].forEach((item) => {
    const key = String(item.name ?? '').trim();
    if (!key) {
      return;
    }
    const previous = customerMap.get(key) ?? {};
    customerMap.set(key, {
      ...previous,
      ...item,
      name: item.name ?? previous.name ?? '',
      shortName: item.shortName ?? previous.shortName ?? item.name ?? '',
      phone: item.phone ?? previous.phone ?? '',
      contactPerson: item.contactPerson ?? previous.contactPerson ?? '',
      address: item.address ?? previous.address ?? '',
      remark: item.remark ?? previous.remark ?? '',
      createdAt: item.createdAt ?? previous.createdAt ?? '2026-04-18 10:30:00',
    });
  });

  return Array.from(customerMap.values());
}

function seedDatabase(): MockDatabase {
  return {
    users: [
      {
        id: 'user_admin',
        username: 'admin',
        realName: '系统管理员',
        roleCode: 'ADMIN',
        roleName: '系统管理员',
        password: 'admin123',
      },
      {
        id: 'user_dispatcher',
        username: 'dispatcher',
        realName: '调度主管',
        roleCode: 'DISPATCHER',
        roleName: '调度主管',
        password: 'dispatcher123',
      },
    ],
    roles: [
      {
        id: 'role_admin',
        roleCode: 'ADMIN',
        roleName: '系统管理员',
        roleStatus: '启用',
        scope: '系统全局配置',
        remark: '默认管理员角色',
      },
      {
        id: 'role_dispatcher',
        roleCode: 'DISPATCHER',
        roleName: '调度主管',
        roleStatus: '启用',
        scope: '运输调度与执行',
        remark: '默认调度角色',
      },
    ],
    ports: [
      {
        id: 'port_001',
        portCode: 'KHG',
        portName: '霍尔果斯口岸',
        country: '中国/哈萨克斯坦',
        mode: '公路口岸',
        status: '启用',
      },
      {
        id: 'port_002',
        portCode: 'ALS',
        portName: '阿拉山口口岸',
        country: '中国/哈萨克斯坦',
        mode: '铁路口岸',
        status: '启用',
      },
    ],
    operationLogs: [
      {
        id: 'log_001',
        moduleName: '系统管理',
        actionType: '初始化',
        businessId: 'seed',
        operatorName: 'System',
        actionTime: '2026-04-18 09:00:00',
      },
    ],
    customers: [
      {
        id: 'customer_001',
        name: '新疆中联重科设备有限公司',
        shortName: '中联重科',
        phone: '13800001234',
        contactPerson: '张经理',
        address: '乌鲁木齐市经济技术开发区',
        remark: '重点项目客户',
        createdAt: '2026-04-18 09:30:00',
      },
      {
        id: 'customer_002',
        name: '霍尔果斯跨境物流有限公司',
        shortName: '霍尔果斯物流',
        phone: '13900005678',
        contactPerson: '李女士',
        address: '霍尔果斯口岸园区',
        remark: '跨境公路运输',
        createdAt: '2026-04-18 10:15:00',
      },
    ],
    inquiries: [
      {
        id: 'inq_001',
        inquiryNo: 'INQ-20260418-001',
        customerId: 'customer_001',
        cargoName: '反应器筒体',
        originPlace: '乌鲁木齐',
        destinationPlace: '阿拉木图',
        requirementDescription: '需评估超限运输方案与报价。',
        requirementAttachments: [],
        quoteAttachments: [],
        totalWeight: 32000,
        quoteStatus: 'UNQUOTED',
        createdAt: '2026-04-18 10:00:00',
      },
    ],
    projects: [
      {
        id: 'project_001',
        projectNo: 'PRJ-20260418-001',
        projectName: '乌鲁木齐至阿拉木图设备运输项目',
        projectStatus: 'IN_PROGRESS',
        customerId: 'customer_seed_001',
        originPlace: '乌鲁木齐',
        destinationPlace: '阿拉木图',
        plannedVehicleCount: 6,
        completedVehicleCount: 2,
        contractAmount: 480000,
        estimatedCost: 360000,
        actualCost: 210000,
        grossProfit: 270000,
        customerBookingAttachments: [],
        batches: [
          { id: 'batch_001', batchName: '第一批', batchStatus: '执行中', plannedVehicleCount: 3 },
          { id: 'batch_002', batchName: '第二批', batchStatus: '待发运', plannedVehicleCount: 3 },
        ],
        vehicleOrders: [
          {
            id: 'vo_001',
            vehicleOrderNo: 'VO-001',
            cargoName: '反应器筒体',
            currentStatus: '在途',
            vehicle: { vehicleNo: '新A12345' },
            driver: { driverName: '张师傅' },
            trackingNodes: [
              { nodeName: '已装车', nodeTime: '2026-04-18T09:30:00+08:00' },
              { nodeName: '已发车', nodeTime: '2026-04-18T13:10:00+08:00' },
            ],
          },
        ],
        abnormalEvents: [
          { id: 'abn_001', abnormalType: '天气延误', abnormalStatus: '处理中', description: '边境风力较大，待调度确认' },
        ],
      },
    ],
    oversizeCountryRules: [
      {
        id: 'os_rule_uz',
        countryCode: 'UZ',
        countryName: '乌兹别克斯坦',
        permitMode: 'AUTO',
        currency: 'USD',
        maxTotalWeight: 44,
        maxAxleWeight: 10,
        maxLength: 20,
        maxWidth: 2.55,
        maxHeight: 4,
        manualReviewWeight: 80,
        manualReviewWidth: 3.5,
        manualReviewHeight: 4.5,
        escortWidth: 3.8,
        escortWeight: 90,
        permitLeadDays: 4,
        riskHints: ['桥梁通行限制', '需提前确认地方许可'],
        feeRules: [
          { id: id('fee'), feeType: 'weight', basis: 'excess_weight', rate: 14, manualOnly: false },
          { id: id('fee'), feeType: 'axle', basis: 'excess_axle_weight', rate: 90, manualOnly: false },
          { id: id('fee'), feeType: 'size', basis: 'oversize_dimension_sum', rate: 22, manualOnly: false },
          { id: id('fee'), feeType: 'permit', basis: 'flat', rate: 220, manualOnly: false },
        ],
      },
      {
        id: 'os_rule_kz',
        countryCode: 'KZ',
        countryName: '哈萨克斯坦',
        permitMode: 'SEMI_AUTO',
        currency: 'USD',
        maxTotalWeight: 38,
        maxAxleWeight: 10,
        maxLength: 20,
        maxWidth: 2.55,
        maxHeight: 4,
        manualReviewWeight: 80,
        manualReviewWidth: 3.5,
        manualReviewHeight: 4.5,
        escortWidth: 3.6,
        escortWeight: 85,
        permitLeadDays: 6,
        riskHints: ['边境换装资源紧张', '路线协调依赖地方路政'],
        feeRules: [
          { id: id('fee'), feeType: 'permit', basis: 'flat', rate: 260, manualOnly: false },
          { id: id('fee'), feeType: 'route', basis: 'distance_km', rate: 0.45, manualOnly: false },
          { id: id('fee'), feeType: 'weight', basis: 'cargo_weight', rate: 4.2, manualOnly: false },
          { id: id('fee'), feeType: 'escort', basis: 'distance_km', rate: 0.28, manualOnly: false },
        ],
      },
      {
        id: 'os_rule_ru',
        countryCode: 'RU',
        countryName: '俄罗斯',
        permitMode: 'MANUAL',
        currency: 'USD',
        maxTotalWeight: 44,
        maxAxleWeight: 10,
        maxLength: 20,
        maxWidth: 2.55,
        maxHeight: 4,
        manualReviewWeight: 80,
        manualReviewWidth: 3.5,
        manualReviewHeight: 4.5,
        escortWidth: 3.5,
        escortWeight: 80,
        permitLeadDays: 10,
        riskHints: ['地方审批周期波动大', '需评估道路损害和警车护送'],
        feeRules: [
          { id: id('fee'), feeType: 'damage', basis: 'cargo_weight', rate: 7.8, manualOnly: true },
          { id: id('fee'), feeType: 'route', basis: 'distance_km', rate: 0.62, manualOnly: true },
          { id: id('fee'), feeType: 'escort', basis: 'distance_km', rate: 0.35, manualOnly: true },
          { id: id('fee'), feeType: 'special', basis: 'flat', rate: 500, manualOnly: true },
        ],
      },
    ],
    tariffHistory: [],
    tariffCache: [],
    oversizeVehicleTemplates: [
      { code: 'DTD-5X5', category: '蓬布车', name: '大通道', allowOversize: false, lines: 5, axles: 5, effectiveLengthM: 13.5, effectiveVolumeText: '90、93、100', effectiveWidthM: 2.4, maxLoadKg: 22000, maxHeightM: 3, maxCargoLengthM: 13.8, maxCargoWidthM: 3.6, maxCargoHeightM: 3.8, scenarios: [] },
      { code: 'DTD-6X6', category: '蓬布车', name: '大通道', allowOversize: false, lines: 6, axles: 6, effectiveLengthM: 13.5, effectiveVolumeText: '90、93、100', effectiveWidthM: 2.4, maxLoadKg: 27000, maxHeightM: 3, maxCargoLengthM: 13.8, maxCargoWidthM: 3.8, maxCargoHeightM: 3.8, scenarios: [] },
      { code: 'DTD-7X7', category: '蓬布车', name: '大通道', allowOversize: false, lines: 7, axles: 7, effectiveLengthM: 16.5, effectiveVolumeText: '120', effectiveWidthM: 3, maxLoadKg: 34000, maxHeightM: 3.2, maxCargoLengthM: 16.8, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: [] },
      { code: 'DTD-8X8', category: '蓬布车', name: '大通道', allowOversize: false, lines: 8, axles: 8, effectiveLengthM: 16.5, effectiveVolumeText: '120', effectiveWidthM: 3, maxLoadKg: 40000, maxHeightM: 3.2, maxCargoLengthM: 16.8, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: [] },
      { code: 'EJC-5X5', category: '蓬布车', name: '二节子', allowOversize: false, lines: 5, axles: 5, effectiveLengthM: 16.5, effectiveVolumeText: '115-160', effectiveWidthM: 3, maxLoadKg: 22000, maxHeightM: 3.2, maxCargoLengthM: 17.0, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: [] },
      { code: 'EJC-6X6', category: '蓬布车', name: '二节子', allowOversize: false, lines: 6, axles: 6, effectiveLengthM: 16.5, effectiveVolumeText: '115-160', effectiveWidthM: 3, maxLoadKg: 28000, maxHeightM: 3.2, maxCargoLengthM: 17.0, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: [] },
      { code: 'LZC-5X5', category: '冷藏车', name: '冷藏车', allowOversize: false, lines: 5, axles: 5, effectiveLengthM: 13.5, effectiveVolumeText: '85', effectiveWidthM: 2.35, maxLoadKg: 21500, maxHeightM: 2.6, maxCargoLengthM: 13.5, maxCargoWidthM: 2.35, maxCargoHeightM: 2.6, scenarios: ['温控货物'] },
      { code: 'PCB-5X5', category: '普通平板车', name: '13.6米', allowOversize: true, lines: 5, axles: 5, effectiveLengthM: 13.6, effectiveWidthM: 2.4, maxLoadKg: 22000, maxHeightM: 2.8, maxCargoLengthM: 13.6, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: ['钢材', '箱货', '超限设备'] },
      { code: 'PCB-6X6', category: '普通平板车', name: '13.6米', allowOversize: true, lines: 6, axles: 6, effectiveLengthM: 13.6, effectiveWidthM: 2.4, maxLoadKg: 28000, maxHeightM: 2.8, maxCargoLengthM: 13.8, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: ['钢材', '箱货', '超限设备'] },
      { code: 'PCB-7X7', category: '普通平板车', name: '13.6米', allowOversize: true, lines: 7, axles: 7, effectiveLengthM: 13.6, effectiveWidthM: 2.5, maxLoadKg: 34000, maxHeightM: 2.8, maxCargoLengthM: 13.8, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: ['钢材', '箱货', '超限设备'] },
      { code: 'TXC-5X5', category: '普通平板车', name: '17米', allowOversize: true, lines: 5, axles: 5, effectiveLengthM: 16.5, effectiveWidthM: 2.8, maxLoadKg: 22000, maxHeightM: 3.2, maxCargoLengthM: 19.5, maxCargoWidthM: 4.2, maxCargoHeightM: 4.0, scenarios: ['长大件'] },
      { code: 'TXC-6X6', category: '普通平板车', name: '17米', allowOversize: true, lines: 6, axles: 6, effectiveLengthM: 16.5, effectiveWidthM: 2.8, maxLoadKg: 28000, maxHeightM: 3.2, maxCargoLengthM: 19.5, maxCargoWidthM: 4.2, maxCargoHeightM: 4.0, scenarios: ['长大件'] },
      { code: 'TXC-7X7', category: '普通平板车', name: '17米', allowOversize: true, lines: 7, axles: 7, effectiveLengthM: 16.5, effectiveWidthM: 2.8, maxLoadKg: 34000, maxHeightM: 3.2, maxCargoLengthM: 19.5, maxCargoWidthM: 4.2, maxCargoHeightM: 4.0, scenarios: ['长大件'] },
      { code: 'PTB-1X1', category: '超限车', name: '普通特种板', allowOversize: true, lines: 1, axles: 1, effectiveLengthM: 13.6, effectiveWidthM: 3, maxLoadKg: 26000, loadLimitText: '轴距1.35米以内每轴承载6吨，1.35-2米每轴承载8吨，2米以上每轴承载10吨，车头驱动轴两轴共计承载16吨', maxHeightM: 3.5, maxCargoLengthM: 13.8, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: ['设备'] },
      { code: 'CLR-1X1', category: '超限车', name: '抽拉板', allowOversize: true, lines: 1, axles: 1, effectiveLengthM: 28, effectiveWidthM: 3, maxLoadKg: 26000, loadLimitText: '轴距1.35米以内每轴承载6吨，1.35-2米每轴承载8吨，2米以上每轴承载10吨，车头驱动轴两轴共计承载16吨', maxHeightM: 3.5, maxCargoLengthM: 28.5, maxCargoWidthM: 4.2, maxCargoHeightM: 4.0, scenarios: ['超长件'] },
      { code: 'CLB-1X2', category: '超限车', name: '超低板', allowOversize: true, lines: 1, axles: 2, effectiveLengthM: 14, effectiveWidthM: 3.2, maxLoadKg: 32000, loadLimitText: '轴距1.35米以内每轴承载6吨，1.35-2米每轴承载8吨，2米以上每轴承载10吨，车头驱动轴两轴共计承载16吨', maxHeightM: 3.8, maxCargoLengthM: 14.5, maxCargoWidthM: 4.2, maxCargoHeightM: 4.5, scenarios: ['超高件', '设备'] },
      { code: 'TTB-1X1', category: '超限车', name: '塔筒板', allowOversize: true, lines: 1, axles: 1, effectiveLengthM: 28, effectiveWidthM: 3.2, maxLoadKg: 36000, loadLimitText: '轴距1.35米以内每轴承载6吨，1.35-2米每轴承载8吨，2米以上每轴承载10吨，车头驱动轴两轴共计承载16吨', maxHeightM: 4.2, maxCargoLengthM: 28.5, maxCargoWidthM: 4.5, maxCargoHeightM: 4.8, scenarios: ['塔筒'] },
      { code: 'YPB-1X1', category: '超限车', name: '叶片板', allowOversize: true, lines: 1, axles: 1, effectiveLengthM: 70, effectiveWidthM: 3.4, maxLoadKg: 22000, loadLimitText: '轴距1.35米以内每轴承载6吨，1.35-2米每轴承载8吨，2米以上每轴承载10吨，车头驱动轴两轴共计承载16吨', maxHeightM: 4.5, maxCargoLengthM: 70, maxCargoWidthM: 4.6, maxCargoHeightM: 4.8, scenarios: ['风电叶片'] },
      { code: 'ZXC-1X2', category: '超限车', name: '轴线车', allowOversize: true, lines: 1, axles: 2, effectiveLengthM: 13.6, effectiveWidthM: 3.4, maxLoadKg: 100000, loadLimitText: '轴距1.35米以内每轴承载6吨，1.35-2米每轴承载8吨，2米以上每轴承载10吨，车头驱动轴两轴共计承载16吨', maxHeightM: 4.5, maxCargoLengthM: 16, maxCargoWidthM: 5.0, maxCargoHeightM: 5.0, scenarios: ['超重设备'] },
      { code: 'PJB-1X2', category: '超限车', name: '拼接板', allowOversize: true, lines: 1, axles: 2, effectiveLengthM: 30, effectiveWidthM: 3.4, maxLoadKg: 40000, loadLimitText: '轴距1.35米以内每轴承载6吨，1.35-2米每轴承载8吨，2米以上每轴承载10吨，车头驱动轴两轴共计承载16吨', maxHeightM: 4, maxCargoLengthM: 30, maxCargoWidthM: 5.0, maxCargoHeightM: 4.8, scenarios: ['超宽件', '异形件'] },
    ],
    oversizeQuotes: [
      {
        id: 'os_quote_1',
        quoteNo: 'OVQ-20260403-001',
        countryCode: 'UZ',
        countryName: '乌兹别克斯坦',
        originPlace: '霍尔果斯',
        destinationPlace: '塔什干',
        cargoName: '反应器筒体',
        totalCost: 1356.8,
        quotedPrice: 1519.62,
        currency: 'USD',
        reviewStatus: 'MANUAL_REVIEW',
        requiresPermit: true,
        requiresEscort: true,
      },
    ],
  };
}

function getDb() {
  const raw = localStorage.getItem(DB_KEY);
  const seeded = seedDatabase();
  const seededCustomers = mergeCustomers(seeded.customers, buildCustomerSeed());
  if (!raw) {
    const initialDb = { ...seeded, customers: seededCustomers };
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
    return initialDb;
  }

  const parsed = JSON.parse(raw) as Partial<MockDatabase>;
  const merged = {
    ...seeded,
    ...parsed,
    roles: parsed.roles ?? seeded.roles,
    ports: parsed.ports ?? seeded.ports,
    operationLogs: parsed.operationLogs ?? seeded.operationLogs,
    customers: mergeCustomers(parsed.customers, seededCustomers),
    inquiries: parsed.inquiries ?? seeded.inquiries,
    projects: parsed.projects ?? seeded.projects,
    oversizeCountryRules: parsed.oversizeCountryRules ?? seeded.oversizeCountryRules,
    oversizeVehicleTemplates: seeded.oversizeVehicleTemplates,
    oversizeQuotes: parsed.oversizeQuotes ?? seeded.oversizeQuotes,
  } as MockDatabase;

  localStorage.setItem(DB_KEY, JSON.stringify(merged));
  return merged;
}

function saveDb(db: MockDatabase) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function buildOversizeSimulation(db: MockDatabase, body: any) {
  const rule =
    db.oversizeCountryRules.find((item) => item.countryCode === String(body.countryCode ?? '').toUpperCase()) ??
    db.oversizeCountryRules[0];

  const cargoWeight = Number(body.cargoWeight ?? 0);
  const cargoLength = Number(body.cargoLength ?? 0);
  const cargoWidth = Number(body.cargoWidth ?? 0);
  const cargoHeight = Number(body.cargoHeight ?? 0);

  const oversizeFlags: string[] = [];
  if (cargoWeight > rule.maxTotalWeight) oversizeFlags.push('超重');
  if (cargoLength > rule.maxLength) oversizeFlags.push('超长');
  if (cargoWidth > rule.maxWidth) oversizeFlags.push('超宽');
  if (cargoHeight > rule.maxHeight) oversizeFlags.push('超高');

  const requiresPermit = oversizeFlags.length > 0;
  const requiresEscort =
    (rule.escortWidth !== null && cargoWidth > rule.escortWidth) ||
    (rule.escortWeight !== null && cargoWeight > rule.escortWeight);

  const reviewReasons: string[] = [];
  if (cargoWeight > rule.manualReviewWeight) reviewReasons.push(`总重超过 ${rule.manualReviewWeight} 吨`);
  if (cargoWidth > rule.manualReviewWidth) reviewReasons.push(`宽度超过 ${rule.manualReviewWidth} 米`);
  if (cargoHeight > rule.manualReviewHeight) reviewReasons.push(`高度超过 ${rule.manualReviewHeight} 米`);
  if (rule.permitMode === 'MANUAL') reviewReasons.push('该国家以人工许可审核为主');

  const costBreakdown = [
    { key: 'permit', label: '许可费', amount: requiresPermit ? 220 : 0, formula: '固定费率' },
    {
      key: 'route',
      label: '路线费',
      amount: Number((Number(body.routeDistanceKm ?? 0) * 0.45).toFixed(2)),
      formula: '公里数 x 0.45',
    },
    {
      key: 'weight',
      label: '载重费',
      amount: Number((cargoWeight * 4.2).toFixed(2)),
      formula: '货重 x 4.2',
    },
    {
      key: 'escort',
      label: '护送费',
      amount: requiresEscort ? Number((Number(body.routeDistanceKm ?? 0) * 0.28).toFixed(2)) : 0,
      formula: '公里数 x 0.28',
    },
  ].filter((item) => item.amount > 0);

  const totalCost = Number(costBreakdown.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
  const suggestedPrice = Number((totalCost * (1 + Number(body.quoteMarkupRate ?? 0.12))).toFixed(2));

  return {
    countryName: rule.countryName,
    permitMode: rule.permitMode,
    currency: rule.currency,
    oversizeFlags,
    riskFlags: [...rule.riskHints, ...(requiresEscort ? ['需安排引导/护送车辆'] : [])],
    requiresPermit,
    requiresEscort,
    reviewStatus: reviewReasons.length > 0 ? 'MANUAL_REVIEW' : 'AUTO_APPROVED',
    permitLeadDays: rule.permitLeadDays,
    totalCost,
    suggestedPrice,
    reviewAdvice: reviewReasons.length > 0 ? `建议人工审核: ${reviewReasons.join('；')}` : '满足自动试算条件',
    costBreakdown,
  };
}

function buildLoadPlanSimulation(db: MockDatabase, body: any) {
  const items = Array.isArray(body.items) ? body.items : [];
  const expandedItems = items.flatMap((item: any) =>
    Array.from({ length: Number(item.quantity ?? 0) }).map((_, index) => ({
      boxNo: `${item.boxNo}-${index + 1}`,
      name: item.name,
      lengthM: Number(item.lengthMm ?? 0) / 1000,
      widthM: Number(item.widthMm ?? 0) / 1000,
      heightM: Number(item.heightMm ?? 0) / 1000,
      weightKg: Number(item.weightKg ?? 0),
      allowRotate: Boolean(item.allowRotate),
      allowStack: Boolean(item.allowStack),
    })),
  );

  const totalWeightKg = expandedItems.reduce((sum: number, item: any) => sum + item.weightKg, 0);
  const totalVolumeM3 = Number(
    expandedItems.reduce((sum: number, item: any) => sum + item.lengthM * item.widthM * item.heightM, 0).toFixed(3),
  );

  const categoryPenaltyMap: Record<string, number> = {
    普通平板车: 0,
    蓬布车: 8,
    超限车: 35,
    冷藏车: 45,
  };

  const candidates = (db.oversizeVehicleTemplates ?? [])
    .map((vehicle) => {
      const deckArea = Number((vehicle.effectiveLengthM * vehicle.effectiveWidthM).toFixed(3));
      let footprint = 0;
      const warnings: string[] = [];
      const unfittedItems: string[] = [];

      expandedItems.forEach((item: any) => {
        const options = item.allowRotate
          ? [
              { length: item.lengthM, width: item.widthM },
              { length: item.widthM, width: item.lengthM },
            ]
          : [{ length: item.lengthM, width: item.widthM }];

        const allowOversize = Boolean(vehicle.allowOversize);
        const maxLength = allowOversize ? Number(vehicle.maxCargoLengthM ?? vehicle.effectiveLengthM) : Number(vehicle.effectiveLengthM);
        const maxWidth = allowOversize ? Number(vehicle.maxCargoWidthM ?? vehicle.effectiveWidthM) : Number(vehicle.effectiveWidthM);
        const maxHeight = allowOversize ? Number(vehicle.maxCargoHeightM ?? vehicle.maxHeightM) : Number(vehicle.maxHeightM);

        const fit = options.find((option: any) => option.length <= maxLength && option.width <= maxWidth && item.heightM <= maxHeight);

        if (!fit) {
          unfittedItems.push(item.boxNo);
          return;
        }

        if (allowOversize && fit.length > vehicle.effectiveLengthM) warnings.push(`${item.boxNo} 存在尾部伸出风险`);
        if (allowOversize && fit.width > vehicle.effectiveWidthM) warnings.push(`${item.boxNo} 存在侧向超宽风险`);
        if (allowOversize && item.heightM > vehicle.maxHeightM) warnings.push(`${item.boxNo} 存在装车后超高风险`);
        if (allowOversize && (fit.length > vehicle.effectiveLengthM || fit.width > vehicle.effectiveWidthM || item.heightM > vehicle.maxHeightM)) {
          warnings.push(`${item.boxNo} 需按超限运输方案绑扎和申报`);
        }

        const stackFactor = item.allowStack && item.heightM * 2 <= vehicle.maxHeightM ? 2 : 1;
        const supportLength = Math.min(fit.length, Number(vehicle.effectiveLengthM ?? 0));
        const supportWidth = Math.min(fit.width, Number(vehicle.effectiveWidthM ?? 0));
        footprint += (supportLength * supportWidth) / stackFactor;
      });

      const vehicleCount = Math.max(1, Math.ceil(Math.max(totalWeightKg / vehicle.maxLoadKg, footprint / deckArea)));
      const weightUtilization = Number(((totalWeightKg / (vehicleCount * vehicle.maxLoadKg)) * 100).toFixed(2));
      const spaceUtilization = Number(((footprint / (vehicleCount * deckArea)) * 100).toFixed(2));

      const fittedLength = fitLengthOfItems(expandedItems, vehicle);
      const fittedWidth = fitWidthOfItems(expandedItems, vehicle);
      const maxHeightNeeded = maxItemHeight(expandedItems);
      const capacitySlackScore =
        Math.max(0, Number(vehicle.maxCargoLengthM ?? vehicle.effectiveLengthM) - fittedLength) * 12 +
        Math.max(0, Number(vehicle.maxCargoWidthM ?? vehicle.effectiveWidthM) - fittedWidth) * 24 +
        Math.max(0, Number(vehicle.maxCargoHeightM ?? vehicle.maxHeightM) - maxHeightNeeded) * 10 +
        Math.max(0, (vehicle.maxLoadKg - totalWeightKg) / 1000) * 6;
      const unnecessaryLargeVehiclePenalty =
        String(vehicle.category) === '普通平板车' &&
        Number(vehicle.effectiveLengthM) > 13.6 &&
        fittedLength <= 13.6 &&
        totalWeightKg <= 22000
          ? 120
          : 0;
      const avoidOversizeSpecialBoardPenalty =
        String(vehicle.category) === '超限车' &&
        fittedLength <= 19.5 &&
        fittedWidth <= 2.8 &&
        maxHeightNeeded <= 4 &&
        totalWeightKg <= 22000
          ? 150
          : 0;

      return {
        vehicle,
        feasible: unfittedItems.length === 0,
        vehicleCount,
        totalFootprintArea: Number(footprint.toFixed(3)),
        deckArea,
        weightUtilization,
        spaceUtilization,
        warnings: Array.from(new Set(warnings)),
        unfittedItems,
        score:
          unfittedItems.length === 0
            ? vehicleCount * 100 +
              (categoryPenaltyMap[String(vehicle.category)] ?? 20) +
              Math.abs(85 - weightUtilization) * 0.5 +
              Math.abs(70 - spaceUtilization) * 0.5 +
              capacitySlackScore +
              unnecessaryLargeVehiclePenalty +
              avoidOversizeSpecialBoardPenalty
            : 9999,
      };
    })
    .sort((a, b) => a.score - b.score);

  return {
    summary: {
      totalBoxes: expandedItems.length,
      totalWeightKg,
      totalVolumeM3,
    },
    recommended: candidates.slice(0, 5),
    rejected: candidates.filter((item) => !item.feasible).slice(0, 5),
  };
}

function fitLengthOfItems(items: any[], vehicle: any) {
  return items.reduce((max, item) => {
    const lengths = item.allowRotate ? [item.lengthM, item.widthM] : [item.lengthM];
    const fitted = lengths.find((length) => length <= Number(vehicle.maxCargoLengthM ?? vehicle.effectiveLengthM));
    return Math.max(max, fitted ?? item.lengthM);
  }, 0);
}

function fitWidthOfItems(items: any[], vehicle: any) {
  return items.reduce((max, item) => {
    const widths = item.allowRotate ? [item.widthM, item.lengthM] : [item.widthM];
    const fitted = widths.find((width) => width <= Number(vehicle.maxCargoWidthM ?? vehicle.effectiveWidthM));
    return Math.max(max, fitted ?? item.widthM);
  }, 0);
}

function maxItemHeight(items: any[]) {
  return items.reduce((max, item) => Math.max(max, item.heightM), 0);
}

function buildTariffQuote(db: MockDatabase, body: Record<string, any>) {
  const rateMap: Record<string, { description: string; rate: number; minRate: number; maxRate: number }> = {
    '870323': {
      description: 'Spark-ignition vehicles, cylinder capacity > 1,500 cc and <= 3,000 cc',
      rate: 10,
      minRate: 10,
      maxRate: 10,
    },
    '100190': {
      description: 'Wheat and meslin (excluding seed)',
      rate: 10,
      minRate: 10,
      maxRate: 10,
    },
    '721420': {
      description: 'Hot-rolled iron or non-alloy steel bars and rods',
      rate: 5,
      minRate: 5,
      maxRate: 5,
    },
    '271112': {
      description: 'Propane, liquefied',
      rate: 5,
      minRate: 5,
      maxRate: 5,
    },
    '847130': {
      description: 'Portable automatic data processing machines',
      rate: 0,
      minRate: 0,
      maxRate: 0,
    },
  };

  const rawHsCode = String(body.hsCode ?? '');
  const hsCode = rawHsCode.replace(/\D/g, '').slice(0, 6);
  if (hsCode.length < 6) {
    throw new Error('请输入至少 6 位 HS 编码');
  }

  const matched = rateMap[hsCode] ?? {
    description: 'Generic HS6 tariff sample for Tajikistan mock mode',
    rate: 5,
    minRate: 5,
    maxRate: 5,
  };

  const customsValue =
    body.customsValue !== undefined
      ? Number(body.customsValue)
      : Number(body.invoiceValue ?? 0) + Number(body.freightCost ?? 0) + Number(body.insuranceCost ?? 0);
  const originCountryCode = String(body.originCountryCode ?? '').toUpperCase();
  const cacheKey = `TJK:${originCountryCode || 'WORLD'}:${hsCode}`;
  const now = Date.now();
  const cacheIndex = db.tariffCache.findIndex((item) => item.cacheKey === cacheKey && new Date(item.expiresAt).getTime() > now);
  const cacheHit = cacheIndex >= 0;
  const dutyRate = cacheHit ? Number(db.tariffCache[cacheIndex].simpleAverageRate) : matched.rate;
  const dutyAmount = Number(((customsValue * dutyRate) / 100).toFixed(2));
  const countrySpecificCharges: Array<{ code: string; label: string; kind: 'rate' | 'fixed'; rate: number | null; amount: number; note: string }> = [];
  if (hsCode.startsWith('8517')) {
    countrySpecificCharges.push({
      code: 'mobile-import-duty',
      label: 'Mobile device import duty',
      kind: 'rate',
      rate: 20,
      amount: Number(((customsValue * 20) / 100).toFixed(2)),
      note: 'Applied to mobile phone imports in Tajikistan from July 1, 2025.',
    });
    if (String(body.currency ?? 'USD').toUpperCase() === 'USD' && customsValue > 100) {
      countrySpecificCharges.push({
        code: 'mobile-customs-fee',
        label: 'Mobile device customs fee',
        kind: 'fixed',
        rate: null,
        amount: 10,
        note: 'USD 10 customs fee applies when mobile device customs value exceeds USD 100.',
      });
    }
  }
  const additionalTaxRate = countrySpecificCharges.reduce((sum, item) => sum + (item.rate ?? 0), 0);
  const additionalTaxAmount = Number(countrySpecificCharges.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
  const vatRate = 14;
  const vatBase = Number((customsValue + dutyAmount + additionalTaxAmount).toFixed(2));
  const vatAmount = Number(((vatBase * vatRate) / 100).toFixed(2));
  const totalTaxAmount = Number((dutyAmount + additionalTaxAmount + vatAmount).toFixed(2));
  const landedCost = Number((customsValue + totalTaxAmount).toFixed(2));

  if (!cacheHit) {
    db.tariffCache.unshift({
      id: id('tcache'),
      cacheKey,
      simpleAverageRate: matched.rate,
      partnerCode: ['KAZ', '398'].includes(originCountryCode) ? '398' : '000',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  const history = {
    id: id('thist'),
    destinationCountryCode: 'TJK',
    destinationCountryName: '塔吉克斯坦',
    originCountryCode: originCountryCode || null,
    originCountryName: originCountryCode === 'KAZ' ? '哈萨克斯坦' : originCountryCode === 'USA' ? '美国' : null,
    hsCode,
    productDescription: matched.description,
    currency: String(body.currency ?? 'USD').toUpperCase(),
    invoiceValue: Number(body.invoiceValue ?? 0),
    freightCost: Number(body.freightCost ?? 0),
    insuranceCost: Number(body.insuranceCost ?? 0),
    customsValue: Number(customsValue.toFixed(2)),
    dutyRate,
    dutyAmount,
    vatRate,
    vatBase,
    vatAmount,
    additionalTaxLabel: countrySpecificCharges.length ? 'Country specific charges' : 'Additional tax',
    additionalTaxRate,
    additionalTaxAmount,
    totalTaxAmount,
    landedCost,
    queryYear: 2021,
    dataSource: 'WITS / UNCTAD TRAINS (mock)',
    partnerCode: ['KAZ', '398'].includes(originCountryCode) ? '398' : '000',
    cacheHit,
    createdAt: new Date().toISOString(),
  };
  db.tariffHistory.unshift(history);
  saveDb(db);

  return {
    id: history.id,
    country: { code: 'TJK', name: '塔吉克斯坦' },
    originCountry: originCountryCode
      ? {
          code: originCountryCode,
          name: originCountryCode === 'KAZ' ? '哈萨克斯坦' : '美国',
        }
      : null,
    hsCode,
    productDescription: matched.description,
    year: 2021,
    dataSource: {
      provider: 'WITS / UNCTAD TRAINS (mock)',
      pricing: 'free',
      reporterCode: '762',
      partnerCode: history.partnerCode,
      nomenclatureCode: 'H4',
      nomenclatureName: 'Harmonized System 2012',
      lastUpdatedDate: '2022/09/09',
      cacheHit,
      cacheExpiresAt: db.tariffCache.find((item) => item.cacheKey === cacheKey)?.expiresAt ?? null,
    },
    tariff: {
      tariffType: 'MFN',
      simpleAverageRate: dutyRate,
      minRate: matched.minRate,
      maxRate: matched.maxRate,
      totalLines: 1,
      mfnLines: 1,
      preferentialLines: 0,
    },
    calculation: {
      currency: String(body.currency ?? 'USD').toUpperCase(),
      invoiceValue: Number(body.invoiceValue ?? 0),
      freightCost: Number(body.freightCost ?? 0),
      insuranceCost: Number(body.insuranceCost ?? 0),
      customsValue: Number(customsValue.toFixed(2)),
      dutyRate,
      dutyAmount,
      minDutyAmount: dutyAmount,
      maxDutyAmount: dutyAmount,
      vatRate,
      vatBase,
      vatAmount,
      additionalTaxLabel: countrySpecificCharges.length ? 'Country specific charges' : 'Additional tax',
      additionalTaxRate,
      additionalTaxAmount,
      totalTaxAmount,
      landedCost,
      countrySpecificCharges,
    },
    warnings: [
      ...(rawHsCode.replace(/\D/g, '') !== hsCode ? [`当前 mock 数据按 HS 6 位查询，已使用 ${hsCode}。`] : []),
      '进口增值税当前按 14% 试算，口径为 CIF + 关税 + 附加税。',
      ...(countrySpecificCharges.length ? [] : ['No country-specific additional charge rule matched this HS code, so additional charges remain 0.']),
      ...(cacheHit ? ['本次税率命中 mock 缓存。'] : []),
    ],
    nextFallbacks: [
      { provider: 'WITS API', pricing: 'free', note: '正式环境默认使用的免费数据源。' },
      { provider: 'Commercial landed cost / tariff API', pricing: 'paid', note: '后续可接更完整税费服务。' },
    ],
  };
}

export async function mockApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const db = getDb();
  const method = init?.method ?? 'GET';

  if (path === '/api/auth/login' && method === 'POST') {
    const body = parseBody(init);
    const user = db.users.find((item) => item.username === body.username && item.password === body.password);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    return ok({
      accessToken: `mock-token-${user.id}`,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        roleCode: user.roleCode,
        roleName: user.roleName,
      },
    } as T);
  }

  if (path === '/api/auth/profile') {
    const user = db.users[0];
    return ok({
      id: user.id,
      username: user.username,
      realName: user.realName,
      roleCode: user.roleCode,
      roleName: user.roleName,
    } as T);
  }

  if (path === '/api/oversize-transport/dashboard') {
    return ok({
      metrics: [
        { label: '国家规则数', value: db.oversizeCountryRules.length },
        { label: '车型模板数', value: db.oversizeVehicleTemplates.length },
        { label: '报价单数', value: db.oversizeQuotes.length },
        { label: '人工审核单', value: db.oversizeQuotes.filter((item) => item.reviewStatus === 'MANUAL_REVIEW').length },
      ],
    } as T);
  }

  if (path === '/api/oversize-transport/country-rules') {
    return ok(db.oversizeCountryRules as T);
  }

  if (path === '/api/oversize-transport/vehicle-templates') {
    return ok(db.oversizeVehicleTemplates as T);
  }

  if (path === '/api/oversize-transport/simulate' && method === 'POST') {
    return ok(buildOversizeSimulation(db, parseBody(init)) as T);
  }

  if (path === '/api/oversize-transport/load-plans/simulate' && method === 'POST') {
    return ok(buildLoadPlanSimulation(db, parseBody(init)) as T);
  }

  if (path.startsWith('/api/oversize-transport/quotes?page=')) {
    return ok(paged(db.oversizeQuotes, 1, 20) as T);
  }

  if (path === '/api/oversize-transport/quotes' && method === 'POST') {
    const body = parseBody(init);
    const simulation = buildOversizeSimulation(db, body);
    const quote = {
      id: id('osq'),
      quoteNo: `OVQ-${Date.now()}`,
      countryCode: String(body.countryCode ?? '').toUpperCase(),
      countryName: simulation.countryName,
      originPlace: body.originPlace,
      destinationPlace: body.destinationPlace,
      cargoName: body.cargoName ?? '',
      totalCost: simulation.totalCost,
      quotedPrice: simulation.suggestedPrice,
      currency: simulation.currency,
      reviewStatus: simulation.reviewStatus,
      requiresPermit: simulation.requiresPermit,
      requiresEscort: simulation.requiresEscort,
    };
    db.oversizeQuotes.unshift(quote);
    saveDb(db);
    return ok(quote as T);
  }

  if (path === '/api/tariffs/quote' && method === 'POST') {
    return ok(buildTariffQuote(db, parseBody(init)) as T);
  }

  if (path.startsWith('/api/tariffs/history') && method === 'GET') {
    return ok(paged(db.tariffHistory, 1, 20) as T);
  }

  if (path === '/api/customers' && method === 'GET') {
    return ok(
      db.customers.map((item) => ({
        ...item,
        customerName: item.name,
      })) as T,
    );
  }

  if (path === '/api/customers' && method === 'POST') {
    const body = parseBody(init);
    const customer = {
      id: id('customer'),
      name: body.name ?? '',
      shortName: body.shortName ?? '',
      phone: body.phone ?? '',
      contactPerson: body.contactPerson ?? '',
      address: body.address ?? '',
      remark: body.remark ?? '',
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    db.customers.unshift(customer);
    saveDb(db);
    return ok({ ...customer, customerName: customer.name } as T);
  }

  if (path.startsWith('/api/customers/') && method === 'PUT') {
    const customerId = path.split('/').pop();
    const body = parseBody(init);
    const index = db.customers.findIndex((item) => item.id === customerId);
    if (index < 0) {
      throw new Error('Customer not found');
    }
    db.customers[index] = { ...db.customers[index], ...body };
    saveDb(db);
    return ok({ ...db.customers[index], customerName: db.customers[index].name } as T);
  }

  if (path.startsWith('/api/customers/') && method === 'DELETE') {
    const customerId = path.split('/').pop();
    db.customers = db.customers.filter((item) => item.id !== customerId);
    saveDb(db);
    return ok({ success: true } as T);
  }

  if (path === '/api/roles' && method === 'GET') {
    return ok(db.roles as T);
  }

  if (path === '/api/roles' && method === 'POST') {
    const body = parseBody(init);
    const role = {
      id: id('role'),
      roleCode: body.roleCode || `ROLE_${Date.now()}`,
      roleName: body.roleName ?? '',
      roleStatus: '启用',
      scope: body.scope ?? '自定义角色',
      remark: body.remark ?? '',
    };
    db.roles.unshift(role);
    db.operationLogs.unshift({
      id: id('log'),
      moduleName: '系统管理',
      actionType: '新增角色',
      businessId: role.id,
      operatorName: 'Admin',
      actionTime: new Date().toLocaleString('zh-CN'),
    });
    saveDb(db);
    return ok(role as T);
  }

  if (path === '/api/users' && method === 'GET') {
    const users = db.users.map((item) => ({
      ...item,
      role: db.roles.find((role) => role.id === (item as any).roleId) ?? {
        id: item.roleCode,
        roleCode: item.roleCode,
        roleName: item.roleName,
      },
    }));
    return ok(users as T);
  }

  if (path === '/api/users' && method === 'POST') {
    const body = parseBody(init);
    const role = db.roles.find((item) => item.id === body.roleId);
    const user = {
      id: id('user'),
      username: body.username ?? '',
      realName: body.realName ?? '',
      roleId: body.roleId ?? role?.id,
      roleCode: role?.roleCode ?? 'CUSTOM',
      roleName: role?.roleName ?? '自定义用户',
      mobile: body.mobile ?? '',
      email: body.email ?? '',
      password: body.passwordHash ?? '123456',
    };
    db.users.unshift(user as SessionUser & { password: string });
    db.operationLogs.unshift({
      id: id('log'),
      moduleName: '系统管理',
      actionType: '新增用户',
      businessId: user.id,
      operatorName: 'Admin',
      actionTime: new Date().toLocaleString('zh-CN'),
    });
    saveDb(db);
    return ok(user as T);
  }

  if (path === '/api/ports' && method === 'GET') {
    return ok(db.ports as T);
  }

  if (path === '/api/ports' && method === 'POST') {
    const body = parseBody(init);
    const port = {
      id: id('port'),
      portCode: body.portCode || `PORT_${Date.now()}`,
      portName: body.portName ?? '',
      country: body.country ?? '',
      mode: body.mode ?? '',
      status: '启用',
    };
    db.ports.unshift(port);
    db.operationLogs.unshift({
      id: id('log'),
      moduleName: '系统管理',
      actionType: '新增口岸',
      businessId: port.id,
      operatorName: 'Admin',
      actionTime: new Date().toLocaleString('zh-CN'),
    });
    saveDb(db);
    return ok(port as T);
  }

  if (path === '/api/operation-logs' && method === 'GET') {
    return ok(db.operationLogs as T);
  }

  if (path.startsWith('/api/projects?page=')) {
    const items = db.projects.map((item) => {
      const customer = db.customers.find((entry) => entry.id === item.customerId);
      return {
        ...item,
        actualVehicleCount: item.completedVehicleCount ?? 0,
        abnormalCount: item.abnormalEvents?.length ?? 0,
        customer: customer
          ? {
              ...customer,
              customerName: customer.name,
            }
          : { customerName: '-' },
      };
    });
    return ok(paged(items, 1, 20) as T);
  }

  if (path === '/api/projects' && method === 'POST') {
    const body = parseBody(init);
    const project = {
      id: id('project'),
      projectNo: `PRJ-${Date.now()}`,
      projectName: body.projectName ?? '',
      projectStatus: 'DRAFT',
      customerId: body.customerId ?? '',
      originPlace: body.originPlace ?? '',
      destinationPlace: body.destinationPlace ?? '',
      plannedVehicleCount: Number(body.plannedVehicleCount ?? 0),
      completedVehicleCount: 0,
      contractAmount: Number(body.contractAmount ?? 0),
      estimatedCost: 0,
      actualCost: 0,
      grossProfit: Number(body.contractAmount ?? 0),
      customerBookingAttachments: body.customerBookingAttachments ?? [],
      batches: [],
      vehicleOrders: [],
      abnormalEvents: [],
    };
    db.projects.unshift(project);
    db.operationLogs.unshift({
      id: id('log'),
      moduleName: '项目管理',
      actionType: '新增项目',
      businessId: project.id,
      operatorName: 'Admin',
      actionTime: new Date().toLocaleString('zh-CN'),
    });
    saveDb(db);
    const customer = db.customers.find((entry) => entry.id === project.customerId);
    return ok(
      {
        ...project,
        customer: customer
          ? {
              ...customer,
              customerName: customer.name,
            }
          : { customerName: '-' },
      } as T,
    );
  }

  if (path.startsWith('/api/projects/')) {
    const projectId = path.split('/')[3];
    const project = db.projects.find((item) => item.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    const customer = db.customers.find((entry) => entry.id === project.customerId);
    return ok(
      {
        ...project,
        customer: customer
          ? {
              ...customer,
              customerName: customer.name,
            }
          : { customerName: '-' },
      } as T,
    );
  }

  if (path.startsWith('/api/inquiries?page=')) {
    const items = db.inquiries.map((item) => {
      const customer = db.customers.find((entry) => entry.id === item.customerId);
      return {
        ...item,
        customer: customer
          ? {
              ...customer,
              customerName: customer.name,
            }
          : null,
      };
    });
    return ok(paged(items, 1, 20) as T);
  }

  if (path === '/api/inquiries' && method === 'POST') {
    const body = parseBody(init);
    const inquiry = {
      id: id('inq'),
      inquiryNo: `INQ-${Date.now()}`,
      customerId: body.customerId ?? '',
      cargoName: body.cargoName ?? '',
      originPlace: body.originPlace ?? '',
      destinationPlace: body.destinationPlace ?? '',
      requirementDescription: body.requirementDescription ?? '',
      requirementAttachments: body.requirementAttachments ?? [],
      quoteAttachments: body.quoteAttachments ?? [],
      totalWeight: Number(body.totalWeight ?? 0),
      quoteStatus: body.quoteStatus ?? 'UNQUOTED',
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    db.inquiries.unshift(inquiry);
    db.operationLogs.unshift({
      id: id('log'),
      moduleName: '询价单管理',
      actionType: '新增询价单',
      businessId: inquiry.id,
      operatorName: 'Admin',
      actionTime: new Date().toLocaleString('zh-CN'),
    });
    saveDb(db);
    const customer = db.customers.find((entry) => entry.id === inquiry.customerId);
    return ok(
      {
        ...inquiry,
        customer: customer
          ? {
              ...customer,
              customerName: customer.name,
            }
          : null,
      } as T,
    );
  }

  if (path.startsWith('/api/inquiries/') && path.endsWith('/quote') && method === 'POST') {
    const inquiryId = path.split('/')[3];
    const body = parseBody(init);
    const index = db.inquiries.findIndex((item) => item.id === inquiryId);
    if (index < 0) {
      throw new Error('Inquiry not found');
    }

    db.inquiries[index] = {
      ...db.inquiries[index],
      quoteAttachments: body.quoteAttachments ?? [],
      quoteStatus: 'QUOTED',
    };
    db.operationLogs.unshift({
      id: id('log'),
      moduleName: '询价单管理',
      actionType: '上传报价方案',
      businessId: db.inquiries[index].id,
      operatorName: 'Admin',
      actionTime: new Date().toLocaleString('zh-CN'),
    });
    saveDb(db);

    const customer = db.customers.find((entry) => entry.id === db.inquiries[index].customerId);
    return ok(
      {
        ...db.inquiries[index],
        customer: customer
          ? {
              ...customer,
              customerName: customer.name,
            }
          : null,
      } as T,
    );
  }

  if (path.startsWith('/api/') && path.includes('?page=')) {
    return ok(paged([], 1, 20) as T);
  }

  if (
    [
      '/api/batches',
      '/api/capacities',
      '/api/capacities',
    ].includes(path)
  ) {
    return ok([] as T);
  }

  if (path === '/api/system-admin/overview') {
    return ok({
      roles: db.roles.slice(0, 6).map((item) => ({ roleName: item.roleName, scope: item.scope ?? item.remark ?? '-' })),
      dictionaries: [
        { name: '客户资料', description: `共 ${db.customers.length} 条` },
        { name: '车型模板', description: `共 ${db.oversizeVehicleTemplates.length} 条` },
      ],
      ports: db.ports.slice(0, 6),
      logs: db.operationLogs.slice(0, 10),
    } as T);
  }

  if (path === '/api/in-transit/overview') {
    return ok({ totalVehicles: 0, abnormalVehicles: 0, activeAlerts: 0 } as T);
  }

  if (path === '/api/in-transit/map') {
    return ok({ mapCenter: [87.6168, 43.8256], routeApiReserved: true, vehicles: [] } as T);
  }

  if (path === '/api/dispatch/board') {
    return ok({ pendingOrders: [], availableVehicles: [], availableDrivers: [], dispatchRecords: [], abnormalAlerts: [] } as T);
  }

  if (method === 'POST' && path.startsWith('/api/')) {
    const body = parseBody(init);
    return ok({ id: id('mock'), ...body } as T);
  }

  throw new Error(`Mock API not implemented: ${method} ${path}`);
}
