import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  List,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Switch,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import { DownloadOutlined, InboxOutlined, SaveOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { formatBeijingTime } from '../utils/date';

type CountryRule = {
  id: string;
  countryCode: string;
  countryName: string;
  permitMode: 'AUTO' | 'SEMI_AUTO' | 'MANUAL';
  currency: string;
  maxTotalWeight: number;
  maxAxleWeight: number;
  maxLength: number;
  maxWidth: number;
  maxHeight: number;
  manualReviewWeight: number;
  manualReviewWidth: number;
  manualReviewHeight: number;
  permitLeadDays: number;
};

type Dashboard = {
  metrics: Array<{ label: string; value: number }>;
};

type SimulationResult = {
  countryName: string;
  permitMode: string;
  currency: string;
  oversizeFlags: string[];
  riskFlags: string[];
  requiresPermit: boolean;
  requiresEscort: boolean;
  reviewStatus: string;
  permitLeadDays: number;
  totalCost: number;
  suggestedPrice: number;
  reviewAdvice: string;
  costBreakdown: Array<{ key: string; label: string; amount: number; formula: string; manualOnly?: boolean }>;
};

type VehicleTemplate = {
  code: string;
  category: string;
  name: string;
  allowOversize?: boolean;
  lines: number;
  axles: number;
  effectiveLengthM: number;
  effectiveWidthM: number;
  maxLoadKg: number;
  maxHeightM: number;
  scenarios: string[];
};

type LoadPlanResult = {
  summary: {
    totalBoxes: number;
    totalWeightKg: number;
    totalVolumeM3: number;
  };
  recommended: Array<{
    vehicle: VehicleTemplate;
    feasible: boolean;
    vehicleCount: number;
    totalFootprintArea: number;
    deckArea: number;
    weightUtilization: number;
    spaceUtilization: number;
    warnings: string[];
    unfittedItems: string[];
  }>;
  rejected: Array<{
    vehicle: VehicleTemplate;
    warnings: string[];
    unfittedItems: string[];
  }>;
};

type CargoItem = {
  boxNo: string;
  name: string;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  quantity: number;
  weightKg: number;
  allowRotate: boolean;
  allowStack: boolean;
  remark?: string;
};

type TruckAllocation = {
  key: string;
  vehicleCode: string;
  vehicleName: string;
  truckLabel: string;
  totalWeightKg: number;
  totalVolumeM3: number;
  items: Array<{
    key: string;
    boxNo: string;
    name: string;
    lengthMm: number;
    widthMm: number;
    heightMm: number;
    weightKg: number;
  }>;
};

type UploadedCargoItem = Omit<Partial<CargoItem>, 'allowRotate' | 'allowStack'> & {
  allowRotate?: unknown;
  allowStack?: unknown;
};

type SavedSolution = {
  savedAt: string;
  quoteNo?: string;
  route: string;
  countryName: string;
  cargoSummary: { totalBoxes: number; totalWeightKg: number; totalVolumeM3: number };
  selectedVehicle: string;
  vehicleCount: number;
  pricing: { totalCost: number; suggestedPrice: number; currency: string };
  riskFlags: string[];
};

const permitModeText: Record<string, string> = {
  AUTO: '自动',
  SEMI_AUTO: '半自动',
  MANUAL: '人工',
};

const reviewStatusColor: Record<string, string> = {
  AUTO_APPROVED: 'green',
  MANUAL_REVIEW: 'orange',
  QUOTE_PENDING: 'default',
};

const reviewStatusText: Record<string, string> = {
  AUTO_APPROVED: '自动通过',
  MANUAL_REVIEW: '人工审核',
  QUOTE_PENDING: '待报价',
};

const STORAGE_KEY = 'oversize-transport-saved-solution';

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function parseCsvItems(text: string): UploadedCargoItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const rows = lines.map((line) =>
    line
      .replace(/^\uFEFF/, '')
      .split(delimiter)
      .map((cell) => cell.trim()),
  );
  const header = rows[0].map((item) =>
    item
      .replace(/^\uFEFF/, '')
      .replace(/\s+/g, '')
      .replace(/[（]/g, '(')
      .replace(/[）]/g, ')')
      .toLowerCase(),
  );
  const indexOf = (names: string[]) => {
    const normalizedNames = names.map((name) =>
      name
        .replace(/^\uFEFF/, '')
        .replace(/\s+/g, '')
        .replace(/[（]/g, '(')
        .replace(/[）]/g, ')')
        .toLowerCase(),
    );
    return header.findIndex((item) => normalizedNames.includes(item));
  };

  const boxNoIndex = indexOf(['箱子序号', 'boxNo']);
  const nameIndex = indexOf(['名称', 'name']);
  const lengthIndex = indexOf(['长度(mm)', 'lengthMm', '长度']);
  const widthIndex = indexOf(['宽度(mm)', 'widthMm', '宽度']);
  const heightIndex = indexOf(['高度(mm)', 'heightMm', '高度']);
  const quantityIndex = indexOf(['数量', 'quantity']);
  const weightIndex = indexOf(['重量', '单件重量', 'weightKg']);
  const rotateIndex = indexOf(['允许旋转', 'allowRotate']);
  const stackIndex = indexOf(['允许堆叠', 'allowStack']);
  const remarkIndex = indexOf(['备注', 'remark']);

  return rows.slice(1).map((row, index) => ({
    boxNo: row[boxNoIndex] || `BOX-${index + 1}`,
    name: row[nameIndex] || `货物${index + 1}`,
    lengthMm: Number(row[lengthIndex] || 0),
    widthMm: Number(row[widthIndex] || 0),
    heightMm: Number(row[heightIndex] || 0),
    quantity: Number(row[quantityIndex] || 1),
    weightKg: Number(row[weightIndex] || 0),
    allowRotate: row[rotateIndex],
    allowStack: row[stackIndex],
    remark: remarkIndex >= 0 ? row[remarkIndex] : '',
  }));
}

function normalizeUploadFlag(value: unknown) {
  return String(value ?? '').trim() === '1';
}

function normalizeUploadedItems(items: UploadedCargoItem[]): CargoItem[] {
  return items.map((item, index) => ({
    boxNo: String(item.boxNo ?? '').trim() || `BOX-${index + 1}`,
    name: String(item.name ?? '').trim() || `货物${index + 1}`,
    lengthMm: Number(item.lengthMm ?? 0),
    widthMm: Number(item.widthMm ?? 0),
    heightMm: Number(item.heightMm ?? 0),
    quantity: Number(item.quantity ?? 1),
    weightKg: Number(item.weightKg ?? 0),
    allowRotate: normalizeUploadFlag(item.allowRotate),
    allowStack: normalizeUploadFlag(item.allowStack),
    remark: String(item.remark ?? '').trim(),
  }));
}

