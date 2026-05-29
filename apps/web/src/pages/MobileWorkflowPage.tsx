import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  List,
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

type WorkflowTodo = {
  id: string;
  instanceNodeId?: string | null;
  taskId?: string | null;
  taskNo?: string | null;
  title: string;
  projectName?: string | null;
  customerName?: string | null;
  nodeName?: string | null;
  status: string;
  priority?: string | null;
  dueAt?: string | null;
  createdAt?: string | null;
};

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
  supplierTypes?: string[];
  supplierId?: string | null;
  supplierVehicleId?: string | null;
  supplierDriverId?: string | null;
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

type UploadResult = ProjectFile;

type MobileAction =
  | { open: false }
  | { open: true; mode: 'start' | 'save' | 'submit' | 'return' | 'skip' | 'hold' | 'exception'; node: WorkflowInstanceNode }
  | { open: true; mode: 'tracking'; node: WorkflowInstanceNode };

type MobileActionMode = Exclude<MobileAction, { open: false }>['mode'];

const mobileSelectPopupContainer = (triggerNode: HTMLElement) => triggerNode.parentElement ?? document.body;

type MobileWorkflowErrorBoundaryState = {
  errorMessage: string;
};

class MobileWorkflowErrorBoundary extends Component<{ children: ReactNode }, MobileWorkflowErrorBoundaryState> {
  state: MobileWorkflowErrorBoundaryState = { errorMessage: '' };

  static getDerivedStateFromError(error: Error) {
    return { errorMessage: error.message || '移动流程页面渲染异常' };
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

function getMobileTaskId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('taskId') || params.get('state') || '';
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
    let errorMessage = '请求失败';
    const responseText = await response.text();
    try {
      const payload = JSON.parse(responseText) as { error?: string };
      errorMessage = payload.error ?? responseText ?? errorMessage;
    } catch {
      errorMessage = responseText || errorMessage;
    }
    if (response.status === 401) clearMobileSession();
    throw new Error(errorMessage);
  }
  return response.json();
}

