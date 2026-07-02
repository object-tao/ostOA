import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Upload,
  message,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { CheckCircleOutlined, ClockCircleOutlined, LoginOutlined, PaperClipOutlined, ReloadOutlined } from '@ant-design/icons';
import type { SessionUser } from '../api/auth';
import { formatBeijingTime } from '../utils/date';

const MOBILE_TOKEN_KEY = 'ostoa-mobile-token';
const MOBILE_USER_KEY = 'ostoa-mobile-user';

const singleSelectText = (value: unknown) => {
  if (Array.isArray(value)) return String(value[value.length - 1] ?? '').trim();
  return String(value ?? '').trim();
};

type WorkflowTodo = {
  id: string;
  instanceNodeId?: string | null;
  taskId?: string | null;
  taskNo?: string | null;
  title: string;
  projectName?: string | null;
  customerShortName?: string | null;
  customerName?: string | null;
  vehicleNo?: string | null;
  vehicleType?: string | null;
  nodeName?: string | null;
  status: string;
  priority?: string | null;
  dueAt?: string | null;
  createdAt?: string | null;
};

const mobileVehicleText = (todo?: WorkflowTodo | null) => {
  const vehicleNo = singleSelectText(todo?.vehicleNo);
  const vehicleType = singleSelectText(todo?.vehicleType);
  return [vehicleNo, vehicleType].filter(Boolean).join(' / ') || '-';
};

const mobileCustomerText = (todo?: WorkflowTodo | null) => singleSelectText(todo?.customerShortName) || singleSelectText(todo?.customerName);

type ProjectFile = {
  key?: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  fileUrl: string;
  customerVisible?: boolean;
  visibilityLevel?: string;
};

type WorkflowFormField = {
  fieldName: string;
  fieldKey: string;
  fieldType: string;
  required: boolean;
  options?: string[];
};

type WorkflowFileRequirement = {
  id: string;
  fileName: string;
  required: boolean;
  allowedTypes?: string | null;
  maxCount?: number | null;
  customerVisible?: boolean;
  downloadable?: boolean;
};

type WorkflowInstanceNode = {
  id: string;
  nodeName: string;
  nodeType: string;
  status: string;
  allowSkip: boolean;
  allowReturn: boolean;
  requireSupplier: boolean;
  requireVehicle: boolean;
  requireDriver: boolean;
  requireGps?: boolean;
  supplierTypes?: string[];
  supplierId?: string | null;
  supplierVehicleId?: string | null;
  supplierDriverId?: string | null;
  gpsProviderId?: string | null;
  gpsProviderShortName?: string | null;
  gpsProviderName?: string | null;
  gpsDeviceNo?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  formFields?: WorkflowFormField[];
  formValues?: Array<{ fieldKey: string; fieldValue: string }>;
  fileRequirements?: WorkflowFileRequirement[];
};

type TaskWorkflow = {
  id: string;
  currentNodeId?: string | null;
  status: string;
  nodes: WorkflowInstanceNode[];
};

type Supplier = {
  id: string;
  name: string;
  type?: string | null;
  vehicles?: Array<{ id: string; plateNo?: string | null; vehicleType?: string | null; requiredVehicleType?: string | null; vehicleLength?: string | null }>;
  drivers?: Array<{ id: string; name?: string | null; phone?: string | null }>;
};

type GpsProviderOption = {
  id: string;
  shortName?: string | null;
  name?: string | null;
  enabled?: boolean;
};

type UploadResult = ProjectFile;

type MobileAction =
  | { open: false }
  | { open: true; mode: 'start' | 'save' | 'submit' | 'return' | 'skip' | 'hold' | 'exception'; node: WorkflowInstanceNode }
  | { open: true; mode: 'tracking'; node: WorkflowInstanceNode };

type MobileActionMode = Exclude<MobileAction, { open: false }>['mode'];

const mobileSelectPopupContainer = (triggerNode: HTMLElement) => triggerNode.parentElement ?? document.body;

function workflowFormValueMap(node?: WorkflowInstanceNode | null) {
  return Object.fromEntries((node?.formValues ?? []).map((item) => [item.fieldKey, item.fieldValue]));
}

function workflowGpsDeviceNo(node?: WorkflowInstanceNode | null) {
  const values = workflowFormValueMap(node);
  return String(values.gpsDeviceNo ?? values.gpsDeviceId ?? values.deviceNo ?? node?.gpsDeviceNo ?? '').trim();
}

function shouldShowGpsFields(node?: WorkflowInstanceNode | null) {
  const values = workflowFormValueMap(node);
  return Boolean(node?.requireGps || node?.gpsProviderId || values.gpsProviderId || workflowGpsDeviceNo(node));
}