function parseFlexibleCsvItems(text: string): UploadedCargoItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const rows = lines.map((line) =>
    line
      .replace(/^\uFEFF/, '')
      .split(delimiter)
      .map((cell) => cell.trim()),
  );

  const normalizeHeader = (value: string) =>
    value
      .replace(/^\uFEFF/, '')
      .replace(/\s+/g, '')
      .replace(/[（]/g, '(')
      .replace(/[）]/g, ')')
      .toLowerCase();

  const header = rows[0].map(normalizeHeader);
  const aliasMap: Record<string, string[]> = {
    boxNo: ['箱子序号', '序号', 'boxno'],
    name: ['名称', '品名', '货物名称', 'name'],
    lengthMm: ['长度(mm)', '长度', '长(mm)', '长', 'lengthmm', 'length'],
    widthMm: ['宽度(mm)', '宽度', '宽(mm)', '宽', 'widthmm', 'width'],
    heightMm: ['高度(mm)', '高度', '高(mm)', '高', 'heightmm', 'height'],
    quantity: ['数量', '件数', 'quantity', 'qty'],
    weightKg: ['重量', '单件重量', '单件重量(kg)', '重量(kg)', 'weightkg', 'weight'],
    allowRotate: ['允许旋转', '是否允许旋转', 'allowrotate'],
    allowStack: ['允许堆叠', '是否允许堆叠', 'allowstack'],
    remark: ['备注', '说明', 'remark'],
  };

  const getIndex = (key: keyof typeof aliasMap) => {
    const aliases = aliasMap[key].map(normalizeHeader);
    return header.findIndex((item) => aliases.includes(item));
  };

  const indexes = {
    boxNo: getIndex('boxNo'),
    name: getIndex('name'),
    lengthMm: getIndex('lengthMm'),
    widthMm: getIndex('widthMm'),
    heightMm: getIndex('heightMm'),
    quantity: getIndex('quantity'),
    weightKg: getIndex('weightKg'),
    allowRotate: getIndex('allowRotate'),
    allowStack: getIndex('allowStack'),
    remark: getIndex('remark'),
  };

  const getCell = (row: string[], index: number) => (index >= 0 ? row[index] : '');

  return rows.slice(1).map((row, index) => ({
    boxNo: getCell(row, indexes.boxNo) || `BOX-${index + 1}`,
    name: getCell(row, indexes.name) || `货物${index + 1}`,
    lengthMm: Number(getCell(row, indexes.lengthMm) || 0),
    widthMm: Number(getCell(row, indexes.widthMm) || 0),
    heightMm: Number(getCell(row, indexes.heightMm) || 0),
    quantity: Number(getCell(row, indexes.quantity) || 1),
    weightKg: Number(getCell(row, indexes.weightKg) || 0),
    allowRotate: getCell(row, indexes.allowRotate),
    allowStack: getCell(row, indexes.allowStack),
    remark: getCell(row, indexes.remark),
  }));
}

