import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { apiRequest } from '../api/client';
import { formatBeijingTime } from '../utils/date';

type WorkflowTemplateNode = {
  id: string;
  templateId: string;
  nodeName: string;
  sortOrder: number;
  nodeType: string;
  defaultOwner?: string | null;
  defaultRoleId?: string | null;
  defaultRoleName?: string | null;
  required: boolean;
  allowSkip: boolean;
  allowReturn: boolean;
  requireCustomerConfirm: boolean;
  requireAttachment: boolean;
  requireSupplier: boolean;
  supplierTypes?: string[];
  requireVehicle: boolean;
  requireDriver: boolean;
  requireGps: boolean;
  gpsProviderId?: string | null;
  gpsProviderShortName?: string | null;
  gpsProviderName?: string | null;
  gpsDeviceNo?: string | null;
  timeoutHours?: number | null;
  workingTimeRuleId?: string | null;
  workingTimeRuleName?: string | null;
  description?: string | null;
  formFields?: WorkflowFormField[];
  fileRequirements?: WorkflowFileRequirement[];
};

type WorkflowFormField = {
  id: string;
  templateNodeId: string;
  fieldName: string;
  fieldKey: string;
  fieldType: string;
  required: boolean;
  options?: string[];
  sortOrder: number;
};

type WorkflowFileRequirement = {
  id: string;
  templateNodeId: string;
  fileName: string;
  required: boolean;
  allowedTypes: string;
  maxCount: number;
  customerVisible: boolean;
  downloadable: boolean;
};

type WorkflowTemplate = {
  id: string;
  name: string;
  businessType: string;
  enabled: boolean;
  remark?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  nodes: WorkflowTemplateNode[];
};

type EmployeeOption = {
  id: string;
  name: string;
  department?: string | null;
  position?: string | null;
  status: string;
};

type RbacRoleOption = {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
};

type WorkingTimeRule = {
  id: string;
  name: string;
  country?: string | null;
  location?: string | null;
  nodeName?: string | null;
  enabled: boolean;
};

type WorkflowTodo = {
  id: string;
  instanceId?: string | null;
  instanceNodeId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  title: string;
  owner?: string | null;
  ownerRoleId?: string | null;
  ownerRoleName?: string | null;
  assignmentSource?: string | null;
  dueAt?: string | null;
  status: string;
  priority: string;
  createdAt: string;
  projectName?: string | null;
  customerName?: string | null;
  taskNo?: string | null;
  nodeName?: string | null;
};

type FormMode<T> = {
  open: boolean;
  record?: T | null;
};

const nodeTypeOptions = ['普通节点', '审批节点', '资料节点', '确认节点'].map((item) => ({ value: item, label: item }));
const fieldTypeOptions = ['text', 'textarea', 'number', 'datetime', 'select'].map((item) => ({ value: item, label: item }));
const supplierTypeOptions = ['报关行', '清关行', '国内经纪人', '国内车队', '国外车队', '国外经纪人', '转关行', '自营业务'].map((item) => ({ value: item, label: item }));

function stringArrayValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item)).filter(Boolean);
    } catch {
      // Fall back to comma/newline separated text below.
    }
    return trimmed
      .split(/[,，\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function WorkflowTemplatePage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [roles, setRoles] = useState<RbacRoleOption[]>([]);
  const [workingTimeRules, setWorkingTimeRules] = useState<WorkingTimeRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateModal, setTemplateModal] = useState<FormMode<WorkflowTemplate>>({ open: false });
  const [nodeModal, setNodeModal] = useState<FormMode<WorkflowTemplateNode>>({ open: false });
  const [fieldModal, setFieldModal] = useState<FormMode<WorkflowFormField>>({ open: false });
  const [fileModal, setFileModal] = useState<FormMode<WorkflowFileRequirement>>({ open: false });
  const [selectedNode, setSelectedNode] = useState<WorkflowTemplateNode | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateForm] = Form.useForm();
  const [nodeForm] = Form.useForm();
  const [fieldForm] = Form.useForm();
  const [fileForm] = Form.useForm();

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId],
  );

  const employeeOptions = useMemo(
    () =>
      employees
        .filter((item) => item.status === 'ACTIVE')
        .map((item) => ({
          value: item.name,
          label: [item.name, item.department, item.position].filter(Boolean).join(' / '),
        })),
    [employees],
  );

  const roleOptions = useMemo(
    () =>
      roles
        .filter((item) => item.enabled)
        .map((item) => ({
          value: item.id,
          label: `${item.name} / ${item.code}`,
        })),
    [roles],
  );

  const workingTimeRuleOptions = useMemo(
    () =>
      workingTimeRules
        .filter((item) => item.enabled)
        .map((item) => ({
          value: item.id,
          label: [item.name, item.country, item.location, item.nodeName].filter(Boolean).join(' / '),
        })),
    [workingTimeRules],
  );

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const [result, employeeResult, roleResult, workingTimeRuleResult] = await Promise.all([
        apiRequest<{ items: WorkflowTemplate[] }>('/api/workflow/templates'),
        apiRequest<{ items: EmployeeOption[] }>('/api/employees'),
        apiRequest<{ items: RbacRoleOption[] }>('/api/rbac/roles'),
        apiRequest<{ items: WorkingTimeRule[] }>('/api/working-time-rules'),
      ]);
      setTemplates(result.items ?? []);
      setEmployees(employeeResult.items ?? []);
      setRoles(roleResult.items ?? []);
      setWorkingTimeRules(workingTimeRuleResult.items ?? []);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const openTemplateModal = (record?: WorkflowTemplate) => {
    setTemplateModal({ open: true, record });
    templateForm.setFieldsValue(record ?? { businessType: '大件运输', enabled: true });
  };

  const saveTemplate = async () => {
    const values = await templateForm.validateFields();
    setSaving(true);
    try {
      await apiRequest(templateModal.record ? `/api/workflow/templates/${templateModal.record.id}` : '/api/workflow/templates', {
        method: templateModal.record ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      });
      message.success(templateModal.record ? '流程模板已更新' : '流程模板已创建');
      setTemplateModal({ open: false });
      await loadTemplates();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (record: WorkflowTemplate) => {
    await apiRequest(`/api/workflow/templates/${record.id}`, { method: 'DELETE' });
    message.success('流程模板已删除');
    await loadTemplates();
  };

  const openNodeModal = (record?: WorkflowTemplateNode) => {
    setNodeModal({ open: true, record });
    nodeForm.setFieldsValue(
      record
        ? {
            ...record,
            workflowNodeName: record.nodeName,
            workflowNodeType: record.nodeType,
            supplierTypes: stringArrayValue(record.supplierTypes),
            requireGps: Boolean(record.requireGps),
          }
        : {
            sortOrder: (selectedTemplate?.nodes?.length ?? 0) + 1,
            workflowNodeType: '普通节点',
            required: true,
            allowReturn: true,
            allowSkip: false,
            requireCustomerConfirm: false,
            requireAttachment: false,
            requireSupplier: false,
            supplierTypes: [],
            requireVehicle: false,
            requireDriver: false,
            requireGps: false,
          },
    );
  };

  const saveNode = async () => {
    if (!selectedTemplate) return;
    const values = await nodeForm.validateFields();
    setSaving(true);
    try {
      const defaultRole = roles.find((role) => role.id === values.defaultRoleId);
      await apiRequest(nodeModal.record ? `/api/workflow/template-nodes/${nodeModal.record.id}` : `/api/workflow/templates/${selectedTemplate.id}/nodes`, {
        method: nodeModal.record ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...values,
          nodeName: values.workflowNodeName,
          nodeType: values.workflowNodeType,
          defaultRoleName: defaultRole?.name ?? '',
          gpsProviderId: undefined,
          gpsDeviceNo: '',
          workflowNodeName: undefined,
          workflowNodeType: undefined,
        }),
      });
      message.success(nodeModal.record ? '节点已更新' : '节点已新增');
      setNodeModal({ open: false });
      await loadTemplates();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const openFieldModal = (record?: WorkflowFormField) => {
    setFieldModal({ open: true, record });
    fieldForm.setFieldsValue(record ? { ...record, optionsText: stringArrayValue(record.options).join('\n') } : { fieldType: 'text', required: false, sortOrder: (selectedNode?.formFields?.length ?? 0) + 1 });
  };

  const saveField = async () => {
    if (!selectedNode) return;
    const values = await fieldForm.validateFields();
    setSaving(true);
    try {
      await apiRequest(fieldModal.record ? `/api/workflow/form-fields/${fieldModal.record.id}` : `/api/workflow/template-nodes/${selectedNode.id}/form-fields`, {
        method: fieldModal.record ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...values,
          options: String(values.optionsText ?? '')
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      message.success(fieldModal.record ? '表单字段已更新' : '表单字段已新增');
      setFieldModal({ open: false });
      await loadTemplates();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteField = async (record: WorkflowFormField) => {
    await apiRequest(`/api/workflow/form-fields/${record.id}`, { method: 'DELETE' });
    message.success('表单字段已删除');
    await loadTemplates();
  };

  const openFileModal = (record?: WorkflowFileRequirement) => {
    setFileModal({ open: true, record });
    fileForm.setFieldsValue(record ?? { required: false, allowedTypes: 'jpg,png,pdf,xlsx,docx', maxCount: 20, customerVisible: false, downloadable: true });
  };

  const saveFileRequirement = async () => {
    if (!selectedNode) return;
    const values = await fileForm.validateFields();
    setSaving(true);
    try {
      await apiRequest(fileModal.record ? `/api/workflow/file-requirements/${fileModal.record.id}` : `/api/workflow/template-nodes/${selectedNode.id}/file-requirements`, {
        method: fileModal.record ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      });
      message.success(fileModal.record ? '附件要求已更新' : '附件要求已新增');
      setFileModal({ open: false });
      await loadTemplates();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteFileRequirement = async (record: WorkflowFileRequirement) => {
    await apiRequest(`/api/workflow/file-requirements/${record.id}`, { method: 'DELETE' });
    message.success('附件要求已删除');
    await loadTemplates();
  };

  const deleteNode = async (record: WorkflowTemplateNode) => {
    await apiRequest(`/api/workflow/template-nodes/${record.id}`, { method: 'DELETE' });
    message.success('节点已删除');
    await loadTemplates();
  };

  const templateColumns: ColumnsType<WorkflowTemplate> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      width: 240,
      render: (value, record) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => setSelectedTemplateId(record.id)}>
          {value}
        </Button>
      ),
    },
    { title: '适用业务', dataIndex: 'businessType', width: 160 },
    { title: '节点数量', width: 100, render: (_, record) => record.nodes?.length ?? 0 },
    { title: '状态', dataIndex: 'enabled', width: 100, render: (value) => <Tag color={value ? 'success' : 'default'}>{value ? '启用' : '停用'}</Tag> },
    { title: '创建人', dataIndex: 'createdBy', width: 120 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180, render: (value) => formatBeijingTime(value, true) },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openTemplateModal(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该模板？" onConfirm={() => void deleteTemplate(record)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const nodeColumns: ColumnsType<WorkflowTemplateNode> = [
    { title: '排序', dataIndex: 'sortOrder', width: 80 },
    { title: '节点名称', dataIndex: 'nodeName', width: 160 },
    { title: '节点类型', dataIndex: 'nodeType', width: 120 },
    { title: '默认负责人', dataIndex: 'defaultOwner', width: 130 },
    { title: '默认角色', dataIndex: 'defaultRoleName', width: 130, render: (value) => value || '-' },
    { title: '必经', dataIndex: 'required', width: 80, render: (value) => (value ? '是' : '否') },
    { title: '可跳过', dataIndex: 'allowSkip', width: 90, render: (value) => (value ? '是' : '否') },
    { title: '可退回', dataIndex: 'allowReturn', width: 90, render: (value) => (value ? '是' : '否') },
    { title: '需客户确认', dataIndex: 'requireCustomerConfirm', width: 110, render: (value) => (value ? '是' : '否') },
    { title: '需附件', dataIndex: 'requireAttachment', width: 90, render: (value) => (value ? '是' : '否') },
    { title: '需供应商', dataIndex: 'requireSupplier', width: 100, render: (value) => (value ? '是' : '否') },
    { title: '供应商类型', dataIndex: 'supplierTypes', width: 180, render: (value) => stringArrayValue(value).join('、') || '-' },
    { title: '需GPS', dataIndex: 'requireGps', width: 90, render: (value) => (value ? '是' : '否') },
    { title: '超时小时', dataIndex: 'timeoutHours', width: 100 },
    { title: '工作时间', dataIndex: 'workingTimeRuleName', width: 180, render: (value) => value || '-' },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openNodeModal(record)} />
          <Button size="small" onClick={() => setSelectedNode(record)}>
            配置
          </Button>
          <Popconfirm title="确认删除该节点？" onConfirm={() => void deleteNode(record)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card
        className="glass-card"
        title="流程模板"
        bordered={false}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => void loadTemplates()} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openTemplateModal()}>
              新建模板
            </Button>
          </Space>
        }
      >
        <Table rowKey="id" loading={loading} dataSource={templates} columns={templateColumns} scroll={{ x: 1200 }} />
      </Card>

      <Drawer
        title={selectedTemplate ? `${selectedTemplate.name} · 节点配置` : '节点配置'}
        open={Boolean(selectedTemplate)}
        width={980}
        zIndex={1100}
        onClose={() => setSelectedTemplateId(null)}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openNodeModal()} disabled={!selectedTemplate}>
            新增节点
          </Button>
        }
      >
        <Table rowKey="id" dataSource={selectedTemplate?.nodes ?? []} columns={nodeColumns} scroll={{ x: 1470 }} pagination={false} />
      </Drawer>

      <Drawer
        title={selectedNode ? `${selectedNode.nodeName} · 表单与附件配置` : '表单与附件配置'}
        open={Boolean(selectedNode)}
        width={980}
        zIndex={1200}
        onClose={() => setSelectedNode(null)}
      >
        {selectedNode ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card
              size="small"
              title="节点表单字段"
              extra={
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openFieldModal()}>
                  新增字段
                </Button>
              }
            >
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={selectedNode.formFields ?? []}
                columns={[
                  { title: '排序', dataIndex: 'sortOrder', width: 80 },
                  { title: '字段名称', dataIndex: 'fieldName', width: 160 },
                  { title: '字段标识', dataIndex: 'fieldKey', width: 160 },
                  { title: '类型', dataIndex: 'fieldType', width: 110 },
                  { title: '必填', dataIndex: 'required', width: 80, render: (value) => (value ? '是' : '否') },
                  { title: '选项', dataIndex: 'options', render: (value) => stringArrayValue(value).join('、') || '-' },
                  {
                    title: '操作',
                    width: 130,
                    render: (_, record) => (
                      <Space>
                        <Button size="small" icon={<EditOutlined />} onClick={() => openFieldModal(record)} />
                        <Popconfirm title="确认删除该字段？" onConfirm={() => void deleteField(record)}>
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>

            <Card
              size="small"
              title="节点附件要求"
              extra={
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openFileModal()}>
                  新增附件
                </Button>
              }
            >
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={selectedNode.fileRequirements ?? []}
                columns={[
                  { title: '附件名称', dataIndex: 'fileName', width: 180 },
                  { title: '必传', dataIndex: 'required', width: 80, render: (value) => (value ? '是' : '否') },
                  { title: '支持格式', dataIndex: 'allowedTypes', width: 180 },
                  { title: '最大数量', dataIndex: 'maxCount', width: 90 },
                  { title: '客户可见', dataIndex: 'customerVisible', width: 100, render: (value) => (value ? '是' : '否') },
                  { title: '可下载', dataIndex: 'downloadable', width: 90, render: (value) => (value ? '是' : '否') },
                  {
                    title: '操作',
                    width: 130,
                    render: (_, record) => (
                      <Space>
                        <Button size="small" icon={<EditOutlined />} onClick={() => openFileModal(record)} />
                        <Popconfirm title="确认删除该附件要求？" onConfirm={() => void deleteFileRequirement(record)}>
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          </Space>
        ) : null}
      </Drawer>

      <Modal title={templateModal.record ? '编辑流程模板' : '新建流程模板'} open={templateModal.open} onCancel={() => setTemplateModal({ open: false })} onOk={saveTemplate} confirmLoading={saving} width={680} zIndex={1300}>
        <Form form={templateForm} layout="vertical">
          <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="businessType" label="适用业务">
                <Input placeholder="如：大件运输、普通运输、清关服务" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="enabled" label="是否启用" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={nodeModal.record ? '编辑节点' : '新增节点'} open={nodeModal.open} onCancel={() => setNodeModal({ open: false })} onOk={saveNode} confirmLoading={saving} width={760} zIndex={1400}>
        <Form form={nodeForm} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sortOrder" label="节点排序">
                <InputNumber min={1} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="workflowNodeName" label="节点名称" rules={[{ required: true, message: '请输入节点名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="workflowNodeType" label="节点类型">
                <Select options={nodeTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="defaultOwner" label="默认负责人">
                <Select allowClear showSearch optionFilterProp="label" options={employeeOptions} placeholder="请选择默认负责人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="defaultRoleId" label="默认角色">
                <Select allowClear showSearch optionFilterProp="label" options={roleOptions} placeholder="请选择默认角色" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="timeoutHours" label="超时时间/小时">
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="workingTimeRuleId" label="工作时间规则">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={workingTimeRuleOptions}
                  placeholder="用于计划时间预测和预警，不限制实际操作"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="required" label="是否必经" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="allowSkip" label="允许跳过" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="allowReturn" label="允许退回" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="requireCustomerConfirm" label="需要客户确认" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="requireAttachment" label="需要上传附件" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="requireSupplier" label="需要供应商" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="requireVehicle" label="需要车辆" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="requireDriver" label="需要司机" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="requireGps" label="需要GPS" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="supplierTypes" label="允许供应商类型">
            <Select mode="multiple" allowClear options={supplierTypeOptions} placeholder="不选择则操作时不过滤供应商类型" />
          </Form.Item>
          <Form.Item name="description" label="节点说明">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={fieldModal.record ? '编辑表单字段' : '新增表单字段'} open={fieldModal.open} onCancel={() => setFieldModal({ open: false })} onOk={saveField} confirmLoading={saving} zIndex={1400}>
        <Form form={fieldForm} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sortOrder" label="排序">
                <InputNumber min={1} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fieldName" label="字段名称" rules={[{ required: true, message: '请输入字段名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fieldKey" label="字段标识" rules={[{ required: true, message: '请输入字段标识' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fieldType" label="字段类型">
                <Select options={fieldTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="required" label="是否必填" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="optionsText" label="选项，每行一个">
            <Input.TextArea rows={4} placeholder="字段类型为 select 时使用" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={fileModal.record ? '编辑附件要求' : '新增附件要求'} open={fileModal.open} onCancel={() => setFileModal({ open: false })} onOk={saveFileRequirement} confirmLoading={saving} zIndex={1400}>
        <Form form={fileForm} layout="vertical">
          <Form.Item name="fileName" label="附件名称" rules={[{ required: true, message: '请输入附件名称' }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="allowedTypes" label="支持格式">
                <Input placeholder="jpg,png,pdf,xlsx,docx" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxCount" label="最大数量">
                <InputNumber min={1} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="required" label="是否必传" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="customerVisible" label="客户可见" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="downloadable" label="可下载" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
}

export function WorkflowTodoPage({ onOpenTask }: { onOpenTask?: (todo: WorkflowTodo) => void }) {
  const [todos, setTodos] = useState<WorkflowTodo[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState('未处理');

  const loadTodos = async () => {
    setLoading(true);
    try {
      const result = await apiRequest<{ items: WorkflowTodo[] }>('/api/workflow/todos');
      setTodos(result.items ?? []);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTodos();
  }, []);

  const updateTodoStatus = async (record: WorkflowTodo, status: string) => {
    try {
      await apiRequest(`/api/workflow/todos/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      message.success(status === '已处理' ? '待办已处理' : '待办已重新打开');
      await loadTodos();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const visibleTodos = useMemo(
    () => (activeStatus === '全部' ? todos : todos.filter((item) => item.status === activeStatus)),
    [activeStatus, todos],
  );

  const columns: ColumnsType<WorkflowTodo> = [
    { title: '待办标题', dataIndex: 'title', width: 240 },
    { title: '客户名称', dataIndex: 'customerName', width: 180 },
    { title: '项目名称', dataIndex: 'projectName', width: 220 },
    { title: '任务号', dataIndex: 'taskNo', width: 170 },
    { title: '节点', dataIndex: 'nodeName', width: 130 },
    {
      title: '指派给',
      width: 160,
      render: (_, record) => record.owner || record.ownerRoleName || '-',
    },
    { title: '截止时间', dataIndex: 'dueAt', width: 170, render: (value) => formatBeijingTime(value, true) },
    { title: '优先级', dataIndex: 'priority', width: 100 },
    { title: '状态', dataIndex: 'status', width: 100, render: (value) => <Tag color={value === '未处理' ? 'warning' : 'success'}>{value}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: (value) => formatBeijingTime(value, true) },
    {
      title: '操作',
      width: 220,
      fixed: 'right',
      render: (_, record) =>
        record.status === '已处理' ? (
          <Space>
            <Button size="small" type="primary" onClick={() => onOpenTask?.(record)} disabled={!record.taskId}>
              查看任务
            </Button>
            <Button size="small" onClick={() => void updateTodoStatus(record, '未处理')}>
              重新打开
            </Button>
          </Space>
        ) : (
          <Space>
            <Button size="small" type="primary" onClick={() => onOpenTask?.(record)} disabled={!record.taskId}>
              处理任务
            </Button>
            <Button size="small" onClick={() => void updateTodoStatus(record, '已处理')}>
              标记已处理
            </Button>
          </Space>
        ),
    },
  ];

  return (
    <Card
      className="glass-card"
      title="我的待办"
      bordered={false}
      extra={
        <Button icon={<ReloadOutlined />} onClick={() => void loadTodos()} loading={loading}>
          刷新
        </Button>
      }
    >
      <Tabs
        activeKey={activeStatus}
        onChange={setActiveStatus}
        items={['未处理', '已处理', '全部'].map((status) => ({
          key: status,
          label: `${status} ${status === '全部' ? todos.length : todos.filter((item) => item.status === status).length}`,
        }))}
      />
      <Table rowKey="id" loading={loading} dataSource={visibleTodos} columns={columns} scroll={{ x: 1600 }} pagination={{ pageSize: 10 }} />
    </Card>
  );
}
