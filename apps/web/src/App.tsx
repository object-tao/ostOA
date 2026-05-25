import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Layout,
  List,
  Menu,
  Modal,
  Popconfirm,
  Progress,
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
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  CarOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FundOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReloadOutlined,
  RocketOutlined,
  SaveOutlined,
  SettingOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { apiRequest } from './api/client';
import { clearSession, getSessionUser, getToken, saveSession, type SessionUser } from './api/auth';
import { formatBeijingTime } from './utils/date';
import * as XLSX from 'xlsx';
import {
  formatLoadingPlan,
  generateLoadingPlan,
  normalizeCargo,
  validateCargo,
  type CargoItem,
  type LoadingAssignment,
  type LoadingPlan,
} from './services/loadingPlan';
import { CustomerManagementPage, SupplierManagementPage, type ManagedCustomer } from './pages/CustomerSupplierPages';
import { DashboardPage } from './pages/DashboardPage';
import { FinancePage } from './pages/FinancePage';
import { OversizeProjectManagementPage, OversizeTaskManagementPage } from './pages/OversizeProjectManagementPage';
import { TrackingPage } from './pages/TrackingPage';
import { EmployeeRoleSelect, PermissionManagementPage } from './pages/PermissionManagementPage';
import { WorkflowTemplatePage, WorkflowTodoPage } from './pages/WorkflowManagementPages';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type SectionKey =
  | 'home'
  | 'plans'
  | 'inquiries'
  | 'loading'
  | 'oversizeProjects'
  | 'oversizeTasks'
  | 'tracking'
  | 'driverCheckpoints'
  | 'marketInfo'
  | 'workflowTemplates'
  | 'workflowTodos'
  | 'finance'
  | 'customers'
  | 'suppliers'
  | 'baseInfo'
  | 'permissions';

type Customer = {
  id: string;
  name: string;
  customerCode?: string | null;
  shortName?: string | null;
  phone?: string | null;
  email?: string | null;
  region?: string | null;
  invoiceInfo?: string | null;
  notes?: string | null;
};

type Employee = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  department?: string | null;
  position?: string | null;
  isSalesperson: boolean;
  status: string;
  notes?: string | null;
  roles?: { id: string; name: string; code: string }[];
  roleIds?: string[];
  createdAt: string;
  updatedAt: string;
};

type VehicleType = {
  id: string;
  sequenceNo: number;
  category: string;
  name: string;
  lineCount?: number | null;
  axleCount?: number | null;
  effectiveLength?: number | null;
  effectiveWidth?: number | null;
  effectiveHeight?: number | null;
  effectiveVolume?: number | null;
  payloadWeight?: number | null;
  priceSort?: number | null;
  priceWeight?: number | null;
  scenario?: string | null;
  createdAt: string;
  updatedAt: string;
};