function parseQuotedCsvItems(text: string): UploadedCargoItem[] {
  const source = text.replace(/^\uFEFF/, '');
  if (!source.trim()) {
    return [];
  }

  const firstLine = source.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const nextChar = source[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && nextChar === '\n') {
        i += 1;
      }
      row.push(cell.trim());
      if (row.some((item) => item !== '')) {
        rows.push(row);
      }
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some((item) => item !== '')) {
    rows.push(row);
  }

  if (rows.length < 2) {
    return [];
  }

  const normalizeHeader = (value: string) =>
    value
      .replace(/^\uFEFF/, '')
      .replace(/\s+/g, '')
      .replace(/[（]/g, '(')
      .replace(/[）]/g, ')')
      .replace(/kg）/gi, 'kg)')
      .toLowerCase();

  const header = rows[0].map(normalizeHeader);
  const aliasMap: Record<string, string[]> = {
    boxNo: ['箱子序号', '序号', 'boxno'],
    name: ['名称', '品名', '货物名称', 'name'],
    length: ['长度(mm)', '长度(cm)', '长度', '长(mm)', '长(cm)', '长', 'lengthmm', 'lengthcm', 'length'],
    width: ['宽度(mm)', '宽度(cm)', '宽度', '宽(mm)', '宽(cm)', '宽', 'widthmm', 'widthcm', 'width'],
    height: ['高度(mm)', '高度(cm)', '高度', '高(mm)', '高(cm)', '高', 'heightmm', 'heightcm', 'height'],
    quantity: ['数量', '件数', 'quantity', 'qty'],
    weightKg: ['重量', '重量(kg)', '重量(kg）', '单件重量', '单件重量(kg)', '单件重量(kg）', 'weightkg', 'weight'],
    allowRotate: ['允许旋转', '是否允许旋转', 'allowrotate'],
    allowStack: ['允许堆叠', '是否允许堆叠', 'allowstack'],
    remark: ['备注', '说明', 'remark'],
  };

  const getIndex = (key: keyof typeof aliasMap) => {
    const aliases = aliasMap[key].map(normalizeHeader);
    return header.findIndex((item) => aliases.includes(item));
  };

  const indexes = {
    boxNo: getIndex('boxNo'),
    name: getIndex('name'),
    length: getIndex('length'),
    width: getIndex('width'),
    height: getIndex('height'),
    quantity: getIndex('quantity'),
    weightKg: getIndex('weightKg'),
    allowRotate: getIndex('allowRotate'),
    allowStack: getIndex('allowStack'),
    remark: getIndex('remark'),
  };
  const detectIndex = (field: keyof typeof indexes) =>
    header.findIndex((item) => {
      switch (field) {
        case 'boxNo':
          return item.includes('\u7bb1\u5b50\u5e8f\u53f7') || item === '\u5e8f\u53f7' || item.includes('boxno');
        case 'name':
          return item.includes('\u540d\u79f0') || item.includes('\u54c1\u540d') || item.includes('\u8d27\u7269\u540d\u79f0') || item.includes('name');
        case 'length':
          return item.includes('\u957f') || item.includes('\u957f\u5ea6') || item.includes('length');
        case 'width':
          return item.includes('\u5bbd') || item.includes('\u5bbd\u5ea6') || item.includes('width');
        case 'height':
          return item.includes('\u9ad8') || item.includes('\u9ad8\u5ea6') || item.includes('height');
        case 'quantity':
          return item.includes('\u6570\u91cf') || item.includes('\u4ef6\u6570') || item.includes('quantity') || item === 'qty';
        case 'weightKg':
          return item.includes('\u91cd\u91cf') || item.includes('weight');
        case 'allowRotate':
          return item.includes('\u5141\u8bb8\u65cb\u8f6c') || item.includes('allowrotate');
        case 'allowStack':
          return item.includes('\u5141\u8bb8\u5806\u53e0') || item.includes('allowstack');
        case 'remark':
          return item.includes('\u5907\u6ce8') || item.includes('\u8bf4\u660e') || item.includes('remark');
        default:
          return false;
      }
    });
  const resolvedIndexes = {
    boxNo: indexes.boxNo >= 0 ? indexes.boxNo : detectIndex('boxNo'),
    name: indexes.name >= 0 ? indexes.name : detectIndex('name'),
    length: indexes.length >= 0 ? indexes.length : detectIndex('length'),
    width: indexes.width >= 0 ? indexes.width : detectIndex('width'),
    height: indexes.height >= 0 ? indexes.height : detectIndex('height'),
    quantity: indexes.quantity >= 0 ? indexes.quantity : detectIndex('quantity'),
    weightKg: indexes.weightKg >= 0 ? indexes.weightKg : detectIndex('weightKg'),
    allowRotate: indexes.allowRotate >= 0 ? indexes.allowRotate : detectIndex('allowRotate'),
    allowStack: indexes.allowStack >= 0 ? indexes.allowStack : detectIndex('allowStack'),
    remark: indexes.remark >= 0 ? indexes.remark : detectIndex('remark'),
  };
  const fallbackIndexes = {
    boxNo: 0,
    name: 1,
    length: 2,
    width: 3,
    height: 4,
    quantity: 5,
    weightKg: 6,
    allowRotate: 9,
    allowStack: 10,
    remark: 11,
  };
  const finalIndexes = {
    boxNo: resolvedIndexes.boxNo >= 0 ? resolvedIndexes.boxNo : fallbackIndexes.boxNo,
    name: resolvedIndexes.name >= 0 ? resolvedIndexes.name : fallbackIndexes.name,
    length: resolvedIndexes.length >= 0 ? resolvedIndexes.length : fallbackIndexes.length,
    width: resolvedIndexes.width >= 0 ? resolvedIndexes.width : fallbackIndexes.width,
    height: resolvedIndexes.height >= 0 ? resolvedIndexes.height : fallbackIndexes.height,
    quantity: resolvedIndexes.quantity >= 0 ? resolvedIndexes.quantity : fallbackIndexes.quantity,
    weightKg: resolvedIndexes.weightKg >= 0 ? resolvedIndexes.weightKg : fallbackIndexes.weightKg,
    allowRotate: resolvedIndexes.allowRotate >= 0 ? resolvedIndexes.allowRotate : fallbackIndexes.allowRotate,
    allowStack: resolvedIndexes.allowStack >= 0 ? resolvedIndexes.allowStack : fallbackIndexes.allowStack,
    remark: resolvedIndexes.remark >= 0 ? resolvedIndexes.remark : fallbackIndexes.remark,
  };

  const getCell = (currentRow: string[], index: number) => (index >= 0 ? currentRow[index] : '');
  const isCentimeter = (index: number) => {
    if (index < 0) {
      return false;
    }
    return header[index].includes('cm');
  };
  const toMillimeter = (value: string, index: number) => {
    const numeric = Number(value || 0);
    return isCentimeter(index) ? numeric * 10 : numeric;
  };

  return rows.slice(1).map((currentRow, index) => ({
    boxNo: getCell(currentRow, finalIndexes.boxNo) || `BOX-${index + 1}`,
    name: getCell(currentRow, finalIndexes.name) || `货物${index + 1}`,
    lengthMm: toMillimeter(getCell(currentRow, finalIndexes.length), finalIndexes.length),
    widthMm: toMillimeter(getCell(currentRow, finalIndexes.width), finalIndexes.width),
    heightMm: toMillimeter(getCell(currentRow, finalIndexes.height), finalIndexes.height),
    quantity: Number(getCell(currentRow, finalIndexes.quantity) || 1),
    weightKg: Number(getCell(currentRow, finalIndexes.weightKg) || 0),
    allowRotate: getCell(currentRow, finalIndexes.allowRotate),
    allowStack: getCell(currentRow, finalIndexes.allowStack),
    remark: getCell(currentRow, finalIndexes.remark),
  }));
}

async function readUploadFileText(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const utf8Text = new TextDecoder('utf-8').decode(bytes);
  const hasReplacementChar = utf8Text.includes('\uFFFD');
  const hasLikelyMojibake = /[锛鈥斺€滃鐨勮]|Ã|å|ä|é/.test(utf8Text);

  if (file.name.toLowerCase().endsWith('.json')) {
    return utf8Text;
  }

  if (hasReplacementChar || hasLikelyMojibake) {
    try {
      return new TextDecoder('gb18030').decode(bytes);
    } catch {
      return utf8Text;
    }
  }

  return utf8Text;
}