function MobileWorkflowContent() {
  const [user, setUser] = useState<SessionUser | null>(() => getMobileUser());
  const [todos, setTodos] = useState<WorkflowTodo[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [workflow, setWorkflow] = useState<TaskWorkflow | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<WorkflowTodo | null>(null);
  const [action, setAction] = useState<MobileAction>({ open: false });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fatalError, setFatalError] = useState('');
  const [form] = Form.useForm();
  const watchedSupplierId = Form.useWatch('supplierId', form);

  const workflowNodes = Array.isArray(workflow?.nodes) ? workflow.nodes : [];
  const currentNode = useMemo(
    () => workflowNodes.find((node) => node.id === workflow?.currentNodeId) ?? workflowNodes.find((node) => node.status === '待处理' || node.status === '处理中') ?? null,
    [workflow?.currentNodeId, workflowNodes],
  );

  const selectedSupplier = useMemo(() => suppliers.find((item) => item.id === watchedSupplierId), [suppliers, watchedSupplierId]);

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
        await openTaskWorkflow(targetTaskId);
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
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('sign in') || errorMessage.includes('登录')) {
        clearMobileSession();
        setUser(null);
        setTodos([]);
        setWorkflow(null);
        setSelectedTodo(null);
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

  const openTaskWorkflow = async (taskId: string, todo?: WorkflowTodo) => {
    if (!taskId) return;
    setSelectedTodo(todo ?? { id: `direct-${taskId}`, taskId, title: '运输任务', status: '未处理' });
    setLoading(true);
    try {
      const result = await mobileApiRequest<TaskWorkflow | { item?: TaskWorkflow }>(`/api/transport-tasks/${taskId}/workflow`);
      const workflowItem: TaskWorkflow | undefined = Object.prototype.hasOwnProperty.call(result, 'item')
        ? (result as { item?: TaskWorkflow }).item
        : (result as TaskWorkflow);
      if (!workflowItem) throw new Error('未获取到运输任务流程。');
      setWorkflow(workflowItem);
      void loadSuppliers();
    } catch (error) {
      const errorMessage = (error as Error).message;
      message.error(errorMessage);
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('sign in') || errorMessage.includes('登录')) {
        clearMobileSession();
        setUser(null);
        setWorkflow(null);
        setSelectedTodo(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const openTodo = async (todo: WorkflowTodo) => {
    if (!todo.taskId) return;
    await openTaskWorkflow(todo.taskId, todo);
  };

  const openAction = (node: WorkflowInstanceNode, mode: MobileActionMode) => {
    setAction({ open: true, mode, node } as MobileAction);
    const valueMap = Object.fromEntries((node.formValues ?? []).map((item) => [item.fieldKey, item.fieldValue]));
    form.setFieldsValue({
      operator: user?.realName ?? '',
      operationTime: nowInputValue(),
      remark: '',
      trackingStatus: '在途',
      content: '',
      supplierId: node.supplierId,
      supplierVehicleId: node.supplierVehicleId,
      supplierDriverId: node.supplierDriverId,
      uploadFiles: [],
      formValues: Object.fromEntries(
        (node.formFields ?? []).map((field) => [field.fieldKey, field.fieldType === 'datetime' ? nowInputValue() : valueMap[field.fieldKey] ?? '']),
      ),
    });
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
    const values = await form.validateFields();
    setSaving(true);
    try {
      const files = await uploadFiles(values.uploadFiles);
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
        const vehicle = supplier?.vehicles?.find((item) => item.id === values.supplierVehicleId);
        const driver = supplier?.drivers?.find((item) => item.id === values.supplierDriverId);
        await mobileApiRequest(`/api/workflow/instance-nodes/${action.node.id}/${action.mode}`, {
          method: 'POST',
          body: JSON.stringify({
            operator: values.operator,
            operationTime: normalizeDateTimeInput(values.operationTime),
            remark: values.remark,
            supplierId: values.supplierId,
            supplierName: supplier?.name ?? '',
            supplierType: supplier?.type ?? '',
            supplierVehicleId: values.supplierVehicleId,
            vehiclePlateNo: vehicle?.plateNo ?? '',
            supplierDriverId: values.supplierDriverId,
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
      if (selectedTodo) await openTodo(selectedTodo);
      await loadTodos();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setFatalError(event.message || '移动页面运行异常');
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || '移动页面请求异常');
      setFatalError(reason);
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
        void openTaskWorkflow(taskId);
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
      void openTodo(target);
    } else {
      void openTaskWorkflow(taskId);
    }
  }, [user, todos, selectedTodo]);

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
                }}
              >
                退出
              </Button>
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
                        <span>{[item.customerName, item.projectName].filter(Boolean).join(' / ')}</span>
                        <span>{formatBeijingTime(item.createdAt)}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Spin>
        </Card>

        {selectedTodo && workflow && workflowNodes.length > 0 ? (
          <Card title={`${selectedTodo.taskNo ?? '运输任务'} · 流程`} style={{ borderRadius: 16 }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="客户">{selectedTodo.customerName || '-'}</Descriptions.Item>
                <Descriptions.Item label="项目">{selectedTodo.projectName || '-'}</Descriptions.Item>
                <Descriptions.Item label="当前节点">{currentNode?.nodeName || '-'}</Descriptions.Item>
              </Descriptions>
              {currentNode ? (
                <Space wrap>
                  <Button type="primary" icon={<ClockCircleOutlined />} disabled={currentNode.status === '处理中'} onClick={() => openAction(currentNode, 'start')}>
                    开始
                  </Button>
                  <Button type="primary" icon={<CheckCircleOutlined />} disabled={currentNode.status !== '处理中'} onClick={() => openAction(currentNode, 'submit')}>
                    提交
                  </Button>
                  <Button disabled={currentNode.status !== '处理中'} onClick={() => openAction(currentNode, 'save')}>
                    草稿
                  </Button>
                  <Button disabled={currentNode.status !== '处理中'} onClick={() => openAction(currentNode, 'tracking')}>
                    增加记录
                  </Button>
                  <Button danger disabled={currentNode.status !== '处理中'} onClick={() => openAction(currentNode, 'exception')}>
                    异常
                  </Button>
                </Space>
              ) : null}
              <List
                dataSource={workflowNodes}
                renderItem={(node) => (
                  <List.Item style={{ paddingInline: 0 }}>
                    <List.Item.Meta title={node.nodeName} description={`状态：${node.status}，开始：${formatBeijingTime(node.startedAt)}，完成：${formatBeijingTime(node.completedAt)}`} />
                  </List.Item>
                )}
              />
            </Space>
          </Card>
        ) : null}
      </Space>

      <Drawer
        title={action.open ? `${action.node.nodeName} · ${actionLabels[action.mode]}` : '节点操作'}
        open={action.open}
        onClose={() => setAction({ open: false })}
        placement="bottom"
        height="88vh"
        rootClassName="mobile-workflow-drawer"
        styles={{ body: { padding: 14, overflowX: 'hidden' }, header: { padding: '14px 16px' } }}
        extra={
          <Space>
            <Button onClick={() => setAction({ open: false })}>取消</Button>
            <Button type="primary" loading={saving} onClick={() => void submitAction()}>
              提交
            </Button>
          </Space>
        }
      >
        {action.open ? (
          <Form form={form} layout="vertical">
            <Form.Item name="operator" label="操作人" rules={[{ required: true, message: '请选择操作人' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="operationTime" label={action.mode === 'tracking' ? '跟踪时间' : '操作时间'} rules={[{ required: true, message: '请选择时间' }]}>
              <Input type="datetime-local" />
            </Form.Item>
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
                  options={suppliers
                    .filter((supplier) => !action.node.supplierTypes?.length || action.node.supplierTypes.includes(String(supplier.type ?? '')))
                    .map((supplier) => ({ value: supplier.id, label: `${supplier.name}${supplier.type ? ` / ${supplier.type}` : ''}` }))}
                />
              </Form.Item>
            ) : null}
            {action.mode !== 'tracking' && action.node.requireVehicle ? (
              <Form.Item name="supplierVehicleId" label="服务车辆" rules={[{ required: action.mode === 'submit', message: '请选择服务车辆' }]}>
                <Select
                  showSearch
                  getPopupContainer={mobileSelectPopupContainer}
                  popupMatchSelectWidth={false}
                  optionFilterProp="label"
                  options={(selectedSupplier?.vehicles ?? []).map((vehicle) => ({
                    value: vehicle.id,
                    label: [vehicle.plateNo, vehicle.vehicleType, vehicle.vehicleLength].filter(Boolean).join(' / '),
                  }))}
                />
              </Form.Item>
            ) : null}
            {action.mode !== 'tracking' && action.node.requireDriver ? (
              <Form.Item name="supplierDriverId" label="服务司机" rules={[{ required: action.mode === 'submit', message: '请选择服务司机' }]}>
                <Select
                  showSearch
                  getPopupContainer={mobileSelectPopupContainer}
                  popupMatchSelectWidth={false}
                  optionFilterProp="label"
                  options={(selectedSupplier?.drivers ?? []).map((driver) => ({
                    value: driver.id,
                    label: [driver.name, driver.phone].filter(Boolean).join(' / '),
                  }))}
                />
              </Form.Item>
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
            <Form.Item name="uploadFiles" label="附件/照片" valuePropName="fileList" getValueFromEvent={(event) => event?.fileList ?? []}>
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
              <Upload beforeUpload={() => false} multiple>
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
