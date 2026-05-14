import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Layout,
  List,
  Menu,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
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
  CheckCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReloadOutlined,
  RocketOutlined,
  SettingOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { apiRequest } from './api/client';
import { clearSession, getSessionUser, getToken, saveSession, type SessionUser } from './api/auth';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type SectionKey = 'inquiries' | 'plans' | 'baseInfo';

type Customer = {
  id: string;
  name: string;
  shortName?: string | null;
  phone?: string | null;
  email?: string | null;
  region?: string | null;
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
  createdAt: string;
  updatedAt: string;
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
  status: string;
  createdAt: string;
  updatedAt: string;
  plans: TransportPlan[];
};

const statusMeta: Record<string, { text: string; color: string }> = {
  NEW: { text: '待生成方案', color: 'gold' },
  PLAN_READY: { text: '方案已生成', color: 'green' },
  CONFIRMED: { text: '客户已确认', color: 'blue' },
  CLOSED: { text: '已关闭', color: 'default' },
};

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

export default function App() {
  const [loginForm] = Form.useForm();
  const [inquiryForm] = Form.useForm();
  const [planForm] = Form.useForm();
  const [employeeForm] = Form.useForm();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(getSessionUser());
  const [activeSection, setActiveSection] = useState<SectionKey>('inquiries');
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [loginLoading, setLoginLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inquiries, setInquiries] = useState<TransportInquiry[]>([]);
  const [plans, setPlans] = useState<TransportPlan[]>([]);
  const [inquiryDrawerOpen, setInquiryDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<TransportInquiry | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

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
      const [customerRes, inquiryRes, planRes, employeeRes] = await Promise.all([
        apiRequest<{ items: Customer[] }>('/api/customers'),
        apiRequest<{ items: TransportInquiry[] }>('/api/transport-inquiries'),
        apiRequest<{ items: TransportPlan[] }>('/api/transport-plans'),
        apiRequest<{ items: Employee[] }>('/api/employees'),
      ]);
      setCustomers(customerRes.items ?? []);
      setInquiries(inquiryRes.items ?? []);
      setPlans(planRes.items ?? []);
      setEmployees(employeeRes.items ?? []);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (getToken()) {
      void loadData();
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

  const uploadCargoFiles = async (files: UploadFile[] = []) => {
    const uploaded: CargoFile[] = [];
    for (const item of files) {
      if (!item.originFileObj) {
        continue;
      }
      const formData = new FormData();
      formData.append('file', item.originFileObj);
      formData.append('folder', 'transport-inquiries');
      uploaded.push(await apiRequest<CargoFile>('/api/uploads', { method: 'POST', body: formData }));
    }
    return uploaded;
  };

  const createInquiry = async (values: Partial<TransportInquiry> & { cargoUploadFiles?: UploadFile[] }) => {
    const customer = customers.find((item) => item.id === values.customerId);
    try {
      const cargoFiles = await uploadCargoFiles(values.cargoUploadFiles);
      await apiRequest<TransportInquiry>('/api/transport-inquiries', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          cargoUploadFiles: undefined,
          cargoFiles,
          customerName: values.customerName || customer?.shortName || customer?.name,
        }),
      });
      message.success('询单已创建');
      setInquiryDrawerOpen(false);
      inquiryForm.resetFields();
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
      message.success('运输方案已生成');
      setPlanModalOpen(false);
      planForm.resetFields();
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
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
      if (editingEmployee) {
        await apiRequest(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
        message.success('员工信息已更新');
      } else {
        await apiRequest('/api/employees', {
          method: 'POST',
          body: JSON.stringify(values),
        });
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

  const openDetail = (record: TransportInquiry) => {
    setSelectedInquiry(record);
    setDetailDrawerOpen(true);
  };

  const inquiryColumns: ColumnsType<TransportInquiry> = [
    {
      title: '询单号',
      dataIndex: 'inquiryNo',
      fixed: 'left',
      render: (value, record) => (
        <Button type="link" style={{ paddingInline: 0 }} onClick={() => openDetail(record)}>
          {value}
        </Button>
      ),
    },
    { title: '客户', dataIndex: 'customerName' },
    { title: '业务员', render: (_, row) => row.salesperson || '-' },
    { title: '货物', dataIndex: 'cargoName' },
    { title: '线路', render: (_, row) => `${row.origin} -> ${row.destination}` },
    { title: '重量/体积', render: (_, row) => `${row.weightKg ?? '-'} kg / ${row.volumeCbm ?? '-'} m3` },
    { title: '文件', render: (_, row) => <Tag icon={<PaperClipOutlined />}>{row.cargoFiles?.length ?? 0}</Tag> },
    { title: '期望到达', render: (_, row) => dateText(row.targetArrivalDate) },
    { title: '状态', render: (_, row) => statusTag(row.status) },
    {
      title: '操作',
      fixed: 'right',
      render: (_, row) => (
        <Space>
          <Button type="link" onClick={() => openDetail(row)}>
            查看
          </Button>
          <Button
            type="link"
            icon={<RocketOutlined />}
            onClick={() => {
              setSelectedInquiry(row);
              setPlanModalOpen(true);
            }}
          >
            生成方案
          </Button>
        </Space>
      ),
    },
  ];

  const planColumns: ColumnsType<TransportPlan> = [
    { title: '方案号', dataIndex: 'planNo' },
    { title: '询单号', dataIndex: 'inquiryNo' },
    { title: '客户', dataIndex: 'customerName' },
    { title: '方案标题', dataIndex: 'title' },
    { title: '时效', render: (_, row) => `${row.transitDays} 天` },
    { title: '预估费用', render: (_, row) => `${row.estimatedCost} ${row.currency}` },
    { title: '状态', render: (_, row) => <Tag color="blue">{row.status}</Tag> },
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
    {
      title: '状态',
      render: (_, row) => <Tag color={row.status === 'ACTIVE' ? 'green' : 'default'}>{row.status === 'ACTIVE' ? '启用' : '停用'}</Tag>,
    },
    {
      title: '操作',
      render: (_, row) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => openEmployeeModal(row)}>
          编辑
        </Button>
      ),
    },
  ];

  const sectionTitle: Record<SectionKey, string> = {
    inquiries: '询单管理',
    plans: '生成方案',
    baseInfo: '基础信息',
  };

  if (!sessionUser) {
    return (
      <div className="login-shell">
        <Card className="login-panel" bordered={false}>
          <Space direction="vertical" size={22} style={{ width: '100%' }}>
            <div className="brand-lockup">
              <div className="brand-mark">T</div>
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  中亚运输管理系统
                </Title>
                <Text type="secondary">询单录入、方案生成、Cloudflare 部署的第一版工作台</Text>
              </div>
            </div>
            <Alert
              type="info"
              showIcon
              message="默认演示账号"
              description="admin@obiecrm.com / Admin123!"
            />
            <Form
              form={loginForm}
              layout="vertical"
              initialValues={{ email: 'admin@obiecrm.com', password: 'Admin123!' }}
              onFinish={(values) => void login(values)}
            >
              <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
                <Input size="large" />
              </Form.Item>
              <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password size="large" />
              </Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={loginLoading}>
                登录系统
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
            <div className="brand-mark">T</div>
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
        {!siderCollapsed && <div className="sidebar-note">先跑通询单与生成方案，再逐步扩展报价、调度、在途和财务。</div>}
        <Menu
          mode="inline"
          selectedKeys={[activeSection]}
          inlineCollapsed={siderCollapsed}
          onClick={(event) => setActiveSection(event.key as SectionKey)}
          items={[
            { key: 'inquiries', icon: <FileTextOutlined />, label: '询单管理' },
            { key: 'plans', icon: <RocketOutlined />, label: '生成方案' },
            { key: 'baseInfo', icon: <SettingOutlined />, label: '基础信息' },
          ]}
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
            {activeSection === 'baseInfo' ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openEmployeeModal()}>
                新增员工
              </Button>
            ) : (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setInquiryDrawerOpen(true)}>
                新建询单
              </Button>
            )}
          </Space>
        </Header>

        <Content className="crm-content">
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} xl={6}>
                <Card className="metric-card">
                  <Statistic title="询单总数" value={stats.inquiryCount} prefix={<FileTextOutlined />} />
                </Card>
              </Col>
              <Col xs={24} sm={12} xl={6}>
                <Card className="metric-card">
                  <Statistic title="待生成方案" value={stats.waiting} />
                </Card>
              </Col>
              <Col xs={24} sm={12} xl={6}>
                <Card className="metric-card">
                  <Statistic title="已生成方案" value={stats.ready} prefix={<CheckCircleOutlined />} />
                </Card>
              </Col>
              <Col xs={24} sm={12} xl={6}>
                <Card className="metric-card">
                  <Statistic title="方案数" value={stats.planCount} prefix={<RocketOutlined />} />
                </Card>
              </Col>
            </Row>

            {activeSection === 'inquiries' ? (
              <Card className="glass-card" title="询单列表" bordered={false}>
                <Table
                  rowKey="id"
                  loading={loading}
                  dataSource={inquiries}
                  columns={inquiryColumns}
                  scroll={{ x: 1180 }}
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            ) : activeSection === 'plans' ? (
              <Card className="glass-card" title="运输方案库" bordered={false}>
                <Table
                  rowKey="id"
                  loading={loading}
                  dataSource={plans}
                  columns={planColumns}
                  expandable={{
                    expandedRowRender: (record) => (
                      <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{record.planText}</Paragraph>
                    ),
                  }}
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            ) : (
              <Card
                className="glass-card"
                title="员工与业务员"
                bordered={false}
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openEmployeeModal()}>
                    新增员工
                  </Button>
                }
              >
                <Table
                  rowKey="id"
                  loading={loading}
                  dataSource={employees}
                  columns={employeeColumns}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )}
          </Space>
        </Content>
      </Layout>

      <Drawer
        title="新建运输询单"
        width={620}
        open={inquiryDrawerOpen}
        onClose={() => setInquiryDrawerOpen(false)}
        destroyOnHidden
      >
        <Form
          form={inquiryForm}
          layout="vertical"
          initialValues={{ cargoType: '普货', customsMode: '一般贸易', temperatureRequirement: '常温' }}
          onFinish={(values) => void createInquiry(values)}
        >
          <Form.Item name="customerId" label="客户">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={customers.map((item) => ({ value: item.id, label: item.shortName || item.name }))}
            />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称" rules={[{ required: true, message: '请选择或填写客户' }]}>
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
                <Select options={['普货', '大件', '冷链', '危险品', '电商小包'].map((value) => ({ value, label: value }))} />
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
            label="客户货物文件"
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList ?? []}
            extra="支持上传客户原始询价单、货物清单、装箱资料、图片、PDF、Excel、Word 等文件。"
          >
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存询单
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
                        description={`${item.fileType || '未知类型'} · ${fileSizeText(item.fileSize)}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无客户货物文件" />
              )}
            </Card>
            <Button
              type="primary"
              icon={<RocketOutlined />}
              onClick={() => setPlanModalOpen(true)}
            >
              生成运输方案
            </Button>
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
                <Empty description="还没有方案" />
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
          message="可直接生成系统建议方案，也可以填写覆盖项后生成。"
        />
        <Form form={planForm} layout="vertical" onFinish={(values) => void generatePlan(values)}>
          <Form.Item name="title" label="方案标题">
            <Input placeholder="不填则自动生成" />
          </Form.Item>
          <Form.Item name="route" label="推荐路线">
            <Input placeholder="不填则按起运地、目的地和中亚口岸自动生成" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="transitDays" label="预计天数">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="estimatedCost" label="预估费用">
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
            <TextArea rows={5} placeholder="不填则自动生成操作节点、风险提示和费用说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingEmployee ? '编辑员工' : '新增员工'}
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
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入员工姓名' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="电话">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="department" label="部门">
                <Input placeholder="如：业务部、操作部、财务部" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="position" label="岗位">
                <Input placeholder="如：业务员、操作、经理" />
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
              <Form.Item name="status" label="状态" initialValue="ACTIVE">
                <Select
                  options={[
                    { value: 'ACTIVE', label: '启用' },
                    { value: 'INACTIVE', label: '停用' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