export function OversizeTransportPage() {
  const [cargoForm] = Form.useForm();
  const [freightForm] = Form.useForm();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [rules, setRules] = useState<CountryRule[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loadPlanResult, setLoadPlanResult] = useState<LoadPlanResult | null>(null);
  const [plannedCargoItems, setPlannedCargoItems] = useState<CargoItem[]>([]);
  const [importPreviewItems, setImportPreviewItems] = useState<CargoItem[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [manualVehicleCodes, setManualVehicleCodes] = useState<Record<string, string>>({});
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedSolution, setSavedSolution] = useState<SavedSolution | null>(null);

  const load = async () => {
    const [dashboardRes, ruleRes, quoteRes] = await Promise.all([
      apiRequest<Dashboard>('/api/oversize-transport/dashboard'),
      apiRequest<CountryRule[]>('/api/oversize-transport/country-rules'),
      apiRequest<{ items: any[] }>('/api/oversize-transport/quotes?page=1&pageSize=20'),
    ]);
    setDashboard(dashboardRes);
    setRules(ruleRes);
    setQuotes(quoteRes.items);
  };

  useEffect(() => {
    cargoForm.setFieldsValue({
      countryCode: 'UZ',
      originPlace: '霍尔果斯',
      destinationPlace: '塔什干',
      routeDistanceKm: 1250,
      items: [],
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSavedSolution(JSON.parse(raw) as SavedSolution);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    void load();
  }, [cargoForm]);

  const cargoItems = Form.useWatch('items', cargoForm) as CargoItem[] | undefined;
  const routeDistanceKm = Form.useWatch('routeDistanceKm', cargoForm) as number | undefined;
  const feasiblePlans = useMemo(
    () => (loadPlanResult?.recommended ?? []).filter((item) => item.feasible),
    [loadPlanResult],
  );
  const feasiblePlanMap = useMemo(
    () => Object.fromEntries(feasiblePlans.map((item) => [item.vehicle.code, item])),
    [feasiblePlans],
  );
  const selectedPlan = feasiblePlans[selectedPlanIndex] ?? null;

  const cargoSummary = useMemo(() => {
    const items = cargoItems ?? [];
    const totalBoxes = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalWeightKg = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.weightKg || 0), 0);
    const totalVolumeM3 = Number(
      items
        .reduce(
          (sum, item) =>
            sum +
            (Number(item.quantity || 0) *
              Number(item.lengthMm || 0) *
              Number(item.widthMm || 0) *
              Number(item.heightMm || 0)) /
              1000000000,
          0,
        )
        .toFixed(3),
    );
    return { totalBoxes, totalWeightKg, totalVolumeM3 };
  }, [cargoItems]);

  const cargoPlanRows = useMemo(() => {
    if (!selectedPlan) {
      return [];
    }

    return plannedCargoItems.map((item, index) => {
      const rowKey = `${item.boxNo || index}`;
      const selectedVehicleCode = manualVehicleCodes[rowKey] ?? selectedPlan.vehicle.code;
      const rowPlan = feasiblePlanMap[selectedVehicleCode] ?? selectedPlan;
      const totalWeightKg = Number((Number(item.quantity || 0) * Number(item.weightKg || 0)).toFixed(2));
      const totalVolumeM3 = Number(
        (
          (Number(item.quantity || 0) *
            Number(item.lengthMm || 0) *
            Number(item.widthMm || 0) *
            Number(item.heightMm || 0)) /
          1000000000
        ).toFixed(3),
      );

      return {
        key: rowKey,
        sequence: index + 1,
        boxNo: item.boxNo,
        name: item.name,
        lengthMm: Number(item.lengthMm || 0),
        widthMm: Number(item.widthMm || 0),
        heightMm: Number(item.heightMm || 0),
        totalWeightKg,
        totalVolumeM3,
        selectedVehicleCode,
        vehicleName: `${rowPlan.vehicle.name} (${rowPlan.vehicle.code})`,
        vehicleCount: rowPlan.vehicleCount,
        plan: rowPlan,
      };
    });
  }, [feasiblePlanMap, manualVehicleCodes, plannedCargoItems, selectedPlan]);

  const primaryPlan = cargoPlanRows[0]?.plan ?? selectedPlan;

  const truckAllocations = useMemo<TruckAllocation[]>(() => {
    if (!selectedPlan || !plannedCargoItems.length) {
      return [];
    }

    const groupedTrucks = new Map<string, TruckAllocation[]>();

    plannedCargoItems.forEach((item, index) => {
      const rowKey = `${item.boxNo || index}`;
      const selectedVehicleCode = manualVehicleCodes[rowKey] ?? selectedPlan.vehicle.code;
      const rowPlan = feasiblePlanMap[selectedVehicleCode] ?? selectedPlan;
      const vehicle = rowPlan.vehicle;
      const unitVolumeM3 = Number(((item.lengthMm * item.widthMm * item.heightMm) / 1000000000).toFixed(3));
      const stackFactor = item.allowStack && item.heightMm * 2 <= vehicle.maxHeightM * 1000 ? 2 : 1;
      const supportAreaM2 = Number(
        (
          (Math.min(item.lengthMm / 1000, vehicle.effectiveLengthM) * Math.min(item.widthMm / 1000, vehicle.effectiveWidthM)) /
          stackFactor
        ).toFixed(3),
      );

      Array.from({ length: Math.max(1, Number(item.quantity || 1)) }).forEach((_, quantityIndex) => {
        const truckList = groupedTrucks.get(vehicle.code) ?? [];
        let targetTruck = truckList.find(
          (truck) =>
            truck.totalWeightKg + Number(item.weightKg || 0) <= vehicle.maxLoadKg &&
            ((truck as TruckAllocation & { usedAreaM2?: number }).usedAreaM2 ?? 0) + supportAreaM2 <= vehicle.effectiveLengthM * vehicle.effectiveWidthM,
        ) as (TruckAllocation & { usedAreaM2?: number }) | undefined;

        if (!targetTruck) {
          targetTruck = {
            key: `${vehicle.code}-${truckList.length + 1}`,
            vehicleCode: vehicle.code,
            vehicleName: vehicle.name,
            truckLabel: `第${truckList.length + 1}台车`,
            totalWeightKg: 0,
            totalVolumeM3: 0,
            items: [],
            usedAreaM2: 0,
          };
          truckList.push(targetTruck);
          groupedTrucks.set(vehicle.code, truckList);
        }

        targetTruck.items.push({
          key: `${rowKey}-${quantityIndex + 1}`,
          boxNo: `${item.boxNo || rowKey}${Number(item.quantity || 1) > 1 ? `-${quantityIndex + 1}` : ''}`,
          name: item.name,
          lengthMm: Number(item.lengthMm || 0),
          widthMm: Number(item.widthMm || 0),
          heightMm: Number(item.heightMm || 0),
          weightKg: Number(item.weightKg || 0),
        });
        targetTruck.totalWeightKg = Number((targetTruck.totalWeightKg + Number(item.weightKg || 0)).toFixed(2));
        targetTruck.totalVolumeM3 = Number((targetTruck.totalVolumeM3 + unitVolumeM3).toFixed(3));
        targetTruck.usedAreaM2 = Number(((targetTruck.usedAreaM2 ?? 0) + supportAreaM2).toFixed(3));
      });
    });

    return Array.from(groupedTrucks.values()).flat();
  }, [feasiblePlanMap, manualVehicleCodes, plannedCargoItems, selectedPlan]);

  const truckSummaryRows = useMemo(() => {
    const summaryMap = new Map<string, { vehicleName: string; vehicleCode: string; truckCount: number; cargoCount: number }>();
    truckAllocations.forEach((truck) => {
      const current = summaryMap.get(truck.vehicleCode) ?? {
        vehicleName: truck.vehicleName,
        vehicleCode: truck.vehicleCode,
        truckCount: 0,
        cargoCount: 0,
      };
      current.truckCount += 1;
      current.cargoCount += truck.items.length;
      summaryMap.set(truck.vehicleCode, current);
    });
    return Array.from(summaryMap.values());
  }, [truckAllocations]);

  const applyPlanToFreightForm = (plan: LoadPlanResult['recommended'][number], items: CargoItem[]) => {
    const maxLengthM = Number((Math.max(...items.map((item) => Number(item.lengthMm || 0)), 0) / 1000).toFixed(3));
    const maxWidthM = Number((Math.max(...items.map((item) => Number(item.widthMm || 0)), 0) / 1000).toFixed(3));
    const maxHeightM = Number((Math.max(...items.map((item) => Number(item.heightMm || 0)), 0) / 1000).toFixed(3));
    const totalWeightTon = Number((cargoSummary.totalWeightKg / 1000).toFixed(2));

    freightForm.setFieldsValue({
      countryCode: cargoForm.getFieldValue('countryCode'),
      originPlace: cargoForm.getFieldValue('originPlace'),
      destinationPlace: cargoForm.getFieldValue('destinationPlace'),
      routeDistanceKm: cargoForm.getFieldValue('routeDistanceKm'),
      vehicleType: plan.vehicle.name,
      axleCount: plan.vehicle.axles,
      cargoName: items[0]?.name ?? '组合货物',
      cargoWeight: totalWeightTon,
      cargoLength: maxLengthM,
      cargoWidth: maxWidthM,
      cargoHeight: maxHeightM,
      axleLoads: Array.from({ length: Math.min(plan.vehicle.axles, 2) }).map((_, index) => ({
        axleName: `A${index + 1}`,
        weight: Number((totalWeightTon / Math.max(plan.vehicle.axles, 1)).toFixed(2)),
      })),
      isIndivisible: true,
      quoteMarkupRate: 0.12,
    });
  };

  useEffect(() => {
    if (primaryPlan && cargoItems?.length) {
      applyPlanToFreightForm(primaryPlan, cargoItems);
    }
  }, [primaryPlan, cargoItems]);

  const handleUploadCargo: UploadProps['beforeUpload'] = async (file) => {
    try {
      const text = await readUploadFileText(file as File);
      const parsedItems = file.name.toLowerCase().endsWith('.json')
        ? (JSON.parse(text) as UploadedCargoItem[])
        : parseQuotedCsvItems(text);
      const items = normalizeUploadedItems(parsedItems);

      if (!items.length) {
        message.error('未解析到货物数据，请上传 JSON 或 CSV 清单');
        return false;
      }

      setImportPreviewItems(items);
      cargoForm.setFieldValue('items', items);
      message.success(`已导入 ${items.length} 行货物数据`);
    } catch (error) {
      message.error((error as Error).message || '文件解析失败');
    }
    return false;
  };

  const handleGenerateLoadPlan = async () => {
    try {
      const values = await cargoForm.validateFields();
      const result = await apiRequest<LoadPlanResult>('/api/oversize-transport/load-plans/simulate', {
        method: 'POST',
        body: JSON.stringify({
          countryCode: values.countryCode,
          items: values.items,
        }),
      });
      setPlannedCargoItems((values.items as CargoItem[]) ?? []);
      setLoadPlanResult(result);
      setSelectedPlanIndex(0);
      setManualVehicleCodes(
        Object.fromEntries(
          (values.items as CargoItem[]).map((item, index) => [`${item.boxNo || index}`, result.recommended[0]?.vehicle.code ?? '']),
        ),
      );

      if (result.recommended[0]) {
        const firstPlan = result.recommended[0];
        freightForm.setFieldsValue({
          countryCode: values.countryCode,
          originPlace: values.originPlace,
          destinationPlace: values.destinationPlace,
          routeDistanceKm: values.routeDistanceKm,
          vehicleType: firstPlan.vehicle.name,
          axleCount: firstPlan.vehicle.axles,
          cargoName: values.items[0]?.name ?? '组合货物',
          cargoWeight: Number((result.summary.totalWeightKg / 1000).toFixed(2)),
          cargoLength: firstPlan.vehicle.effectiveLengthM,
          cargoWidth: firstPlan.vehicle.effectiveWidthM,
          cargoHeight: firstPlan.vehicle.maxHeightM,
          axleLoads: Array.from({ length: Math.min(firstPlan.vehicle.axles, 2) }).map((_, index) => ({
            axleName: `A${index + 1}`,
            weight: Number(((result.summary.totalWeightKg / 1000) / Math.max(firstPlan.vehicle.axles, 1)).toFixed(2)),
          })),
          isIndivisible: true,
          quoteMarkupRate: 0.12,
        });
      }

      setCurrentStep(1);
      message.success('装载方案已生成');
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleRecalculateFreight = async () => {
    try {
      const values = await freightForm.validateFields();
      const result = await apiRequest<SimulationResult>('/api/oversize-transport/simulate', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setSimulation(result);
      setCurrentStep(2);
      message.success('运费计算完成');
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleSaveSolution = async () => {
    if (!simulation || !primaryPlan) {
      message.warning('请先完成装载方案和运费计算');
      return;
    }

    try {
      const freightValues = await freightForm.validateFields();
      setSaving(true);
      const savedQuote = await apiRequest<any>('/api/oversize-transport/quotes', {
        method: 'POST',
        body: JSON.stringify(freightValues),
      });

      const country = rules.find((item) => item.countryCode === freightValues.countryCode);
      const solution: SavedSolution = {
        savedAt: formatBeijingTime(new Date().toISOString(), true),
        quoteNo: savedQuote.quoteNo,
        route: `${freightValues.originPlace} -> ${freightValues.destinationPlace}`,
        countryName: country?.countryName ?? freightValues.countryCode,
        cargoSummary: loadPlanResult?.summary ?? cargoSummary,
        selectedVehicle: `${primaryPlan.vehicle.name} (${primaryPlan.vehicle.code})`,
        vehicleCount: primaryPlan.vehicleCount,
        pricing: {
          totalCost: simulation.totalCost,
          suggestedPrice: simulation.suggestedPrice,
          currency: simulation.currency,
        },
        riskFlags: simulation.riskFlags,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(solution));
      setSavedSolution(solution);
      setCurrentStep(3);
      await load();
      message.success('方案与报价已保存');
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadProposal = () => {
    if (!savedSolution) {
      message.warning('请先保存方案');
      return;
    }

    const content = [
      '超限运输方案与报价',
      `保存时间：${savedSolution.savedAt}`,
      `报价单号：${savedSolution.quoteNo ?? '-'}`,
      `国家：${savedSolution.countryName}`,
      `线路：${savedSolution.route}`,
      `总箱数：${savedSolution.cargoSummary.totalBoxes}`,
      `总重量：${savedSolution.cargoSummary.totalWeightKg} kg`,
      `总体积：${savedSolution.cargoSummary.totalVolumeM3} m3`,
      `选用车型：${savedSolution.selectedVehicle}`,
      `建议车数：${savedSolution.vehicleCount}`,
      `成本：${savedSolution.pricing.totalCost} ${savedSolution.pricing.currency}`,
      `报价：${savedSolution.pricing.suggestedPrice} ${savedSolution.pricing.currency}`,
      '风险提示：',
      ...savedSolution.riskFlags.map((item) => `- ${item}`),
    ].join('\n');

    downloadTextFile(`oversize-proposal-${savedSolution.quoteNo ?? 'draft'}.txt`, content);
  };

  return (
    <>
      <PageHeader title="超限运输系统" subtitle="按业务流程完成货物录入、装载方案生成、运费计算、方案保存与报价输出。" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {dashboard?.metrics.map((metric) => (
          <Col xs={24} sm={12} lg={6} key={metric.label}>
            <Card className="glass-card">
              <Statistic title={metric.label} value={metric.value} precision={metric.label.includes('成本') ? 2 : 0} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Steps
          current={currentStep}
          items={[
            { title: '货物信息', description: '输入或上传货物' },
            { title: '装载方案', description: '生成并微调车型方案' },
            { title: '运费结果', description: '计算成本与报价' },
            { title: '预览下载', description: '保存并导出方案' },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        {currentStep === 0 ? (
          <>
        <Col xs={24} xl={15}>
          <Card className="glass-card" title="第一步：货物信息">
            <Form form={cargoForm} layout="vertical">
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="countryCode" label="目的国家" rules={[{ required: true }]}>
                    <Select options={rules.map((item) => ({ label: `${item.countryName} (${item.countryCode})`, value: item.countryCode }))} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                </Col>
                <Col span={12}>
                  <Form.Item name="originPlace" label="起点" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="destinationPlace" label="终点" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="routeDistanceKm" label="路线公里" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Upload.Dragger accept=".json,.csv,.txt" beforeUpload={handleUploadCargo} showUploadList={false} style={{ marginBottom: 16 }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p>拖拽或点击上传货物清单</p>
                <p className="ant-upload-hint">支持 JSON 或 CSV，字段可使用：箱子序号、名称、长度(mm)、宽度、高度、数量、重量、允许旋转、允许堆叠、备注</p>
              </Upload.Dragger>

              {importPreviewItems.length > 0 ? (
                <Card size="small" title="导入预览" style={{ marginBottom: 16 }}>
                  <Table
                    size="small"
                    rowKey={(item) => item.boxNo}
                    pagination={{ pageSize: 5 }}
                    dataSource={importPreviewItems}
                    columns={[
                      { title: '序号', render: (_, __, index) => index + 1, width: 72 },
                      { title: '箱子序号', dataIndex: 'boxNo', width: 120 },
                      { title: '名称', dataIndex: 'name', ellipsis: true },
                      { title: '长度(mm)', dataIndex: 'lengthMm', width: 110 },
                      { title: '宽度(mm)', dataIndex: 'widthMm', width: 110 },
                      { title: '高度(mm)', dataIndex: 'heightMm', width: 110 },
                      { title: '数量', dataIndex: 'quantity', width: 80 },
                      { title: '重量(kg)', dataIndex: 'weightKg', width: 100 },
                      { title: '允许旋转', dataIndex: 'allowRotate', width: 90, render: (value: boolean) => (value ? '是' : '否') },
                      { title: '允许堆叠', dataIndex: 'allowStack', width: 90, render: (value: boolean) => (value ? '是' : '否') },
                    ]}
                    scroll={{ x: 1100 }}
                  />
                </Card>
              ) : null}

              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Card
                        key={field.key}
                        size="small"
                        style={{ marginBottom: 12 }}
                        title={`货物 ${field.name + 1}`}
                        extra={
                          <Button danger type="text" onClick={() => remove(field.name)}>
                            删除
                          </Button>
                        }
                      >
                        <Row gutter={12}>
                          <Col span={8}>
                            <Form.Item {...field} name={[field.name, 'boxNo']} label="箱子序号" rules={[{ required: true }]}>
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col span={16}>
                            <Form.Item {...field} name={[field.name, 'name']} label="名称" rules={[{ required: true }]}>
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...field} name={[field.name, 'lengthMm']} label="长度(mm)" rules={[{ required: true }]}>
                              <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...field} name={[field.name, 'widthMm']} label="宽度(mm)" rules={[{ required: true }]}>
                              <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...field} name={[field.name, 'heightMm']} label="高度(mm)" rules={[{ required: true }]}>
                              <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...field} name={[field.name, 'quantity']} label="数量" rules={[{ required: true }]}>
                              <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...field} name={[field.name, 'weightKg']} label="单件重量(kg)" rules={[{ required: true }]}>
                              <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...field} name={[field.name, 'allowRotate']} label="允许旋转" valuePropName="checked">
                              <Switch />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...field} name={[field.name, 'allowStack']} label="允许堆叠" valuePropName="checked">
                              <Switch />
                            </Form.Item>
                          </Col>
                          <Col span={16}>
                            <Form.Item {...field} name={[field.name, 'remark']} label="备注">
                              <Input />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Space>
                      <Button onClick={() => add({ quantity: 1, weightKg: 0, allowRotate: false, allowStack: false })}>新增货物</Button>
                      <Button type="primary" onClick={() => void handleGenerateLoadPlan()}>
                        生成装载方案
                      </Button>
                    </Space>
                  </>
                )}
              </Form.List>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card className="glass-card" title="货物汇总">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="总箱数">{cargoSummary.totalBoxes}</Descriptions.Item>
              <Descriptions.Item label="总重量">{cargoSummary.totalWeightKg} kg</Descriptions.Item>
              <Descriptions.Item label="总体积">{cargoSummary.totalVolumeM3} m3</Descriptions.Item>
              <Descriptions.Item label="路线">{routeDistanceKm ? `${routeDistanceKm} km` : '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="glass-card" title="流程提示" style={{ marginTop: 16 }}>
            <List
              size="small"
              dataSource={[
                '第一步先录入或上传货物清单。',
                '第二步生成装载方案后，可切换不同推荐车型。',
                '第三步基于选中方案计算运费。',
                '第四步确认后保存，并预览/下载方案及报价。',
              ]}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </Col>
          </>
        ) : null}

        {currentStep === 1 ? (
          <Col span={24}>
          <Card className="glass-card" title="第二步：装载方案">
            {!loadPlanResult ? (
              <Alert type="info" showIcon message="先完成第一步货物录入，再点击“生成装载方案”。" />
            ) : (
              <>
                {primaryPlan ? (
                  <Card size="small" title="装载方案" style={{ marginBottom: 16 }}>
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                      <Col xs={24} md={8}>
                        <Statistic title="总车数" value={truckAllocations.length} suffix="台" />
                      </Col>
                      <Col xs={24} md={8}>
                        <Statistic title="已分配货物件数" value={truckAllocations.reduce((sum, truck) => sum + truck.items.length, 0)} suffix="件" />
                      </Col>
                      <Col xs={24} md={8}>
                        <Statistic title="车型种类" value={truckSummaryRows.length} suffix="种" />
                      </Col>
                    </Row>

                    {truckSummaryRows.length ? (
                      <Table
                        size="small"
                        rowKey={(row) => row.vehicleCode}
                        pagination={false}
                        style={{ marginBottom: 16 }}
                        dataSource={truckSummaryRows}
                        columns={[
                          { title: '车型', render: (_, row) => `${row.vehicleName} (${row.vehicleCode})` },
                          { title: '车数', dataIndex: 'truckCount', width: 100 },
                          { title: '货物件数', dataIndex: 'cargoCount', width: 120 },
                        ]}
                      />
                    ) : null}

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1.1fr 1.5fr 1fr 1fr 1fr 1fr 1.4fr',
                        gap: 8,
                        padding: '8px 12px',
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(5, 5, 5, 0.06)',
                      }}
                    >
                      <div>序号</div>
                      <div>箱号</div>
                      <div>名称</div>
                      <div>长度(mm)</div>
                      <div>宽度(mm)</div>
                      <div>高度(mm)</div>
                      <div>重量/kg</div>
                      <div>车型</div>
                    </div>
                    <List
                      dataSource={cargoPlanRows}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '10px 12px' }}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '80px 1.1fr 1.5fr 1fr 1fr 1fr 1fr 1.4fr',
                              gap: 8,
                              width: '100%',
                              alignItems: 'center',
                            }}
                          >
                            <div>{item.sequence}</div>
                            <div>{item.boxNo}</div>
                            <div>{item.name}</div>
                            <div>{item.lengthMm}</div>
                            <div>{item.widthMm}</div>
                            <div>{item.heightMm}</div>
                            <div>{item.totalWeightKg}</div>
                            <div>
                              <Select
                                size="small"
                                style={{ width: '100%' }}
                                value={item.selectedVehicleCode}
                                options={feasiblePlans.map((plan) => ({
                                  label: `${plan.vehicle.name} (${plan.vehicle.code})`,
                                  value: plan.vehicle.code,
                                }))}
                                onChange={(value) => {
                                  setManualVehicleCodes((current) => ({ ...current, [item.key]: value }));
                                }}
                              />
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                ) : null}

                {truckAllocations.length ? (
                  <Card size="small" title="分车明细" style={{ marginBottom: 16 }}>
                    <List
                      dataSource={truckAllocations}
                      renderItem={(truck) => (
                        <List.Item>
                          <Card
                            size="small"
                            style={{ width: '100%' }}
                            title={`${truck.truckLabel} · ${truck.vehicleName} (${truck.vehicleCode})`}
                            extra={`${truck.totalWeightKg} kg / ${truck.totalVolumeM3} m3`}
                          >
                            <Table
                              size="small"
                              rowKey={(row) => row.key}
                              pagination={false}
                              dataSource={truck.items}
                              columns={[
                                { title: '箱号', dataIndex: 'boxNo', width: 120 },
                                { title: '名称', dataIndex: 'name', ellipsis: true },
                                { title: '长度(mm)', dataIndex: 'lengthMm', width: 110 },
                                { title: '宽度(mm)', dataIndex: 'widthMm', width: 110 },
                                { title: '高度(mm)', dataIndex: 'heightMm', width: 110 },
                                { title: '重量(kg)', dataIndex: 'weightKg', width: 110 },
                              ]}
                              scroll={{ x: 900 }}
                            />
                          </Card>
                        </List.Item>
                      )}
                    />
                  </Card>
                ) : null}

                <Table
                  rowKey={(row) => row.vehicle.code}
                  pagination={false}
                  dataSource={feasiblePlans}
                  rowClassName={(_, index) => (index === selectedPlanIndex ? 'ant-table-row-selected' : '')}
                  onRow={(_, index) => ({
                    onClick: () => setSelectedPlanIndex(index ?? 0),
                  })}
                  columns={[
                    { title: '车型', render: (_, row) => `${row.vehicle.name} (${row.vehicle.code})` },
                    { title: '分类', render: (_, row) => <Tag color="blue">{row.vehicle.category}</Tag> },
                    { title: '建议车数', dataIndex: 'vehicleCount' },
                    { title: '重量利用率', render: (_, row) => `${row.weightUtilization}%` },
                    { title: '板面利用率', render: (_, row) => `${row.spaceUtilization}%` },
                  ]}
                />

                {!feasiblePlans.length ? (
                  <Alert style={{ marginTop: 16 }} type="warning" showIcon message="当前货物未生成可用装载方案，请检查货物尺寸或车型规则。" />
                ) : null}

                {selectedPlan ? (
                  <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} xl={12}>
                      <Card size="small" title="方案摘要">
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="车型">{primaryPlan.vehicle.name}</Descriptions.Item>
                          <Descriptions.Item label="车型编码">{primaryPlan.vehicle.code}</Descriptions.Item>
                          <Descriptions.Item label="有效尺寸">
                            {primaryPlan.vehicle.effectiveLengthM} x {primaryPlan.vehicle.effectiveWidthM} x {primaryPlan.vehicle.maxHeightM} m
                          </Descriptions.Item>
                          <Descriptions.Item label="最大载重">{primaryPlan.vehicle.maxLoadKg} kg</Descriptions.Item>
                          <Descriptions.Item label="建议车数">{primaryPlan.vehicleCount}</Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                    <Col xs={24} xl={12}>
                      <Card size="small" title="微调建议">
                        <List
                          size="small"
                          dataSource={
                            primaryPlan.warnings.length
                              ? primaryPlan.warnings
                              : ['当前方案无明显装载告警，如需人工优化可切换其他推荐车型重新试算。']
                          }
                          renderItem={(item) => <List.Item>{item}</List.Item>}
                        />
                      </Card>
                    </Col>
                  </Row>
                ) : null}

                <Divider />
                <Space>
                  <Button onClick={() => setCurrentStep(0)}>返回上一步</Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      if (!primaryPlan) {
                        message.warning('请先选择一个装载方案');
                        return;
                      }
                      void handleRecalculateFreight();
                    }}
                  >
                    计算运费
                  </Button>
                </Space>
              </>
            )}
          </Card>
        </Col>
        ) : null}

        {currentStep === 2 ? (
          <>
        <Col xs={24} xl={14}>
          <Card className="glass-card" title="第三步：运费结果">
            <Form form={freightForm} layout="vertical">
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="countryCode" label="目的国家" rules={[{ required: true }]}>
                    <Select options={rules.map((item) => ({ label: `${item.countryName} (${item.countryCode})`, value: item.countryCode }))} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="vehicleType" label="装载车型" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="originPlace" label="起点" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="destinationPlace" label="终点" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="routeDistanceKm" label="路线公里" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="cargoWeight" label="总货重(吨)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="axleCount" label="轴数" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="cargoLength" label="装载长度(m)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="cargoWidth" label="装载宽度(m)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="cargoHeight" label="装载高度(m)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="cargoName" label="货物名称">
                <Input />
              </Form.Item>

              <Form.Item name="isIndivisible" label="是否不可分割" valuePropName="checked">
                <Switch checkedChildren="不可分" unCheckedChildren="可拆分" />
              </Form.Item>

              <Form.List name="axleLoads">
                {(fields) => (
                  <Card size="small" title="轴荷分布">
                    {fields.map((field) => (
                      <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }}>
                        <Form.Item {...field} name={[field.name, 'axleName']} style={{ minWidth: 120 }}>
                          <Input placeholder="轴位" />
                        </Form.Item>
                        <Form.Item {...field} name={[field.name, 'weight']} style={{ minWidth: 180 }}>
                          <InputNumber placeholder="吨位" style={{ width: '100%' }} />
                        </Form.Item>
                      </Space>
                    ))}
                  </Card>
                )}
              </Form.List>

              <Space style={{ marginTop: 16 }}>
                <Button onClick={() => setCurrentStep(1)}>返回上一步</Button>
                <Button type="primary" onClick={() => void handleRecalculateFreight()}>
                  重新计算运费
                </Button>
                <Button icon={<SaveOutlined />} onClick={() => void handleSaveSolution()} loading={saving}>
                  保存进入第四步
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card className="glass-card" title="运费结果">
            {simulation ? (
              <>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="国家">{simulation.countryName}</Descriptions.Item>
                  <Descriptions.Item label="许可模式">{permitModeText[simulation.permitMode] ?? simulation.permitMode}</Descriptions.Item>
                  <Descriptions.Item label="审核状态">
                    <Tag color={reviewStatusColor[simulation.reviewStatus]}>{reviewStatusText[simulation.reviewStatus] ?? simulation.reviewStatus}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="成本">{simulation.totalCost} {simulation.currency}</Descriptions.Item>
                  <Descriptions.Item label="报价">{simulation.suggestedPrice} {simulation.currency}</Descriptions.Item>
                  <Descriptions.Item label="办理周期">{simulation.permitLeadDays} 天</Descriptions.Item>
                </Descriptions>

                <List
                  style={{ marginTop: 16 }}
                  size="small"
                  bordered
                  header="费用构成"
                  dataSource={simulation.costBreakdown}
                  renderItem={(item) => (
                    <List.Item>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <span>{item.label}</span>
                        <span>{item.amount} {simulation.currency}</span>
                      </Space>
                    </List.Item>
                  )}
                />

                <List
                  style={{ marginTop: 16 }}
                  size="small"
                  bordered
                  header="风险提示"
                  dataSource={simulation.riskFlags}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </>
            ) : (
              <Alert type="info" showIcon message="第二步确定装载方案后，点击“计算运费”即可在这里查看结果。" />
            )}
          </Card>
        </Col>
          </>
        ) : null}

        {currentStep === 3 ? (
          <>
        <Col span={24}>
          <Card className="glass-card" title="第四步：预览与下载">
            {!savedSolution ? (
              <Alert type="info" showIcon message="确认装载方案和运费结果后，点击“保存进入第四步”，即可预览并下载方案及报价。" />
            ) : (
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={15}>
                  <Card size="small" title="方案预览">
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="保存时间">{savedSolution.savedAt}</Descriptions.Item>
                      <Descriptions.Item label="报价单号">{savedSolution.quoteNo ?? '-'}</Descriptions.Item>
                      <Descriptions.Item label="国家">{savedSolution.countryName}</Descriptions.Item>
                      <Descriptions.Item label="线路">{savedSolution.route}</Descriptions.Item>
                      <Descriptions.Item label="总箱数">{savedSolution.cargoSummary.totalBoxes}</Descriptions.Item>
                      <Descriptions.Item label="总重量">{savedSolution.cargoSummary.totalWeightKg} kg</Descriptions.Item>
                      <Descriptions.Item label="总体积">{savedSolution.cargoSummary.totalVolumeM3} m3</Descriptions.Item>
                      <Descriptions.Item label="装载车型">{savedSolution.selectedVehicle}</Descriptions.Item>
                      <Descriptions.Item label="建议车数">{savedSolution.vehicleCount}</Descriptions.Item>
                      <Descriptions.Item label="成本 / 报价">
                        {savedSolution.pricing.totalCost} / {savedSolution.pricing.suggestedPrice} {savedSolution.pricing.currency}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col xs={24} xl={9}>
                  <Card size="small" title="输出操作">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadProposal} block>
                        下载方案及报价
                      </Button>
                      <Typography.Text type="secondary">当前导出为文本版方案摘要，后续可以继续扩展为 PDF/Excel。</Typography.Text>
                    </Space>
                    <Divider />
                    <List size="small" header="风险摘要" bordered dataSource={savedSolution.riskFlags} renderItem={(item) => <List.Item>{item}</List.Item>} />
                  </Card>
                </Col>
              </Row>
            )}
          </Card>
        </Col>
          </>
        ) : null}

        {currentStep === 3 ? (
        <Col span={24}>
          <Card className="glass-card" title="历史报价记录">
            <Table
              rowKey="id"
              dataSource={quotes}
              columns={[
                { title: '报价单号', dataIndex: 'quoteNo' },
                { title: '国家', dataIndex: 'countryName' },
                { title: '线路', render: (_, row) => `${row.originPlace} -> ${row.destinationPlace}` },
                { title: '货物', dataIndex: 'cargoName' },
                {
                  title: '审核状态',
                  render: (_, row) => (
                    <Tag color={reviewStatusColor[row.reviewStatus]}>{reviewStatusText[row.reviewStatus] ?? row.reviewStatus}</Tag>
                  ),
                },
                { title: '成本', render: (_, row) => `${row.totalCost} ${row.currency}` },
                { title: '报价', render: (_, row) => (row.quotedPrice ? `${row.quotedPrice} ${row.currency}` : '-') },
              ]}
            />
          </Card>
        </Col>
        ) : null}
      </Row>
    </>
  );
}
