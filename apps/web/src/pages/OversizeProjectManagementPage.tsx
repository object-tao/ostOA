import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Timeline,
  Upload,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import {
  AlertOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { apiRequest } from '../api/client';
import { beijingTimeValue, formatBeijingTime } from '../utils/date';

type ProjectCustomer = {
  id: string;
  name: string;
  shortName?: string | null;
};

type EmployeeOption = {
  id: string;
  name: string;
  department?: string | null;
  position?: string | null;
  status?: string | null;
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

type SupplierVehicleOption = {
  id: string;
  plateNo?: string | null;
  vehicleType?: string | null;
  requiredVehicleType?: string | null;
  vehicleLength?: string | null;
  axle?: string | null;
};

type SupplierDriverOption = {
  id: string;
  name: string;
  phone?: string | null;
};

type SupplierOption = {
  id: string;
  name: string;
  supplierCode?: string | null;
  type: string;
  contactInfo?: string | null;
  vehicles?: SupplierVehicleOption[];
  drivers?: SupplierDriverOption[];
};

type WorkflowTemplateNodeOption = {
  id: string;
  nodeName: string;
  sortOrder: number;
};

type WorkflowTemplateOption = {
  id: string;
  name: string;
  businessType: string;
  enabled: boolean;
  nodes: WorkflowTemplateNodeOption[];
};

type OversizeTaskNode = {
  id: string;
  projectId: string;
  taskId: string;
  nodeName: string;
  sortOrder: number;
  status: string;
  owner?: string | null;
  plannedDate?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  files: ProjectFile[];
};

type OversizeTask = {
  id: string;
  projectId: string;
  taskNo: string;
  vehicleNo?: string | null;
  vehicleType?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  cargoSummary?: string | null;
  plannedDepartureDate?: string | null;
  status: string;
  progress: number;
  notes?: string | null;
  workflowInstanceId?: string | null;
  workflowStatus?: string | null;
  workflowCurrentNodeId?: string | null;
  workflowCurrentNodeName?: string | null;
  workflowCurrentNodeStatus?: string | null;
  nodes: OversizeTaskNode[];
  workflowNodes?: WorkflowInstanceNode[];
};

type WorkflowFormValue = {
  fieldKey: string;
  fieldName: string;
  fieldType: string;
  fieldValue?: string | null;
};

type WorkflowTransition = {
  id: string;
  operator?: string | null;
  action: string;
  fromNodeName?: string | null;
  toNodeName?: string | null;
  fromStatus?: string | null;
  toStatus?: string | null;
  remark?: string | null;
  createdAt: string;
};

type WorkflowTrackingRecord = {
  id: string;
  instanceId: string;
  instanceNodeId: string;
  projectId: string;
  taskId: string;
  nodeName: string;
  trackedAt: string;
  location?: string | null;
  trackingStatus?: string | null;
  content: string;
  operator?: string | null;
  customerVisible: boolean;
  visibilityLevel?: string | null;
  files: ProjectFile[];
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
};

type WorkflowInstanceNode = {
  id: string;
  instanceId: string;
  taskId: string;
  projectId: string;
  nodeName: string;
  sortOrder: number;
  nodeType: string;
  owner?: string | null;
  status: string;
  required: boolean;
  allowSkip: boolean;
  allowReturn: boolean;
  requireCustomerConfirm: boolean;
  requireSupplier: boolean;
  supplierTypes?: string[];
  requireVehicle: boolean;
  requireDriver: boolean;
  supplierId?: string | null;
  supplierName?: string | null;
  supplierType?: string | null;
  supplierVehicleId?: string | null;
  vehiclePlateNo?: string | null;
  supplierDriverId?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  serviceCost?: number | null;
  serviceCurrency?: string | null;
  serviceExchangeRate?: number | null;
  serviceRemark?: string | null;
  timeoutAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  formFields: Array<{
    fieldKey: string;
    fieldName: string;
    fieldType: string;
    required: boolean;
    options?: string[];
  }>;
  formValues: WorkflowFormValue[];
  files: ProjectFile[];
  fileRequirements?: Array<{
    id: string;
    fileName: string;
    required: boolean;
    allowedTypes?: string | null;
    maxCount?: number | null;
    customerVisible?: boolean;
    downloadable?: boolean;
  }>;
  trackingRecords?: WorkflowTrackingRecord[];
};

type WorkflowInstance = {
  id: string;
  taskId: string;
  projectId: string;
  templateId: string;
  status: string;
  currentNodeId?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  nodes: WorkflowInstanceNode[];
  transitions: WorkflowTransition[];
  trackingRecords?: WorkflowTrackingRecord[];
};

type TaskCostItem = {
  id: string;
  itemNo: string;
  direction: 'receivable' | 'payable';
  taskId?: string | null;
  workflowInstanceNodeId?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  feeName: string;
  currency: string;
  amount: number;
  exchangeRate: number;
  amountCny: number;
  status: string;
  occurrenceStage?: string | null;
  sourceType?: string | null;
  files?: ProjectFile[];
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type OversizeTodo = {
  id: string;
  projectId: string;
  taskId?: string | null;
  nodeId?: string | null;
  title: string;
  owner?: string | null;
  dueDate?: string | null;
  status: string;
  priority: string;
  notes?: string | null;
};

type OversizeException = {
  id: string;
  projectId: string;
  taskId?: string | null;
  nodeId?: string | null;
  title: string;
  level: string;
  status: string;
  owner?: string | null;
  description?: string | null;
  resolution?: string | null;
};

type OversizeProject = {
  id: string;
  projectNo: string;
  name: string;
  customerId?: string | null;
  customerName?: string | null;
  origin: string;
  destination: string;
  startDate?: string | null;
  endDate?: string | null;
  manager?: string | null;
  status: string;
  serviceScope: string[];
  workflowTemplateId?: string | null;
  workflowNodeIds?: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: OversizeTask[];
  todos: OversizeTodo[];
  exceptions: OversizeException[];
  totalTasks: number;
  completedTasks: number;
  pendingTodoCount: number;
  abnormalCount: number;
  progress: number;
};

type FormMode<T> = {
  open: boolean;
  record?: T | null;
};

type UploadResult = {
  key: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
};

type OversizeProjectManagementPageProps = {
  customers: ProjectCustomer[];
};

const projectStatuses = ['待启动', '执行中', '暂停', '异常', '已完成', '已取消'];
const taskStatuses = ['待发运', '运输中', '已到达', '暂停', '异常', '已完成'];
const nodeStatuses = ['未开始', '进行中', '已完成', '异常'];
const todoStatuses = ['待处理', '处理中', '已完成'];
const exceptionStatuses = ['处理中', '已解决', '已关闭'];
const exceptionLevels = ['一般', '重要', '紧急'];
const priorities = ['普通', '重要', '紧急'];
const serviceScopeOptions = ['国内运输', '国际运输', '接车验货', '装车报关', '转关', '清关', '卸货'];
const taskFollowFlow = ['国内运输', '接车验货', '装车报关', '转关', '国际运输', '清关', '卸货', '完成'];
const trackingStatusOptions = ['已提货', '在途', '到达', '等待', '查验', '文件已提交', '已同步客户', '异常', '其他'];
const workflowTransitionActions = ['start', 'save', 'submit', 'return', 'skip', 'hold', 'exception', 'reassign'];

const statusColor: Record<string, string> = {
  待启动: 'default',
  执行中: 'processing',
  暂停: 'warning',
  异常: 'error',
  已完成: 'success',
  已取消: 'default',
  待发运: 'default',
  运输中: 'processing',
  已到达: 'cyan',
  未开始: 'default',
  进行中: 'processing',
  待处理: 'warning',
  处理中: 'processing',
  已解决: 'success',
  已关闭: 'default',
};

const fileUrl = (url: string) => {
  if (url.startsWith('http')) return url;
  return url;
};

const toDateValue = (value?: string | null) => (value ? dayjs(value) : undefined);
const serializeDateValue = (value: unknown, format = 'YYYY-MM-DD') => (dayjs.isDayjs(value) ? value.format(format) : value || null);
const trackingTimeValue = (value?: string | null) => {
  return beijingTimeValue(value);
};
const trackingDateText = (value?: string | null) => {
  return formatBeijingTime(value);
};
const isWorkflowNodeStarted = (node: Pick<WorkflowInstanceNode, 'startedAt' | 'status'>) =>
  Boolean(node.startedAt) || ['处理中', '已完成', '已退回', '已跳过', '已挂起', '异常'].includes(node.status);
const sortTrackingRecords = <T extends { trackedAt?: string | null; createdAt?: string | null }>(records?: T[]) =>
  [...(records ?? [])].sort((a, b) => trackingTimeValue(b.trackedAt || b.createdAt) - trackingTimeValue(a.trackedAt || a.createdAt));
const isCompletedTask = (task?: Pick<OversizeTask, 'status' | 'workflowStatus' | 'progress'> | null) =>
  Boolean(task && (task.status === '已完成' || task.status === '完成' || task.workflowStatus === '已完成' || Number(task.progress) >= 100));

export function OversizeProjectManagementPage({ customers }: OversizeProjectManagementPageProps) {
  const [projects, setProjects] = useState<OversizeProject[]>([]);
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplateOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedTemplateIdForProject, setSelectedTemplateIdForProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectModal, setProjectModal] = useState<FormMode<OversizeProject>>({ open: false });
  const [taskModal, setTaskModal] = useState<FormMode<OversizeTask>>({ open: false });
  const [todoModal, setTodoModal] = useState<FormMode<OversizeTodo>>({ open: false });
  const [exceptionModal, setExceptionModal] = useState<FormMode<OversizeException>>({ open: false });
  const [nodeModal, setNodeModal] = useState<FormMode<OversizeTaskNode>>({ open: false });
  const [projectForm] = Form.useForm();
  const [taskForm] = Form.useForm();
  const [todoForm] = Form.useForm();
  const [exceptionForm] = Form.useForm();
  const [nodeForm] = Form.useForm();

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const flattenedNodes = useMemo(() => {
    if (!selectedProject) return [];
    return selectedProject.tasks.flatMap((task) =>
      (task.workflowNodes?.length ? task.workflowNodes : task.nodes).map((node) => ({
        ...node,
        taskNo: task.taskNo,
        vehicleNo: task.vehicleNo,
        vehicleType: task.vehicleType,
      })),
    );
  }, [selectedProject]);

  const summary = useMemo(
    () => ({
      activeProjects: projects.filter((item) => item.status === '执行中' || item.status === '待启动').length,
      abnormalProjects: projects.filter((item) => item.status === '异常' || item.abnormalCount > 0).length,
      pendingTodos: projects.reduce((sum, item) => sum + item.pendingTodoCount, 0),
      taskCount: projects.reduce((sum, item) => sum + item.totalTasks, 0),
    }),
    [projects],
  );

  const selectedProjectTemplate = useMemo(
    () => workflowTemplates.find((item) => item.id === selectedTemplateIdForProject),
    [workflowTemplates, selectedTemplateIdForProject],
  );

  const employeeSelectOptions = useMemo(
    () =>
      employees
        .filter((item) => item.status !== 'INACTIVE')
        .map((item) => ({
          value: item.name,
          label: item.department || item.position ? `${item.name}（${[item.department, item.position].filter(Boolean).join(' / ')}）` : item.name,
        })),
    [employees],
  );

  const loadProjects = async () => {
    setLoading(true);
    try {
      const [projectResult, templateResult, employeeResult] = await Promise.all([
        apiRequest<{ items: OversizeProject[] }>('/api/oversize-projects'),
        apiRequest<{ items: WorkflowTemplateOption[] }>('/api/workflow/templates'),
        apiRequest<{ items: EmployeeOption[] }>('/api/employees'),
      ]);
      setProjects(projectResult.items ?? []);
      setWorkflowTemplates(templateResult.items ?? []);
      setEmployees(employeeResult.items ?? []);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const reloadAndKeepSelection = async () => {
    await loadProjects();
  };

  const openProjectModal = (record?: OversizeProject) => {
    setProjectModal({ open: true, record });
    const defaultTemplateId = record?.workflowTemplateId || workflowTemplates.find((item) => item.enabled)?.id || workflowTemplates[0]?.id || 'wft_oversize_standard';
    setSelectedTemplateIdForProject(defaultTemplateId);
    const defaultTemplate = workflowTemplates.find((item) => item.id === defaultTemplateId);
    projectForm.setFieldsValue(
      record
        ? {
            ...record,
            startDate: toDateValue(record.startDate),
            endDate: toDateValue(record.endDate),
            serviceScope: record.serviceScope?.length ? record.serviceScope : serviceScopeOptions,
            workflowTemplateId: defaultTemplateId,
            workflowNodeIds: record.workflowNodeIds?.length ? record.workflowNodeIds : defaultTemplate?.nodes?.map((node) => node.id),
          }
        : {
            status: '待启动',
            serviceScope: serviceScopeOptions,
            vehicleCount: 1,
            workflowTemplateId: defaultTemplateId,
            workflowNodeIds: defaultTemplate?.nodes?.map((node) => node.id),
          },
    );
  };

  const saveProject = async () => {
    const values = await projectForm.validateFields();
    const customer = customers.find((item) => item.id === values.customerId);
    setSaving(true);
    try {
      const result = await apiRequest<{ id?: string; ok?: boolean }>(projectModal.record ? `/api/oversize-projects/${projectModal.record.id}` : '/api/oversize-projects', {
        method: projectModal.record ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...values,
          startDate: serializeDateValue(values.startDate),
          endDate: serializeDateValue(values.endDate),
          customerName: customer?.name ?? values.customerName ?? '',
        }),
      });
      message.success(projectModal.record ? '项目已更新' : '项目已创建');
      setProjectModal({ open: false });
      await reloadAndKeepSelection();
      if (!projectModal.record && result.id) {
        setSelectedProjectId(result.id);
      }
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (record: OversizeProject) => {
    await apiRequest(`/api/oversize-projects/${record.id}`, { method: 'DELETE' });
    message.success('项目已删除');
    if (selectedProjectId === record.id) {
      setSelectedProjectId(null);
    }
    await loadProjects();
  };

  const openTaskModal = (record?: OversizeTask) => {
    if (isCompletedTask(record)) {
      message.info('运输任务已完成，不能再编辑。');
      return;
    }
    setTaskModal({ open: true, record });
    taskForm.setFieldsValue(
      record
        ? {
            ...record,
            plannedDepartureDate: toDateValue(record.plannedDepartureDate),
          }
        : { status: '待发运', progress: 0 },
    );
  };

  const saveTask = async () => {
    if (!selectedProject) return;
    const values = await taskForm.validateFields();
    setSaving(true);
    try {
      await apiRequest(taskModal.record ? `/api/oversize-project-tasks/${taskModal.record.id}` : `/api/oversize-projects/${selectedProject.id}/tasks`, {
        method: taskModal.record ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...values,
          plannedDepartureDate: serializeDateValue(values.plannedDepartureDate),
        }),
      });
      message.success(taskModal.record ? '运输任务已更新' : '运输任务已新增');
      setTaskModal({ open: false });
      await reloadAndKeepSelection();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (record: OversizeTask) => {
    if (isCompletedTask(record)) {
      message.info('运输任务已完成，不能再操作。');
      return;
    }
    await apiRequest(`/api/oversize-project-tasks/${record.id}`, { method: 'DELETE' });
    message.success('运输任务已删除');
    await loadProjects();
  };

  const openNodeModal = (record: OversizeTaskNode) => {
    setNodeModal({ open: true, record });
    nodeForm.setFieldsValue({
      ...record,
      plannedDate: toDateValue(record.plannedDate),
      completedAt: toDateValue(record.completedAt),
      uploadFiles: [],
    });
  };

  const uploadFiles = async (files?: UploadFile[]) => {
    const selectedFiles = (files ?? []).filter((item) => item.originFileObj);
    const uploaded: ProjectFile[] = [];
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('folder', 'oversize-projects');
      formData.append('file', file.originFileObj as File);
      const result = await apiRequest<UploadResult>('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      uploaded.push(result);
    }
    return uploaded;
  };

  const saveNode = async () => {
    if (!nodeModal.record) return;
    const values = await nodeForm.validateFields();
    setSaving(true);
    try {
      const uploaded = await uploadFiles(values.uploadFiles);
      await apiRequest(`/api/oversize-task-nodes/${nodeModal.record.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: values.status,
          owner: values.owner,
          plannedDate: serializeDateValue(values.plannedDate),
          completedAt: serializeDateValue(values.completedAt, 'YYYY-MM-DD HH:mm'),
          notes: values.notes,
          files: [...(nodeModal.record.files ?? []), ...uploaded],
        }),
      });
      message.success('节点已更新');
      setNodeModal({ open: false });
      await reloadAndKeepSelection();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const openTodoModal = (record?: OversizeTodo) => {
    setTodoModal({ open: true, record });
    todoForm.setFieldsValue(record ? { ...record, dueDate: toDateValue(record.dueDate) } : { status: '待处理', priority: '普通' });
  };

  const saveTodo = async () => {
    if (!selectedProject) return;
    const values = await todoForm.validateFields();
    setSaving(true);
    try {
      await apiRequest(todoModal.record ? `/api/oversize-project-todos/${todoModal.record.id}` : `/api/oversize-projects/${selectedProject.id}/todos`, {
        method: todoModal.record ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...values,
          dueDate: serializeDateValue(values.dueDate),
        }),
      });
      message.success(todoModal.record ? '待办已更新' : '待办已新增');
      setTodoModal({ open: false });
      await reloadAndKeepSelection();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTodo = async (record: OversizeTodo) => {
    await apiRequest(`/api/oversize-project-todos/${record.id}`, { method: 'DELETE' });
    message.success('待办已删除');
    await loadProjects();
  };

  const openExceptionModal = (record?: OversizeException) => {
    setExceptionModal({ open: true, record });
    exceptionForm.setFieldsValue(record ?? { status: '处理中', level: '一般' });
  };

  const saveException = async () => {
    if (!selectedProject) return;
    const values = await exceptionForm.validateFields();
    setSaving(true);
    try {
      await apiRequest(
        exceptionModal.record ? `/api/oversize-project-exceptions/${exceptionModal.record.id}` : `/api/oversize-projects/${selectedProject.id}/exceptions`,
        {
          method: exceptionModal.record ? 'PUT' : 'POST',
          body: JSON.stringify(values),
        },
      );
      message.success(exceptionModal.record ? '异常已更新' : '异常已新增');
      setExceptionModal({ open: false });
      await reloadAndKeepSelection();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteException = async (record: OversizeException) => {
    await apiRequest(`/api/oversize-project-exceptions/${record.id}`, { method: 'DELETE' });
    message.success('异常已删除');
    await loadProjects();
  };

  const projectColumns: ColumnsType<OversizeProject> = [
    {
      title: '项目编号',
      dataIndex: 'projectNo',
      width: 180,
      render: (value, record) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => setSelectedProjectId(record.id)}>
          {value}
        </Button>
      ),
    },
    { title: '项目名称', dataIndex: 'name', width: 220 },
    { title: '客户', dataIndex: 'customerName', width: 180 },
    { title: '路线', width: 240, render: (_, record) => `${record.origin} → ${record.destination}` },
    { title: '业务员', dataIndex: 'manager', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (value) => <Tag color={statusColor[value] ?? 'default'}>{value}</Tag>,
    },
    { title: '进度', dataIndex: 'progress', width: 160, render: (value) => <Progress percent={Number(value) || 0} size="small" /> },
    { title: '运输任务', dataIndex: 'totalTasks', width: 100 },
    { title: '待办', dataIndex: 'pendingTodoCount', width: 80 },
    { title: '异常', dataIndex: 'abnormalCount', width: 80 },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openProjectModal(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该项目？" onConfirm={() => void deleteProject(record)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const taskColumns: ColumnsType<OversizeTask> = [
    { title: '任务号', dataIndex: 'taskNo', width: 170 },
    { title: '车牌/车辆', dataIndex: 'vehicleNo', width: 140 },
    { title: '车型', dataIndex: 'vehicleType', width: 160 },
    { title: '司机', dataIndex: 'driverName', width: 120 },
    { title: '货物摘要', dataIndex: 'cargoSummary', width: 220 },
    { title: '计划发运', dataIndex: 'plannedDepartureDate', width: 120 },
    { title: '状态', dataIndex: 'status', width: 100, render: (value) => <Tag color={statusColor[value] ?? 'default'}>{value}</Tag> },
    {
      title: '当前节点',
      width: 130,
      render: (_, record) => <Tag color={record.workflowCurrentNodeStatus === '异常' ? 'error' : 'processing'}>{record.workflowCurrentNodeName || '-'}</Tag>,
    },
    { title: '进度', dataIndex: 'progress', width: 140, render: (value) => <Progress percent={Number(value) || 0} size="small" /> },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      render: (_, record) =>
        isCompletedTask(record) ? (
          <Tag color="success">已完成</Tag>
        ) : (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openTaskModal(record)} />
            <Popconfirm title="确认删除运输任务？" onConfirm={() => void deleteTask(record)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
    },
  ];

  const nodeColumns: ColumnsType<(OversizeTaskNode | WorkflowInstanceNode) & { taskNo: string; vehicleNo?: string | null; vehicleType?: string | null }> = [
    { title: '运输任务', dataIndex: 'taskNo', width: 170 },
    { title: '车辆', dataIndex: 'vehicleNo', width: 120 },
    { title: '节点', dataIndex: 'nodeName', width: 130 },
    { title: '服务供应商', dataIndex: 'supplierName', width: 180, render: (value) => value || '-' },
    { title: '服务车辆', dataIndex: 'vehiclePlateNo', width: 130, render: (value) => value || '-' },
    { title: '服务司机', dataIndex: 'driverName', width: 120, render: (value) => value || '-' },
    { title: '计划/超时', width: 170, render: (_, record) => ('timeoutAt' in record ? record.timeoutAt || '-' : (record as OversizeTaskNode).plannedDate || '-') },
    { title: '开始时间', dataIndex: 'startedAt', width: 150, render: (value) => trackingDateText(value) },
    { title: '完成时间', dataIndex: 'completedAt', width: 150, render: (value) => trackingDateText(value) },
    { title: '状态', dataIndex: 'status', width: 100, render: (value) => <Tag color={statusColor[value] ?? 'default'}>{value}</Tag> },
    {
      title: '资料',
      width: 140,
      render: (_, record) =>
        record.files?.length ? (
          <Space wrap>
            {record.files.map((file) => (
              <a key={file.key ?? file.fileUrl} href={fileUrl(file.fileUrl)} target="_blank" rel="noreferrer">
                <PaperClipOutlined /> {file.fileName}
                {file.visibilityLevel ? <Tag style={{ marginLeft: 4 }}>{file.visibilityLevel}</Tag> : null}
              </a>
            ))}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      width: 100,
      fixed: 'right',
      render: (_, record) => 'instanceId' in record ? '-' : (
        <Button size="small" icon={<EditOutlined />} onClick={() => openNodeModal(record as OversizeTaskNode)}>
          更新
        </Button>
      ),
    },
  ];

  const todoColumns: ColumnsType<OversizeTodo> = [
    { title: '待办', dataIndex: 'title', width: 220 },
    { title: '负责人', dataIndex: 'owner', width: 120 },
    { title: '截止日期', dataIndex: 'dueDate', width: 120 },
    { title: '优先级', dataIndex: 'priority', width: 100, render: (value) => <Tag color={value === '紧急' ? 'red' : value === '重要' ? 'orange' : 'default'}>{value}</Tag> },
    { title: '状态', dataIndex: 'status', width: 100, render: (value) => <Tag color={statusColor[value] ?? 'default'}>{value}</Tag> },
    {
      title: '操作',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openTodoModal(record)} />
          <Popconfirm title="确认删除待办？" onConfirm={() => void deleteTodo(record)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const exceptionColumns: ColumnsType<OversizeException> = [
    { title: '异常', dataIndex: 'title', width: 220 },
    { title: '级别', dataIndex: 'level', width: 100, render: (value) => <Tag color={value === '紧急' ? 'red' : value === '重要' ? 'orange' : 'default'}>{value}</Tag> },
    { title: '负责人', dataIndex: 'owner', width: 120 },
    { title: '状态', dataIndex: 'status', width: 100, render: (value) => <Tag color={statusColor[value] ?? 'default'}>{value}</Tag> },
    { title: '说明', dataIndex: 'description', width: 260 },
    {
      title: '操作',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openExceptionModal(record)} />
          <Popconfirm title="确认删除异常？" onConfirm={() => void deleteException(record)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="执行项目" value={summary.activeProjects} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="运输任务" value={summary.taskCount} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="待办事项" value={summary.pendingTodos} prefix={<PaperClipOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="异常项目" value={summary.abnormalProjects} prefix={<AlertOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card
        className="glass-card"
        title="大件运输项目"
        bordered={false}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => void loadProjects()} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openProjectModal()}>
              新建项目
            </Button>
          </Space>
        }
      >
        <Table rowKey="id" loading={loading} dataSource={projects} columns={projectColumns} scroll={{ x: 1400 }} pagination={{ pageSize: 10 }} />
      </Card>

      <Drawer
        title={selectedProject ? `${selectedProject.projectNo} · ${selectedProject.name}` : '项目详情'}
        open={Boolean(selectedProject)}
        width={1180}
        onClose={() => setSelectedProjectId(null)}
        destroyOnClose
      >
        {selectedProject ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered size="small" column={3}>
              <Descriptions.Item label="客户">{selectedProject.customerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="路线">{`${selectedProject.origin} → ${selectedProject.destination}`}</Descriptions.Item>
              <Descriptions.Item label="业务员">{selectedProject.manager || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColor[selectedProject.status] ?? 'default'}>{selectedProject.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="项目周期">
                {selectedProject.startDate || '-'} 至 {selectedProject.endDate || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={selectedProject.progress} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="服务范围" span={3}>
                <Space wrap>
                  {selectedProject.serviceScope.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={3}>
                {selectedProject.notes || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Tabs
              items={[
                {
                  key: 'tasks',
                  label: '运输任务',
                  children: (
                    <Card
                      size="small"
                      extra={
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openTaskModal()}>
                          新增运输任务
                        </Button>
                      }
                    >
                      <Table rowKey="id" dataSource={selectedProject.tasks} columns={taskColumns} scroll={{ x: 1200 }} pagination={false} />
                    </Card>
                  ),
                },
                {
                  key: 'nodes',
                  label: '流程节点',
                  children: <Table rowKey="id" dataSource={flattenedNodes} columns={nodeColumns} scroll={{ x: 1300 }} pagination={{ pageSize: 20 }} />,
                },
                {
                  key: 'todos',
                  label: '待办提醒',
                  children: (
                    <Card
                      size="small"
                      extra={
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openTodoModal()}>
                          新增待办
                        </Button>
                      }
                    >
                      <Table rowKey="id" dataSource={selectedProject.todos} columns={todoColumns} scroll={{ x: 900 }} pagination={false} />
                    </Card>
                  ),
                },
                {
                  key: 'exceptions',
                  label: '异常风险',
                  children: (
                    <Card
                      size="small"
                      extra={
                        <Button type="primary" danger icon={<PlusOutlined />} onClick={() => openExceptionModal()}>
                          新增异常
                        </Button>
                      }
                    >
                      <Table rowKey="id" dataSource={selectedProject.exceptions} columns={exceptionColumns} scroll={{ x: 1000 }} pagination={false} />
                    </Card>
                  ),
                },
              ]}
            />
          </Space>
        ) : null}
      </Drawer>

      <Modal title={projectModal.record ? '编辑项目' : '新建项目'} open={projectModal.open} onCancel={() => setProjectModal({ open: false })} onOk={saveProject} confirmLoading={saving} width={760} zIndex={1300}>
        <Form form={projectForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerId" label="客户名称">
                <Select allowClear showSearch optionFilterProp="label" options={customers.map((item) => ({ value: item.id, label: item.shortName || item.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="origin" label="起运地" rules={[{ required: true, message: '请输入起运地' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="destination" label="目的地" rules={[{ required: true, message: '请输入目的地' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="manager" label="业务员">
                <Select allowClear showSearch optionFilterProp="label" options={employeeSelectOptions} placeholder="请选择业务员" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="项目状态">
                <Select options={projectStatuses.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            {!projectModal.record ? (
              <Col span={12}>
                <Form.Item name="vehicleCount" label="车数量" rules={[{ required: true, message: '请输入车数量' }]}>
                  <InputNumber min={0} max={200} precision={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            ) : null}
            <Col span={12}>
              <Form.Item name="startDate" label="开始时间">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="结束时间">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="serviceScope" label="服务范围" rules={[{ required: true, message: '请选择服务范围' }]}>
                <Select mode="multiple" options={serviceScopeOptions.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="workflowTemplateId" label="流程模板" rules={[{ required: true, message: '请选择流程模板' }]}>
                <Select
                  options={workflowTemplates.map((item) => ({ value: item.id, label: item.name }))}
                  onChange={(value) => {
                    setSelectedTemplateIdForProject(value);
                    const template = workflowTemplates.find((item) => item.id === value);
                    projectForm.setFieldValue('workflowNodeIds', template?.nodes?.map((node) => node.id) ?? []);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="workflowNodeIds" label="经过流程节点" rules={[{ required: true, message: '请选择至少一个流程节点' }]}>
                <Select
                  mode="multiple"
                  options={(selectedProjectTemplate?.nodes ?? []).map((node) => ({ value: node.id, label: node.nodeName }))}
                  placeholder="选择本项目需要经过的节点"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="notes" label="项目备注">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal title={taskModal.record ? '编辑运输任务' : '新增运输任务'} open={taskModal.open} onCancel={() => setTaskModal({ open: false })} onOk={saveTask} confirmLoading={saving} width={760} zIndex={1300}>
        <Form form={taskForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vehicleNo" label="车牌/车辆编号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="vehicleType" label="车型">
                <Input placeholder="例如 17米5轴平板" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="driverName" label="司机名称">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="driverPhone" label="司机电话">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="plannedDepartureDate" label="计划发运">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select options={taskStatuses.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="progress" label="进度">
                <Select options={[0, 25, 50, 75, 100].map((item) => ({ value: item, label: `${item}%` }))} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="cargoSummary" label="货物摘要">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="notes" label="备注">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="更新流程节点" open={nodeModal.open} onCancel={() => setNodeModal({ open: false })} onOk={saveNode} confirmLoading={saving} width={720} zIndex={1300}>
        <Form form={nodeForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="节点状态">
                <Select options={nodeStatuses.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="owner" label="负责人">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="plannedDate" label="计划日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="completedAt" label="完成时间">
                <DatePicker showTime style={{ width: '100%' }} placeholder="留空则完成时自动生成" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="uploadFiles" label="上传节点资料" valuePropName="fileList" getValueFromEvent={(event) => event?.fileList ?? []}>
                <Upload beforeUpload={() => false} multiple>
                  <Button icon={<UploadOutlined />}>选择附件</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="notes" label="节点备注">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal title={todoModal.record ? '编辑待办' : '新增待办'} open={todoModal.open} onCancel={() => setTodoModal({ open: false })} onOk={saveTodo} confirmLoading={saving} zIndex={1300}>
        <Form form={todoForm} layout="vertical">
          <Form.Item name="title" label="待办标题" rules={[{ required: true, message: '请输入待办标题' }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="owner" label="负责人">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueDate" label="截止日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="优先级">
                <Select options={priorities.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select options={todoStatuses.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={exceptionModal.record ? '编辑异常' : '新增异常'} open={exceptionModal.open} onCancel={() => setExceptionModal({ open: false })} onOk={saveException} confirmLoading={saving} width={680} zIndex={1300}>
        <Form form={exceptionForm} layout="vertical">
          <Form.Item name="title" label="异常标题" rules={[{ required: true, message: '请输入异常标题' }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="level" label="级别">
                <Select options={exceptionLevels.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select options={exceptionStatuses.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="owner" label="负责人">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="异常说明">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="resolution" label="处理方案">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

type OversizeTaskListItem = OversizeTask & {
  projectNo: string;
  projectName: string;
  customerName?: string | null;
};

type OversizeTaskOpenRequest = {
  taskId: string;
  nodeId?: string | null;
  requestId: number;
};

export function OversizeTaskManagementPage({ openRequest }: { openRequest?: OversizeTaskOpenRequest | null }) {
  const [projects, setProjects] = useState<OversizeProject[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [taskModal, setTaskModal] = useState<FormMode<OversizeTaskListItem>>({ open: false });
  const [selectedTask, setSelectedTask] = useState<OversizeTaskListItem | null>(null);
  const [taskWorkflow, setTaskWorkflow] = useState<WorkflowInstance | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowNodeModal, setWorkflowNodeModal] = useState<FormMode<WorkflowInstanceNode>>({ open: false });
  const [trackingModal, setTrackingModal] = useState<FormMode<WorkflowTrackingRecord> & { node?: WorkflowInstanceNode | null }>({ open: false });
  const [costItems, setCostItems] = useState<TaskCostItem[]>([]);
  const [costModal, setCostModal] = useState<FormMode<TaskCostItem>>({ open: false });
  const [workflowAction, setWorkflowAction] = useState('save');
  const [activeFollowStatus, setActiveFollowStatus] = useState<string | null>(null);
  const [taskFilters, setTaskFilters] = useState({
    taskNo: '',
    customerName: '',
    projectName: '',
    status: undefined as string | undefined,
    currentNode: undefined as string | undefined,
  });
  const [taskForm] = Form.useForm();
  const [workflowForm] = Form.useForm();
  const [trackingForm] = Form.useForm();
  const [costForm] = Form.useForm();
  const selectedWorkflowSupplierId = Form.useWatch('supplierId', workflowForm);
  const selectedWorkflowVehicleId = Form.useWatch('supplierVehicleId', workflowForm);
  const selectedWorkflowSupplier = suppliers.find((item) => item.id === selectedWorkflowSupplierId);
  const selectedWorkflowVehicle = selectedWorkflowSupplier?.vehicles?.find((item) => item.id === selectedWorkflowVehicleId);

  const employeeSelectOptions = useMemo(
    () =>
      employees
        .filter((item) => item.status !== 'INACTIVE')
        .map((item) => ({
          value: item.name,
          label: item.department || item.position ? `${item.name}（${[item.department, item.position].filter(Boolean).join(' / ')}）` : item.name,
        })),
    [employees],
  );

  const tasks = useMemo(
    () =>
      projects.flatMap((project) =>
        project.tasks.map((task) => ({
          ...task,
          projectNo: project.projectNo,
          projectName: project.name,
          customerName: project.customerName,
        })),
      ),
    [projects],
  );

  const currentTaskNode = (task: OversizeTaskListItem) => {
    if (task.status === '已完成') return '完成';
    if (task.workflowStatus === '已完成') return '完成';
    if (task.workflowCurrentNodeName) return task.workflowCurrentNodeName;
    const flowNodeNames = taskFollowFlow.filter((item) => item !== '完成');
    const nodes = [...(task.nodes ?? [])].sort((a, b) => {
      const flowDiff = flowNodeNames.indexOf(a.nodeName) - flowNodeNames.indexOf(b.nodeName);
      return flowDiff || Number(a.sortOrder) - Number(b.sortOrder);
    });
    const activeNode = nodes.find((node) => node.status === '异常' || node.status === '进行中');
    if (activeNode) return activeNode.nodeName;
    const nextNode = nodes.find((node) => node.status !== '已完成');
    if (nextNode) {
      const anyStarted = nodes.some((node) => node.status === '已完成' || node.status === '进行中' || node.status === '异常');
      return anyStarted || task.status === '运输中' || task.status === '已到达' ? nextNode.nodeName : flowNodeNames[0];
    }
    return nodes.length ? '完成' : flowNodeNames[0];
  };

  const followCounts = useMemo(() => {
    const counts = new Map(taskFollowFlow.map((item) => [item, 0]));
    tasks.forEach((task) => {
      const nodeName = currentTaskNode(task);
      counts.set(nodeName, (counts.get(nodeName) ?? 0) + 1);
    });
    return counts;
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const normalize = (value: unknown) => String(value ?? '').trim().toLowerCase();
    const taskNoKeyword = normalize(taskFilters.taskNo);
    const customerKeyword = normalize(taskFilters.customerName);
    const projectKeyword = normalize(taskFilters.projectName);
    return (activeFollowStatus ? tasks.filter((task) => currentTaskNode(task) === activeFollowStatus) : tasks).filter((task) => {
      const nodeName = currentTaskNode(task);
      if (taskNoKeyword && !normalize(task.taskNo).includes(taskNoKeyword)) return false;
      if (customerKeyword && !normalize(task.customerName).includes(customerKeyword)) return false;
      if (projectKeyword && !normalize(task.projectName).includes(projectKeyword) && !normalize(task.projectNo).includes(projectKeyword)) return false;
      if (taskFilters.status && task.status !== taskFilters.status) return false;
      if (taskFilters.currentNode && nodeName !== taskFilters.currentNode) return false;
      return true;
    });
  }, [activeFollowStatus, taskFilters, tasks]);

  const workflowSupplierOptions = useMemo(() => {
    const allowedTypes = workflowNodeModal.record?.supplierTypes ?? [];
    return suppliers
      .filter((supplier) => !allowedTypes.length || allowedTypes.includes(supplier.type))
      .map((supplier) => ({
        value: supplier.id,
        label: `${supplier.supplierCode ? `${supplier.supplierCode} · ` : ''}${supplier.name}（${supplier.type}）`,
      }));
  }, [suppliers, workflowNodeModal.record]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const [projectResult, employeeResult, supplierResult] = await Promise.all([
        apiRequest<{ items: OversizeProject[] }>('/api/oversize-projects'),
        apiRequest<{ items: EmployeeOption[] }>('/api/employees'),
        apiRequest<{ items: SupplierOption[] }>('/api/suppliers'),
      ]);
      setProjects(projectResult.items ?? []);
      setEmployees(employeeResult.items ?? []);
      setSuppliers(supplierResult.items ?? []);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  useEffect(() => {
    if (!openRequest?.taskId || loading || !tasks.length) return;
    const targetTask = tasks.find((task) => task.id === openRequest.taskId);
    if (targetTask) {
      openTaskDetail(targetTask);
    }
  }, [openRequest?.requestId, loading, tasks]);

  const openTaskModal = (record: OversizeTaskListItem) => {
    if (isCompletedTask(record)) {
      message.info('运输任务已完成，不能再编辑。');
      return;
    }
    setTaskModal({ open: true, record });
    taskForm.setFieldsValue({
      ...record,
      plannedDepartureDate: toDateValue(record.plannedDepartureDate),
    });
  };

  const loadTaskWorkflow = async (taskId: string) => {
    setWorkflowLoading(true);
    try {
      const result = await apiRequest<{ item: WorkflowInstance }>(`/api/transport-tasks/${taskId}/workflow`);
      setTaskWorkflow(result.item);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setWorkflowLoading(false);
    }
  };

  const loadTaskCosts = async (taskId: string) => {
    try {
      const result = await apiRequest<{ items: TaskCostItem[] }>(`/api/finance/items?direction=payable&taskId=${encodeURIComponent(taskId)}`);
      setCostItems(result.items ?? []);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const openTaskDetail = (record: OversizeTaskListItem) => {
    setSelectedTask(record);
    setTaskWorkflow(null);
    setCostItems([]);
    void loadTaskWorkflow(record.id);
    void loadTaskCosts(record.id);
  };

  const openWorkflowNodeModal = (node: WorkflowInstanceNode, action: string) => {
    if (isCompletedTask(selectedTask)) {
      message.info('运输任务已完成，不能再操作流程。');
      return;
    }
    setWorkflowNodeModal({ open: true, record: node });
    setWorkflowAction(action);
    const rawFormValues = Object.fromEntries((node.formValues ?? []).map((item) => [item.fieldKey, item.fieldValue]));
    const normalizedFormValues = Object.fromEntries(
      (node.formFields ?? []).map((field) => [
        field.fieldKey,
        field.fieldType === 'datetime' ? toDateValue(rawFormValues[field.fieldKey] as string | null) ?? dayjs() : rawFormValues[field.fieldKey],
      ]),
    );
    workflowForm.setFieldsValue({
      operator: '',
      operationTime: dayjs(),
      remark: '',
      uploadFiles: [],
      customerVisible: false,
      visibilityLevel: '内部资料',
      supplierId: node.supplierId,
      supplierVehicleId: node.supplierVehicleId,
      supplierDriverId: node.supplierDriverId,
      serviceCost: node.serviceCost,
      serviceCurrency: node.serviceCurrency || 'CNY',
      serviceExchangeRate: node.serviceExchangeRate || 1,
      serviceRemark: node.serviceRemark,
      formValues: normalizedFormValues,
    });
  };

  const uploadWorkflowFiles = async (files?: UploadFile[]) => {
    const selectedFiles = (files ?? []).filter((item) => item.originFileObj);
    const uploaded: ProjectFile[] = [];
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('folder', 'workflow');
      formData.append('file', file.originFileObj as File);
      const result = await apiRequest<UploadResult>('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      uploaded.push(result);
    }
    return uploaded;
  };

  const openTrackingModal = (node: WorkflowInstanceNode, record?: WorkflowTrackingRecord) => {
    if (!record && isCompletedTask(selectedTask)) {
      message.info('运输任务已完成，不能再新增跟踪记录。');
      return;
    }
    setTrackingModal({ open: true, node, record });
    trackingForm.setFieldsValue(
      record
        ? {
            ...record,
            trackedAt: toDateValue(record.trackedAt),
            uploadFiles: [],
          }
        : {
            trackedAt: dayjs(),
            trackingStatus: '在途',
            customerVisible: true,
            visibilityLevel: '客户可见资料',
            uploadFiles: [],
          },
    );
  };

  const saveTrackingRecord = async () => {
    if (!trackingModal.node || !selectedTask) return;
    const values = await trackingForm.validateFields();
    setSaving(true);
    try {
      const uploaded = await uploadWorkflowFiles(values.uploadFiles);
      const files = [...(trackingModal.record?.files ?? []), ...uploaded];
      await apiRequest(
        trackingModal.record
          ? `/api/workflow/tracking-records/${trackingModal.record.id}`
          : `/api/workflow/instance-nodes/${trackingModal.node.id}/tracking-records`,
        {
          method: trackingModal.record ? 'PUT' : 'POST',
          body: JSON.stringify({
            ...values,
            trackedAt: serializeDateValue(values.trackedAt, 'YYYY-MM-DD HH:mm'),
            files,
          }),
        },
      );
      message.success(trackingModal.record ? '跟踪记录已更新' : '跟踪记录已新增');
      setTrackingModal({ open: false });
      await loadTaskWorkflow(selectedTask.id);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTrackingRecord = async (record: WorkflowTrackingRecord) => {
    if (!selectedTask) return;
    await apiRequest(`/api/workflow/tracking-records/${record.id}`, { method: 'DELETE' });
    message.success('跟踪记录已删除');
    await loadTaskWorkflow(selectedTask.id);
  };

  const completedWorkflowNodes = useMemo(
    () => (taskWorkflow?.nodes ?? []).filter((node) => node.status === '\u5df2\u5b8c\u6210' || Boolean(node.completedAt)),
    [taskWorkflow],
  );

  const openCostModal = (record?: TaskCostItem) => {
    if (!selectedTask) return;
    const firstNode = completedWorkflowNodes[0];
    setCostModal({ open: true, record });
    costForm.setFieldsValue(
      record
        ? {
            ...record,
            uploadFiles: [],
          }
        : {
            direction: 'payable',
            status: 'confirmed',
            currency: 'CNY',
            exchangeRate: 1,
            workflowInstanceNodeId: firstNode?.id,
            supplierId: firstNode?.supplierId,
            feeName: firstNode?.nodeName ? `${firstNode.nodeName}费用` : '',
            uploadFiles: [],
          },
    );
  };

  const saveCostItem = async () => {
    if (!selectedTask) return;
    const values = await costForm.validateFields();
    setSaving(true);
    try {
      const uploaded = await uploadWorkflowFiles(values.uploadFiles);
      const node = taskWorkflow?.nodes.find((item) => item.id === values.workflowInstanceNodeId);
      const supplier = suppliers.find((item) => item.id === values.supplierId) ?? suppliers.find((item) => item.id === node?.supplierId);
      const files = [...(costModal.record?.files ?? []), ...uploaded];
      await apiRequest(costModal.record ? `/api/finance/items/${costModal.record.id}` : '/api/finance/items', {
        method: costModal.record ? 'PUT' : 'POST',
        body: JSON.stringify({
          direction: 'payable',
          projectId: selectedTask.projectId,
          taskId: selectedTask.id,
          workflowInstanceNodeId: values.workflowInstanceNodeId,
          supplierId: values.supplierId || node?.supplierId,
          supplierName: supplier?.name || node?.supplierName || '',
          feeName: values.feeName,
          currency: values.currency,
          amount: values.amount,
          exchangeRate: values.exchangeRate,
          status: values.status || 'confirmed',
          sourceType: 'manual',
          occurrenceStage: node?.nodeName || values.occurrenceStage,
          notes: values.notes,
          files,
        }),
      });
      message.success(costModal.record ? '费用已更新' : '费用已添加');
      setCostModal({ open: false });
      await loadTaskCosts(selectedTask.id);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCostItem = async (record: TaskCostItem) => {
    if (!selectedTask) return;
    await apiRequest(`/api/finance/items/${record.id}`, { method: 'DELETE' });
    message.success('费用已删除');
    await loadTaskCosts(selectedTask.id);
  };

  const submitWorkflowAction = async () => {
    if (!workflowNodeModal.record || !selectedTask) return;
    const values = await workflowForm.validateFields();
    setSaving(true);
    try {
      const uploaded = await uploadWorkflowFiles(values.uploadFiles);
      const formValueMap = values.formValues ?? {};
      const supplier = suppliers.find((item) => item.id === values.supplierId);
      const vehicle = supplier?.vehicles?.find((item) => item.id === values.supplierVehicleId);
      const driver = supplier?.drivers?.find((item) => item.id === values.supplierDriverId);
      await apiRequest(`/api/workflow/instance-nodes/${workflowNodeModal.record.id}/${workflowAction}`, {
        method: 'POST',
        body: JSON.stringify({
          operator: values.operator,
          operationTime: serializeDateValue(values.operationTime, 'YYYY-MM-DD HH:mm'),
          remark: values.remark,
          customerVisible: values.customerVisible,
          visibilityLevel: values.visibilityLevel,
          supplierId: values.supplierId,
          supplierName: supplier?.name ?? '',
          supplierType: supplier?.type ?? '',
          supplierVehicleId: values.supplierVehicleId,
          vehiclePlateNo: vehicle?.plateNo ?? '',
          supplierDriverId: values.supplierDriverId,
          driverName: driver?.name ?? '',
          driverPhone: driver?.phone ?? '',
          serviceCost: values.serviceCost,
          serviceCurrency: values.serviceCurrency,
          serviceExchangeRate: values.serviceExchangeRate,
          serviceRemark: values.serviceRemark,
          files: uploaded,
          formValues: Object.entries(formValueMap).map(([fieldKey, fieldValue]) => {
            const fieldConfig = workflowNodeModal.record?.formFields?.find((field) => field.fieldKey === fieldKey);
            const fieldType = fieldConfig?.fieldType ?? 'text';
            return {
              fieldKey,
              fieldName: fieldConfig?.fieldName ?? fieldKey,
              fieldType,
              fieldValue: fieldType === 'datetime' ? serializeDateValue(fieldValue, 'YYYY-MM-DD HH:mm') : String(fieldValue ?? ''),
            };
          }),
        }),
      });
      message.success('流程节点已处理');
      setWorkflowNodeModal({ open: false });
      await loadTaskWorkflow(selectedTask.id);
      await loadTasks();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveTask = async () => {
    if (!taskModal.record) return;
    if (isCompletedTask(taskModal.record)) {
      message.info('运输任务已完成，不能再编辑。');
      setTaskModal({ open: false });
      return;
    }
    const values = await taskForm.validateFields();
    setSaving(true);
    try {
      await apiRequest(`/api/oversize-project-tasks/${taskModal.record.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...values,
          plannedDepartureDate: serializeDateValue(values.plannedDepartureDate),
        }),
      });
      message.success('运输任务已更新');
      setTaskModal({ open: false });
      await loadTasks();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<OversizeTaskListItem> = [
    {
      title: '任务号',
      dataIndex: 'taskNo',
      width: 220,
      fixed: 'left',
      render: (value, record) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => openTaskDetail(record)}>
          {value}
        </Button>
      ),
    },
    { title: '客户名称', dataIndex: 'customerName', width: 180, render: (value) => value || '-' },
    { title: '项目名称', dataIndex: 'projectName', width: 220 },
    {
      title: '当前节点',
      width: 130,
      render: (_, record) => <Tag color={record.workflowCurrentNodeStatus === '异常' ? 'error' : 'processing'}>{currentTaskNode(record)}</Tag>,
    },
    { title: '状态', dataIndex: 'status', width: 100, render: (value) => <Tag color={statusColor[value] ?? 'default'}>{value}</Tag> },
    { title: '进度', dataIndex: 'progress', width: 140, render: (value) => <Progress percent={Number(value) || 0} size="small" /> },
    { title: '项目编号', dataIndex: 'projectNo', width: 180 },
    { title: '车牌/车辆', dataIndex: 'vehicleNo', width: 140 },
    { title: '车型', dataIndex: 'vehicleType', width: 160 },
    { title: '司机', dataIndex: 'driverName', width: 120 },
    { title: '司机电话', dataIndex: 'driverPhone', width: 140 },
    { title: '货物摘要', dataIndex: 'cargoSummary', width: 220 },
    { title: '计划发运', dataIndex: 'plannedDepartureDate', width: 120 },
    {
      title: '操作',
      width: 100,
      fixed: 'right',
      render: (_, record) =>
        isCompletedTask(record) ? (
          <Tag color="success">已完成</Tag>
        ) : (
          <Button size="small" icon={<EditOutlined />} onClick={() => openTaskModal(record)}>
            编辑
          </Button>
        ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card
        className="glass-card"
        title="状态跟进"
        bordered={false}
        extra={
          activeFollowStatus ? (
            <Button size="small" onClick={() => setActiveFollowStatus(null)}>
              查看全部
            </Button>
          ) : null
        }
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            overflowX: 'auto',
            padding: '12px 14px',
            borderRadius: 16,
            border: '1px solid #e8edf5',
            background: '#f8fafc',
          }}
        >
          {taskFollowFlow.map((nodeName, index) => {
            const active = activeFollowStatus === nodeName;
            return (
              <div key={nodeName} style={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
                <button
                  type="button"
                  onClick={() => setActiveFollowStatus(active ? null : nodeName)}
                  style={{
                    width: 98,
                    minHeight: 58,
                    padding: '8px 8px',
                    borderRadius: 14,
                    border: active ? '1px solid #1677ff' : '1px solid #d8e2ef',
                    background: active ? '#eef7ff' : '#ffffff',
                    color: '#172033',
                    cursor: 'pointer',
                    boxShadow: active ? '0 8px 18px rgba(22, 119, 255, 0.14)' : '0 4px 12px rgba(15, 23, 42, 0.04)',
                    font: 'inherit',
                    lineHeight: 1.3,
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{nodeName}</div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 28,
                      height: 22,
                      marginTop: 6,
                      padding: '0 8px',
                      borderRadius: 999,
                      background: active ? '#1677ff' : '#eef2f7',
                      color: active ? '#ffffff' : '#0f172a',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {followCounts.get(nodeName) ?? 0}
                  </div>
                </button>
                {index < taskFollowFlow.length - 1 ? (
                  <div
                    aria-hidden
                    style={{
                      width: 18,
                      height: 2,
                      background: '#b8c4d2',
                      position: 'relative',
                      margin: '0 5px',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        right: -1,
                        top: -4,
                        width: 0,
                        height: 0,
                        borderTop: '5px solid transparent',
                        borderBottom: '5px solid transparent',
                        borderLeft: '7px solid #b8c4d2',
                      }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        className="glass-card"
        title={activeFollowStatus ? `运输任务列表 · ${activeFollowStatus}` : '运输任务列表'}
        bordered={false}
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => void loadTasks()} loading={loading}>
            刷新
          </Button>
        }
      >
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={6}>
            <Input
              allowClear
              placeholder="查询任务号"
              value={taskFilters.taskNo}
              onChange={(event) => setTaskFilters((prev) => ({ ...prev, taskNo: event.target.value }))}
            />
          </Col>
          <Col xs={24} md={6}>
            <Input
              allowClear
              placeholder="查询客户名称"
              value={taskFilters.customerName}
              onChange={(event) => setTaskFilters((prev) => ({ ...prev, customerName: event.target.value }))}
            />
          </Col>
          <Col xs={24} md={6}>
            <Input
              allowClear
              placeholder="查询项目名称/编号"
              value={taskFilters.projectName}
              onChange={(event) => setTaskFilters((prev) => ({ ...prev, projectName: event.target.value }))}
            />
          </Col>
          <Col xs={24} md={3}>
            <Select
              allowClear
              placeholder="任务状态"
              style={{ width: '100%' }}
              value={taskFilters.status}
              options={taskStatuses.map((item) => ({ value: item, label: item }))}
              onChange={(value) => setTaskFilters((prev) => ({ ...prev, status: value }))}
            />
          </Col>
          <Col xs={24} md={3}>
            <Select
              allowClear
              placeholder="当前节点"
              style={{ width: '100%' }}
              value={taskFilters.currentNode}
              options={taskFollowFlow.map((item) => ({ value: item, label: item }))}
              onChange={(value) => setTaskFilters((prev) => ({ ...prev, currentNode: value }))}
            />
          </Col>
          <Col xs={24}>
            <Button
              onClick={() =>
                setTaskFilters({
                  taskNo: '',
                  customerName: '',
                  projectName: '',
                  status: undefined,
                  currentNode: undefined,
                })
              }
            >
              清空筛选
            </Button>
          </Col>
        </Row>
        <Table rowKey="id" loading={loading} dataSource={visibleTasks} columns={columns} scroll={{ x: 1700 }} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="编辑运输任务" open={taskModal.open} onCancel={() => setTaskModal({ open: false })} onOk={saveTask} confirmLoading={saving} width={760}>
        <Form form={taskForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vehicleNo" label="车牌/车辆编号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="vehicleType" label="车型">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="driverName" label="司机名称">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="driverPhone" label="司机电话">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="plannedDepartureDate" label="计划发运">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select options={taskStatuses.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="progress" label="进度">
                <Select options={[0, 25, 50, 75, 100].map((item) => ({ value: item, label: `${item}%` }))} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="cargoSummary" label="货物摘要">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="notes" label="备注">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        title={selectedTask ? `运输任务详情 ${selectedTask.taskNo}` : '运输任务详情'}
        open={Boolean(selectedTask)}
        width={920}
        onClose={() => setSelectedTask(null)}
      >
        {selectedTask ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="任务号">{selectedTask.taskNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColor[selectedTask.status] ?? 'default'}>{selectedTask.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="客户名称">{selectedTask.customerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="项目名称">{selectedTask.projectName}</Descriptions.Item>
              <Descriptions.Item label="项目编号">{selectedTask.projectNo}</Descriptions.Item>
              <Descriptions.Item label="计划发运">{selectedTask.plannedDepartureDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="车牌/车辆">{selectedTask.vehicleNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="车型">{selectedTask.vehicleType || '-'}</Descriptions.Item>
              <Descriptions.Item label="司机">{selectedTask.driverName || '-'}</Descriptions.Item>
              <Descriptions.Item label="司机电话">{selectedTask.driverPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="进度" span={2}>
                <Progress percent={Number(selectedTask.progress) || 0} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="货物摘要" span={2}>{selectedTask.cargoSummary || '-'}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{selectedTask.notes || '-'}</Descriptions.Item>
            </Descriptions>

            <Card size="small" title="流程进度" loading={workflowLoading}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingBottom: 4 }}>
                {(taskWorkflow?.nodes ?? []).map((node) => (
                  <div key={node.id} style={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (taskWorkflow?.currentNodeId === node.id && !isCompletedTask(selectedTask)) {
                          openWorkflowNodeModal(node, 'save');
                        }
                      }}
                      style={{
                        width: 96,
                        minHeight: 62,
                        borderRadius: 14,
                        border: taskWorkflow?.currentNodeId === node.id ? '2px solid #1677ff' : '1px solid #d9d9d9',
                        background: node.status === '已完成' ? '#f6ffed' : taskWorkflow?.currentNodeId === node.id ? '#e6f4ff' : '#fff',
                        cursor: taskWorkflow?.currentNodeId === node.id && !isCompletedTask(selectedTask) ? 'pointer' : 'default',
                        font: 'inherit',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{node.nodeName}</div>
                      <Tag color={statusColor[node.status] ?? 'default'} style={{ marginTop: 6 }}>
                        {node.status}
                      </Tag>
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card size="small" title="节点处理">
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={taskWorkflow?.nodes ?? []}
                columns={[
                  { title: '节点', dataIndex: 'nodeName', width: 130 },
                  { title: '负责人', dataIndex: 'owner', width: 120, render: (value) => value || '-' },
                  { title: '类型', dataIndex: 'nodeType', width: 110 },
                  { title: '超时', dataIndex: 'timeoutAt', width: 150, render: (value) => trackingDateText(value) },
                  { title: '开始时间', dataIndex: 'startedAt', width: 150, render: (value) => trackingDateText(value) },
                  { title: '完成时间', dataIndex: 'completedAt', width: 150, render: (value) => trackingDateText(value) },
                  { title: '状态', dataIndex: 'status', width: 100, render: (value) => <Tag color={statusColor[value] ?? 'default'}>{value}</Tag> },
                  {
                    title: '跟踪',
                    width: 120,
                    render: (_, record) => (
                      <Space>
                        <Tag color={record.trackingRecords?.length ? 'processing' : 'default'}>{record.trackingRecords?.length ?? 0}</Tag>
                        {!isCompletedTask(selectedTask) ? (
                          <Button size="small" onClick={() => openTrackingModal(record)}>
                            新增
                          </Button>
                        ) : null}
                      </Space>
                    ),
                  },
                  {
                    title: '附件',
                    render: (_, record) =>
                      record.files?.length ? (
                        <Space wrap>
                          {record.files.map((file) => (
                            <a key={file.key ?? file.fileUrl} href={fileUrl(file.fileUrl)} target="_blank" rel="noreferrer">
                              <PaperClipOutlined /> {file.fileName}
                              {file.visibilityLevel ? <Tag style={{ marginLeft: 4 }}>{file.visibilityLevel}</Tag> : null}
                            </a>
                          ))}
                        </Space>
                      ) : (
                        '-'
                      ),
                  },
                  {
                    title: '操作',
                    width: 300,
                    fixed: 'right',
                    render: (_, record) =>
                      taskWorkflow?.currentNodeId === record.id && !isCompletedTask(selectedTask) ? (
                        <Space wrap>
                          <Button size="small" disabled={isWorkflowNodeStarted(record)} onClick={() => openWorkflowNodeModal(record, 'start')}>开始</Button>
                          <Button size="small" type="primary" disabled={!isWorkflowNodeStarted(record)} onClick={() => openWorkflowNodeModal(record, 'submit')}>提交</Button>
                          <Button size="small" onClick={() => openWorkflowNodeModal(record, 'return')}>退回</Button>
                          {record.allowSkip ? <Button size="small" onClick={() => openWorkflowNodeModal(record, 'skip')}>跳过</Button> : null}
                          <Button size="small" onClick={() => openWorkflowNodeModal(record, 'hold')}>挂起</Button>
                          <Button size="small" danger onClick={() => openWorkflowNodeModal(record, 'exception')}>异常</Button>
                        </Space>
                      ) : (
                        <Tag>{isCompletedTask(selectedTask) ? '已完成' : '不可操作'}</Tag>
                      ),
                  },
                ]}
                scroll={{ x: 1200 }}
              />
            </Card>

            <Card
              size="small"
              title="节点跟踪记录"
              extra={
                !isCompletedTask(selectedTask) && taskWorkflow?.currentNodeId ? (
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      const currentNode = taskWorkflow.nodes.find((node) => node.id === taskWorkflow.currentNodeId);
                      if (currentNode) openTrackingModal(currentNode);
                    }}
                  >
                    增加节点跟踪
                  </Button>
                ) : null
              }
            >
              {taskWorkflow?.trackingRecords?.length ? (
                <Timeline
                  items={sortTrackingRecords(taskWorkflow.trackingRecords).map((record) => ({
                    color: record.trackingStatus === '异常' ? 'red' : record.customerVisible ? 'blue' : 'gray',
                    children: (
                      <div>
                        <Space wrap size={8}>
                          <strong>{trackingDateText(record.trackedAt)}</strong>
                          <Tag>{record.nodeName}</Tag>
                          {record.trackingStatus ? <Tag color={record.trackingStatus === '异常' ? 'error' : 'processing'}>{record.trackingStatus}</Tag> : null}
                          {record.location ? <span>{record.location}</span> : null}
                          {record.customerVisible ? <Tag color="green">客户可见</Tag> : <Tag>内部</Tag>}
                        </Space>
                        <div style={{ marginTop: 6, color: '#1f2937' }}>{record.content}</div>
                        {record.remark ? <div style={{ marginTop: 4, color: '#64748b' }}>{record.remark}</div> : null}
                        {record.files?.length ? (
                          <Space wrap size={8} style={{ marginTop: 6 }}>
                            {record.files.map((file) => (
                              <a key={file.key ?? file.fileUrl} href={fileUrl(file.fileUrl)} target="_blank" rel="noreferrer">
                                <PaperClipOutlined /> {file.fileName}
                              </a>
                            ))}
                          </Space>
                        ) : null}
                        <div style={{ marginTop: 6 }}>
                          <Space size={8}>
                            {record.operator ? <span style={{ color: '#64748b' }}>操作人：{record.operator}</span> : null}
                            {!isCompletedTask(selectedTask) ? (
                              <>
                                <Button
                                  type="link"
                                  size="small"
                                  style={{ padding: 0 }}
                                  onClick={() => {
                                    const node = taskWorkflow.nodes.find((item) => item.id === record.instanceNodeId);
                                    if (node) openTrackingModal(node, record);
                                  }}
                                >
                                  编辑
                                </Button>
                                <Popconfirm title="确认删除该跟踪记录？" onConfirm={() => void deleteTrackingRecord(record)}>
                                  <Button type="link" danger size="small" style={{ padding: 0 }}>
                                    删除
                                  </Button>
                                </Popconfirm>
                              </>
                            ) : null}
                          </Space>
                        </div>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>暂无跟踪记录</div>
              )}
            </Card>

            <Card
              size="small"
              title="费用清单"
              extra={
                !isCompletedTask(selectedTask) ? (
                  <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => openCostModal()}>
                    添加费用
                  </Button>
                ) : null
              }
            >
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={costItems}
                columns={[
                  { title: '时间', dataIndex: 'createdAt', width: 170, render: (value) => trackingDateText(value) },
                  { title: '费用项', dataIndex: 'feeName', width: 160 },
                  { title: '节点', dataIndex: 'occurrenceStage', width: 130, render: (value) => value || '-' },
                  { title: '供应商', dataIndex: 'supplierName', width: 180, render: (value) => value || '-' },
                  {
                    title: '金额',
                    width: 150,
                    render: (_, record) => `${record.currency} ${Number(record.amount || 0).toFixed(2)}`,
                  },
                  {
                    title: '折CNY',
                    width: 130,
                    render: (_, record) => Number(record.amountCny || 0).toFixed(2),
                  },
                  { title: '状态', dataIndex: 'status', width: 110, render: (value) => <Tag>{value}</Tag> },
                  {
                    title: '凭证',
                    width: 220,
                    render: (_, record) =>
                      record.files?.length ? (
                        <Space wrap>
                          {record.files.map((file) => (
                            <a key={file.key ?? file.fileUrl} href={fileUrl(file.fileUrl)} target="_blank" rel="noreferrer">
                              <PaperClipOutlined /> {file.fileName}
                            </a>
                          ))}
                        </Space>
                      ) : (
                        '-'
                      ),
                  },
                  { title: '备注', dataIndex: 'notes', render: (value) => value || '-' },
                  {
                    title: '操作',
                    width: 120,
                    fixed: 'right',
                    render: (_, record) =>
                      !isCompletedTask(selectedTask) ? (
                        <Space>
                          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => openCostModal(record)}>
                            编辑
                          </Button>
                          <Popconfirm title="确认删除该费用？" onConfirm={() => void deleteCostItem(record)}>
                            <Button type="link" danger size="small" style={{ padding: 0 }}>
                              删除
                            </Button>
                          </Popconfirm>
                        </Space>
                      ) : (
                        <Tag>不可操作</Tag>
                      ),
                  },
                ]}
                scroll={{ x: 1300 }}
              />
            </Card>

            <Card size="small" title="流程流转记录">
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={(taskWorkflow?.transitions ?? []).filter((item) => workflowTransitionActions.includes(item.action))}
                columns={[
                  { title: '时间', dataIndex: 'createdAt', width: 170, render: (value) => trackingDateText(value) },
                  { title: '动作', dataIndex: 'action', width: 100 },
                  { title: '原节点', dataIndex: 'fromNodeName', width: 130 },
                  { title: '目标节点', dataIndex: 'toNodeName', width: 130 },
                  { title: '原状态', dataIndex: 'fromStatus', width: 100 },
                  { title: '新状态', dataIndex: 'toStatus', width: 100 },
                  { title: '操作人', dataIndex: 'operator', width: 120 },
                  { title: '备注', dataIndex: 'remark' },
                ]}
              />
            </Card>
          </Space>
        ) : null}
      </Drawer>

      <Modal
        title={workflowNodeModal.record ? `${workflowNodeModal.record.nodeName} · ${workflowAction}` : '处理流程节点'}
        open={workflowNodeModal.open}
        onCancel={() => setWorkflowNodeModal({ open: false })}
        onOk={submitWorkflowAction}
        confirmLoading={saving}
        width={920}
        zIndex={1300}
      >
        <Form form={workflowForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="operator" label="操作人">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={employeeSelectOptions}
                  placeholder="请选择操作人"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="operationTime" label="操作时间" rules={[{ required: true, message: '请选择操作时间' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          {workflowNodeModal.record?.requireSupplier || workflowNodeModal.record?.supplierTypes?.length ? (
            <Card size="small" title="服务资源" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="supplierId"
                    label="服务供应商"
                    rules={workflowNodeModal.record?.requireSupplier && workflowAction === 'submit' ? [{ required: true, message: '请选择服务供应商' }] : []}
                  >
                    <Select
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={workflowSupplierOptions}
                      placeholder="请选择供应商"
                      onChange={() => workflowForm.setFieldsValue({ supplierVehicleId: undefined, supplierDriverId: undefined })}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="supplierType" label="供应商类型">
                    <Input value={selectedWorkflowSupplier?.type} disabled placeholder={selectedWorkflowSupplier?.type || '-'} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="supplierVehicleId"
                    label="服务车辆"
                    rules={workflowNodeModal.record?.requireVehicle && workflowAction === 'submit' ? [{ required: true, message: '请选择服务车辆' }] : []}
                  >
                    <Select
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      disabled={!selectedWorkflowSupplier}
                      options={(selectedWorkflowSupplier?.vehicles ?? []).map((vehicle) => ({
                        value: vehicle.id,
                        label: `${vehicle.plateNo || '未填车牌'} · ${[vehicle.requiredVehicleType, vehicle.vehicleLength, vehicle.axle].filter(Boolean).join(' / ') || vehicle.vehicleType || '-'}`,
                      }))}
                      placeholder="请选择车辆"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="supplierDriverId"
                    label="服务司机"
                    rules={workflowNodeModal.record?.requireDriver && workflowAction === 'submit' ? [{ required: true, message: '请选择服务司机' }] : []}
                  >
                    <Select
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      disabled={!selectedWorkflowSupplier}
                      options={(selectedWorkflowSupplier?.drivers ?? []).map((driver) => ({
                        value: driver.id,
                        label: `${driver.name}${driver.phone ? ` · ${driver.phone}` : ''}`,
                      }))}
                      placeholder="请选择司机"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="已选车辆信息">
                    <Input disabled value={selectedWorkflowVehicle ? [selectedWorkflowVehicle.plateNo, selectedWorkflowVehicle.vehicleLength, selectedWorkflowVehicle.axle].filter(Boolean).join(' / ') : ''} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="serviceCost" label="服务费用">
                    <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="serviceCurrency" label="费用币种">
                    <Select options={['CNY', 'USD', 'KZT', 'RUB'].map((value) => ({ value, label: value }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="serviceExchangeRate" label="折CNY汇率">
                    <InputNumber min={0.0001} precision={4} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="serviceRemark" label="供应商备注">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ) : null}
          {workflowNodeModal.record?.formFields?.length ? (
            <Row gutter={16}>
              {workflowNodeModal.record.formFields.map((field) => (
                <Col key={field.fieldKey} xs={24} md={field.fieldType === 'textarea' ? 24 : 12}>
                  <Form.Item
                    name={['formValues', field.fieldKey]}
                    label={field.fieldName}
                    rules={field.required && workflowAction === 'submit' ? [{ required: true, message: `请填写${field.fieldName}` }] : []}
                  >
                    {field.fieldType === 'select' ? (
                      <Select options={(field.options ?? []).map((item) => ({ value: item, label: item }))} />
                    ) : field.fieldType === 'number' ? (
                      <InputNumber style={{ width: '100%' }} />
                    ) : field.fieldType === 'textarea' ? (
                      <Input.TextArea rows={3} />
                    ) : field.fieldType === 'datetime' ? (
                      <DatePicker showTime style={{ width: '100%' }} />
                    ) : (
                      <Input />
                    )}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          ) : (
            <Form.Item name={['formValues', 'summary']} label="节点资料">
              <Input.TextArea rows={3} placeholder="填写当前节点资料、处理结果或关键时间" />
            </Form.Item>
          )}
          <Form.Item name="remark" label="操作备注">
            <Input.TextArea rows={3} />
          </Form.Item>
          {workflowNodeModal.record?.fileRequirements?.length ? (
            <Card size="small" title="附件要求" style={{ marginBottom: 16 }}>
              <Space wrap>
                {workflowNodeModal.record.fileRequirements.map((file) => (
                  <Tag key={file.id || file.fileName} color={file.required ? 'red' : 'blue'}>
                    {file.fileName} · {file.required ? '必传' : '可选'} · {file.allowedTypes || '不限格式'} · 最多
                    {file.maxCount || 20}
                  </Tag>
                ))}
              </Space>
            </Card>
          ) : null}
          <Form.Item name="uploadFiles" label="上传附件" valuePropName="fileList" getValueFromEvent={(event) => event?.fileList ?? []}>
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>选择附件</Button>
            </Upload>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="visibilityLevel" label="资料可见级别">
                <Select
                  options={['内部资料', '客户可见资料', '敏感资料'].map((item) => ({ value: item, label: item }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerVisible" label="客户可见" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={costModal.record ? '编辑费用' : '添加费用'}
        open={costModal.open}
        onCancel={() => setCostModal({ open: false })}
        onOk={saveCostItem}
        confirmLoading={saving}
        width={760}
        zIndex={1300}
      >
        <Form form={costForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="workflowInstanceNodeId" label="已完成节点" rules={[{ required: true, message: '请选择已完成节点' }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={completedWorkflowNodes.map((node) => ({
                    value: node.id,
                    label: `${node.nodeName}${node.supplierName ? ` / ${node.supplierName}` : ''}`,
                  }))}
                  onChange={(nodeId) => {
                    const node = completedWorkflowNodes.find((item) => item.id === nodeId);
                    costForm.setFieldsValue({
                      supplierId: node?.supplierId,
                      feeName: node?.nodeName ? `${node.nodeName}费用` : costForm.getFieldValue('feeName'),
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="supplierId" label="供应商" rules={[{ required: true, message: '请选择供应商' }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={suppliers.map((supplier) => ({
                    value: supplier.id,
                    label: `${supplier.supplierCode ? `${supplier.supplierCode} / ` : ''}${supplier.name}${supplier.type ? ` / ${supplier.type}` : ''}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="feeName" label="费用名称" rules={[{ required: true, message: '请输入费用名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="currency" label="币种" rules={[{ required: true, message: '请选择币种' }]}>
                <Select options={['CNY', 'USD', 'KZT', 'RUB'].map((value) => ({ value, label: value }))} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
                <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="exchangeRate" label="折CNY汇率" rules={[{ required: true, message: '请输入汇率' }]}>
                <InputNumber min={0.0001} precision={4} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select
                  options={[
                    { value: 'draft', label: '草稿' },
                    { value: 'confirmed', label: '已确认' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="notes" label="备注">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
          {costModal.record?.files?.length ? (
            <Form.Item label="已有凭证">
              <Space wrap>
                {costModal.record.files.map((file) => (
                  <a key={file.key ?? file.fileUrl} href={fileUrl(file.fileUrl)} target="_blank" rel="noreferrer">
                    <PaperClipOutlined /> {file.fileName}
                  </a>
                ))}
              </Space>
            </Form.Item>
          ) : null}
          <Form.Item name="uploadFiles" label="凭证附件" valuePropName="fileList" getValueFromEvent={(event) => event?.fileList ?? []}>
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>选择附件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={trackingModal.record ? '编辑跟踪记录' : `增加跟踪记录${trackingModal.node ? ` · ${trackingModal.node.nodeName}` : ''}`}
        open={trackingModal.open}
        onCancel={() => setTrackingModal({ open: false })}
        onOk={saveTrackingRecord}
        confirmLoading={saving}
        width={720}
        zIndex={1300}
      >
        <Form form={trackingForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="trackedAt" label="记录时间" rules={[{ required: true, message: '请选择记录时间' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trackingStatus" label="跟踪状态">
                <Select options={trackingStatusOptions.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="location" label="当前位置">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="operator" label="操作人">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={employeeSelectOptions}
                  placeholder="请选择操作人"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="跟踪内容" rules={[{ required: true, message: '请输入跟踪内容' }]}>
            <Input.TextArea rows={4} placeholder="例如：车辆已到达霍尔果斯口岸，等待排队查验。" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
          {trackingModal.record?.files?.length ? (
            <Form.Item label="已有附件">
              <Space wrap>
                {trackingModal.record.files.map((file) => (
                  <a key={file.key ?? file.fileUrl} href={fileUrl(file.fileUrl)} target="_blank" rel="noreferrer">
                    <PaperClipOutlined /> {file.fileName}
                  </a>
                ))}
              </Space>
            </Form.Item>
          ) : null}
          <Form.Item name="uploadFiles" label="上传附件" valuePropName="fileList" getValueFromEvent={(event) => event?.fileList ?? []}>
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>选择附件</Button>
            </Upload>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="visibilityLevel" label="资料可见级别">
                <Select options={['内部资料', '客户可见资料', '敏感资料'].map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerVisible" label="客户可见" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
}