function normalizeErrorMessage(error: unknown, fallback = '请求失败'): string {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === 'string') return error || fallback;
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const direct = record.error ?? record.message ?? record.cause ?? record.detail;
    if (direct) return normalizeErrorMessage(direct, fallback);
    const errors = record.errors;
    if (Array.isArray(errors)) {
      const messages = errors.map((item) => normalizeErrorMessage(item, '')).filter(Boolean);
      if (messages.length) return messages.join('；');
    }
    const errorFields = record.errorFields;
    if (Array.isArray(errorFields)) {
      const messages = errorFields
        .flatMap((item) => {
          if (!item || typeof item !== 'object') return [];
          const fieldErrors = (item as { errors?: unknown }).errors;
          return Array.isArray(fieldErrors) ? fieldErrors.map((fieldError) => normalizeErrorMessage(fieldError, '')) : [];
        })
        .filter(Boolean);
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

function parseResponseError(responseText: string, fallback = '请求失败'): string {
  if (!responseText) return fallback;
  const trimmed = responseText.trimStart();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
    return '接口返回了网页内容，请检查 API 路由或登录状态。';
  }
  try {
    const payload = JSON.parse(responseText) as unknown;
    return normalizeErrorMessage(payload, fallback);
  } catch {
    return responseText || fallback;
  }
}

type MobileWorkflowErrorBoundaryState = {
  errorMessage: string;
};

class MobileWorkflowErrorBoundary extends Component<{ children: ReactNode }, MobileWorkflowErrorBoundaryState> {
  state: MobileWorkflowErrorBoundaryState = { errorMessage: '' };

  static getDerivedStateFromError(error: unknown) {
    return { errorMessage: normalizeErrorMessage(error, '移动流程页面渲染异常') };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Mobile workflow render failed.', error, info);
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <div style={{ minHeight: '100vh', padding: 20, background: '#f3f7fb', display: 'flex', alignItems: 'center' }}>
          <Card style={{ width: '100%', borderRadius: 16 }}>
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              <Alert type="error" showIcon message="移动流程页面异常" description={this.state.errorMessage} />
              <Button
                type="primary"
                block
                onClick={() => {
                  clearMobileSession();
                  window.location.href = window.location.pathname;
                }}
              >
                重新登录
              </Button>
            </Space>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

const actionLabels: Record<string, string> = {
  start: '开始处理',
  save: '保存草稿',
  submit: '提交完成',
  return: '退回上一步',
  skip: '跳过节点',
  hold: '挂起流程',
  exception: '标记异常',
  tracking: '增加记录',
};

function nowInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function normalizeDateTimeInput(value?: string) {
  return value ? value.replace('T', ' ') : formatBeijingTime(new Date().toISOString());
}

function nodeStatusColor(status?: string) {
  if (status === '已完成') return 'green';
  if (status === '处理中') return 'blue';
  if (status === '待处理') return 'gold';
  if (status === '异常') return 'red';
  if (status === '已挂起') return 'orange';
  return 'default';
}

function formatMobileTime(value?: string | null) {
  return value ? formatBeijingTime(value) : '-';
}

function getUploadAccept(requirements?: WorkflowFileRequirement[]) {
  const extensions = (requirements ?? [])
    .flatMap((item) => String(item.allowedTypes ?? '').split(','))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .map((item) => (item.startsWith('.') ? item : `.${item}`));
  return Array.from(new Set(extensions)).join(',');
}

function getMobileTaskId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('taskId') || params.get('state') || '';
}

function clearMobileTaskId() {
  const params = new URLSearchParams(window.location.search);
  params.delete('taskId');
  params.delete('state');
  const query = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
}

function getMobileToken() {
  return localStorage.getItem(MOBILE_TOKEN_KEY);
}

function getMobileUser(): SessionUser | null {
  const raw = localStorage.getItem(MOBILE_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function saveMobileSession(token: string, user: SessionUser) {
  localStorage.setItem(MOBILE_TOKEN_KEY, token);
  localStorage.setItem(MOBILE_USER_KEY, JSON.stringify(user));
}

function clearMobileSession() {
  localStorage.removeItem(MOBILE_TOKEN_KEY);
  localStorage.removeItem(MOBILE_USER_KEY);
}

class MobileApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'MobileApiError';
    this.status = status;
  }
}

function isMobileUnauthorized(error: unknown) {
  return error instanceof MobileApiError && error.status === 401;
}

async function mobileApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getMobileToken();
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'https://api.ostoa.org'}${path}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    const responseText = await response.text();
    if (response.status === 401) clearMobileSession();
    throw new MobileApiError(parseResponseError(responseText), response.status);
  }
  return response.json();
}