type LoadingRule = {
  id: string;
  ruleCode: string;
  ruleName: string;
  category: string;
  applicableCountries?: string[];
  valueType: 'number' | 'text' | 'boolean' | 'json';
  ruleValue: string;
  unit?: string | null;
  enabled: boolean;
  description?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type LoadingAiConfig = {
  id: string;
  provider: string;
  apiBaseUrl: string;
  model: string;
  enabled: boolean;
  systemPrompt?: string | null;
  temperature: number;
  maxOutputTokens: number;
  notes?: string | null;
  hasApiKey: boolean;
  apiKeyMasked?: string;
  keySource?: string;
  updatedAt?: string;
};

type TransportPlan = {
  id: string;
  planNo: string;
  inquiryId: string;
  inquiryNo?: string;
  customerName?: string;
  cargoName?: string;
  title: string;
  route: string;
  transitDays: number;
  estimatedCost: number;
  currency: string;
  planText: string;
  status: string;
  createdAt: string;
};

type LoadingPlanRecord = {
  id: string;
  planNo: string;
  title: string;
  cargoItems: CargoItem[];
  vehicleIds: string[];
  planResult: LoadingPlan;
  planFile?: CargoFile | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type MarketInfo = {
  id: string;
  collectedAt: string;
  whatsappNumber?: string | null;
  sourceGroup?: string | null;
  foreignText: string;
  chineseTranslation?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type DriverCheckpoint = {
  id: string;
  tgId: string;
  tgName?: string | null;
  latitude: number;
  longitude: number;
  checkinAt: string;
  addressRu?: string | null;
  addressZh?: string | null;
  plateNo?: string | null;
  originalImageUrl?: string | null;
  watermarkedImageUrl?: string | null;
  mapImageUrl?: string | null;
  status: string;
  createdAt: string;
};

type CargoFile = {
  key?: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  fileUrl: string;
};

type TransportInquiry = {
  id: string;
  inquiryNo: string;
  customerId?: string | null;
  customerName: string;
  salesperson?: string | null;
  serviceItems?: string[];
  contactName?: string | null;
  contactPhone?: string | null;
  cargoName: string;
  cargoType?: string | null;
  origin: string;
  destination: string;
  weightKg?: number | null;
  volumeCbm?: number | null;
  packageCount?: number | null;
  readyDate?: string | null;
  targetArrivalDate?: string | null;
  customsMode?: string | null;
  temperatureRequirement?: string | null;
  specialRequirement?: string | null;
  cargoFiles?: CargoFile[];
  quoteAmount?: number | null;
  quoteCurrency?: string | null;
  quoteRemark?: string | null;
  quoteFiles?: CargoFile[];
  solutionFiles?: CargoFile[];
  quotedAt?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  plans: TransportPlan[];
};

const statusMeta: Record<string, { text: string; color: string }> = {
  NEW: { text: '待报价', color: 'gold' },
  PLAN_READY: { text: '已生成方案', color: 'green' },
  QUOTED: { text: '完成报价', color: 'blue' },
  CONFIRMED: { text: '已确认', color: 'blue' },
  CLOSED: { text: '已关闭', color: 'default' },
};

const serviceItemOptions = ['国内运输', '国际运输', '自驾接车', '装车', '报关', '转关', '清关', '其他'].map((value) => ({
  value,
  label: value,
}));

function statusTag(status: string) {
  const meta = statusMeta[status] ?? { text: status, color: 'default' };
  return <Tag color={meta.color}>{meta.text}</Tag>;
}

function dateText(value?: string | null) {
  if (!value) {
    return '-';
  }
  return value.slice(0, 10);
}

function fileSizeText(value?: number) {
  if (!value) {
    return '-';
  }
  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`;
  }
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function fileUrl(value: string) {
  if (value.startsWith('http')) {
    return value;
  }
  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8787';
  const isLocalBrowser =
    typeof window !== 'undefined' &&
    (window.location.hostname === '127.0.0.1' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname.startsWith('192.168.'));
  return isLocalBrowser ? value : `${configuredApiBaseUrl}${value}`;
}

function beforeQuoteAttachmentUpload(file: File) {
  const fileName = file.name.toLowerCase();
  const isAllowed =
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'application/pdf' ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.pdf');
  if (!isAllowed) {
    message.error('鍙兘涓婁紶 jpg銆乸ng銆乸df 鏂囦欢');
    return Upload.LIST_IGNORE;
  }
  return false;
}

function nowrapText(value?: string | null) {
  return <span className="nowrap-cell">{value || '-'}</span>;
}

function canUploadQuote(record?: TransportInquiry | null) {
  return Boolean(record && record.status !== 'QUOTED');
}

export default function App() {
  const [loginForm] = Form.useForm();
  const [inquiryForm] = Form.useForm();
  const [planForm] = Form.useForm();
  const [quoteForm] = Form.useForm();
  const [employeeForm] = Form.useForm();
  const [vehicleTypeForm] = Form.useForm();
  const [loadingRuleForm] = Form.useForm();
  const [loadingAiConfigForm] = Form.useForm();
  const [cargoForm] = Form.useForm();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(getSessionUser());
  const [activeSection, setActiveSection] = useState<SectionKey>('home');
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [taskOpenRequest, setTaskOpenRequest] = useState<{ taskId: string; nodeId?: string | null; requestId: number } | null>(null);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [loginLoading, setLoginLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [marketInfos, setMarketInfos] = useState<MarketInfo[]>([]);
  const [driverCheckpoints, setDriverCheckpoints] = useState<DriverCheckpoint[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loadingRuleConfigs, setLoadingRuleConfigs] = useState<LoadingRule[]>([]);
  const [loadingAiConfig, setLoadingAiConfig] = useState<LoadingAiConfig | null>(null);
  const [inquiries, setInquiries] = useState<TransportInquiry[]>([]);
  const [plans, setPlans] = useState<TransportPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<LoadingPlanRecord[]>([]);
  const [cargoItems, setCargoItems] = useState<CargoItem[]>([]);
  const [loadingDestinationCountries, setLoadingDestinationCountries] = useState<string[]>(['哈萨克斯坦']);
  const [loadingPlan, setLoadingPlan] = useState<LoadingPlan | null>(null);
  const [editingCargo, setEditingCargo] = useState<CargoItem | null>(null);
  const [inquiryDrawerOpen, setInquiryDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [vehicleTypeModalOpen, setVehicleTypeModalOpen] = useState(false);
  const [loadingRuleModalOpen, setLoadingRuleModalOpen] = useState(false);
  const [loadingAiConfigModalOpen, setLoadingAiConfigModalOpen] = useState(false);
  const [cargoModalOpen, setCargoModalOpen] = useState(false);
  const [savingLoadingPlan, setSavingLoadingPlan] = useState(false);
  const [activeLoadingStep, setActiveLoadingStep] = useState('cargo');
  const [loadingPlanSaved, setLoadingPlanSaved] = useState(false);
  const [loadingPlanUploadFiles, setLoadingPlanUploadFiles] = useState<UploadFile[]>([]);
  const [selectedLoadingPlanRecord, setSelectedLoadingPlanRecord] = useState<LoadingPlanRecord | null>(null);
  const [aiOptimizeOpen, setAiOptimizeOpen] = useState(false);
  const [aiOptimizeLoading, setAiOptimizeLoading] = useState(false);
  const [aiManualPlanText, setAiManualPlanText] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<TransportInquiry | null>(null);
  const [editingInquiry, setEditingInquiry] = useState<TransportInquiry | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);
  const [editingLoadingRule, setEditingLoadingRule] = useState<LoadingRule | null>(null);

  const can = (code: string) => sessionUser?.roleCode === 'ADMIN' || Boolean(sessionUser?.permissions?.includes(code));

  const stats = useMemo(() => {
    const waiting = inquiries.filter((item) => item.status === 'NEW').length;
    return {
      inquiryCount: inquiries.length,
      planCount: plans.length,
      waiting,
      ready: inquiries.length - waiting,
    };
  }, [inquiries, plans]);

  const salespeople = useMemo(
    () => employees.filter((item) => item.isSalesperson && item.status === 'ACTIVE'),
    [employees],
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [customerRes, inquiryRes, planRes, employeeRes, vehicleTypeRes, loadingRuleRes, loadingAiConfigRes, loadingPlanRes, marketInfoRes, driverCheckpointRes] = await Promise.all([
        apiRequest<{ items: Customer[] }>('/api/customers'),
        apiRequest<{ items: TransportInquiry[] }>('/api/transport-inquiries'),
        apiRequest<{ items: TransportPlan[] }>('/api/transport-plans'),
        apiRequest<{ items: Employee[] }>('/api/employees'),
        apiRequest<{ items: VehicleType[] }>('/api/vehicle-types'),
        apiRequest<{ items: LoadingRule[] }>('/api/loading-rules'),
        apiRequest<LoadingAiConfig>('/api/loading-ai-config'),
        apiRequest<{ items: LoadingPlanRecord[] }>('/api/loading-plans'),
        apiRequest<{ items: MarketInfo[] }>('/api/market-info'),
        apiRequest<{ items: DriverCheckpoint[] }>('/api/driver/checkpoints'),
      ]);
      setCustomers(customerRes.items ?? []);
      setInquiries(inquiryRes.items ?? []);
      setPlans(planRes.items ?? []);
      setEmployees(employeeRes.items ?? []);
      setVehicleTypes(vehicleTypeRes.items ?? []);
      setLoadingRuleConfigs(loadingRuleRes.items ?? []);
      setLoadingAiConfig(loadingAiConfigRes);
      setLoadingPlans(loadingPlanRes.items ?? []);
      setMarketInfos(marketInfoRes.items ?? []);
      setDriverCheckpoints(driverCheckpointRes.items ?? []);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (getToken()) {
      void apiRequest<{ user: SessionUser }>('/api/auth/me')
        .then((result) => {
          if (result.user) {
            setSessionUser(result.user);
            const token = getToken();
            if (token) saveSession(token, result.user);
          }
        })
        .finally(() => void loadData());
    }
  }, []);

  const login = async (values: { email: string; password: string }) => {
    setLoginLoading(true);
    try {
      const result = await apiRequest<{ token: string; user: SessionUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      saveSession(result.token, result.user);
      setSessionUser(result.user);
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setSessionUser(null);
    setInquiries([]);
    setPlans([]);
  };

  const uploadCargoFiles = async (files: UploadFile[] = [], folder = 'transport-inquiries') => {
    const uploaded: CargoFile[] = [];
    for (const item of files) {
      if (!item.originFileObj) {
        continue;
      }
      const formData = new FormData();
      formData.append('file', item.originFileObj);
      formData.append('folder', folder);
      uploaded.push(await apiRequest<CargoFile>('/api/uploads', { method: 'POST', body: formData }));
    }
    return uploaded;
  };

  const openInquiryDrawer = (record?: TransportInquiry) => {
    setEditingInquiry(record ?? null);
    inquiryForm.resetFields();
    inquiryForm.setFieldsValue(
      record
        ? {
            ...record,
            cargoUploadFiles: [],
          }
        : { cargoType: '普货', customsMode: '一般贸易', temperatureRequirement: '常温' },
    );
    setInquiryDrawerOpen(true);
  };

  const saveInquiry = async (values: Partial<TransportInquiry> & { cargoUploadFiles?: UploadFile[] }) => {
    const customer = customers.find((item) => item.id === values.customerId);
    try {
      const cargoFiles = await uploadCargoFiles(values.cargoUploadFiles);
      const payload = {
        ...values,
        cargoUploadFiles: undefined,
        cargoFiles: [...(editingInquiry?.cargoFiles ?? []), ...cargoFiles],
        customerName: values.customerName || customer?.shortName || customer?.name,
      };
      await apiRequest<TransportInquiry>(editingInquiry ? `/api/transport-inquiries/${editingInquiry.id}` : '/api/transport-inquiries', {
        method: editingInquiry ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...payload,
        }),
      });
      message.success(editingInquiry ? '询单已更新' : '询单已创建');
      setInquiryDrawerOpen(false);
      setEditingInquiry(null);
      inquiryForm.resetFields();
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const deleteInquiry = async (record: TransportInquiry) => {
    try {
      await apiRequest(`/api/transport-inquiries/${record.id}`, { method: 'DELETE' });
      message.success('询单已删除');
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const generatePlan = async (values: Partial<TransportPlan> = {}) => {
    if (!selectedInquiry) {
      return;
    }
    try {
      const updated = await apiRequest<TransportInquiry>(`/api/transport-inquiries/${selectedInquiry.id}/generate-plan`, {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setSelectedInquiry(updated);
      message.success('方案已生成');
      setPlanModalOpen(false);
      planForm.resetFields();
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const openQuoteModal = (record: TransportInquiry) => {
    setSelectedInquiry(record);
    quoteForm.resetFields();
    quoteForm.setFieldsValue({
      quoteAmount: record.quoteAmount,
      quoteCurrency: record.quoteCurrency || 'USD',
      quoteRemark: record.quoteRemark,
      quoteUploadFiles: [],
      solutionUploadFiles: [],
    });
    setQuoteModalOpen(true);
  };

  const submitQuote = async (
    values: Partial<TransportInquiry> & {
      quoteUploadFiles?: UploadFile[];
      solutionUploadFiles?: UploadFile[];
    },
  ) => {
    if (!selectedInquiry) {
      return;
    }

    try {
      const [quoteFiles, solutionFiles] = await Promise.all([
        uploadCargoFiles(values.quoteUploadFiles),
        uploadCargoFiles(values.solutionUploadFiles),
      ]);
      const updated = await apiRequest<TransportInquiry>(`/api/transport-inquiries/${selectedInquiry.id}/quote`, {
        method: 'POST',
        body: JSON.stringify({
          quoteAmount: values.quoteAmount,
          quoteCurrency: values.quoteCurrency || 'USD',
          quoteRemark: values.quoteRemark,
          quoteFiles: [...(selectedInquiry.quoteFiles ?? []), ...quoteFiles],
          solutionFiles: [...(selectedInquiry.solutionFiles ?? []), ...solutionFiles],
        }),
      });
      setSelectedInquiry(updated);
      message.success('????????????????');
      setQuoteModalOpen(false);
      quoteForm.resetFields();
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const openCargoModal = (record?: CargoItem) => {
    setEditingCargo(record ?? null);
    cargoForm.resetFields();
    cargoForm.setFieldsValue(
      record ?? {
        quantity: 1,
        allowRotate: true,
        allowStack: false,
      },
    );
    setCargoModalOpen(true);
  };

  const saveCargo = (values: Partial<CargoItem>) => {
    const errors = validateCargo(values);
    if (errors.length) {
      message.error(errors[0]);
      return;
    }
    const normalized = normalizeCargo({ ...values, id: editingCargo?.id });
    setCargoItems((items) => (editingCargo ? items.map((item) => (item.id === editingCargo.id ? normalized : item)) : [...items, normalized]));
    setCargoModalOpen(false);
    setEditingCargo(null);
    cargoForm.resetFields();
    setLoadingPlan(null);
    setLoadingPlanSaved(false);
    setActiveLoadingStep('cargo');
  };

  const copyCargo = (record: CargoItem) => {
    const copied = normalizeCargo({ ...record, id: undefined, boxNo: `${record.boxNo}-COPY` });
    setCargoItems((items) => [...items, copied]);
    setLoadingPlan(null);
    setLoadingPlanSaved(false);
    setActiveLoadingStep('cargo');
  };

  const deleteCargo = (record: CargoItem) => {
    setCargoItems((items) => items.filter((item) => item.id !== record.id));
    setLoadingPlan(null);
    setLoadingPlanSaved(false);
    setActiveLoadingStep('cargo');
  };

  const downloadCargoTemplate = () => {
    const header = ['箱子序号', '名称', '长度(mm)', '宽度(mm)', '高度(mm)', '数量', '重量(kg)', '总重量(kg)', '体积(立方)', '允许旋转', '允许堆叠', '备注'];
    const sample = ['BOX-001', '货物', '12000', '2600', '3200', '1', '18000', '', '', '是', '否', '备注'];
    const blob = new Blob([`\ufeff${header.join(',')}\n${sample.join(',')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '配货导入模板.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const truthyText = (value: unknown) => {
    const text = String(value ?? '').trim().toLowerCase();
    return ['是', '可', '可以', '允许', '允许堆叠', '允许旋转', 'true', 'yes', 'y', '1'].includes(text);
  };

  const stackableText = (stackValue: unknown, requirementValue: unknown) => {
    const requirement = String(requirementValue ?? '').trim();
    if (requirement.includes('不可堆放') || requirement.includes('不能堆放') || requirement.includes('不允许堆放') || requirement.includes('不允许堆叠')) {
      return false;
    }
    if (requirement.includes('可堆放') || requirement.includes('允许堆放') || requirement.includes('允许堆叠')) {
      return true;
    }
    if (stackValue !== undefined && stackValue !== '') {
      return truthyText(stackValue);
    }
    return true;
  };

  const importCargoFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type.includes('csv');
      const decodeCsv = () => {
        for (const encoding of ['utf-8', 'gb18030', 'gbk']) {
          try {
            return new TextDecoder(encoding, { fatal: true }).decode(buffer);
          } catch {
            // Try the next common CSV encoding.
          }
        }
        return new TextDecoder('utf-8').decode(buffer);
      };
      const workbook = isCsv ? XLSX.read(decodeCsv(), { type: 'string', raw: true }) : XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      const imported: CargoItem[] = [];
      const rowErrors: string[] = [];
      const normalizeHeader = (value: string) =>
        value
          .replace(/^\ufeff/, '')
          .replace(/\s+/g, '')
          .replace(/[（]/g, '(')
          .replace(/[）]/g, ')')
          .replace(/³/g, '3')
          .toLowerCase();
      const normalizeNumber = (value: unknown) => {
        if (typeof value === 'number') return value;
        const text = String(value ?? '')
          .replace(/,/g, '')
          .trim();
        return Number(text);
      };
      const valueOf = (row: Record<string, unknown>, names: string[]) => {
        const normalizedRow = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]));
        return names
          .map((name) => normalizedRow[normalizeHeader(name)])
          .find((value) => value !== undefined && value !== '');
      };

      rows.forEach((row, index) => {
        const requirement = valueOf(row, ['要求', '装载要求', '摆放要求', '堆叠要求', '备注']);
        const rawItem: Partial<CargoItem> = {
          boxNo: String(valueOf(row, ['箱子序号', '箱号', '序号', '编号', 'boxNo', 'box']) ?? ''),
          name: String(valueOf(row, ['名称', '货物名称', '品名', '货物', 'name', 'cargoName']) ?? ''),
          lengthCm: normalizeNumber(valueOf(row, ['长度(mm)', '长(mm)', '长度', '长', 'l', 'lengthMm', 'length']) ?? 0),
          widthCm: normalizeNumber(valueOf(row, ['宽度(mm)', '宽(mm)', '宽度', '宽', 'w', 'widthMm', 'width']) ?? 0),
          heightCm: normalizeNumber(valueOf(row, ['高度(mm)', '高(mm)', '高度', '高', 'h', 'heightMm', 'height']) ?? 0),
          quantity: normalizeNumber(valueOf(row, ['数量', '件数', 'qty', 'quantity']) ?? 0),
          weightKg: normalizeNumber(valueOf(row, ['重量(kg)', '重量', '单件重量', '单重(kg)', '单重', 'gw', 'weightKg', 'weight']) ?? 0),
          totalWeightKg: normalizeNumber(valueOf(row, ['总重量(kg)', '总重(kg)', '总重量', '总重', 'totalWeightKg']) ?? 0),
          volumeCbm: normalizeNumber(valueOf(row, ['体积(立方)', '体积(m3)', '体积(m³)', '体积', '方数', 'volumeCbm', 'volume']) ?? 0),
          allowRotate: truthyText(valueOf(row, ['允许旋转', '旋转', '是否允许旋转', 'allowRotate'])),
          allowStack: stackableText(valueOf(row, ['允许堆叠', '堆叠', '是否允许堆叠', 'allowStack']), requirement),
          remark: String(valueOf(row, ['备注', '说明', 'remark']) ?? ''),
        };
        const errors = validateCargo(rawItem);
        if (errors.length) {
          rowErrors.push(`第 ${index + 2} 行：${errors.join('、')}`);
        } else {
          imported.push(normalizeCargo(rawItem));
        }
      });

      if (rowErrors.length) {
        Modal.error({
          title: '导入数据校验未通过',
          content: <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{rowErrors.slice(0, 8).join('\n')}</Paragraph>,
        });
        return Upload.LIST_IGNORE;
      }
      setCargoItems((items) => [...items, ...imported]);
      setLoadingPlan(null);
      setLoadingPlanSaved(false);
      setActiveLoadingStep('cargo');
      message.success(`已导入 ${imported.length} 条货物`);
    } catch (error) {
      message.error(`导入失败：${(error as Error).message}`);
    }
    return Upload.LIST_IGNORE;
  };

  const runLoadingPlan = () => {
    if (!cargoItems.length) {
      message.warning('请先新增或导入货物信息');
      return;
    }
    if (!vehicleTypes.length) {
      message.warning('系统中还没有可用于自动匹配的车型数据');
      return;
    }
    setLoadingPlan(
      generateLoadingPlan(cargoItems, vehicleTypes, {
        destinationCountries: loadingDestinationCountries,
        loadingRules: loadingRuleConfigs
          .filter((rule) => {
            const countries = rule.applicableCountries ?? [];
            return !countries.length || countries.some((country) => loadingDestinationCountries.includes(country));
          })
          .map((rule) => ({
            ruleCode: rule.ruleCode,
            ruleValue: rule.ruleValue,
            valueType: rule.valueType,
            enabled: rule.enabled,
            applicableCountries: rule.applicableCountries,
          })),
      }),
    );
    setLoadingPlanSaved(false);
    setActiveLoadingStep('result');
    message.success('配载方案已生成，可进入第二步调整');
  };

  const recalculateLoadingPlan = (plan: LoadingPlan): LoadingPlan => {
    const vehicles = plan.vehicles.map((vehicle) => {
      const usedWeightKg = vehicle.assignments.reduce((sum, item) => sum + item.weightKg, 0);
      const usedVolumeCbm = vehicle.assignments.reduce((sum, item) => sum + item.volumeCbm, 0);
      const maxLengthCm = vehicle.assignments.reduce((max, item) => Math.max(max, item.usedLengthCm), 0);
      const weightLimit = Number(vehicle.vehicle.payloadWeight ?? 0);
      const volumeLimit = Number(vehicle.vehicle.effectiveVolume ?? 0);
      return {
        ...vehicle,
        usedWeightKg,
        usedVolumeCbm,
        maxLengthCm,
        weightUtilization: weightLimit ? Math.round((usedWeightKg / weightLimit) * 1000) / 10 : 0,
        volumeUtilization: volumeLimit ? Math.round((usedVolumeCbm / volumeLimit) * 1000) / 10 : 0,
      };
    });
    return {
      ...plan,
      vehicles,
      summary: {
        ...plan.summary,
        assignedQuantity: vehicles.reduce((sum, vehicle) => sum + vehicle.assignments.reduce((inner, item) => inner + item.quantity, 0), 0),
        assignedWeightKg: vehicles.reduce((sum, vehicle) => sum + vehicle.usedWeightKg, 0),
        assignedVolumeCbm: vehicles.reduce((sum, vehicle) => sum + vehicle.usedVolumeCbm, 0),
        vehicleCount: vehicles.filter((vehicle) => vehicle.assignments.length > 0).length,
      },
    };
  };

  const vehiclePriceWeight = (vehicle: LoadingPlan['vehicles'][number]) => Number(vehicle.vehicle.priceWeight ?? vehicle.vehicle.priceSort ?? 0) || 0;

  const loadingPlanPriceWeightTotal = (plan: LoadingPlan) =>
    plan.vehicles.reduce((sum, vehicle) => sum + vehiclePriceWeight(vehicle), 0);

  const loadingPlanVehicleTypeSummary = (plan: LoadingPlan) => {
    const grouped = new Map<string, { count: number; weight: number }>();
    for (const vehicle of plan.vehicles) {
      const key = `${vehicle.vehicle.category} / ${vehicle.vehicle.name} · ${vehicle.vehicle.lineCount ?? '-'}线 ${vehicle.vehicle.axleCount ?? '-'}轴`;
      const existing = grouped.get(key) ?? { count: 0, weight: 0 };
      existing.count += 1;
      existing.weight += vehiclePriceWeight(vehicle);
      grouped.set(key, existing);
    }
    return [...grouped.entries()].map(([name, value]) => ({ name, ...value }));
  };

  const loadingVehicleTitle = (vehicle: LoadingPlan['vehicles'][number]) =>
    `${vehicle.vehicle.category} / ${vehicle.vehicle.name} · ${vehicle.vehicle.lineCount ?? '-'}线 ${vehicle.vehicle.axleCount ?? '-'}轴 · ${
      vehicle.loadingMethod ?? '自动配载'
    }（权重 ${vehiclePriceWeight(vehicle) || '-'}）`;

  const updateAssignmentQuantity = (assignment: LoadingAssignment, quantity: number) => {
    const cargo = cargoItems.find((item) => item.id === assignment.cargoId);
    if (!cargo || !loadingPlan) {
      return;
    }
    const nextQuantity = Math.max(1, Math.round(quantity));
    const unitVolume = cargo.volumeCbm / cargo.quantity;
    const updated = {
      ...loadingPlan,
      vehicles: loadingPlan.vehicles.map((vehicle) => ({
        ...vehicle,
        assignments: vehicle.assignments.map((item) =>
          item.id === assignment.id
            ? { ...item, quantity: nextQuantity, weightKg: cargo.weightKg * nextQuantity, volumeCbm: unitVolume * nextQuantity }
            : item,
        ),
      })),
    };
    setLoadingPlan(recalculateLoadingPlan(updated));
  };

  const changeLoadingVehicleType = (sourceVehicleId: string, nextVehicleId: string) => {
    if (!loadingPlan || sourceVehicleId === nextVehicleId) {
      return;
    }
    const nextVehicle = vehicleTypes.find((item) => item.id === nextVehicleId);
    if (!nextVehicle) {
      return;
    }
    const updated = {
      ...loadingPlan,
      vehicles: loadingPlan.vehicles.map((vehicle) =>
        vehicle.vehicle.id === sourceVehicleId
          ? {
              ...vehicle,
              vehicle: nextVehicle,
              loadingMethod: `${vehicle.loadingMethod || '????'} / ??????`,
              assignments: vehicle.assignments.map((item) => ({
                ...item,
                vehicleId: nextVehicle.id,
                vehicleName: `${nextVehicle.category} / ${nextVehicle.name}`,
              })),
            }
          : vehicle,
      ),
    };
    setLoadingPlan(recalculateLoadingPlan(updated));
  };

  const moveAssignmentToVehicle = (assignment: LoadingAssignment, targetVehicleIndex: number) => {
    if (!loadingPlan) {
      return;
    }
    const currentVehicleIndex = loadingPlan.vehicles.findIndex((vehicle) => vehicle.assignments.some((item) => item.id === assignment.id));
    const targetVehicleResult = loadingPlan.vehicles[targetVehicleIndex];
    if (currentVehicleIndex < 0 || !targetVehicleResult || currentVehicleIndex === targetVehicleIndex) {
      return;
    }
    let moving: LoadingAssignment | null = null;
    const vehicles = loadingPlan.vehicles.map((vehicle, index) => {
      if (index !== currentVehicleIndex) {
        return vehicle;
      }
      moving = vehicle.assignments.find((item) => item.id === assignment.id) ?? null;
      return { ...vehicle, assignments: vehicle.assignments.filter((item) => item.id !== assignment.id) };
    });
    if (!moving) {
      return;
    }
    const movedAssignment: LoadingAssignment = moving;
    const updated = {
      ...loadingPlan,
      vehicles: vehicles.map((vehicle, index) =>
        index === targetVehicleIndex
          ? {
              ...vehicle,
              assignments: [
                ...vehicle.assignments,
                {
                  ...movedAssignment,
                  vehicleId: targetVehicleResult.vehicle.id,
                  vehicleName: `${targetVehicleResult.vehicle.category} / ${targetVehicleResult.vehicle.name}`,
                },
              ],
            }
          : vehicle,
      ),
    };
    setLoadingPlan(recalculateLoadingPlan(updated));
  };

  const downloadLoadingPlanFile = (plan: LoadingPlan) => {
    const rows = plan.vehicles.flatMap((vehicle, vehicleIndex) =>
      vehicle.assignments.map((assignment) => {
        const cargo = cargoItems.find((item) => item.id === assignment.cargoId);
        const lengthMm = assignment.lengthCm ?? cargo?.lengthCm ?? '';
        const widthMm = assignment.widthCm ?? cargo?.widthCm ?? '';
        const heightMm = assignment.heightCm ?? cargo?.heightCm ?? '';
        return [
          `车辆${vehicleIndex + 1}`,
          `${vehicle.vehicle.category} / ${vehicle.vehicle.name}`,
          assignment.boxNo,
          assignment.cargoName,
          lengthMm,
          widthMm,
          heightMm,
          assignment.weightKg,
        ];
      }),
    );
    const sheet = XLSX.utils.aoa_to_sheet([
      ['车辆', '当前车型名称', '货物序号', '货物名称', '长', '宽', '高', '重量'],
      ...rows,
    ]);
    const merges: XLSX.Range[] = [];
    let rowCursor = 1;
    for (const vehicle of plan.vehicles) {
      const count = vehicle.assignments.length;
      if (count > 1) {
        merges.push(
          { s: { r: rowCursor, c: 0 }, e: { r: rowCursor + count - 1, c: 0 } },
          { s: { r: rowCursor, c: 1 }, e: { r: rowCursor + count - 1, c: 1 } },
        );
      }
      rowCursor += count;
    }
    sheet['!merges'] = merges;
    sheet['!cols'] = [
      { wch: 10 },
      { wch: 24 },
      { wch: 16 },
      { wch: 24 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
    ];
    const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1:H1');
    for (let row = range.s.r; row <= range.e.r; row += 1) {
      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const address = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = sheet[address];
        if (!cell) continue;
        cell.s = {
          alignment: { horizontal: col <= 1 || row === 0 ? 'center' : 'left', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'thin', color: { rgb: 'D9E2EC' } },
            bottom: { style: 'thin', color: { rgb: 'D9E2EC' } },
            left: { style: 'thin', color: { rgb: 'D9E2EC' } },
            right: { style: 'thin', color: { rgb: 'D9E2EC' } },
          },
          font: row === 0 ? { bold: true, color: { rgb: '10233F' } } : undefined,
          fill: row === 0 ? { fgColor: { rgb: 'F3F7FB' } } : undefined,
        };
      }
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, '配载方案');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.title.replace(/[\\/:*?"<>|]/g, '-')}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadUploadedFile = (file?: CargoFile | null) => {
    if (!file?.fileUrl) {
      message.warning('当前方案没有上传文件');
      return;
    }
    const link = document.createElement('a');
    link.href = fileUrl(file.fileUrl);
    link.download = file.fileName;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.click();
  };

  const saveLoadingPlan = async () => {
    if (!loadingPlan) {
      message.warning('璇峰厛鐢熸垚閰嶈浇鏂规');
      return;
    }
    setSavingLoadingPlan(true);
    try {
      const uploadedPlanFiles = await uploadCargoFiles(loadingPlanUploadFiles, 'loading-plans');
      await apiRequest('/api/loading-plans', {
        method: 'POST',
        body: JSON.stringify({
          title: loadingPlan.title,
          cargoItems,
          vehicleIds: loadingPlan.vehicles.map((item) => item.vehicle.id),
          planResult: loadingPlan,
          planFile: uploadedPlanFiles[0] ?? null,
        }),
      });
      message.success('???????');
      downloadLoadingPlanFile(loadingPlan);
      await loadData();
      setLoadingPlanUploadFiles([]);
      setLoadingPlanSaved(true);
      setActiveLoadingStep('saved');
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSavingLoadingPlan(false);
    }
  };

  const runAiLoadingPlanOptimize = async () => {
    if (!loadingPlan) {
      message.warning('请先生成配载方案');
      return;
    }
    setAiOptimizeLoading(true);
    try {
      const result = await apiRequest<{ configured?: boolean; answer: string; questions?: string[] }>('/api/loading-plans/ai-optimize', {
        method: 'POST',
        body: JSON.stringify({
          cargoItems,
          vehicleTypes,
          systemPlan: loadingPlan,
          destinationCountry: loadingDestinationCountries.join('、'),
          manualPlanText: aiManualPlanText,
          question: aiQuestion,
        }),
      });
      setAiAnswer([result.answer, result.questions?.length ? `\n建议追问：\n${result.questions.map((item) => `- ${item}`).join('\n')}` : ''].join(''));
      if (result.configured === false) {
        message.warning('AI Key 尚未配置，已显示离线引导问题');
      }
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setAiOptimizeLoading(false);
    }
  };

  const openEmployeeModal = (record?: Employee) => {
    setEditingEmployee(record ?? null);
    employeeForm.setFieldsValue(
      record ?? {
        status: 'ACTIVE',
        isSalesperson: false,
      },
    );
    setEmployeeModalOpen(true);
  };

  const saveEmployee = async (values: Partial<Employee>) => {
    try {
      const { roleIds, ...employeeValues } = values;
      if (editingEmployee) {
        await apiRequest(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          body: JSON.stringify(employeeValues),
        });
        await apiRequest(`/api/employees/${editingEmployee.id}/roles`, {
          method: 'PUT',
          body: JSON.stringify({ roleIds: roleIds ?? [] }),
        });
        message.success('员工已更新');
      } else {
        const result = await apiRequest<{ id: string }>('/api/employees', {
          method: 'POST',
          body: JSON.stringify(employeeValues),
        });
        if (result.id) {
          await apiRequest(`/api/employees/${result.id}/roles`, {
            method: 'PUT',
            body: JSON.stringify({ roleIds: roleIds ?? [] }),
          });
        }
        message.success('员工已创建');
      }
      setEmployeeModalOpen(false);
      setEditingEmployee(null);
      employeeForm.resetFields();
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const resetEmployeePassword = (employee: Employee) => {
    Modal.confirm({
      title: '???????',
      content: `?? ${employee.name} ???????? ost987456?${employee.email ? '' : ' ?????????????????'}`,
      okText: '纭閲嶇疆',
      cancelText: '鍙栨秷',
      onOk: async () => {
        try {
          await apiRequest(`/api/employees/${employee.id}/reset-password`, { method: 'POST' });
          message.success('瀵嗙爜宸查噸缃紝榛樿瀵嗙爜锛歰st987456');
        } catch (error) {
          message.error((error as Error).message);
        }
      },
    });
  };

  const openVehicleTypeModal = (record?: VehicleType) => {
    setEditingVehicleType(record ?? null);
    vehicleTypeForm.resetFields();
    vehicleTypeForm.setFieldsValue(
      record
        ? { ...record, priceWeight: record.priceWeight ?? record.priceSort }
        : {
        sequenceNo: vehicleTypes.length + 1,
        category: '篷布车',
          },
    );
    setVehicleTypeModalOpen(true);
  };

  const saveVehicleType = async (values: Partial<VehicleType>) => {
    try {
      if (editingVehicleType) {
        await apiRequest(`/api/vehicle-types/${editingVehicleType.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
        message.success('车型已更新');
      } else {
        await apiRequest('/api/vehicle-types', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        message.success('车型已创建');
      }
      setVehicleTypeModalOpen(false);
      setEditingVehicleType(null);
      vehicleTypeForm.resetFields();
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const openLoadingRuleModal = (record?: LoadingRule) => {
    setEditingLoadingRule(record ?? null);
    loadingRuleForm.resetFields();
    loadingRuleForm.setFieldsValue(
      record
        ? record
        : {
            category: '通用规则',
            valueType: 'number',
            enabled: true,
            sortOrder: loadingRuleConfigs.length + 1,
          },
    );
    setLoadingRuleModalOpen(true);
  };

  const saveLoadingRule = async (values: Partial<LoadingRule>) => {
    try {
      if (editingLoadingRule) {
        await apiRequest(`/api/loading-rules/${editingLoadingRule.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
        message.success('配载规则已更新');
      } else {
        await apiRequest('/api/loading-rules', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        message.success('配载规则已创建');
      }
      setLoadingRuleModalOpen(false);
      setEditingLoadingRule(null);
      loadingRuleForm.resetFields();
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const deleteLoadingRule = async (record: LoadingRule) => {
    try {
      await apiRequest(`/api/loading-rules/${record.id}`, { method: 'DELETE' });
      message.success('配载规则已删除');
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const openLoadingAiConfigModal = () => {
    loadingAiConfigForm.resetFields();
    loadingAiConfigForm.setFieldsValue({
      provider: loadingAiConfig?.provider ?? 'openai',
      apiBaseUrl: loadingAiConfig?.apiBaseUrl ?? 'https://api.openai.com/v1/responses',
      apiKey: '',
      model: loadingAiConfig?.model ?? 'gpt-4.1-mini',
      enabled: loadingAiConfig?.enabled ?? true,
      systemPrompt: loadingAiConfig?.systemPrompt,
      temperature: loadingAiConfig?.temperature ?? 0.2,
      maxOutputTokens: loadingAiConfig?.maxOutputTokens ?? 2000,
      notes: loadingAiConfig?.notes,
    });
    setLoadingAiConfigModalOpen(true);
  };

  const saveLoadingAiConfig = async (values: Partial<LoadingAiConfig> & { apiKey?: string }) => {
    try {
      const payload = { ...values };
      if (!payload.apiKey) {
        delete payload.apiKey;
      }
      const result = await apiRequest<LoadingAiConfig>('/api/loading-ai-config', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setLoadingAiConfig(result);
      setLoadingAiConfigModalOpen(false);
      loadingAiConfigForm.resetFields();
      message.success('AI 配置已更新');
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const invalidateMarketInfo = async (record: MarketInfo) => {
    try {
      await apiRequest(`/api/market-info/${record.id}`, { method: 'DELETE' });
      message.success('已标注无效并删除');
      setMarketInfos((items) => items.filter((item) => item.id !== record.id));
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const openDetail = (record: TransportInquiry) => {
    setSelectedInquiry(record);
    setDetailDrawerOpen(true);
  };

  const marketInfoColumns: ColumnsType<MarketInfo> = [
    { title: '采集时间', dataIndex: 'collectedAt', width: 180, render: (value) => nowrapText(formatBeijingTime(value, true)) },
    { title: 'WhatsApp号码', dataIndex: 'whatsappNumber', width: 160, render: (value) => nowrapText(value || '-') },
    { title: '来源群', dataIndex: 'sourceGroup', width: 180, render: (value) => nowrapText(value || '-') },
    {
      title: '外语（俄语/哈萨克语）',
      dataIndex: 'foreignText',
      width: 360,
      render: (value) => <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>{value}</Paragraph>,
    },
    {
      title: '翻译中文',
      dataIndex: 'chineseTranslation',
      width: 360,
      render: (value) => <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>{value || '-'}</Paragraph>,
    },
    {
      title: '操作',
      width: 110,
      fixed: 'right',
      render: (_, row) => (
        <Popconfirm title="确认标注无效并删除这条市场信息？" onConfirm={() => void invalidateMarketInfo(row)}>
          <Button danger type="link" icon={<DeleteOutlined />}>
            无效
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const driverCheckpointColumns: ColumnsType<DriverCheckpoint> = [
    { title: '打卡时间', dataIndex: 'checkinAt', width: 180, render: (value) => nowrapText(formatBeijingTime(value, true)) },
    { title: '司机', width: 180, render: (_, row) => nowrapText(row.tgName || row.tgId || '-') },
    { title: 'Telegram ID', dataIndex: 'tgId', width: 150, render: (value) => nowrapText(value || '-') },
    {
      title: '地点',
      width: 360,
      render: (_, row) => (
        <Space direction="vertical" size={2}>
          <Text>{row.addressZh || '-'}</Text>
          <Text type="secondary">{row.addressRu || '-'}</Text>
        </Space>
      ),
    },
    {
      title: '经纬度',
      width: 190,
      render: (_, row) => nowrapText(`${Number(row.latitude).toFixed(6)}, ${Number(row.longitude).toFixed(6)}`),
    },
    { title: '车牌', dataIndex: 'plateNo', width: 120, render: (value) => nowrapText(value || '-') },
    {
      title: '照片',
      width: 190,
      fixed: 'right',
      render: (_, row) => (
        <Space>
          {row.watermarkedImageUrl ? (
            <Button type="link" onClick={() => window.open(row.watermarkedImageUrl || '', '_blank')}>
              水印图
            </Button>
          ) : null}
          {row.originalImageUrl ? (
            <Button type="link" onClick={() => window.open(row.originalImageUrl || '', '_blank')}>
              原图
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  const inquiryColumns: ColumnsType<TransportInquiry> = [
    { title: '状态', width: 120, fixed: 'left', render: (_, row) => statusTag(row.status) },
    {
      title: '询单号',
      dataIndex: 'inquiryNo',
      width: 180,
      render: (value, record) => (
        <Button type="link" className="table-link-cell" onClick={() => openDetail(record)}>
          {value}
        </Button>
      ),
    },
    { title: '客户', dataIndex: 'customerName', width: 180, render: nowrapText },
    { title: '业务员', width: 120, render: (_, row) => nowrapText(row.salesperson) },
    {
      title: '服务项目',
      width: 220,
      render: (_, row) => (
        <Space size={4} wrap>
          {(row.serviceItems ?? []).map((item) => (
            <Tag key={item} color="blue">{item}</Tag>
          ))}
        </Space>
      ),
    },
    { title: '货物', dataIndex: 'cargoName', width: 180, render: nowrapText },
    {
      title: '路线',
      width: 280,
      render: (_, row) => <span className="route-cell">{`${row.origin} -> ${row.destination}`}</span>,
    },
    { title: '重量/体积', width: 150, render: (_, row) => nowrapText(`${row.weightKg ?? '-'} kg / ${row.volumeCbm ?? '-'} m3`) },
    { title: '文件', width: 90, render: (_, row) => <Tag icon={<PaperClipOutlined />}>{row.cargoFiles?.length ?? 0}</Tag> },
    { title: '期望到达', width: 120, render: (_, row) => nowrapText(dateText(row.targetArrivalDate)) },
    { title: '询单时间', width: 180, render: (_, row) => nowrapText(formatBeijingTime(row.createdAt, true)) },
    {
      title: '操作',
      width: 260,
      fixed: 'right',
      render: (_, row) => (
        <Space>
          <Button type="link" onClick={() => openDetail(row)}>
            查看
          </Button>
          {canUploadQuote(row) ? (
            <Button type="link" icon={<UploadOutlined />} onClick={() => openQuoteModal(row)}>
              报价上传
            </Button>
          ) : null}
          <Button type="link" icon={<EditOutlined />} onClick={() => openInquiryDrawer(row)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该询单？" onConfirm={() => void deleteInquiry(row)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const planColumns: ColumnsType<TransportPlan> = [
    { title: '???', dataIndex: 'planNo' },
    { title: '???', dataIndex: 'inquiryNo' },
    { title: '??', dataIndex: 'customerName' },
    { title: '????', dataIndex: 'title' },
    { title: '??', render: (_, row) => `${row.transitDays} ?` },
    { title: '????', render: (_, row) => `${row.estimatedCost} ${row.currency}` },
    { title: '??', render: (_, row) => <Tag color="blue">{row.status}</Tag> },
  ];

  const quoteColumns: ColumnsType<TransportInquiry> = [
    {
      title: '???',
      dataIndex: 'inquiryNo',
      width: 180,
      render: (value, record) => (
        <Button type="link" className="table-link-cell" onClick={() => openDetail(record)}>
          {value}
        </Button>
      ),
    },
    { title: '瀹㈡埛', dataIndex: 'customerName', width: 180, render: nowrapText },
    { title: '???', width: 120, render: (_, row) => nowrapText(row.salesperson) },
    {
      title: '鎶ヤ环閲戦',
      width: 140,
      render: (_, row) => nowrapText(row.quoteAmount !== null && row.quoteAmount !== undefined ? `${row.quoteAmount} ${row.quoteCurrency || ''}` : '-'),
    },
    { title: '鎶ヤ环鏂囦欢', width: 100, render: (_, row) => <Tag icon={<PaperClipOutlined />}>{row.quoteFiles?.length ?? 0}</Tag> },
    { title: '鏂规闄勪欢', width: 100, render: (_, row) => <Tag icon={<PaperClipOutlined />}>{row.solutionFiles?.length ?? 0}</Tag> },
    { title: '??', width: 120, render: (_, row) => statusTag(row.status) },
    { title: '鎶ヤ环鏃堕棿', width: 180, render: (_, row) => nowrapText(row.quotedAt) },
    {
      title: '鎿嶄綔',
      width: 140,
      fixed: 'right',
      render: (_, row) =>
        canUploadQuote(row) ? (
          <Button type="link" icon={<UploadOutlined />} onClick={() => openQuoteModal(row)}>
            鎶ヤ环涓婁紶
          </Button>
        ) : (
          <Button type="link" onClick={() => openDetail(row)}>
            鏌ョ湅
          </Button>
        ),
    },
  ];

  const employeeColumns: ColumnsType<Employee> = [
    { title: '姓名', dataIndex: 'name' },
    { title: '部门', render: (_, row) => row.department || '-' },
    { title: '岗位', render: (_, row) => row.position || '-' },
    { title: '电话', render: (_, row) => row.phone || '-' },
    { title: '邮箱', render: (_, row) => row.email || '-' },
    {
      title: '业务员',
      render: (_, row) => (row.isSalesperson ? <Tag color="blue">是</Tag> : <Tag>否</Tag>),
    },
    { title: '角色', render: (_, row) => (row.roles?.length ? row.roles.map((role) => <Tag key={role.id}>{role.name}</Tag>) : '-') },
    {
      title: '状态',
      render: (_, row) => <Tag color={row.status === 'ACTIVE' ? 'green' : 'default'}>{row.status === 'ACTIVE' ? '启用' : '停用'}</Tag>,
    },
    {
      title: '操作',
      render: (_, row) => (
        <Button type="link" icon={<EditOutlined />} disabled={!can('base.manage')} onClick={() => openEmployeeModal(row)}>
          编辑
        </Button>
      ),
    },
    {
      title: '重置密码',
      width: 110,
      render: (_, row) => (
        <Button type="link" disabled={!can('employee.reset_password')} onClick={() => resetEmployeePassword(row)}>
          重置
        </Button>
      ),
    },
  ];

  const vehicleTypeColumns: ColumnsType<VehicleType> = [
    { title: '价格权重', dataIndex: 'priceWeight', width: 120, render: (_, row) => row.priceWeight ?? row.priceSort ?? '-' },
    { title: '序号', dataIndex: 'sequenceNo', width: 80 },
    { title: '分类', dataIndex: 'category', width: 140, render: (value) => <Tag color="blue">{value}</Tag> },
    { title: '车型名称', dataIndex: 'name', width: 180, render: nowrapText },
    { title: '线', dataIndex: 'lineCount', width: 80, render: (value) => value ?? '-' },
    { title: '轴', dataIndex: 'axleCount', width: 80, render: (value) => value ?? '-' },
    { title: '有效长度', dataIndex: 'effectiveLength', width: 120, render: (value) => value ?? '-' },
    { title: '有效宽度', dataIndex: 'effectiveWidth', width: 120, render: (value) => value ?? '-' },
    { title: '有效高度', dataIndex: 'effectiveHeight', width: 120, render: (value) => value ?? '-' },
    { title: '有效方数', dataIndex: 'effectiveVolume', width: 120, render: (value) => value ?? '-' },
    { title: '载重', dataIndex: 'payloadWeight', width: 120, render: (value) => value ?? '-' },
    { title: '适用场景', dataIndex: 'scenario', width: 260, render: nowrapText },
    {
      title: '操作',
      width: 100,
      fixed: 'right',
      render: (_, row) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => openVehicleTypeModal(row)}>
          编辑
        </Button>
      ),
    },
  ];

  const loadingRuleColumns: ColumnsType<LoadingRule> = [
    { title: '排序', dataIndex: 'sortOrder', width: 80 },
    { title: '规则名称', dataIndex: 'ruleName', width: 180, render: nowrapText },
    { title: '规则编码', dataIndex: 'ruleCode', width: 220, render: nowrapText },
    { title: '分类', dataIndex: 'category', width: 120, render: (value) => <Tag>{value}</Tag> },
    {
      title: '适用国家',
      dataIndex: 'applicableCountries',
      width: 220,
      render: (value: string[]) =>
        value?.length ? (
          <Space size={[4, 4]} wrap>
            {value.map((country) => (
              <Tag key={country} color="geekblue">
                {country}
              </Tag>
            ))}
          </Space>
        ) : (
          <Tag>通用</Tag>
        ),
    },
    { title: '类型', dataIndex: 'valueType', width: 90 },
    {
      title: '规则值',
      width: 140,
      render: (_, row) => `${row.ruleValue}${row.unit ? ` ${row.unit}` : ''}`,
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 90,
      render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? '启用' : '停用'}</Tag>,
    },
    { title: '说明', dataIndex: 'description', width: 320, render: nowrapText },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      render: (_, row) => (
        <Space size={4}>
          <Button type="link" icon={<EditOutlined />} onClick={() => openLoadingRuleModal(row)}>
            编辑
          </Button>
          <Popconfirm title="确认删除这条配载规则？" onConfirm={() => void deleteLoadingRule(row)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const vehicleCategoryOptions = ['篷布车', '冷藏车', '普通平板车', '超限车'].map((value) => ({
    value,
    label: value,
  }));

  const loadingRuleCategoryOptions = ['通用规则', '重量规则', '尺寸规则', '车型偏好', '批量规则', '成本规则', '国家规则'].map(
    (value) => ({ value, label: value }),
  );

  const countryOptions = ['哈萨克斯坦', '俄罗斯', '乌兹别克斯坦', '吉尔吉斯斯坦', '塔吉克斯坦', '土库曼斯坦'].map((value) => ({
    value,
    label: value,
  }));

  const cargoColumns: ColumnsType<CargoItem> = [
    { title: '箱子序号', dataIndex: 'boxNo', width: 120, fixed: 'left' },
    { title: '名称', dataIndex: 'name', width: 150, render: nowrapText },
    { title: '尺寸(mm)', width: 170, render: (_, row) => `${row.lengthCm} x ${row.widthCm} x ${row.heightCm}` },
    { title: '数量', dataIndex: 'quantity', width: 80 },
    { title: '单重(kg)', dataIndex: 'weightKg', width: 100 },
    { title: '总重(kg)', dataIndex: 'totalWeightKg', width: 110, render: (value) => Number(value).toFixed(2) },
    { title: '体积(m3)', dataIndex: 'volumeCbm', width: 110, render: (value) => Number(value).toFixed(3) },
    { title: '旋转', width: 80, render: (_, row) => (row.allowRotate ? <Tag color="blue">是</Tag> : <Tag>否</Tag>) },
    { title: '堆叠', width: 80, render: (_, row) => (row.allowStack ? <Tag color="green">是</Tag> : <Tag>否</Tag>) },
    { title: '备注', dataIndex: 'remark', width: 180, render: nowrapText },
    {
      title: '操作',
      width: 170,
      fixed: 'right',
      render: (_, row) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openCargoModal(row)}>
            编辑
          </Button>
          <Button type="link" icon={<CopyOutlined />} onClick={() => copyCargo(row)}>
            复制
          </Button>
          <Popconfirm title="确认删除该货物？" onConfirm={() => deleteCargo(row)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const savedLoadingPlanColumns: ColumnsType<LoadingPlanRecord> = [
    {
      title: '方案号',
      dataIndex: 'planNo',
      width: 170,
      render: (value, row) => (
        <Button type="link" style={{ padding: 0, whiteSpace: 'normal', height: 'auto', textAlign: 'left' }} onClick={() => setSelectedLoadingPlanRecord(row)}>
          {value}
        </Button>
      ),
    },
    { title: '标题', dataIndex: 'title', width: 220, render: nowrapText },
    { title: '车辆数', width: 90, render: (_, row) => row.planResult?.summary?.vehicleCount ?? '-' },
    { title: '已配件数', width: 100, render: (_, row) => row.planResult?.summary?.assignedQuantity ?? '-' },
    { title: '状态', dataIndex: 'status', width: 90, render: (value) => <Tag color="green">{value}</Tag> },
    { title: '保存时间', dataIndex: 'createdAt', width: 180, render: (value) => nowrapText(formatBeijingTime(value, true)) },
    {
      title: '文件',
      width: 150,
      render: (_, row) => (
        <Space size={0}>
          {row.planFile?.fileUrl ? (
            <Button type="link" icon={<PaperClipOutlined />} onClick={() => downloadUploadedFile(row.planFile)}>
              上传文件
            </Button>
          ) : null}
          <Button type="link" icon={<DownloadOutlined />} onClick={() => downloadLoadingPlanFile(row.planResult)}>
            配载数据
          </Button>
        </Space>
      ),
    },
  ];

  const sectionTitle: Record<SectionKey, string> = {
    plans: '报价管理',
    home: '首页',
    finance: '财务管理',
    customers: '客户管理',
    suppliers: '供应商管理',
    inquiries: '询单管理',
    loading: '配货配载',
    marketInfo: '市场信息',
    oversizeProjects: '项目管理',
    oversizeTasks: '运输任务',
    tracking: '轨迹跟踪',
    driverCheckpoints: '司机打卡',
    workflowTemplates: '流程模板',
    workflowTodos: '我的待办',
    baseInfo: '基础信息',
    permissions: '权限管理',
  };

  const menuPermission: Partial<Record<SectionKey, string>> = {
    home: 'home.view',
    workflowTodos: 'todo.view',
    tracking: 'tracking.view',
    driverCheckpoints: 'tracking.view',
    marketInfo: 'market.view',
    inquiries: 'inquiry.view',
    loading: 'loading.view',
    oversizeProjects: 'project.view',
    oversizeTasks: 'task.view',
    finance: 'finance.view',
    suppliers: 'supplier.view',
    customers: 'customer.view',
    baseInfo: 'base.view',
    workflowTemplates: 'workflow.view',
    permissions: 'rbac.view',
  };

  const sidebarItems = [
    { key: 'home', icon: <FundOutlined />, label: '首页' },
    { key: 'workflowTodos', icon: <FileTextOutlined />, label: '我的待办' },
    { key: 'tracking', icon: <PaperClipOutlined />, label: '轨迹跟踪' },
    { key: 'driverCheckpoints', icon: <CarOutlined />, label: '司机打卡' },
    { key: 'marketInfo', icon: <FundOutlined />, label: '市场信息' },
    { key: 'inquiries', icon: <FileTextOutlined />, label: '询单管理' },
    { key: 'loading', icon: <CarOutlined />, label: '配货配载' },
    { key: 'oversizeProjects', icon: <RocketOutlined />, label: '项目管理' },
    { key: 'oversizeTasks', icon: <CheckCircleOutlined />, label: '运输任务' },
    { key: 'finance', icon: <DollarCircleOutlined />, label: '财务管理' },
    { key: 'suppliers', icon: <CarOutlined />, label: '供应商管理' },
    { key: 'customers', icon: <TeamOutlined />, label: '客户管理' },
    { key: 'baseInfo', icon: <SettingOutlined />, label: '基础信息' },
    { key: 'workflowTemplates', icon: <SettingOutlined />, label: '流程模板' },
    { key: 'permissions', icon: <SettingOutlined />, label: '权限管理' },
  ].filter((item) => can(menuPermission[item.key as SectionKey] ?? 'home.view'));

  useEffect(() => {
    if (sessionUser && sidebarItems.length && !sidebarItems.some((item) => item.key === activeSection)) {
      setActiveSection(sidebarItems[0].key as SectionKey);
    }
  }, [sessionUser?.permissions?.join(','), activeSection]);

  if (!sessionUser) {
    return (
      <div className="login-shell">
        <Card className="login-panel" bordered={false}>
          <Space direction="vertical" size={22} style={{ width: '100%' }}>
            <div className="brand-lockup">
              <div className="brand-mark brand-logo-mark">
                <img src="/ost-logo.jpg" alt="欧速通" />
              </div>
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  中亚运输管理系统
                </Title>
                <Text type="secondary">Central Asia Transport OS</Text>
              </div>
            </div>
            <Form
              form={loginForm}
              layout="vertical"
              initialValues={{ email: '38128151@qq.com', password: 'Admin123!' }}
              onFinish={(values) => void login(values)}
            >
              <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
                <Input size="large" />
              </Form.Item>
              <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password size="large" />
              </Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={loginLoading}>
                登录
              </Button>
            </Form>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <Layout className="crm-shell">
      <Sider
        width={250}
        collapsedWidth={88}
        collapsible
        collapsed={siderCollapsed}
        trigger={null}
        className={`crm-sider ${siderCollapsed ? 'crm-sider-collapsed' : ''}`}
      >
        <div className="sidebar-brand-row">
          <div className="brand-lockup brand-lockup-sidebar">
            <div className="brand-mark brand-logo-mark">
              <img src="/ost-logo.jpg" alt="欧速通" />
            </div>
            {!siderCollapsed && (
              <div className="brand-text">
                <Title level={4} style={{ margin: 0 }}>
                  中亚 TMS
                </Title>
                <Text type="secondary">Transport OS</Text>
              </div>
            )}
          </div>
          <Button
            className="sider-collapse-btn"
            type="text"
            icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setSiderCollapsed((value) => !value)}
          />
        </div>
        {!siderCollapsed && <div className="sidebar-note">做一个高效、稳定、有温度的哈萨克斯坦车队运营公司</div>}
        <Menu
          mode="inline"
          selectedKeys={[activeSection]}
          inlineCollapsed={siderCollapsed}
          onClick={(event) => setActiveSection(event.key as SectionKey)}
          items={sidebarItems}
        />
        <div className="sidebar-user">
          <Space>
            <Avatar icon={<TeamOutlined />} />
            {!siderCollapsed && (
              <div>
                <Text strong>{sessionUser.realName}</Text>
                <div className="sidebar-user-role">{sessionUser.roleName}</div>
              </div>
            )}
          </Space>
          {!siderCollapsed && (
            <Button onClick={logout} block>
              退出登录
            </Button>
          )}
        </div>
      </Sider>

      <Layout>
        <Header className="crm-header">
          <div>
            <Text className="eyebrow">Central Asia Transport</Text>
            <Title level={2} style={{ margin: 0 }}>
              {sectionTitle[activeSection]}
            </Title>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => void loadData()} loading={loading}>
              刷新
            </Button>
            {activeSection === 'baseInfo' && can('base.manage') ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openVehicleTypeModal()}>
                新增车型
              </Button>
            ) : activeSection === 'loading' ? (
              <>
                <Button icon={<FileTextOutlined />} onClick={() => setActiveLoadingStep('saved')}>
                  查看配载方案
                </Button>
                {can('loading.manage') ? (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openCargoModal()}>
                    新增货物
                  </Button>
                ) : null}
              </>
            ) : (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openInquiryDrawer()}
                style={{
                  display:
                    activeSection === 'home' ||
                    activeSection === 'customers' ||
                    activeSection === 'finance' ||
                    activeSection === 'suppliers' ||
                    activeSection === 'marketInfo' ||
                    activeSection === 'driverCheckpoints' ||
                    activeSection === 'oversizeProjects' ||
                    activeSection === 'oversizeTasks' ||
                    activeSection === 'tracking' ||
                    activeSection === 'workflowTemplates' ||
                    activeSection === 'workflowTodos' ||
                    activeSection === 'permissions' ||
                    !can('inquiry.create')
                      ? 'none'
                      : undefined,
                }}
              >
                新建询单
              </Button>
            )}
          </Space>
        </Header>

        <Content className="crm-content">
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            {activeSection !== 'loading' &&
            activeSection !== 'home' &&
            activeSection !== 'oversizeProjects' &&
            activeSection !== 'oversizeTasks' &&
            activeSection !== 'tracking' &&
            activeSection !== 'marketInfo' &&
            activeSection !== 'driverCheckpoints' &&
            activeSection !== 'workflowTemplates' &&
            activeSection !== 'workflowTodos' &&
            activeSection !== 'permissions' &&
            activeSection !== 'finance' ? (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} xl={6}>
                  <Card className="metric-card">
                    <Statistic title="询单总数" value={stats.inquiryCount} prefix={<FileTextOutlined />} />
                  </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                  <Card className="metric-card">
                    <Statistic title="待报价" value={stats.waiting} />
                  </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                  <Card className="metric-card">
                    <Statistic title="已报价" value={stats.ready} prefix={<CheckCircleOutlined />} />
                  </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                  <Card className="metric-card">
                    <Statistic title="方案数" value={stats.planCount} prefix={<RocketOutlined />} />
                  </Card>
                </Col>
              </Row>
            ) : null}

            {activeSection === 'home' ? (
              <DashboardPage />
            ) : activeSection === 'inquiries' ? (
              <Card className="glass-card" title="询单列表" bordered={false}>
                <Table
                  rowKey="id"
                  loading={loading}
                  dataSource={inquiries}
                  columns={inquiryColumns}
                  scroll={{ x: 1500 }}
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            ) : activeSection === 'plans' ? (
              <Card className="glass-card" title="报价记录" bordered={false}>
                <Table
                  rowKey="id"
                  loading={loading}
                  dataSource={inquiries}
                  columns={quoteColumns}
                  scroll={{ x: 1180 }}
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            ) : activeSection === 'loading' ? (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card className="glass-card" bordered={false}>
                  <Steps
                    type="navigation"
                    size="small"
                    current={activeLoadingStep === 'cargo' ? 0 : activeLoadingStep === 'result' ? 1 : 2}
                    items={[
                      { title: '第一步：录入货物数据' },
                      { title: '第二步：配载结果调整' },
                      { title: '第三步：保存与导出方案' },
                    ]}
                    onChange={(index) => {
                      if (index === 1 && !loadingPlan) {
                        message.warning('请先完成自动配载');
                        return;
                      }
                      if (index === 2 && !loadingPlanSaved) {
                        message.warning('请先在第二步保存方案');
                        return;
                      }
                      setActiveLoadingStep(index === 0 ? 'cargo' : index === 1 ? 'result' : 'saved');
                    }}
                  />
                </Card>
                {activeLoadingStep === 'cargo' ? (
                <Card
                  className="glass-card"
                  title="第一步：货物信息"
                  bordered={false}
                  extra={
                    <Space>
                      <Button icon={<DownloadOutlined />} onClick={downloadCargoTemplate}>
                        下载模板
                      </Button>
                      <Upload
                        accept=".xlsx,.xls,.csv"
                        showUploadList={false}
                        beforeUpload={(file) => importCargoFile(file)}
                      >
                        <Button icon={<FileExcelOutlined />}>批量导入</Button>
                      </Upload>
                      <Button icon={<CarOutlined />} onClick={runLoadingPlan}>
                        自动配载
                      </Button>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openCargoModal()}>
                        新增货物
                      </Button>
                    </Space>
                  }
                >
                  <Row gutter={12} style={{ marginBottom: 12 }}>
                    <Col xs={24} md={8}>
                      <Text type="secondary">途经/目的国家</Text>
                      <Select
                        mode="multiple"
                        value={loadingDestinationCountries}
                        onChange={(value) => {
                          setLoadingDestinationCountries(value);
                          setLoadingPlan(null);
                          setLoadingPlanSaved(false);
                        }}
                        placeholder="请选择途经或目的国家"
                        style={{ width: '100%', marginTop: 6 }}
                        options={countryOptions}
                      />
                    </Col>
                  </Row>
                  <Table
                    rowKey="id"
                    dataSource={cargoItems}
                    columns={cargoColumns}
                    scroll={{ x: 1520 }}
                    pagination={{ pageSize: 8 }}
                    locale={{ emptyText: <Empty description="请新增或导入货物信息" /> }}
                  />
                </Card>
                ) : null}

                {activeLoadingStep === 'result' ? (
                <Card
                  className="glass-card"
                  title="第二步：配载结果调整"
                  bordered={false}
                  extra={
                    <Space>
                      <Button
                        disabled={!loadingPlan}
                        icon={<RocketOutlined />}
                        onClick={() => {
                          setAiOptimizeOpen(true);
                          setAiAnswer('');
                          setAiQuestion('');
                        }}
                      >
                        AI优化
                      </Button>
                      <Button disabled={!loadingPlan} icon={<DownloadOutlined />} onClick={() => loadingPlan && downloadLoadingPlanFile(loadingPlan)}>
                        下载
                      </Button>
                      <Upload
                        accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png"
                        beforeUpload={() => false}
                        maxCount={1}
                        fileList={loadingPlanUploadFiles}
                        onChange={({ fileList }) => setLoadingPlanUploadFiles(fileList.slice(-1))}
                      >
                        <Button disabled={!loadingPlan} icon={<UploadOutlined />}>
                          上传方案文件
                        </Button>
                      </Upload>
                      <Button type="primary" disabled={!loadingPlan} loading={savingLoadingPlan} icon={<SaveOutlined />} onClick={saveLoadingPlan}>
                        保存方案</Button>
                    </Space>
                  }
                >
                  {loadingPlan ? (
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      <Row gutter={[12, 12]}>
                        <Col xs={24} md={5}>
                          <Statistic title="已配/总件数" value={`${loadingPlan.summary.assignedQuantity}/${loadingPlan.summary.totalCargoQuantity}`} />
                        </Col>
                        <Col xs={24} md={4}>
                          <Statistic title="车辆数" value={loadingPlan.summary.vehicleCount} />
                        </Col>
                        <Col xs={24} md={5}>
                          <Statistic title="已配重量 kg" value={loadingPlan.summary.assignedWeightKg.toFixed(2)} />
                        </Col>
                        <Col xs={24} md={5}>
                          <Statistic title="已配方数 m3" value={loadingPlan.summary.assignedVolumeCbm.toFixed(3)} />
                        </Col>
                        <Col xs={24} md={5}>
                          <Statistic title="总价格权重" value={loadingPlanPriceWeightTotal(loadingPlan)} />
                        </Col>
                      </Row>
                      <Space size={[8, 8]} wrap>
                        <Text type="secondary">车型车辆数：</Text>
                        {loadingPlanVehicleTypeSummary(loadingPlan).map((item) => (
                          <Tag key={item.name} color="blue">
                            {item.name} × {item.count}（权重 {item.weight}）
                          </Tag>
                        ))}
                      </Space>
                      {loadingPlan.vehicles.map((vehicle, vehicleIndex) => (
                        <Card
                          key={vehicle.vehicle.id}
                          size="small"
                          title={loadingVehicleTitle(vehicle)}
                          extra={
                            <Space>
                              <Text type="secondary">调整车型</Text>
                              <Select
                                value={vehicle.vehicle.id}
                                options={vehicleTypes.map((item) => ({ value: item.id, label: `${item.category} / ${item.name}` }))}
                                onChange={(value) => changeLoadingVehicleType(vehicle.vehicle.id, value)}
                                style={{ width: 260 }}
                              />
                            </Space>
                          }
                        >
                          <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                            <Col xs={24} md={8}>
                              <Text type="secondary">重量利用率</Text>
                              <Progress percent={Math.min(vehicle.weightUtilization, 100)} status={vehicle.weightUtilization > 100 ? 'exception' : 'normal'} />
                            </Col>
                            <Col xs={24} md={8}>
                              <Text type="secondary">方数利用率</Text>
                              <Progress percent={Math.min(vehicle.volumeUtilization, 100)} status={vehicle.volumeUtilization > 100 ? 'exception' : 'normal'} />
                            </Col>
                            <Col xs={24} md={8}>
                              <Text type="secondary">最长货物</Text>
                              <div>{vehicle.maxLengthCm} mm</div>
                            </Col>
                          </Row>
                          <Table
                            rowKey="id"
                            size="small"
                            dataSource={vehicle.assignments}
                            pagination={false}
                            columns={[
                              { title: '箱子序号', dataIndex: 'boxNo' },
                              { title: '货物', dataIndex: 'cargoName' },
                              {
                                title: '移动车次',
                                width: 220,
                                render: (_, assignment) => (
                                  <Select
                                    value={vehicleIndex}
                                    options={loadingPlan.vehicles.map((item, index) => ({
                                      value: index,
                                      label: `第 ${index + 1} 车 ${item.vehicle.category} / ${item.vehicle.name}`,
                                    }))}
                                    onChange={(value) => moveAssignmentToVehicle(assignment, value)}
                                    style={{ width: '100%' }}
                                  />
                                ),
                              },
                              {
                                title: '数量',
                                width: 110,
                                render: (_, assignment) => (
                                  <InputNumber min={1} value={assignment.quantity} onChange={(value) => updateAssignmentQuantity(assignment, Number(value || 1))} />
                                ),
                              },
                              { title: '重量 kg', dataIndex: 'weightKg', render: (value) => Number(value).toFixed(2) },
                              { title: '方数 m3', dataIndex: 'volumeCbm', render: (value) => Number(value).toFixed(3) },
                              { title: '提醒', render: (_, assignment) => assignment.notes.length ? assignment.notes.map((item) => <Tag key={item}>{item}</Tag>) : '-' },
                            ]}
                          />
                          {vehicle.warnings.length ? <Alert type="warning" showIcon style={{ marginTop: 12 }} message={vehicle.warnings.join('?')} /> : null}
                        </Card>
                      ))}
                      {loadingPlan.unassigned.length ? (
                        <Alert
                          type="error"
                          showIcon
                          message="存在无法配载货物"
                          description={loadingPlan.unassigned.map((item) => `${item.cargo.boxNo} ${item.cargo.name} x ${item.quantity}：${item.reasons.join('、')}`).join('\n')}
                        />
                      ) : null}
                    </Space>
                  ) : (
                    <Empty description="点击自动配载后展示方案" />
                  )}
                </Card>
                ) : null}

                {activeLoadingStep === 'saved' ? (
                <Card className="glass-card" title="第三步：已保存配载方案" bordered={false}>
                  <Table
                    rowKey="id"
                    loading={loading}
                    dataSource={loadingPlans}
                    columns={savedLoadingPlanColumns}
                    scroll={{ x: 900 }}
                    pagination={{ pageSize: 5 }}
                  />
                </Card>
                ) : null}
              </Space>
            ) : activeSection === 'oversizeProjects' ? (
              <OversizeProjectManagementPage customers={customers} />
            ) : activeSection === 'oversizeTasks' ? (
              <OversizeTaskManagementPage openRequest={taskOpenRequest} />
            ) : activeSection === 'tracking' ? (
              <TrackingPage />
            ) : activeSection === 'driverCheckpoints' ? (
              <Card
                className="glass-card"
                title="司机打卡照片"
                bordered={false}
                extra={<Text type="secondary">Telegram Mini App 上传的定位防伪照片</Text>}
              >
                <Table
                  rowKey="id"
                  loading={loading}
                  dataSource={driverCheckpoints}
                  columns={driverCheckpointColumns}
                  scroll={{ x: 1400 }}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: <Empty description="暂无司机打卡照片" /> }}
                />
              </Card>
            ) : activeSection === 'marketInfo' ? (
              <Card
                className="glass-card"
                title="市场信息"
                bordered={false}
                extra={<Text type="secondary">Chrome 插件定时采集 WhatsApp 群报价后同步到这里</Text>}
              >
                <Table
                  rowKey="id"
                  loading={loading}
                  dataSource={marketInfos}
                  columns={marketInfoColumns}
                  scroll={{ x: 1360 }}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: <Empty description="暂无市场信息" /> }}
                />
              </Card>
            ) : activeSection === 'workflowTemplates' ? (
              <WorkflowTemplatePage />
            ) : activeSection === 'workflowTodos' ? (
              <WorkflowTodoPage
                onOpenTask={(todo) => {
                  if (!todo.taskId) return;
                  setTaskOpenRequest({ taskId: todo.taskId, nodeId: todo.instanceNodeId, requestId: Date.now() });
                  setActiveSection('oversizeTasks');
                }}
              />
            ) : activeSection === 'permissions' ? (
              <PermissionManagementPage />
            ) : activeSection === 'finance' ? (
              <FinancePage />
            ) : activeSection === 'customers' ? (
              <CustomerManagementPage customers={customers as ManagedCustomer[]} loading={loading} onReload={loadData} />
            ) : activeSection === 'suppliers' ? (
              <SupplierManagementPage />
            ) : (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card
                  className="glass-card"
                  title="车型配置"
                  bordered={false}
                  extra={
                    can('base.manage') ? (
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openVehicleTypeModal()}>
                        新增车型
                      </Button>
                    ) : null
                  }
                >
                  <Table
                    rowKey="id"
                    loading={loading}
                    dataSource={vehicleTypes}
                    columns={vehicleTypeColumns}
                    scroll={{ x: 1280 }}
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
                <Card
                  className="glass-card"
                  title="配载规则"
                  bordered={false}
                  extra={
                    can('base.manage') ? (
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openLoadingRuleModal()}>
                        新增规则
                      </Button>
                    ) : null
                  }
                >
                  <Table
                    rowKey="id"
                    loading={loading}
                    dataSource={loadingRuleConfigs}
                    columns={loadingRuleColumns}
                    scroll={{ x: 1220 }}
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
                <Card
                  className="glass-card"
                  title="配载 AI 优化配置"
                  bordered={false}
                  extra={
                    can('base.manage') ? (
                      <Button type="primary" icon={<EditOutlined />} onClick={openLoadingAiConfigModal}>
                        编辑配置
                      </Button>
                    ) : null
                  }
                >
                  <Descriptions column={{ xs: 1, md: 2, xl: 3 }} size="small" bordered>
                    <Descriptions.Item label="启用状态">
                      <Tag color={loadingAiConfig?.enabled ? 'green' : 'default'}>{loadingAiConfig?.enabled ? '启用' : '停用'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="服务商">{loadingAiConfig?.provider ?? 'openai'}</Descriptions.Item>
                    <Descriptions.Item label="模型">{loadingAiConfig?.model ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="API 地址">{loadingAiConfig?.apiBaseUrl ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="API Key">
                      {loadingAiConfig?.hasApiKey ? (
                        <Tag color="blue">{loadingAiConfig.apiKeyMasked || '已配置'}</Tag>
                      ) : (
                        <Tag color="red">未配置</Tag>
                      )}
                      {loadingAiConfig?.keySource ? <Text type="secondary"> {loadingAiConfig.keySource}</Text> : null}
                    </Descriptions.Item>
                    <Descriptions.Item label="输出限制">{loadingAiConfig?.maxOutputTokens ?? 2000}</Descriptions.Item>
                    <Descriptions.Item label="温度">{loadingAiConfig?.temperature ?? 0.2}</Descriptions.Item>
                    <Descriptions.Item label="备注" span={3}>{loadingAiConfig?.notes || '-'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Space>
            )}
          </Space>
        </Content>
      </Layout>

      <Modal
        title={selectedLoadingPlanRecord ? `配载方案详情 ${selectedLoadingPlanRecord.planNo}` : '配载方案详情'}
        open={Boolean(selectedLoadingPlanRecord)}
        onCancel={() => setSelectedLoadingPlanRecord(null)}
        footer={
          selectedLoadingPlanRecord ? (
            <Space>
              {selectedLoadingPlanRecord.planFile?.fileUrl ? (
                <Button icon={<PaperClipOutlined />} onClick={() => downloadUploadedFile(selectedLoadingPlanRecord.planFile)}>
                  下载上传文件
                </Button>
              ) : null}
              <Button icon={<DownloadOutlined />} onClick={() => downloadLoadingPlanFile(selectedLoadingPlanRecord.planResult)}>
                下载配载数据
              </Button>
            </Space>
          ) : null
        }
        width={1080}
      >
        {selectedLoadingPlanRecord ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered size="small" column={3}>
              <Descriptions.Item label="方案号">{selectedLoadingPlanRecord.planNo}</Descriptions.Item>
              <Descriptions.Item label="标题">{selectedLoadingPlanRecord.title}</Descriptions.Item>
              <Descriptions.Item label="状态">{selectedLoadingPlanRecord.status}</Descriptions.Item>
              <Descriptions.Item label="车辆数">{selectedLoadingPlanRecord.planResult?.summary?.vehicleCount ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="已配件数">{selectedLoadingPlanRecord.planResult?.summary?.assignedQuantity ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="保存时间">{formatBeijingTime(selectedLoadingPlanRecord.createdAt, true)}</Descriptions.Item>
              <Descriptions.Item label="已配重量 kg">{selectedLoadingPlanRecord.planResult?.summary?.assignedWeightKg?.toFixed?.(2) ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="已配方数 m3">{selectedLoadingPlanRecord.planResult?.summary?.assignedVolumeCbm?.toFixed?.(3) ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="货物总数">{selectedLoadingPlanRecord.planResult?.summary?.totalCargoQuantity ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="总价格权重">{selectedLoadingPlanRecord.planResult ? loadingPlanPriceWeightTotal(selectedLoadingPlanRecord.planResult) : '-'}</Descriptions.Item>
              <Descriptions.Item label="上传文件" span={2}>
                {selectedLoadingPlanRecord.planFile?.fileName ? (
                  <Button type="link" icon={<PaperClipOutlined />} onClick={() => downloadUploadedFile(selectedLoadingPlanRecord.planFile)}>
                    {selectedLoadingPlanRecord.planFile.fileName}
                  </Button>
                ) : (
                  '未上传，可下载系统生成的配载数据'
                )}
              </Descriptions.Item>
            </Descriptions>
            {selectedLoadingPlanRecord.planResult?.vehicles?.map((vehicle, index) => (
              <Card
                key={`${vehicle.vehicle.id}-${index}`}
                size="small"
                title={`第 ${index + 1} 车：${loadingVehicleTitle(vehicle)}`}
              >
                <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                  <Col xs={24} md={6}>
                    <Statistic title="装载方式" value={vehicle.loadingMethod || '自动配载'} />
                  </Col>
                  <Col xs={24} md={6}>
                    <Statistic title="重量 kg" value={vehicle.usedWeightKg.toFixed(2)} />
                  </Col>
                  <Col xs={24} md={6}>
                    <Statistic title="方数 m3" value={vehicle.usedVolumeCbm.toFixed(3)} />
                  </Col>
                  <Col xs={24} md={6}>
                    <Statistic title="最大长度 mm" value={vehicle.maxLengthCm} />
                  </Col>
                </Row>
                <Table
                  rowKey="id"
                  size="small"
                  pagination={false}
                  dataSource={vehicle.assignments}
                  columns={[
                    { title: '箱子序号', dataIndex: 'boxNo', width: 140 },
                    { title: '货物', dataIndex: 'cargoName', width: 180 },
                    { title: '数量', dataIndex: 'quantity', width: 90 },
                    { title: '重量 kg', dataIndex: 'weightKg', width: 120, render: (value) => Number(value).toFixed(2) },
                    { title: '方数 m3', dataIndex: 'volumeCbm', width: 120, render: (value) => Number(value).toFixed(3) },
                    { title: '提醒', render: (_, assignment) => (assignment.notes?.length ? assignment.notes.map((item) => <Tag key={item}>{item}</Tag>) : '-') },
                  ]}
                />
                {vehicle.warnings?.length ? <Alert type="warning" showIcon style={{ marginTop: 12 }} message={vehicle.warnings.join('；')} /> : null}
              </Card>
            ))}
          </Space>
        ) : null}
      </Modal>

      <Modal
        title="AI配载优化"
        open={aiOptimizeOpen}
        onCancel={() => setAiOptimizeOpen(false)}
        width={860}
        footer={[
          <Button key="close" onClick={() => setAiOptimizeOpen(false)}>
            关闭
          </Button>,
          <Button key="run" type="primary" icon={<RocketOutlined />} loading={aiOptimizeLoading} onClick={runAiLoadingPlanOptimize}>
            开始分析
          </Button>,
        ]}
      >
        <Space direction="vertical" size={14} style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message="用于同事手工调整与系统方案不一致时，AI通过问答分析原因，并沉淀后续算法规则。"
            description="请把同事调整后的车次、车型、货物序号、原因或疑问写在下面。AI会结合当前系统方案、货物和车型数据进行分析。"
          />
          <Form layout="vertical">
            <Form.Item label="同事手工方案 / 调整原因">
              <TextArea
                rows={6}
                value={aiManualPlanText}
                onChange={(event) => setAiManualPlanText(event.target.value)}
                placeholder="例如：第1车 2,21,5,6,22,23,7 配17米6轴平板；原因：减少总车数，平板可办超宽证，总重不超31吨..."
              />
            </Form.Item>
            <Form.Item label="继续追问 / 补充说明">
              <TextArea
                rows={3}
                value={aiQuestion}
                onChange={(event) => setAiQuestion(event.target.value)}
                placeholder="例如：为什么这几件可以放一车？篷布和17米6轴平板应该如何按总成本比较？"
              />
            </Form.Item>
          </Form>
          {aiAnswer ? (
            <Card size="small" title="AI分析结果">
              <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{aiAnswer}</Paragraph>
            </Card>
          ) : (
            <Empty description="填写手工方案后点击开始分析" />
          )}
        </Space>
      </Modal>

      <Drawer
        title={editingInquiry ? `编辑询单 ${editingInquiry.inquiryNo}` : '新增询单'}
        width={620}
        open={inquiryDrawerOpen}
        onClose={() => {
          setInquiryDrawerOpen(false);
          setEditingInquiry(null);
        }}
        destroyOnHidden
      >
        <Form
          form={inquiryForm}
          layout="vertical"
          initialValues={{ cargoType: '普货', customsMode: '一般贸易', temperatureRequirement: '常温' }}
          onFinish={(values) => void saveInquiry(values)}
        >
          <Form.Item name="customerId" label="客户">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={customers.map((item) => ({ value: item.id, label: item.shortName || item.name }))}
            />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}>
            <Input placeholder="可直接填写临时客户" />
          </Form.Item>
          <Form.Item name="salesperson" label="业务员">
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              placeholder="选择负责该询单的业务员"
              options={salespeople.map((item) => ({ value: item.name, label: item.name }))}
            />
          </Form.Item>
          <Form.Item
            name="serviceItems"
            label="服务项目"
            rules={[{ required: true, message: '请至少选择一个服务项目' }]}
          >
            <Select
              mode="multiple"
              allowClear
              options={serviceItemOptions}
              placeholder="可多选，例如：国际运输、报关、清关"
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="contactName" label="联系人">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPhone" label="联系电话">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="cargoName" label="货物名称" rules={[{ required: true, message: '请输入货物名称' }]}>
            <Input placeholder="如：机械设备、鲜花、跨境电商包裹" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="origin" label="起运地" rules={[{ required: true, message: '请输入起运地' }]}>
                <Input placeholder="中国 上海" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="destination" label="目的地" rules={[{ required: true, message: '请输入目的地' }]}>
                <Input placeholder="哈萨克斯坦 阿拉木图" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="weightKg" label="重量 kg">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="volumeCbm" label="体积 m3">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="packageCount" label="件数">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="readyDate" label="备货日期">
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="targetArrivalDate" label="期望到达">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="cargoType" label="货物类型">
                <Select options={['普货', '重货', '泡货', '危险品', '冷链货物'].map((value) => ({ value, label: value }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="customsMode" label="报关方式">
                <Select options={['一般贸易', '转关', '清关派送', '客户自理'].map((value) => ({ value, label: value }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="temperatureRequirement" label="温控要求">
                <Select options={['常温', '冷藏', '冷冻', '恒温'].map((value) => ({ value, label: value }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="specialRequirement" label="特殊要求">
            <TextArea rows={4} placeholder="时效、口岸偏好、装卸限制、保险、目的国清关要求等" />
          </Form.Item>
          <Form.Item
            name="cargoUploadFiles"
            label={editingInquiry ? '追加客户货物文件' : '客户货物文件'}
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList ?? []}
            extra="支持上传客户原始询价单、货物清单、装箱资料、图片、PDF、Excel、Word 等文件。"
          >
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          {editingInquiry?.cargoFiles?.length ? (
            <List
              size="small"
              header="已有客户货物文件"
              dataSource={editingInquiry.cargoFiles}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.fileName} description={fileSizeText(item.fileSize)} />
                </List.Item>
              )}
            />
          ) : null}
          <Button type="primary" htmlType="submit" block>
            {editingInquiry ? '保存修改' : '保存询单'}
          </Button>
        </Form>
      </Drawer>

      <Drawer
        title={selectedInquiry ? `询单详情 ${selectedInquiry.inquiryNo}` : '询单详情'}
        width={760}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        destroyOnHidden
      >
        {selectedInquiry ? (
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="客户">{selectedInquiry.customerName}</Descriptions.Item>
              <Descriptions.Item label="状态">{statusTag(selectedInquiry.status)}</Descriptions.Item>
              <Descriptions.Item label="业务员">{selectedInquiry.salesperson || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系人">{selectedInquiry.contactName || '-'}</Descriptions.Item>
              <Descriptions.Item label="服务项目" span={2}>
                <Space size={4} wrap>
                  {(selectedInquiry.serviceItems ?? []).map((item) => (
                    <Tag key={item} color="blue">{item}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="货物">{selectedInquiry.cargoName}</Descriptions.Item>
              <Descriptions.Item label="类型">{selectedInquiry.cargoType || '-'}</Descriptions.Item>
              <Descriptions.Item label="起运地">{selectedInquiry.origin}</Descriptions.Item>
              <Descriptions.Item label="目的地">{selectedInquiry.destination}</Descriptions.Item>
              <Descriptions.Item label="重量">{selectedInquiry.weightKg ?? '-'} kg</Descriptions.Item>
              <Descriptions.Item label="体积">{selectedInquiry.volumeCbm ?? '-'} m3</Descriptions.Item>
              <Descriptions.Item label="报关方式">{selectedInquiry.customsMode || '-'}</Descriptions.Item>
              <Descriptions.Item label="温控要求">{selectedInquiry.temperatureRequirement || '-'}</Descriptions.Item>
              <Descriptions.Item label="特殊要求" span={2}>
                {selectedInquiry.specialRequirement || '-'}
              </Descriptions.Item>
            </Descriptions>
            <Card className="glass-card" title="客户货物文件" bordered={false}>
              {selectedInquiry.cargoFiles?.length ? (
                <List
                  dataSource={selectedInquiry.cargoFiles}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          key="open"
                          type="link"
                          icon={<DownloadOutlined />}
                          href={fileUrl(item.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          打开
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<PaperClipOutlined />}
                        title={item.fileName}
                        description={`${item.fileType || '未知类型'} - ${fileSizeText(item.fileSize)}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无客户货物文件" />
              )}
            </Card>
            {canUploadQuote(selectedInquiry) ? (
              <Button type="primary" icon={<UploadOutlined />} onClick={() => openQuoteModal(selectedInquiry)}>
                报价上传
              </Button>
            ) : null}
            {selectedInquiry.status === 'QUOTED' ? (
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="报价状态">{statusTag(selectedInquiry.status)}</Descriptions.Item>
                <Descriptions.Item label="报价时间">{formatBeijingTime(selectedInquiry.quotedAt, true)}</Descriptions.Item>
                <Descriptions.Item label="报价金额">
                  {selectedInquiry.quoteAmount ?? '-'} {selectedInquiry.quoteCurrency || ''}
                </Descriptions.Item>
                <Descriptions.Item label="报价说明">{selectedInquiry.quoteRemark || '-'}</Descriptions.Item>
              </Descriptions>
            ) : null}
            <Card className="glass-card" title="报价文件" bordered={false}>
              {selectedInquiry.quoteFiles?.length ? (
                <List
                  dataSource={selectedInquiry.quoteFiles}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button key="open" type="link" href={fileUrl(item.fileUrl)} target="_blank" rel="noreferrer">
                          打开
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta avatar={<PaperClipOutlined />} title={item.fileName} description={fileSizeText(item.fileSize)} />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无报价文件" />
              )}
            </Card>
            <Card className="glass-card" title="运载方案文件" bordered={false}>
              {selectedInquiry.solutionFiles?.length ? (
                <List
                  dataSource={selectedInquiry.solutionFiles}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button key="open" type="link" href={fileUrl(item.fileUrl)} target="_blank" rel="noreferrer">
                          打开
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta avatar={<PaperClipOutlined />} title={item.fileName} description={fileSizeText(item.fileSize)} />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无运载方案文件" />
              )}
            </Card>
            <Card className="glass-card" title="已生成方案" bordered={false}>
              {selectedInquiry.plans?.length ? (
                <List
                  dataSource={selectedInquiry.plans}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${item.planNo} · ${item.title}`}
                        description={
                          <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                            {item.route}
                            {'\n'}
                            {item.transitDays} 天 · {item.estimatedCost} {item.currency}
                            {'\n'}
                            {item.planText}
                          </Paragraph>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无方案" />
              )}
            </Card>
          </Space>
        ) : null}
      </Drawer>

      <Modal
        title="生成运输方案"
        open={planModalOpen}
        onCancel={() => setPlanModalOpen(false)}
        onOk={() => planForm.submit()}
        okText="生成方案"
        width={680}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="可直接生成系统建议方案，也可以填写后覆盖生成。"
        />
        <Form form={planForm} layout="vertical" onFinish={(values) => void generatePlan(values)}>
          <Form.Item name="title" label="方案标题">
            <Input placeholder="例如：中亚陆运方案" />
          </Form.Item>
          <Form.Item name="route" label="推荐路线">
            <Input placeholder="例如：上海 - 霍尔果斯 - 阿拉木图" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="transitDays" label="预计天数">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="estimatedCost" label="预计费用">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="currency" label="币种" initialValue="USD">
                <Select options={['USD', 'CNY', 'KZT', 'EUR'].map((value) => ({ value, label: value }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="planText" label="方案说明">
            <TextArea rows={5} placeholder="不填写则自动生成操作节点、风险提示和费用说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={selectedInquiry ? `报价上传 ${selectedInquiry.inquiryNo}` : '报价上传'}
        open={quoteModalOpen}
        onCancel={() => setQuoteModalOpen(false)}
        onOk={() => quoteForm.submit()}
        okText="提交报价"
        width={680}
      >
        <Form form={quoteForm} layout="vertical" initialValues={{ quoteCurrency: 'USD' }} onFinish={(values) => void submitQuote(values)}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="quoteAmount" label="报价金额">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="quoteCurrency" label="币种">
                <Select options={['USD', 'CNY', 'KZT', 'EUR'].map((value) => ({ value, label: value }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="quoteRemark" label="报价备注">
            <TextArea rows={4} placeholder="填写报价说明、有效期、费用包含范围等" />
          </Form.Item>
          <Form.Item
            name="quoteUploadFiles"
            label="上传报价"
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList ?? []}
          >
            <Upload beforeUpload={beforeQuoteAttachmentUpload} multiple accept=".jpg,.jpeg,.png,.pdf">
              <Button icon={<UploadOutlined />}>选择报价文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="solutionUploadFiles"
            label="上传方案附件"
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList ?? []}
          >
            <Upload beforeUpload={beforeQuoteAttachmentUpload} multiple accept=".jpg,.jpeg,.png,.pdf">
              <Button icon={<UploadOutlined />}>选择方案附件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingCargo ? '编辑货物' : '新增货物'}
        open={cargoModalOpen}
        onCancel={() => {
          setCargoModalOpen(false);
          setEditingCargo(null);
          cargoForm.resetFields();
        }}
        onOk={() => cargoForm.submit()}
        okText="淇濆瓨"
        width={760}
      >
        <Form
          form={cargoForm}
          layout="vertical"
          onFinish={(values) => saveCargo(values)}
          onValuesChange={(_, values) => {
            const quantity = Number(values.quantity ?? 0);
            const weightKg = Number(values.weightKg ?? 0);
            const lengthCm = Number(values.lengthCm ?? 0);
            const widthCm = Number(values.widthCm ?? 0);
            const heightCm = Number(values.heightCm ?? 0);
            if (quantity > 0 && weightKg > 0) {
              cargoForm.setFieldValue('totalWeightKg', quantity * weightKg);
            }
            if (quantity > 0 && lengthCm > 0 && widthCm > 0 && heightCm > 0) {
              cargoForm.setFieldValue('volumeCbm', (lengthCm * widthCm * heightCm * quantity) / 1_000_000_000);
            }
          }}
          initialValues={{ quantity: 1, allowRotate: true, allowStack: false }}
        >
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="boxNo" label="箱子序号" rules={[{ required: true, message: '请输入箱子序号' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="lengthCm" label="长度(mm)" rules={[{ required: true, message: '请输入长度' }]}>
                <InputNumber min={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="widthCm" label="宽度(mm)" rules={[{ required: true, message: '请输入宽度' }]}>
                <InputNumber min={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="heightCm" label="高度(mm)" rules={[{ required: true, message: '请输入高度' }]}>
                <InputNumber min={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
                <InputNumber min={1} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weightKg" label="重量(kg)" rules={[{ required: true, message: '请输入重量' }]}>
                <InputNumber min={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalWeightKg" label="总重量(kg)">
                <InputNumber min={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="volumeCbm" label="体积(立方)">
                <InputNumber min={0.0001} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="allowRotate" valuePropName="checked">
                <Checkbox>允许旋转</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="allowStack" valuePropName="checked">
                <Checkbox>允许堆叠</Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} />
          </Form.Item>
          <Divider />
          <Alert
            type="info"
            showIcon
            message="当前配载算法使用有效长度、方数和载重约束；后续车辆补充宽度、高度字段后，可升级为三维配载。"
          />
        </Form>
      </Modal>

      <Modal
        title={editingEmployee ? '缂栬緫鍛樺伐' : '鏂板鍛樺伐'}
        open={employeeModalOpen}
        onCancel={() => {
          setEmployeeModalOpen(false);
          setEditingEmployee(null);
          employeeForm.resetFields();
        }}
        onOk={() => employeeForm.submit()}
        okText="保存"
        width={620}
      >
        <Form form={employeeForm} layout="vertical" onFinish={(values) => void saveEmployee(values)}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="name" label="??" rules={[{ required: true, message: '???????' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="鐢佃瘽">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label="閭">
            <Input />
          </Form.Item>
          <Form.Item name="roleIds" label="角色">
            <EmployeeRoleSelect />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="department" label="閮ㄩ棬">
                <Input placeholder="濡傦細涓氬姟閮ㄣ€佹搷浣滈儴銆佽储鍔￠儴" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="position" label="宀椾綅">
                <Input placeholder="Position" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="isSalesperson" label="是否业务员" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="??" initialValue="ACTIVE">
                <Select
                  options={[
                    { value: 'ACTIVE', label: '??' },
                    { value: 'INACTIVE', label: '??' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="澶囨敞">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingVehicleType ? '编辑车型' : '新增车型'}
        open={vehicleTypeModalOpen}
        onCancel={() => {
          setVehicleTypeModalOpen(false);
          setEditingVehicleType(null);
          vehicleTypeForm.resetFields();
        }}
        onOk={() => vehicleTypeForm.submit()}
        okText="保存"
        width={720}
      >
        <Form form={vehicleTypeForm} layout="vertical" onFinish={(values) => void saveVehicleType(values)}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="priceWeight" label="价格权重">
                <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="数值越大越贵" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="sequenceNo" label="序号">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
                <Select options={vehicleCategoryOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="name" label="车型名称" rules={[{ required: true, message: '请输入车型名称' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="lineCount" label="线">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="axleCount" label="轴">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="payloadWeight" label="载重">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="effectiveLength" label="有效长度">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="effectiveWidth" label="有效宽度">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="effectiveHeight" label="有效高度">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="effectiveVolume" label="有效方数">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="scenario" label="适用场景">
            <TextArea rows={4} placeholder="例如：适合普通机械、冷链货物、大件超限运输等" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingLoadingRule ? '编辑配载规则' : '新增配载规则'}
        open={loadingRuleModalOpen}
        onCancel={() => {
          setLoadingRuleModalOpen(false);
          setEditingLoadingRule(null);
          loadingRuleForm.resetFields();
        }}
        onOk={() => loadingRuleForm.submit()}
        okText="保存"
        width={760}
      >
        <Form form={loadingRuleForm} layout="vertical" onFinish={(values) => void saveLoadingRule(values)}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="sortOrder" label="排序">
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
                <Select options={loadingRuleCategoryOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="enabled" label="是否启用" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="ruleName" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
                <Input placeholder="例如：俄罗斯车货总高上限" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ruleCode" label="规则编码" rules={[{ required: true, message: '请输入规则编码' }]}>
                <Input placeholder="例如：russiaMaxVehicleCargoHeightMm" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="applicableCountries" label="适用国家">
            <Select
              mode="multiple"
              allowClear
              placeholder="不选择表示全线路通用"
              options={countryOptions}
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="valueType" label="值类型" rules={[{ required: true, message: '请选择值类型' }]}>
                <Select
                  options={[
                    { value: 'number', label: '数字' },
                    { value: 'text', label: '文本' },
                    { value: 'boolean', label: '开关' },
                    { value: 'json', label: 'JSON' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="ruleValue" label="规则值" rules={[{ required: true, message: '请输入规则值' }]}>
                <Input placeholder="例如：5200" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="unit" label="单位">
                <Input placeholder="mm / kg / m3" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="规则说明">
            <TextArea rows={4} placeholder="说明规则适用场景、业务含义和风险提示" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="配载 AI 优化配置"
        open={loadingAiConfigModalOpen}
        onCancel={() => {
          setLoadingAiConfigModalOpen(false);
          loadingAiConfigForm.resetFields();
        }}
        onOk={() => loadingAiConfigForm.submit()}
        okText="保存"
        width={820}
      >
        <Form form={loadingAiConfigForm} layout="vertical" onFinish={(values) => void saveLoadingAiConfig(values)}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="enabled" label="是否启用" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="provider" label="服务商" rules={[{ required: true, message: '请输入服务商' }]}>
                <Input placeholder="openai" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="model" label="模型" rules={[{ required: true, message: '请输入模型' }]}>
                <Input placeholder="gpt-4.1-mini" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="apiBaseUrl" label="API 地址" rules={[{ required: true, message: '请输入 API 地址' }]}>
            <Input placeholder="https://api.openai.com/v1/responses" />
          </Form.Item>
          <Form.Item
            name="apiKey"
            label={`API Key${loadingAiConfig?.hasApiKey ? `（当前：${loadingAiConfig.apiKeyMasked || '已配置'}）` : ''}`}
            extra="留空表示不修改现有 Key；输入新 Key 后会覆盖数据库配置。"
          >
            <Input.Password placeholder="sk-..." autoComplete="new-password" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="temperature" label="温度">
                <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxOutputTokens" label="最大输出 Token">
                <InputNumber min={256} max={8000} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="systemPrompt" label="系统提示词">
            <TextArea rows={5} placeholder="定义 AI 配载分析角色、判断规则和输出要求" />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