function MobileWorkflowContent() {
  const [user, setUser] = useState<SessionUser | null>(() => getMobileUser());
  const [todos, setTodos] = useState<WorkflowTodo[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [gpsProviders, setGpsProviders] = useState<GpsProviderOption[]>([]);
  const [workflow, setWorkflow] = useState<TaskWorkflow | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<WorkflowTodo | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [action, setAction] = useState<MobileAction>({ open: false });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fatalError, setFatalError] = useState('');
  const [actionUploadFiles, setActionUploadFiles] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const watchedSupplierId = Form.useWatch('supplierId', form);
  const watchedSupplierVehicleId = Form.useWatch('supplierVehicleId', form);
  const watchedSupplierDriverId = Form.useWatch('supplierDriverId', form);

  const resetUnauthorizedSession = () => {
    clearMobileSession();
    setUser(null);
    setTodos([]);
    setWorkflow(null);
    setSelectedTodo(null);
    setDetailOpen(false);
    setAction({ open: false });
    setFatalError('');
  };

  const workflowNodes = Array.isArray(workflow?.nodes) ? workflow.nodes : [];
  const currentNode = useMemo(
    () => workflowNodes.find((node) => node.id === workflow?.currentNodeId) ?? workflowNodes.find((node) => node.status === '待处理' || node.status === '处理中') ?? null,
    [workflow?.currentNodeId, workflowNodes],
  );

  const selectedSupplier = useMemo(() => suppliers.find((item) => item.id === watchedSupplierId), [suppliers, watchedSupplierId]);
  const activeGpsProviders = useMemo(() => gpsProviders.filter((item) => item.enabled !== false), [gpsProviders]);
  const overdueTodoCount = useMemo(
    () => todos.filter((item) => item.dueAt && new Date(item.dueAt).getTime() < Date.now()).length,
    [todos],
  );

  const loginWithCode = async (code: string) => {
    setAuthLoading(true);
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const targetTaskId = getMobileTaskId();
      const result = await mobileApiRequest<{ token: string; user: SessionUser }>('/api/feishu/mobile-login', {
        method: 'POST',
        body: JSON.stringify({ code, redirectUri }),
      });
      saveMobileSession(result.token, result.user);
      setUser(result.user);
      window.history.replaceState(null, '', `${window.location.pathname}${targetTaskId ? `?taskId=${encodeURIComponent(targetTaskId)}` : ''}`);
      message.success('飞书登录成功');
      if (targetTaskId) {
        await loadTodos();
        await openTaskWorkflow(targetTaskId, undefined, { autoOpenCurrentAction: true, operatorName: result.user.realName });
      } else {
        await loadTodos();
      }
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setAuthLoading(false);
    }
  };

  const openFeishuLogin = async () => {
    setAuthLoading(true);
    try {
      const redirect = `${window.location.origin}${window.location.pathname}`;
      const targetTaskId = getMobileTaskId();
      const result = await mobileApiRequest<{ authUrl: string }>(
        `/api/feishu/auth-url?redirect=${encodeURIComponent(redirect)}${targetTaskId ? `&state=${encodeURIComponent(targetTaskId)}` : ''}`,
      );
      window.location.href = result.authUrl;
    } catch (error) {
      message.error((error as Error).message);
      setAuthLoading(false);
    }
  };

  const loadTodos = async () => {
    setLoading(true);
    try {
      const result = await mobileApiRequest<{ items: WorkflowTodo[] }>('/api/mobile/workflow-todos');
      setTodos((result.items ?? []).filter((item) => item.status !== '已处理'));
    } catch (error) {
      const errorMessage = (error as Error).message;
      message.error(errorMessage);
      if (isMobileUnauthorized(error)) {
        resetUnauthorizedSession();
        return;
      }
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('sign in') || errorMessage.includes('登录')) {
        clearMobileSession();
        setUser(null);
        setTodos([]);
        setWorkflow(null);
        setSelectedTodo(null);
        setDetailOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const result = await mobileApiRequest<{ items: Supplier[] }>('/api/suppliers');
      setSuppliers(result.items ?? []);
    } catch {
      setSuppliers([]);
    }
  };

  const loadGpsProviders = async () => {
    try {
      const result = await mobileApiRequest<{ items: GpsProviderOption[] }>('/api/gps-providers');
      setGpsProviders(result.items ?? []);
    } catch {
      setGpsProviders([]);
    }
  };

  const findCurrentWorkflowNode = (workflowItem: TaskWorkflow) =>
    (Array.isArray(workflowItem.nodes) ? workflowItem.nodes : []).find((node) => node.id === workflowItem.currentNodeId) ??
    (Array.isArray(workflowItem.nodes) ? workflowItem.nodes : []).find((node) => node.status === '待处理' || node.status === '处理中') ??
    null;

  const openAction = (node: WorkflowInstanceNode, mode: MobileActionMode, operatorName = user?.realName ?? '') => {
    setAction({ open: true, mode, node } as MobileAction);
    setActionUploadFiles([]);
    const valueMap = workflowFormValueMap(node);
    const initialFormValues = Object.fromEntries(
      (node.formFields ?? []).map((field) => [field.fieldKey, field.fieldType === 'datetime' ? nowInputValue() : valueMap[field.fieldKey] ?? '']),
    );
    if (shouldShowGpsFields(node)) {
      initialFormValues.gpsProviderId = valueMap.gpsProviderId ?? node.gpsProviderId ?? '';
      initialFormValues.gpsDeviceNo = workflowGpsDeviceNo(node);
    }
    form.setFieldsValue({
      operator: operatorName,
      operationTime: nowInputValue(),
      remark: '',
      trackingStatus: '在途',
      content: '',
      supplierId: node.supplierId,
      supplierVehicleId: node.supplierVehicleId ? [node.supplierVehicleId] : undefined,
      supplierDriverId: node.supplierDriverId ? [node.supplierDriverId] : undefined,
      manualVehiclePlateNo: undefined,
      manualRequiredVehicleType: undefined,
      manualVehicleLength: undefined,
      manualDriverName: undefined,
      manualDriverPhone: undefined,
      uploadFiles: [],
      formValues: initialFormValues,
    });
  };

  const openTaskWorkflow = async (
    taskId: string,
    todo?: WorkflowTodo,
    options?: { autoOpenCurrentAction?: boolean; operatorName?: string },
  ) => {
    if (!taskId) return;
    setSelectedTodo(todo ?? { id: `direct-${taskId}`, taskId, title: '运输任务', status: '未处理' });
    setDetailOpen(true);
    setLoading(true);
    try {
      const result = await mobileApiRequest<TaskWorkflow | { item?: TaskWorkflow }>(`/api/transport-tasks/${taskId}/workflow`);
      const workflowItem: TaskWorkflow | undefined = Object.prototype.hasOwnProperty.call(result, 'item')
        ? (result as { item?: TaskWorkflow }).item
        : (result as TaskWorkflow);
      if (!workflowItem) throw new Error('未获取到运输任务流程。');
      setWorkflow(workflowItem);
      void loadSuppliers();
      void loadGpsProviders();
      if (options?.autoOpenCurrentAction) {
        const targetNode = findCurrentWorkflowNode(workflowItem);
        if (targetNode) {
          const defaultMode: MobileActionMode = targetNode.status === '处理中' ? 'submit' : 'start';
          openAction(targetNode, defaultMode, options.operatorName);
        }
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      message.error(errorMessage);
      if (isMobileUnauthorized(error)) {
        resetUnauthorizedSession();
        return;
      }
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('sign in') || errorMessage.includes('登录')) {
        clearMobileSession();
        setUser(null);
        setWorkflow(null);
        setSelectedTodo(null);
        setDetailOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const openTodo = async (todo: WorkflowTodo) => {
    if (!todo.taskId) return;
    await openTaskWorkflow(todo.taskId, todo);
  };

  const uploadFiles = async (files?: UploadFile[]) => {
    const selectedFiles = (files ?? []).filter((item) => item.originFileObj);
    const uploaded: ProjectFile[] = [];
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('folder', 'workflow');
      formData.append('file', file.originFileObj as File);
      const result = await mobileApiRequest<UploadResult>('/api/uploads', { method: 'POST', body: formData });
      uploaded.push(result);
    }
    return uploaded;
  };

  const submitAction = async () => {
    if (!action.open) return;
    setSaving(true);
    try {
      const values = await form.validateFields();
      const formUploadFiles = Array.isArray(values.uploadFiles) ? values.uploadFiles : [];
      const files = await uploadFiles(formUploadFiles.length ? formUploadFiles : actionUploadFiles);
      if (action.mode === 'tracking') {
        await mobileApiRequest(`/api/workflow/instance-nodes/${action.node.id}/tracking-records`, {
          method: 'POST',
          body: JSON.stringify({
            trackedAt: normalizeDateTimeInput(values.operationTime),
            trackingStatus: values.trackingStatus,
            content: values.content || values.remark,
            operator: values.operator,
            customerVisible: true,
            visibilityLevel: '客户可见资料',
            files,
            remark: values.remark,
          }),
        });
      } else {
        const supplier = suppliers.find((item) => item.id === values.supplierId);
        let supplierVehicleId = singleSelectText(values.supplierVehicleId);
        let supplierDriverId = singleSelectText(values.supplierDriverId);
        let vehicle = supplier?.vehicles?.find((item) => item.id === supplierVehicleId);
        let driver = supplier?.drivers?.find((item) => item.id === supplierDriverId);
        const typedVehiclePlateNo = supplierVehicleId && !vehicle ? supplierVehicleId : '';
        const typedDriverName = supplierDriverId && !driver ? supplierDriverId : '';
        if (!vehicle) supplierVehicleId = '';
        if (!driver) supplierDriverId = '';

        if (!supplierVehicleId && values.supplierId && (values.manualVehiclePlateNo || typedVehiclePlateNo)) {
          const manualVehiclePlateNo = values.manualVehiclePlateNo || typedVehiclePlateNo;
          const createdVehicle = await mobileApiRequest<{ id: string }>(`/api/suppliers/${values.supplierId}/vehicles`, {
            method: 'POST',
            body: JSON.stringify({
              plateNo: manualVehiclePlateNo,
              requiredVehicleType: values.manualRequiredVehicleType,
              vehicleLength: values.manualVehicleLength,
            }),
          });
          supplierVehicleId = createdVehicle.id;
          vehicle = {
            id: createdVehicle.id,
            plateNo: manualVehiclePlateNo,
            requiredVehicleType: values.manualRequiredVehicleType,
            vehicleLength: values.manualVehicleLength,
          };
        }

        if (!supplierDriverId && values.supplierId && (values.manualDriverName || typedDriverName)) {
          const manualDriverName = values.manualDriverName || typedDriverName;
          const createdDriver = await mobileApiRequest<{ id: string }>(`/api/suppliers/${values.supplierId}/drivers`, {
            method: 'POST',
            body: JSON.stringify({
              name: manualDriverName,
              phone: values.manualDriverPhone,
            }),
          });
          supplierDriverId = createdDriver.id;
          driver = {
            id: createdDriver.id,
            name: manualDriverName,
            phone: values.manualDriverPhone,
          };
        }

        await mobileApiRequest(`/api/workflow/instance-nodes/${action.node.id}/${action.mode}`, {
          method: 'POST',
          body: JSON.stringify({
            operator: values.operator,
            operationTime: normalizeDateTimeInput(values.operationTime),
            remark: values.remark,
            supplierId: values.supplierId,
            supplierName: supplier?.name ?? '',
            supplierType: supplier?.type ?? '',
            supplierVehicleId,
            vehiclePlateNo: vehicle?.plateNo ?? '',
            supplierDriverId,
            driverName: driver?.name ?? '',
            driverPhone: driver?.phone ?? '',
            customerVisible: false,
            visibilityLevel: '内部资料',
            files,
            formValues: Object.entries(values.formValues ?? {}).map(([fieldKey, fieldValue]) => {
              const field = action.node.formFields?.find((item) => item.fieldKey === fieldKey);
              return {
                fieldKey,
                fieldName: field?.fieldName ?? fieldKey,
                fieldType: field?.fieldType ?? 'text',
                fieldValue: field?.fieldType === 'datetime' ? normalizeDateTimeInput(String(fieldValue ?? '')) : String(fieldValue ?? ''),
              };
            }),
          }),
        });
      }
      message.success('操作已提交');
      setAction({ open: false });
      setActionUploadFiles([]);
      if (selectedTodo) await openTodo(selectedTodo);
      await loadTodos();
    } catch (error) {
      message.error(normalizeErrorMessage(error, '提交失败'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setFatalError(normalizeErrorMessage(event.error ?? event.message, '移动页面运行异常'));
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isMobileUnauthorized(event.reason)) return;
      setFatalError(normalizeErrorMessage(event.reason, '移动页面请求异常'));
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      void loginWithCode(code);
      return;
    }
    if (getMobileToken()) {
      const taskId = getMobileTaskId();
      if (taskId) {
        void (async () => {
          await loadTodos();
          if (getMobileToken()) {
            await openTaskWorkflow(taskId, undefined, { autoOpenCurrentAction: true, operatorName: user?.realName });
          }
        })();
      } else {
        void loadTodos();
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (user && !getMobileTaskId()) void loadTodos();
  }, [user]);

  useEffect(() => {
    const taskId = getMobileTaskId();
    if (!user || !taskId || selectedTodo) return;
    const target = todos.find((todo) => todo.taskId === taskId);
    if (target) {
      void openTaskWorkflow(taskId, target, { autoOpenCurrentAction: true, operatorName: user.realName });
    } else {
      void openTaskWorkflow(taskId, undefined, { autoOpenCurrentAction: true, operatorName: user.realName });
    }
  }, [user, todos, selectedTodo]);

  const closeTaskDetail = () => {
    setDetailOpen(false);
    setSelectedTodo(null);
    setWorkflow(null);
    clearMobileTaskId();
  };

  const closeActionDrawer = () => {
    setAction({ open: false });
    setActionUploadFiles([]);
    form.setFieldValue('uploadFiles', []);
  };

  const renderTaskWorkflowDetail = () => {
    if (!selectedTodo || !workflow || workflowNodes.length === 0) {
      return (
        <div style={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin spinning={loading} />
        </div>
      );
    }
    return (
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div className="mobile-task-summary">
          <div>
            <div className="mobile-task-summary-label">任务号</div>
            <div className="mobile-task-summary-value">{selectedTodo.taskNo || selectedTodo.title}</div>
          </div>
          <div>
            <div className="mobile-task-summary-label">客户 / 项目</div>
            <div className="mobile-task-summary-value">{[mobileCustomerText(selectedTodo), selectedTodo.projectName].filter(Boolean).join(' / ') || '-'}</div>
          </div>
          <div>
            <div className="mobile-task-summary-label">车牌 / 车辆</div>
            <div className="mobile-task-summary-value">{mobileVehicleText(selectedTodo)}</div>
          </div>
          <div>
            <div className="mobile-task-summary-label">当前节点</div>
            <Space size={6} wrap>
              <Tag color={nodeStatusColor(currentNode?.status)}>{currentNode?.status || '-'}</Tag>
              <span>{currentNode?.nodeName || '-'}</span>
            </Space>
          </div>
        </div>
        {currentNode ? (
          <Card size="small" className="mobile-current-node-card">
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              <div className="mobile-current-node-title">
                <span>{currentNode.nodeName}</span>
                <Tag color={nodeStatusColor(currentNode.status)}>{currentNode.status}</Tag>
              </div>
              <div className="mobile-action-grid">
                <Button type="primary" icon={<ClockCircleOutlined />} disabled={currentNode.status === '处理中'} onClick={() => openAction(currentNode, 'start')}>
                  开始处理
                </Button>
                <Button type="primary" icon={<CheckCircleOutlined />} disabled={currentNode.status !== '处理中'} onClick={() => openAction(currentNode, 'submit')}>
                  提交完成
                </Button>
                <Button disabled={currentNode.status !== '处理中'} onClick={() => openAction(currentNode, 'save')}>
                  保存草稿
                </Button>
                <Button disabled={currentNode.status !== '处理中'} onClick={() => openAction(currentNode, 'tracking')}>
                  增加记录
                </Button>
                <Button danger disabled={currentNode.status !== '处理中'} onClick={() => openAction(currentNode, 'exception')}>
                  标记异常
                </Button>
              </div>
            </Space>
          </Card>
        ) : null}
        <List
          className="mobile-node-list"
          dataSource={workflowNodes}
          renderItem={(node) => (
            <List.Item style={{ paddingInline: 0 }}>
              <List.Item.Meta
                title={
                  <Space size={6} wrap>
                    <span>{node.nodeName}</span>
                    <Tag color={nodeStatusColor(node.status)}>{node.status}</Tag>
                  </Space>
                }
                description={`开始：${formatMobileTime(node.startedAt)}，完成：${formatMobileTime(node.completedAt)}`}
              />
            </List.Item>
          )}
        />
      </Space>
    );
  };

  if (fatalError) {
    return (
      <div className="mobile-workflow-page" style={{ minHeight: '100vh', padding: 20, background: '#f3f7fb', display: 'flex', alignItems: 'center' }}>
        <Card style={{ width: '100%', borderRadius: 16 }}>
          <Space direction="vertical" size={14} style={{ width: '100%' }}>
            <Alert type="error" showIcon message="移动流程页面异常" description={fatalError} />
            <Button
              type="primary"
              block
              onClick={() => {
                setFatalError('');
                clearMobileSession();
                setUser(null);
                setTodos([]);
                setWorkflow(null);
                setSelectedTodo(null);
              }}
            >
              重新登录
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mobile-workflow-page" style={{ minHeight: '100vh', padding: 20, background: '#f3f7fb', display: 'flex', alignItems: 'center' }}>
        <Card style={{ width: '100%', borderRadius: 16 }}>
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <div>
              <div style={{ color: '#64748b', letterSpacing: 1, fontSize: 12 }}>OSTOA MOBILE</div>
              <h1 style={{ margin: '8px 0 0', fontSize: 26 }}>移动流程处理</h1>
              <p style={{ color: '#64748b', marginBottom: 0 }}>通过飞书免登进入现场任务，处理节点、上传照片和附件。</p>
            </div>
            <Button type="primary" size="large" icon={<LoginOutlined />} block loading={authLoading} onClick={openFeishuLogin}>
              使用飞书登录
            </Button>
            <Alert type="info" showIcon message="请先在飞书开放平台配置重定向 URL 为当前页面地址。" />
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div className="mobile-workflow-page" style={{ minHeight: '100vh', padding: 14, background: '#f3f7fb' }}>
      <Space direction="vertical" size={14} style={{ width: '100%' }}>
        <Card style={{ borderRadius: 16 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: 12 }}>移动工作台</div>
                <h2 style={{ margin: 0 }}>{user.realName}</h2>
              </div>
              <Button
                onClick={() => {
                  clearMobileSession();
                  setUser(null);
                  setTodos([]);
                  setWorkflow(null);
                  setDetailOpen(false);
                }}
              >
                退出
              </Button>
            </div>
            <div className="mobile-todo-metrics">
              <div>
                <span>待处理</span>
                <strong>{todos.length}</strong>
              </div>
              <div>
                <span>已超时</span>
                <strong className={overdueTodoCount ? 'danger' : ''}>{overdueTodoCount}</strong>
              </div>
            </div>
            <Button icon={<ReloadOutlined />} block onClick={loadTodos} loading={loading}>
              刷新待办
            </Button>
          </Space>
        </Card>

        <Card title="我的待办" style={{ borderRadius: 16 }}>
          <Spin spinning={loading}>
            <List
              dataSource={todos}
              locale={{ emptyText: <Empty description="暂无待办" /> }}
              renderItem={(item) => (
                <List.Item onClick={() => void openTodo(item)} style={{ cursor: 'pointer', paddingInline: 0 }}>
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <span>{item.taskNo ?? item.title}</span>
                        <Tag color="blue">{item.nodeName}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={2}>
                        <span>{[mobileCustomerText(item), item.projectName].filter(Boolean).join(' / ')}</span>
                        <span>车牌 / 车辆：{mobileVehicleText(item)}</span>
                        <span>{formatBeijingTime(item.createdAt)}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Spin>
        </Card>

      </Space>

      <Modal
        title={`${selectedTodo?.taskNo ?? '运输任务'} · 流程处理`}
        open={detailOpen}
        onCancel={closeTaskDetail}
        footer={null}
        width={720}
        style={{ top: 16 }}
        styles={{ body: { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', padding: 16 } }}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Button block onClick={closeTaskDetail}>
            返回待办列表
          </Button>
          {renderTaskWorkflowDetail()}
        </Space>
      </Modal>

      <Drawer
        title={action.open ? `${action.node.nodeName} · ${actionLabels[action.mode]}` : '节点操作'}
        open={action.open}
        onClose={closeActionDrawer}
        placement="bottom"
        height="88vh"
        rootClassName="mobile-workflow-drawer"
        styles={{ body: { padding: 14, overflowX: 'hidden' }, header: { padding: '14px 16px' } }}
        extra={
          <Space>
            <Button onClick={closeActionDrawer}>取消</Button>
            <Button type="primary" loading={saving} onClick={() => void submitAction()}>
              提交
            </Button>
          </Space>
        }
      >
        {action.open ? (
          <Form form={form} layout="vertical">
            <div className="mobile-form-grid">
              <Form.Item name="operator" label="操作人" rules={[{ required: true, message: '请选择操作人' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="operationTime" label={action.mode === 'tracking' ? '跟踪时间' : '操作时间'} rules={[{ required: true, message: '请选择时间' }]}>
                <Input type="datetime-local" />
              </Form.Item>
            </div>
            {action.mode === 'tracking' ? (
              <>
                <Form.Item name="trackingStatus" label="跟踪状态">
                  <Input placeholder="如：在途、已到达、等待清关" />
                </Form.Item>
                <Form.Item name="content" label="记录内容" rules={[{ required: true, message: '请输入记录内容' }]}>
                  <Input.TextArea rows={4} />
                </Form.Item>
              </>
            ) : null}
            {action.mode !== 'tracking' && action.node.requireSupplier ? (
              <Form.Item name="supplierId" label="服务供应商" rules={[{ required: action.mode === 'submit', message: '请选择服务供应商' }]}>
                <Select
                  showSearch
                  getPopupContainer={mobileSelectPopupContainer}
                  popupMatchSelectWidth={false}
                  optionFilterProp="label"
                  onChange={() =>
                    form.setFieldsValue({
                      supplierVehicleId: undefined,
                      supplierDriverId: undefined,
                      manualVehiclePlateNo: undefined,
                      manualRequiredVehicleType: undefined,
                      manualVehicleLength: undefined,
                      manualDriverName: undefined,
                      manualDriverPhone: undefined,
                    })
                  }
                  options={suppliers
                    .filter((supplier) => !action.node.supplierTypes?.length || action.node.supplierTypes.includes(String(supplier.type ?? '')))
                    .map((supplier) => ({ value: supplier.id, label: `${supplier.name}${supplier.type ? ` / ${supplier.type}` : ''}` }))}
                />
              </Form.Item>
            ) : null}
            {action.mode !== 'tracking' && action.node.requireVehicle ? (
              <Form.Item
                name="supplierVehicleId"
                label="服务车辆"
                rules={
                  action.mode === 'submit'
                    ? [
                        {
                          validator: async (_, value) => {
                            if (singleSelectText(value) || form.getFieldValue('manualVehiclePlateNo')) return;
                            throw new Error('请选择服务车辆，或手动填写车牌号');
                          },
                        },
                      ]
                    : []
                }
              >
                <Select
                  mode="tags"
                  showSearch
                  getPopupContainer={mobileSelectPopupContainer}
                  popupMatchSelectWidth={false}
                  optionFilterProp="label"
                  onChange={(value) => form.setFieldValue('supplierVehicleId', Array.isArray(value) ? value.slice(-1) : value)}
                  options={(selectedSupplier?.vehicles ?? []).map((vehicle) => ({
                    value: vehicle.id,
                    label: [vehicle.plateNo, vehicle.vehicleType, vehicle.vehicleLength].filter(Boolean).join(' / '),
                  }))}
                />
              </Form.Item>
            ) : null}
            {action.mode !== 'tracking' && action.node.requireVehicle ? (
              <>
                <div className="mobile-manual-panel">
                  <div className="mobile-manual-panel-title">下拉没有车辆时，填写后会自动保存到当前供应商</div>
                  <div className="mobile-form-grid">
                    <Form.Item name="manualVehiclePlateNo" label="车牌号">
                      <Input disabled={!selectedSupplier || Boolean(watchedSupplierVehicleId)} placeholder="没有对应车辆时填写" />
                    </Form.Item>
                    <Form.Item name="manualRequiredVehicleType" label="需求车型">
                      <Input disabled={!selectedSupplier || Boolean(watchedSupplierVehicleId)} placeholder="如：平板、篷布车、特种板" />
                    </Form.Item>
                    <Form.Item name="manualVehicleLength" label="车长">
                      <Input disabled={!selectedSupplier || Boolean(watchedSupplierVehicleId)} placeholder="如：13米、17米、17.5米" />
                    </Form.Item>
                  </div>
                </div>
              </>
            ) : null}
            {action.mode !== 'tracking' && action.node.requireDriver ? (
              <Form.Item
                name="supplierDriverId"
                label="服务司机"
                rules={
                  action.mode === 'submit'
                    ? [
                        {
                          validator: async (_, value) => {
                            if (singleSelectText(value) || form.getFieldValue('manualDriverName')) return;
                            throw new Error('请选择服务司机，或手动填写司机姓名');
                          },
                        },
                      ]
                    : []
                }
              >
                <Select
                  mode="tags"
                  showSearch
                  getPopupContainer={mobileSelectPopupContainer}
                  popupMatchSelectWidth={false}
                  optionFilterProp="label"
                  onChange={(value) => form.setFieldValue('supplierDriverId', Array.isArray(value) ? value.slice(-1) : value)}
                  options={(selectedSupplier?.drivers ?? []).map((driver) => ({
                    value: driver.id,
                    label: [driver.name, driver.phone].filter(Boolean).join(' / '),
                  }))}
                />
              </Form.Item>
            ) : null}
            {action.mode !== 'tracking' && action.node.requireDriver ? (
              <>
                <div className="mobile-manual-panel">
                  <div className="mobile-manual-panel-title">下拉没有司机时，填写后会自动保存到当前供应商</div>
                  <div className="mobile-form-grid">
                    <Form.Item name="manualDriverName" label="司机姓名">
                      <Input disabled={!selectedSupplier || Boolean(watchedSupplierDriverId)} placeholder="没有对应司机时填写" />
                    </Form.Item>
                    <Form.Item name="manualDriverPhone" label="司机电话">
                      <Input disabled={!selectedSupplier || Boolean(watchedSupplierDriverId)} placeholder="司机联系电话" />
                    </Form.Item>
                  </div>
                </div>
              </>
            ) : null}
            {action.mode !== 'tracking' && shouldShowGpsFields(action.node) ? (
              <div className="mobile-manual-panel">
                <div className="mobile-manual-panel-title">GPS设备信息</div>
                <div className="mobile-form-grid">
                  <Form.Item
                    name={['formValues', 'gpsProviderId']}
                    label="GPS服务商"
                    rules={action.mode === 'submit' && action.node.requireGps ? [{ required: true, message: '请选择GPS服务商' }] : []}
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder="请选择GPS服务商"
                      getPopupContainer={mobileSelectPopupContainer}
                      popupMatchSelectWidth={false}
                      optionFilterProp="label"
                      options={activeGpsProviders.map((provider) => ({
                        value: provider.id,
                        label: provider.shortName || provider.name || provider.id,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item
                    name={['formValues', 'gpsDeviceNo']}
                    label="GPS ID/设备号"
                    rules={action.mode === 'submit' && action.node.requireGps ? [{ required: true, message: '请输入GPS ID/设备号' }] : []}
                  >
                    <Input placeholder="如：设备号、终端号、GPS ID" />
                  </Form.Item>
                </div>
              </div>
            ) : null}
            {action.mode !== 'tracking'
              ? (action.node.formFields ?? []).map((field) => (
                  <Form.Item
                    key={field.fieldKey}
                    name={['formValues', field.fieldKey]}
                    label={field.fieldName}
                    rules={field.required && action.mode === 'submit' ? [{ required: true, message: `请填写${field.fieldName}` }] : []}
                  >
                    {field.fieldType === 'textarea' ? (
                      <Input.TextArea rows={3} />
                    ) : field.fieldType === 'select' ? (
                      <Select getPopupContainer={mobileSelectPopupContainer} popupMatchSelectWidth={false} options={(field.options ?? []).map((item) => ({ value: item, label: item }))} />
                    ) : field.fieldType === 'datetime' ? (
                      <Input type="datetime-local" />
                    ) : (
                      <Input type={field.fieldType === 'number' ? 'number' : 'text'} />
                    )}
                  </Form.Item>
                ))
              : null}
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={3} />
            </Form.Item>
            {action.mode !== 'tracking' && (action.node.fileRequirements ?? []).length ? (
              <div className="mobile-file-requirements">
                <div className="mobile-file-requirements-title">节点附件要求</div>
                <div className="mobile-file-requirements-list">
                  {(action.node.fileRequirements ?? []).map((item) => (
                    <div key={item.id ?? item.fileName} className={item.required ? 'mobile-file-requirement required' : 'mobile-file-requirement'}>
                      <span className="mobile-file-requirement-name">
                        {item.required ? <span className="mobile-file-required-mark">*</span> : null}
                        {item.fileName}
                      </span>
                      <span className="mobile-file-requirement-meta">
                        {item.required ? '必传' : '选传'}
                        {item.allowedTypes ? ` · ${item.allowedTypes}` : ''}
                        {item.maxCount ? ` · 最多 ${item.maxCount} 个` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <Form.Item name="uploadFiles" label="附件/照片" valuePropName="fileList" getValueFromEvent={(event) => event?.fileList ?? []}>
              <Upload
                beforeUpload={() => false}
                multiple
                accept={getUploadAccept(action.node.fileRequirements)}
                fileList={actionUploadFiles}
                onChange={({ fileList }) => {
                  setActionUploadFiles(fileList);
                  form.setFieldValue('uploadFiles', fileList);
                }}
                onRemove={(file) => {
                  const nextFiles = actionUploadFiles.filter((item) => item.uid !== file.uid);
                  setActionUploadFiles(nextFiles);
                  form.setFieldValue('uploadFiles', nextFiles);
                  return true;
                }}
              >
                <Button icon={<PaperClipOutlined />}>选择文件</Button>
              </Upload>
            </Form.Item>
          </Form>
        ) : null}
      </Drawer>
    </div>
  );
}

export function MobileWorkflowPage() {
  return (
    <MobileWorkflowErrorBoundary>
      <MobileWorkflowContent />
    </MobileWorkflowErrorBoundary>
  );
}
