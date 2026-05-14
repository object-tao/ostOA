import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  Layout,
  List,
  Menu,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ApartmentOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  SearchOutlined,
  TagsOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { apiRequest } from './api/client';
import { clearSession, getSessionUser, getToken, saveSession, type SessionUser } from './api/auth';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

type DashboardData = {
  customerCount: number;
  contactCount: number;
  reminderCount: number;
  attachmentCount: number;
  tagHighlights: Array<{ name: string; usageCount: number }>;
  recentActivities: Array<{ id: string; title: string; detail: string; createdAt: string }>;
};

type TagOption = {
  id: string;
  name: string;
  color: string;
  groupName: string;
};

type ProductOption = {
  id: string;
  name: string;
  category?: string | null;
  notes?: string | null;
};

type TagGroup = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  tags: Array<{ id: string; name: string; color: string; groupId: string }>;
};

type Customer = {
  id: string;
  name: string;
  customerCode?: string | null;
  shortName?: string | null;
  detailedAddress?: string | null;
  companyProfile?: string | null;
  industry: string;
  phone: string;
  email: string;
  website: string;
  instagram?: string | null;
  whatsapp?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  region: string;
  cooperationStatus: string;
  notes: string;
  contactCount: number;
  tags: TagOption[];
  products: ProductOption[];
};

type Contact = {
  id: string;
  customerId?: string | null;
  customerName?: string | null;
  name: string;
  title: string;
  department?: string | null;
  phone: string;
  email: string;
  wechat: string;
  socialHandle: string;
  companyName: string;
  relationshipNote: string;
  meetingContext: string;
  coreValue: string;
  businessCardName?: string;
  businessCardUrl?: string;
  tags: TagOption[];
};

type TimelineEntry = {
  id: string;
  followUpDate: string;
  followUpType: string;
  summary: string;
  todoReminderAt?: string | null;
  contactId?: string | null;
  contactName?: string | null;
  customerId?: string | null;
  customerName?: string | null;
};

type FollowUpEntry = TimelineEntry & {
  entityType: 'customer' | 'contact';
  entityId: string;
  entityName: string;
  attachments: Attachment[];
};

type Attachment = {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize?: number | null;
  notes?: string | null;
  createdAt: string;
};

type CustomerDetail = Customer & {
  timeline: TimelineEntry[];
  attachments: Attachment[];
  contacts: Contact[];
};

type ContactDetail = Contact & {
  timeline: TimelineEntry[];
  attachments: Attachment[];
};

type SearchResults = {
  customers: Customer[];
  contacts: Contact[];
};

type LoginResponse = {
  token: string;
  user: SessionUser;
};

type SectionKey = 'dashboard' | 'customers' | 'contacts' | 'followups' | 'search' | 'tags';
type ImportTarget = 'customer' | 'contact';

const customerImportHeaders = [
  '客户编号',
  '客户简称',
  '客户名称',
  '行业',
  '国家/地区',
  '详细地址',
  '合作状态',
  '电话',
  '邮箱',
  '网站',
  'Instagram',
  'WhatsApp',
  'LinkedIn',
  'Facebook',
  '产品',
  '标签',
  '公司简介',
  '备注',
];

const contactImportHeaders = [
  '姓名',
  '职位',
  '部门',
  '所属客户',
  '所属公司',
  '电话',
  '邮箱',
  '微信',
  '社交账号',
  '标签',
  '相识场景',
  '关系备注',
  '核心价值',
  '名片文件名',
  '名片文件链接',
];

const customerTemplateRows = [
  customerImportHeaders,
  [
    'C-2026-001',
    '示例简称',
    '示例客户有限公司',
    '跨境电商',
    '哈萨克斯坦',
    '详细地址示例',
    '潜在客户',
    '+86 13800000000',
    'demo@example.com',
    'https://example.com',
    '@demo',
    '+8613800000000',
    'https://linkedin.com/company/demo',
    'https://facebook.com/demo',
    '鲜花；服装',
    '集运客户；跨境电商',
    '这里填写公司简介',
    '这里填写备注',
  ],
];

const contactTemplateRows = [
  contactImportHeaders,
  [
    '张三',
    '总经理',
    '业务部',
    '示例客户有限公司',
    '示例客户有限公司',
    '+86 13800000000',
    'zhangsan@example.com',
    'wechat-demo',
    '@demo',
    '企业客户；政府关系',
    '展会认识',
    '关键联系人',
    '能协助对接资源',
    'zhangsan-card.jpg',
    'https://example.com/card.jpg',
  ],
];

const sectionLabels: Record<SectionKey, string> = {
  dashboard: '总览',
  customers: '客户管理',
  contacts: '人脉管理',
  followups: '跟进记录',
  search: '标签检索',
  tags: '标签配置',
};

function formatDate(value?: string | null) {
  if (!value) {
    return '--';
  }
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function fallback(value?: string | null, empty = '未填写') {
  return value && value.trim() ? value : empty;
}

function csvEscape(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function downloadCsvTemplate(target: ImportTarget) {
  const rows = target === 'customer' ? customerTemplateRows : contactTemplateRows;
  const csv = `\uFEFF${rows.map((row) => row.map(csvEscape).join(',')).join('\r\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = target === 'customer' ? '客户导入模板.csv' : '人脉导入模板.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function splitImportList(value: string) {
  return value
    .split(/[;；,，、|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (char === '\n') {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }

  row.push(cell.trim());
  rows.push(row);
  return rows.filter((item) => item.some(Boolean));
}

function rowsToObjects(rows: string[][]) {
  const headers = rows[0] ?? [];
  return rows.slice(1).map((row) =>
    headers.reduce<Record<string, string>>((record, header, index) => {
      record[header.trim()] = row[index]?.trim() ?? '';
      return record;
    }, {}),
  );
}

function readImportFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file, 'utf-8');
  });
}

function LoginScreen({ onSuccess }: { onSuccess: (response: LoginResponse) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  async function handleSubmit(values: { email: string; password: string }) {
    setSubmitting(true);
    try {
      const response = await apiRequest<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      saveSession(response.token, response.user);
      onSuccess(response);
      message.success('登录成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-grid" />
      <div className="login-glow login-glow-left" />
      <div className="login-glow login-glow-right" />
      <Card className="login-panel" bordered={false}>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <div className="brand-lockup">
            <div className="brand-mark">O</div>
            <div>
              <Text className="eyebrow">自用 CRM</Text>
              <Title level={2} style={{ margin: 0 }}>
                人脉客户管理系统
              </Title>
            </div>
          </div>

          <Paragraph className="panel-copy">
            一个适合个人业务和人脉维护的轻量工作台，把客户、联系人、跟进记录、附件和标签检索放到同一个视图里。
          </Paragraph>

          <Card className="credential-card" bordered={false}>
            <Text strong>默认管理员账号</Text>
            <div>邮箱：admin@obiecrm.com</div>
            <div>密码：Admin123!</div>
          </Card>

          <Form
            form={form}
            layout="vertical"
            initialValues={{ email: 'admin@obiecrm.com', password: 'Admin123!' }}
            onFinish={handleSubmit}
          >
            <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
              <Input size="large" placeholder="请输入登录邮箱" />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password size="large" placeholder="请输入密码" />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
              登录系统
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
}

function TagPills({ tags }: { tags: TagOption[] }) {
  if (!tags.length) {
    return <Text type="secondary">暂无标签</Text>;
  }

  return (
    <Space wrap size={[6, 6]}>
      {tags.map((tag) => (
        <Tag color={tag.color} key={tag.id}>
          {tag.groupName} · {tag.name}
        </Tag>
      ))}
    </Space>
  );
}

export default function App() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(getSessionUser());
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpEntry[]>([]);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [customerFilters, setCustomerFilters] = useState<{
    q: string;
    industry?: string;
    country?: string;
    tagIds: string[];
  }>({ q: '', tagIds: [] });
  const [contactFilters, setContactFilters] = useState<{
    q: string;
    company?: string;
    tagIds: string[];
  }>({ q: '', tagIds: [] });
  const [searchResults, setSearchResults] = useState<SearchResults>({ customers: [], contacts: [] });
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [timelineModal, setTimelineModal] = useState<{
    open: boolean;
    entityType: 'customer' | 'contact';
    entityId: string | null;
  }>({
    open: false,
    entityType: 'customer',
    entityId: null,
  });
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [attachmentModal, setAttachmentModal] = useState<{
    open: boolean;
    entityType: 'customer' | 'contact';
    entityId: string | null;
  }>({
    open: false,
    entityType: 'customer',
    entityId: null,
  });
  const [tagGroupModalOpen, setTagGroupModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [contactCardFile, setContactCardFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [followUpFile, setFollowUpFile] = useState<File | null>(null);
  const [importTarget, setImportTarget] = useState<ImportTarget | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [searchForm] = Form.useForm();
  const [customerForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [timelineForm] = Form.useForm();
  const [followUpForm] = Form.useForm();
  const [attachmentForm] = Form.useForm();
  const [tagGroupForm] = Form.useForm();
  const [tagForm] = Form.useForm();
  const [productForm] = Form.useForm();

  const flatTags = useMemo(
    () =>
      tagGroups.flatMap((group) =>
        group.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          groupName: group.name,
        })),
      ),
    [tagGroups],
  );

  const tagSelectOptions = flatTags.map((tag) => ({
    value: tag.id,
    label: `${tag.groupName} / ${tag.name}`,
  }));
  const productSelectOptions = products.map((product) => ({
    value: product.id,
    label: product.category ? `${product.category} / ${product.name}` : product.name,
  }));
  const tagIdByName = new Map(
    flatTags.flatMap((tag) => [
      [tag.name.trim().toLowerCase(), tag.id],
      [`${tag.groupName}/${tag.name}`.trim().toLowerCase(), tag.id],
      [`${tag.groupName} / ${tag.name}`.trim().toLowerCase(), tag.id],
    ]),
  );
  const productIdByName = new Map(products.map((product) => [product.name.trim().toLowerCase(), product.id]));
  const customerIdByName = new Map(
    customers.flatMap((customer) =>
      [customer.name, customer.shortName, customer.customerCode]
        .filter(Boolean)
        .map((value) => [String(value).trim().toLowerCase(), customer.id] as const),
    ),
  );

  const customerIndustryOptions = Array.from(new Set(customers.map((item) => item.industry).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map((value) => ({ value, label: value }));
  const customerCountryOptions = Array.from(new Set(customers.map((item) => item.region).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map((value) => ({ value, label: value }));
  const contactCompanyOptions = Array.from(
    new Set(contacts.map((item) => item.companyName || item.customerName || '').filter(Boolean)),
  )
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map((value) => ({ value, label: value }));
  const customerKeyword = customerFilters.q.trim().toLowerCase();
  const filteredCustomers = customers.filter((item) => {
    const matchesKeyword =
      !customerKeyword ||
      [
        item.name,
        item.shortName,
        item.customerCode,
        item.industry,
        item.region,
        item.detailedAddress,
        ...(item.products ?? []).map((product) => product.name),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(customerKeyword));
    const matchesIndustry = !customerFilters.industry || item.industry === customerFilters.industry;
    const matchesCountry = !customerFilters.country || item.region === customerFilters.country;
    const matchesTags =
      customerFilters.tagIds.length === 0 ||
      customerFilters.tagIds.every((tagId) => item.tags.some((tag) => tag.id === tagId));
    return matchesKeyword && matchesIndustry && matchesCountry && matchesTags;
  });
  const contactKeyword = contactFilters.q.trim().toLowerCase();
  const filteredContacts = contacts.filter((item) => {
    const matchesKeyword =
      !contactKeyword ||
      [item.name, item.title, item.department, item.companyName, item.customerName, item.phone, item.email, item.wechat]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(contactKeyword));
    const matchesCompany =
      !contactFilters.company || item.companyName === contactFilters.company || item.customerName === contactFilters.company;
    const matchesTags =
      contactFilters.tagIds.length === 0 ||
      contactFilters.tagIds.every((tagId) => item.tags.some((tag) => tag.id === tagId));
    return matchesKeyword && matchesCompany && matchesTags;
  });

  const customerOptions = customers.map((item) => ({ value: item.id, label: item.name }));
  const followUpTargetOptions = [
    ...contacts.map((item) => ({
      value: `contact:${item.id}`,
      label: `人脉 / ${item.name}${item.companyName ? `（${item.companyName}）` : ''}`,
    })),
    ...customers.map((item) => ({
      value: `customer:${item.id}`,
      label: `客户 / ${item.name}`,
    })),
  ];
  const followUpTypeOptions = ['加微信', '回访跟进', '打电话', '发微信', '拜访', '发邮件', '其它'].map((value) => ({
    value,
    label: value,
  }));

  async function bootstrapSession() {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest<{ user: SessionUser }>('/api/auth/me');
      saveSession(getToken() ?? '', response.user);
      setSessionUser(response.user);
    } catch {
      clearSession();
      setSessionUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadWorkspace() {
    if (!sessionUser) {
      return;
    }

    try {
      const [dashboardData, customerData, contactData, followUpData, tagGroupData, productData] = await Promise.all([
        apiRequest<DashboardData>('/api/dashboard'),
        apiRequest<{ items: Customer[] }>('/api/customers'),
        apiRequest<{ items: Contact[] }>('/api/contacts'),
        apiRequest<{ items: FollowUpEntry[] }>('/api/follow-ups'),
        apiRequest<{ items: TagGroup[] }>('/api/tag-groups'),
        apiRequest<{ items: ProductOption[] }>('/api/products'),
      ]);
      setDashboard(dashboardData);
      setCustomers(customerData.items);
      setContacts(contactData.items);
      setFollowUps(followUpData.items);
      setTagGroups(tagGroupData.items);
      setProducts(productData.items);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载工作台失败');
    }
  }

  useEffect(() => {
    void bootstrapSession();
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [sessionUser]);

  async function refreshOpenDetail() {
    if (selectedCustomer) {
      await openCustomerDetail(selectedCustomer.id);
    }
    if (selectedContact) {
      await openContactDetail(selectedContact.id);
    }
  }

  async function openCustomerDetail(id: string) {
    setDetailLoading(true);
    try {
      const detail = await apiRequest<CustomerDetail>(`/api/customers/${id}`);
      setSelectedCustomer(detail);
    } finally {
      setDetailLoading(false);
    }
  }

  async function openContactDetail(id: string) {
    setDetailLoading(true);
    try {
      const detail = await apiRequest<ContactDetail>(`/api/contacts/${id}`);
      setSelectedContact(detail);
    } finally {
      setDetailLoading(false);
    }
  }

  function openCustomerCreate() {
    setEditingCustomer(null);
    customerForm.resetFields();
    setCustomerModalOpen(true);
  }

  function openCustomerEdit(customer: Customer) {
    setEditingCustomer(customer);
    customerForm.setFieldsValue({
      name: customer.name,
      customerCode: customer.customerCode,
      shortName: customer.shortName,
      detailedAddress: customer.detailedAddress,
      companyProfile: customer.companyProfile,
      industry: customer.industry,
      region: customer.region,
      phone: customer.phone,
      email: customer.email,
      website: customer.website,
      instagram: customer.instagram,
      whatsapp: customer.whatsapp,
      linkedin: customer.linkedin,
      facebook: customer.facebook,
      cooperationStatus: customer.cooperationStatus,
      notes: customer.notes,
      tagIds: customer.tags.map((tag) => tag.id),
      productIds: (customer.products ?? []).map((product) => product.id),
    });
    setCustomerModalOpen(true);
  }

  async function openCustomerEditById(id: string) {
    const detail = await apiRequest<CustomerDetail>(`/api/customers/${id}`);
    openCustomerEdit(detail);
  }

  async function submitCustomer(values: Record<string, unknown>) {
    const currentEditingCustomer = editingCustomer;
    await apiRequest(currentEditingCustomer ? `/api/customers/${currentEditingCustomer.id}` : '/api/customers', {
      method: currentEditingCustomer ? 'PATCH' : 'POST',
      body: JSON.stringify(values),
    });
    setCustomerModalOpen(false);
    setEditingCustomer(null);
    customerForm.resetFields();
    message.success(currentEditingCustomer ? '客户已更新' : '客户已创建');
    await loadWorkspace();
    if (currentEditingCustomer && selectedCustomer?.id === currentEditingCustomer.id) {
      await openCustomerDetail(currentEditingCustomer.id);
    }
  }

  async function deleteCustomer(customer: Customer) {
    await apiRequest(`/api/customers/${customer.id}`, {
      method: 'DELETE',
    });
    message.success('客户已删除');
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(null);
    }
    await loadWorkspace();
  }

  async function uploadFile(file: File, folder: string) {
    const body = new FormData();
    body.append('file', file);
    body.append('folder', folder);
    return apiRequest<{ fileName: string; fileType: string; fileUrl: string; fileSize: number }>('/api/uploads', {
      method: 'POST',
      body,
    });
  }

  async function createContact(values: Record<string, unknown>) {
    const payload = { ...values } as Record<string, unknown>;
    if (contactCardFile) {
      const uploaded = await uploadFile(contactCardFile, 'business-cards');
      payload.businessCardName = uploaded.fileName;
      payload.businessCardUrl = uploaded.fileUrl;
    }

    await apiRequest(editingContact ? `/api/contacts/${editingContact.id}` : '/api/contacts', {
      method: editingContact ? 'PATCH' : 'POST',
      body: JSON.stringify(payload),
    });
    setContactModalOpen(false);
    setEditingContact(null);
    setContactCardFile(null);
    contactForm.resetFields();
    message.success(editingContact ? '人脉已更新' : '人脉已创建');
    await loadWorkspace();
    if (editingContact && selectedContact?.id === editingContact.id) {
      await openContactDetail(editingContact.id);
    }
  }

  function openImportModal(target: ImportTarget) {
    setImportTarget(target);
    setImportFile(null);
  }

  function closeImportModal() {
    setImportTarget(null);
    setImportFile(null);
  }

  function mapNamesToIds(value: string, lookup: Map<string, string>) {
    return splitImportList(value)
      .map((item) => lookup.get(item.toLowerCase()))
      .filter((item): item is string => Boolean(item));
  }

  async function importCustomers(records: Array<Record<string, string>>) {
    let successCount = 0;
    for (const record of records) {
      const name = record['客户名称'] || record['名称'];
      if (!name) {
        continue;
      }

      await apiRequest('/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          customerCode: record['客户编号'] || `IMP-${Date.now()}-${successCount + 1}`,
          shortName: record['客户简称'],
          name,
          industry: record['行业'],
          region: record['国家/地区'] || record['地区'],
          detailedAddress: record['详细地址'],
          cooperationStatus: record['合作状态'] || '潜在客户',
          phone: record['电话'] || record['Tel'],
          email: record['邮箱'] || record['E-mail'],
          website: record['网站'] || record['Web'],
          instagram: record['Instagram'],
          whatsapp: record['WhatsApp'],
          linkedin: record['LinkedIn'],
          facebook: record['Facebook'],
          productIds: mapNamesToIds(record['产品'] ?? '', productIdByName),
          tagIds: mapNamesToIds(record['标签'] ?? '', tagIdByName),
          companyProfile: record['公司简介'],
          notes: record['备注'],
        }),
      });
      successCount += 1;
    }
    return successCount;
  }

  async function importContacts(records: Array<Record<string, string>>) {
    let successCount = 0;
    for (const record of records) {
      const name = record['姓名'] || record['人脉名称'];
      if (!name) {
        continue;
      }

      const linkedCustomer = record['所属客户'] || record['关联客户'];
      await apiRequest('/api/contacts', {
        method: 'POST',
        body: JSON.stringify({
          name,
          title: record['职位'],
          department: record['部门'],
          customerId: linkedCustomer ? customerIdByName.get(linkedCustomer.trim().toLowerCase()) : undefined,
          companyName: record['所属公司'] || linkedCustomer,
          phone: record['电话'],
          email: record['邮箱'],
          wechat: record['微信'],
          socialHandle: record['社交账号'],
          tagIds: mapNamesToIds(record['标签'] ?? '', tagIdByName),
          meetingContext: record['相识场景'],
          relationshipNote: record['关系备注'],
          coreValue: record['核心价值'],
          businessCardName: record['名片文件名'],
          businessCardUrl: record['名片文件链接'],
        }),
      });
      successCount += 1;
    }
    return successCount;
  }

  async function submitImport() {
    if (!importTarget || !importFile) {
      message.error('请先选择要导入的 CSV 文件');
      return;
    }

    setImporting(true);
    try {
      const rows = parseCsv(await readImportFile(importFile));
      const records = rowsToObjects(rows);
      const successCount = importTarget === 'customer' ? await importCustomers(records) : await importContacts(records);
      message.success(`导入完成：成功导入 ${successCount} 条`);
      closeImportModal();
      await loadWorkspace();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '导入失败，请检查模板格式');
    } finally {
      setImporting(false);
    }
  }

  function openContactCreate(defaultValues?: Partial<Contact>) {
    setEditingContact(null);
    setContactCardFile(null);
    contactForm.resetFields();
    if (defaultValues) {
      contactForm.setFieldsValue(defaultValues);
    }
    setContactModalOpen(true);
  }

  function openContactEdit(contact: Contact) {
    setEditingContact(contact);
    setContactCardFile(null);
    contactForm.setFieldsValue({
      name: contact.name,
      title: contact.title,
      department: contact.department,
      customerId: contact.customerId,
      companyName: contact.companyName,
      phone: contact.phone,
      email: contact.email,
      wechat: contact.wechat,
      socialHandle: contact.socialHandle,
      meetingContext: contact.meetingContext,
      relationshipNote: contact.relationshipNote,
      coreValue: contact.coreValue,
      businessCardName: contact.businessCardName,
      businessCardUrl: contact.businessCardUrl,
      tagIds: contact.tags.map((tag) => tag.id),
    });
    setContactModalOpen(true);
  }

  async function deleteContact(contact: Contact) {
    await apiRequest(`/api/contacts/${contact.id}`, {
      method: 'DELETE',
    });
    message.success('人脉已删除');
    if (selectedContact?.id === contact.id) {
      setSelectedContact(null);
    }
    await loadWorkspace();
  }

  async function createTimeline(values: Record<string, unknown>) {
    if (!timelineModal.entityId) {
      return;
    }
    await apiRequest(
      `/api/${timelineModal.entityType === 'customer' ? 'customers' : 'contacts'}/${timelineModal.entityId}/timelines`,
      {
        method: 'POST',
        body: JSON.stringify(values),
      },
    );
    setTimelineModal({ ...timelineModal, open: false, entityId: null });
    timelineForm.resetFields();
    message.success(timelineModal.entityType === 'contact' ? '联系记录已添加' : '跟进记录已添加');
    await loadWorkspace();
    await refreshOpenDetail();
  }

  async function createFollowUp(values: Record<string, unknown>) {
    const [entityType, entityId] = String(values.target ?? '').split(':') as ['customer' | 'contact', string];
    if ((entityType !== 'customer' && entityType !== 'contact') || !entityId) {
      message.error('请选择要跟进的客户或人脉');
      return;
    }

    const result = await apiRequest<{ id: string }>('/api/follow-ups', {
      method: 'POST',
      body: JSON.stringify({
        entityType,
        entityId,
        followUpDate: values.followUpDate,
        followUpType: values.followUpType,
        summary: values.summary,
        todoReminderAt: values.todoReminderAt || null,
      }),
    });

    if (followUpFile) {
      try {
        const uploaded = await uploadFile(followUpFile, 'follow-up-files');
        await apiRequest(`/api/${entityType === 'customer' ? 'customers' : 'contacts'}/${entityId}/attachments`, {
          method: 'POST',
          body: JSON.stringify({
            fileName: uploaded.fileName,
            fileType: uploaded.fileType,
            fileUrl: uploaded.fileUrl,
            fileSize: uploaded.fileSize,
            timelineId: result.id,
            notes: '跟进记录附件',
          }),
        });
      } catch (error) {
        message.warning(error instanceof Error ? `跟进已保存，但附件上传失败：${error.message}` : '跟进已保存，但附件上传失败');
      }
    }

    setFollowUpModalOpen(false);
    setFollowUpFile(null);
    followUpForm.resetFields();
    message.success('跟进记录已添加');
    await loadWorkspace();
    await refreshOpenDetail();
  }

  async function createAttachment(values: Record<string, unknown>) {
    if (!attachmentModal.entityId) {
      return;
    }

    const payload = { ...values } as Record<string, unknown>;
    if (attachmentFile) {
      const uploaded = await uploadFile(
        attachmentFile,
        attachmentModal.entityType === 'customer' ? 'customer-files' : 'contact-files',
      );
      payload.fileName = uploaded.fileName;
      payload.fileType = uploaded.fileType;
      payload.fileUrl = uploaded.fileUrl;
      payload.fileSize = uploaded.fileSize;
    }

    await apiRequest(
      `/api/${attachmentModal.entityType === 'customer' ? 'customers' : 'contacts'}/${attachmentModal.entityId}/attachments`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    setAttachmentModal({ ...attachmentModal, open: false, entityId: null });
    setAttachmentFile(null);
    attachmentForm.resetFields();
    message.success('附件已添加');
    await loadWorkspace();
    await refreshOpenDetail();
  }

  async function createTagGroup(values: Record<string, unknown>) {
    await apiRequest('/api/tag-groups', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    setTagGroupModalOpen(false);
    tagGroupForm.resetFields();
    message.success('标签组已创建');
    await loadWorkspace();
  }

  async function createTag(values: Record<string, unknown>) {
    await apiRequest('/api/tags', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    setTagModalOpen(false);
    tagForm.resetFields();
    message.success('标签已创建');
    await loadWorkspace();
  }

  async function createProduct(values: Record<string, unknown>) {
    await apiRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    setProductModalOpen(false);
    productForm.resetFields();
    message.success('产品已创建');
    await loadWorkspace();
  }

  async function runSearch(values: { q?: string; entityType?: 'all' | 'customer' | 'contact'; tagIds?: string[] }) {
    const params = new URLSearchParams();
    if (values.q) {
      params.set('q', values.q);
    }
    params.set('entityType', values.entityType ?? 'all');
    for (const tagId of values.tagIds ?? []) {
      params.append('tagIds', tagId);
    }
    const result = await apiRequest<SearchResults>(`/api/search?${params.toString()}`);
    setSearchResults(result);
  }

  function logout() {
    clearSession();
    setSessionUser(null);
    setDashboard(null);
    setCustomers([]);
    setContacts([]);
    setFollowUps([]);
    setTagGroups([]);
    setProducts([]);
    setCustomerFilters({ q: '', tagIds: [] });
    setContactFilters({ q: '', tagIds: [] });
    setSearchResults({ customers: [], contacts: [] });
    setSelectedCustomer(null);
    setSelectedContact(null);
    message.success('已退出登录');
  }

  const customerColumns: ColumnsType<Customer> = [
    {
      title: '客户',
      dataIndex: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Button type="link" style={{ padding: 0 }} onClick={() => void openCustomerDetail(record.id)}>
            {record.name}
          </Button>
          <Text type="secondary">{fallback(record.industry, '未填写行业')}</Text>
        </Space>
      ),
    },
    { title: '简称', dataIndex: 'shortName', render: (value) => fallback(value, '--') },
    { title: '客户编号', dataIndex: 'customerCode', render: (value) => fallback(value, '--') },
    { title: '详细地址', dataIndex: 'detailedAddress', render: (value) => fallback(value, '--') },
    { title: '地区', dataIndex: 'region', render: (value) => fallback(value, '--') },
    { title: '合作状态', dataIndex: 'cooperationStatus', render: (value) => fallback(value, '--') },
    { title: '关联人脉', dataIndex: 'contactCount' },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (value) => <TagPills tags={value as TagOption[]} />,
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" onClick={() => void openContactDetail(record.id)}>
            查看
          </Button>
          <Button
            type="link"
            onClick={() => setTimelineModal({ open: true, entityType: 'contact', entityId: record.id })}
          >
            记联系
          </Button>
        </Space>
      ),
    },
  ];

  const customerColumnsFixed: ColumnsType<Customer> = [
    {
      title: '行业 / 简称',
      dataIndex: 'shortName',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary">{fallback(record.industry, '未填写行业')}</Text>
          <Text>{fallback(record.shortName, '--')}</Text>
        </Space>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 360,
      render: (_, record) => (
        <Button
          type="link"
          className="table-name-link"
          style={{ padding: 0, whiteSpace: 'normal', textAlign: 'left' }}
          onClick={() => void openCustomerDetail(record.id)}
        >
          {record.name}
        </Button>
      ),
    },
    { title: '客户编号', dataIndex: 'customerCode', width: 150, render: (value) => fallback(value, '--') },
    { title: '详细地址', dataIndex: 'detailedAddress', width: 300, render: (value) => fallback(value, '--') },
    { title: '地区', dataIndex: 'region', width: 130, render: (value) => fallback(value, '--') },
    {
      title: '产品',
      dataIndex: 'products',
      width: 220,
      render: (value) => (
        <Space wrap size={[4, 4]}>
          {((value as ProductOption[]) ?? []).length ? (
            ((value as ProductOption[]) ?? []).map((product) => (
              <Tag key={product.id} color="blue">
                {product.name}
              </Tag>
            ))
          ) : (
            <Text type="secondary">--</Text>
          )}
        </Space>
      ),
    },
    { title: '合作状态', dataIndex: 'cooperationStatus', width: 120, render: (value) => fallback(value, '--') },
    { title: '关联人脉', dataIndex: 'contactCount', width: 100 },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 180,
      render: (value) => <TagPills tags={value as TagOption[]} />,
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 190,
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" onClick={() => void openCustomerDetail(record.id)}>
            查看
          </Button>
          <Button type="link" onClick={() => void openCustomerEditById(record.id)}>
            编辑
          </Button>
          <Button
            danger
            type="link"
            onClick={() => {
              Modal.confirm({
                title: '确认删除客户？',
                content: `删除后会移除客户档案、客户标签、客户附件和客户跟进记录；关联人脉会保留，但会解除与「${record.name}」的关联。`,
                okText: '删除',
                okButtonProps: { danger: true },
                cancelText: '取消',
                onOk: () => deleteCustomer(record),
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const contactColumns: ColumnsType<Contact> = [
    {
      title: '人脉',
      dataIndex: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Button type="link" style={{ padding: 0 }} onClick={() => void openContactDetail(record.id)}>
            {record.name}
          </Button>
          <Text type="secondary">{fallback(record.title, '未填写职位')}</Text>
        </Space>
      ),
    },
    { title: '部门', dataIndex: 'department', render: (value) => fallback(value, '--') },
    { title: '所属公司', dataIndex: 'companyName', render: (value) => fallback(value, '--') },
    { title: '电话', dataIndex: 'phone', render: (value) => fallback(value, '--') },
    { title: '关联客户', dataIndex: 'customerName', render: (value) => fallback(value, '--') },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (value) => <TagPills tags={value as TagOption[]} />,
    },
  ];

  const contactColumnsFixed: ColumnsType<Contact> = [
    {
      title: '人脉',
      dataIndex: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Button type="link" style={{ padding: 0 }} onClick={() => void openContactDetail(record.id)}>
            {record.name}
          </Button>
          <Text type="secondary">{fallback(record.title, '未填写职位')}</Text>
        </Space>
      ),
    },
    { title: '部门', dataIndex: 'department', render: (value) => fallback(value, '--') },
    { title: '所属公司', dataIndex: 'companyName', render: (value) => fallback(value, '--') },
    { title: '电话', dataIndex: 'phone', render: (value) => fallback(value, '--') },
    { title: '关联客户', dataIndex: 'customerName', render: (value) => fallback(value, '--') },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (value) => <TagPills tags={value as TagOption[]} />,
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 230,
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" onClick={() => void openContactDetail(record.id)}>
            查看
          </Button>
          <Button type="link" onClick={() => openContactEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => setTimelineModal({ open: true, entityType: 'contact', entityId: record.id })}
          >
            记联系
          </Button>
          <Button
            danger
            type="link"
            onClick={() => {
              Modal.confirm({
                title: '确认删除人脉？',
                content: `删除后会移除「${record.name}」的人脉档案、标签、附件和联系记录。`,
                okText: '删除',
                okButtonProps: { danger: true },
                cancelText: '取消',
                onOk: () => deleteContact(record),
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const followUpColumns: ColumnsType<FollowUpEntry> = [
    {
      title: '跟进对象',
      dataIndex: 'entityName',
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() =>
              record.entityType === 'contact'
                ? void openContactDetail(record.entityId)
                : void openCustomerDetail(record.entityId)
            }
          >
            {record.entityName}
          </Button>
          <Text type="secondary">{record.entityType === 'contact' ? '人脉' : '客户'}</Text>
        </Space>
      ),
    },
    { title: '跟进时间', dataIndex: 'followUpDate', width: 180, render: (value) => formatDate(value as string) },
    {
      title: '跟进类型',
      dataIndex: 'followUpType',
      width: 120,
      render: (value) => <Tag color="geekblue">{String(value)}</Tag>,
    },
    {
      title: '详情',
      dataIndex: 'summary',
      render: (value) => <Text>{String(value || '--')}</Text>,
    },
    {
      title: '附件',
      dataIndex: 'attachments',
      width: 180,
      render: (value) => {
        const attachments = value as Attachment[];
        return attachments.length ? (
          <Space direction="vertical" size={0}>
            {attachments.map((item) => (
              <a href={item.fileUrl} target="_blank" rel="noreferrer" key={item.id}>
                {item.fileName}
              </a>
            ))}
          </Space>
        ) : (
          <Text type="secondary">无附件</Text>
        );
      },
    },
  ];

  if (loading) {
    return <div className="app-loading">正在加载 CRM 工作台...</div>;
  }

  if (!sessionUser) {
    return (
      <LoginScreen
        onSuccess={(response) => {
          setSessionUser(response.user);
        }}
      />
    );
  }

  return (
    <>
      <Layout className="crm-shell">
        <Sider
          breakpoint="lg"
          collapsedWidth={84}
          width={292}
          collapsible
          collapsed={siderCollapsed}
          trigger={null}
          onCollapse={setSiderCollapsed}
          className={`crm-sider ${siderCollapsed ? 'crm-sider-collapsed' : ''}`}
        >
          <div className="sidebar-brand-row">
            <div className="brand-lockup brand-lockup-sidebar">
              <div className="brand-mark">O</div>
              <div className="brand-text">
                <Text className="eyebrow">关系资产台</Text>
                <Title level={4} style={{ margin: 0 }}>
                  人脉客户管理系统
                </Title>
              </div>
            </div>
            <Button
              className="sider-collapse-btn"
              type="text"
              icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSiderCollapsed((current) => !current)}
              aria-label={siderCollapsed ? '展开菜单' : '收起菜单'}
            />
          </div>

          <div className="sidebar-note">
            用标签做导航，把客户、人脉、跟进和附件沉淀成你自己的关系数据库。
          </div>

          <Menu
            mode="inline"
            theme="light"
            selectedKeys={[activeSection]}
            inlineCollapsed={siderCollapsed}
            onClick={(event) => setActiveSection(event.key as SectionKey)}
            items={[
              { key: 'dashboard', icon: <FolderOpenOutlined />, label: '总览' },
              { key: 'customers', icon: <ApartmentOutlined />, label: '客户管理' },
              { key: 'contacts', icon: <TeamOutlined />, label: '人脉管理' },
              { key: 'followups', icon: <ClockCircleOutlined />, label: '跟进记录' },
              { key: 'search', icon: <SearchOutlined />, label: '标签检索' },
              { key: 'tags', icon: <TagsOutlined />, label: '标签配置' },
            ]}
          />

          <div className="sidebar-user">
            <Avatar size={52}>{sessionUser.realName.slice(0, 1)}</Avatar>
            <div>
              <Text strong>
                {sessionUser.realName}
              </Text>
              <div className="sidebar-user-role">{sessionUser.roleName}</div>
            </div>
            <Button onClick={logout}>退出登录</Button>
          </div>
        </Sider>

        <Layout>
          <Header className="crm-header">
            <div>
              <Text className="eyebrow">自用 CRM 工作台</Text>
              <Title level={2} style={{ margin: 0 }}>
                {sectionLabels[activeSection]}
              </Title>
            </div>
            <Text className="header-note">
              支持移动端浏览器记录跟进、补充人脉信息和上传名片或 PDF。
            </Text>
          </Header>

          <Content className="crm-content">
            {activeSection === 'dashboard' && <section className="hero-panel">
              <div className="hero-copy-block">
                <Text className="eyebrow eyebrow-light">标签驱动的关系管理</Text>
                <Title className="hero-title">
                  不只是记住谁，
                  <br />
                  而是随时找回关键关系。
                </Title>
                <Paragraph className="hero-copy">
                  把客户档案、人脉上下文、跟进记录、回访提醒和附件统一沉淀下来。需要找人时，直接用
                  “地区 + 行业 + 决策层级” 做交集查询，就能快速定位目标关系。
                </Paragraph>
              </div>
              <div className="hero-stat-panel">
                <div className="hero-badge">轻量私有化</div>
                <div className="hero-chip-stack">
                  <Tag bordered={false}>客户档案</Tag>
                  <Tag bordered={false}>人脉关系</Tag>
                  <Tag bordered={false}>时间轴跟进</Tag>
                  <Tag bordered={false}>标签交集</Tag>
                </div>
              </div>
            </section>}

            {activeSection === 'dashboard' && (
              <Space direction="vertical" size={18} style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} xl={6}>
                    <Card className="metric-card" bordered={false}>
                      <Statistic title="客户总数" value={dashboard?.customerCount ?? 0} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} xl={6}>
                    <Card className="metric-card" bordered={false}>
                      <Statistic title="人脉总数" value={dashboard?.contactCount ?? 0} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} xl={6}>
                    <Card className="metric-card" bordered={false}>
                      <Statistic title="待回访事项" value={dashboard?.reminderCount ?? 0} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} xl={6}>
                    <Card className="metric-card" bordered={false}>
                      <Statistic title="附件数量" value={dashboard?.attachmentCount ?? 0} />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} xl={10}>
                    <Card className="glass-card" title="高频标签" bordered={false}>
                      <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        {(dashboard?.tagHighlights ?? []).length ? (
                          dashboard?.tagHighlights.map((item) => (
                            <div className="progress-row" key={item.name}>
                              <Text>{item.name}</Text>
                              <Tag color="gold">{item.usageCount} 次</Tag>
                            </div>
                          ))
                        ) : (
                          <Empty description="还没有标签使用数据" />
                        )}
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} xl={14}>
                    <Card className="glass-card" title="最近动态" bordered={false}>
                      {(dashboard?.recentActivities ?? []).length ? (
                        <List
                          dataSource={dashboard?.recentActivities ?? []}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Avatar icon={<ClockCircleOutlined />} />}
                                title={item.title}
                                description={
                                  <Space direction="vertical" size={2}>
                                    <Text>{item.detail}</Text>
                                    <Text type="secondary">{formatDate(item.createdAt)}</Text>
                                  </Space>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty description="还没有动态记录" />
                      )}
                    </Card>
                  </Col>
                </Row>
              </Space>
            )}

            {activeSection === 'customers' && (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card className="glass-card filter-card" title="客户筛选" bordered={false}>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} lg={8}>
                      <Form.Item label="搜索" className="compact-form-item">
                        <Input
                          allowClear
                          prefix={<SearchOutlined />}
                          placeholder="名称、编号、简称、地址"
                          value={customerFilters.q}
                          onChange={(event) => setCustomerFilters((current) => ({ ...current, q: event.target.value }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8} lg={5}>
                      <Form.Item label="行业" className="compact-form-item">
                        <Select
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          placeholder="全部行业"
                          options={customerIndustryOptions}
                          value={customerFilters.industry}
                          onChange={(value) => setCustomerFilters((current) => ({ ...current, industry: value }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8} lg={5}>
                      <Form.Item label="国家/地区" className="compact-form-item">
                        <Select
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          placeholder="全部国家"
                          options={customerCountryOptions}
                          value={customerFilters.country}
                          onChange={(value) => setCustomerFilters((current) => ({ ...current, country: value }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={6}>
                      <Form.Item label="标签" className="compact-form-item">
                        <Select
                          mode="multiple"
                          allowClear
                          maxTagCount="responsive"
                          placeholder="标签交集"
                          options={tagSelectOptions}
                          value={customerFilters.tagIds}
                          onChange={(value) => setCustomerFilters((current) => ({ ...current, tagIds: value }))}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
                <Card
                  className="glass-card"
                  title={`客户档案（${filteredCustomers.length}/${customers.length}）`}
                  bordered={false}
                  extra={
                    <Space>
                      <Button icon={<UploadOutlined />} onClick={() => openImportModal('customer')}>
                        导入客户
                      </Button>
                      <Button type="primary" icon={<PlusOutlined />} onClick={openCustomerCreate}>
                        新建客户
                      </Button>
                    </Space>
                  }
                >
                  <Table
                    rowKey="id"
                    columns={customerColumnsFixed}
                    dataSource={filteredCustomers}
                    pagination={{ pageSize: 8 }}
                    scroll={{ x: 1580 }}
                  />
                </Card>
              </Space>
            )}

            {activeSection === 'contacts' && (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card className="glass-card filter-card" title="人脉筛选" bordered={false}>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} lg={9}>
                      <Form.Item label="搜索" className="compact-form-item">
                        <Input
                          allowClear
                          prefix={<SearchOutlined />}
                          placeholder="姓名、职位、部门、电话、邮箱、微信"
                          value={contactFilters.q}
                          onChange={(event) => setContactFilters((current) => ({ ...current, q: event.target.value }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={10} lg={7}>
                      <Form.Item label="公司/客户" className="compact-form-item">
                        <Select
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          placeholder="全部公司"
                          options={contactCompanyOptions}
                          value={contactFilters.company}
                          onChange={(value) => setContactFilters((current) => ({ ...current, company: value }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={14} lg={8}>
                      <Form.Item label="标签" className="compact-form-item">
                        <Select
                          mode="multiple"
                          allowClear
                          maxTagCount="responsive"
                          placeholder="标签交集"
                          options={tagSelectOptions}
                          value={contactFilters.tagIds}
                          onChange={(value) => setContactFilters((current) => ({ ...current, tagIds: value }))}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
                <Card
                  className="glass-card"
                  title={`人脉档案（${filteredContacts.length}/${contacts.length}）`}
                  bordered={false}
                  extra={
                    <Space>
                      <Button icon={<UploadOutlined />} onClick={() => openImportModal('contact')}>
                        导入人脉
                      </Button>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openContactCreate()}>
                        新建人脉
                      </Button>
                    </Space>
                  }
                >
                  <Table
                    rowKey="id"
                    columns={contactColumnsFixed}
                    dataSource={filteredContacts}
                    pagination={{ pageSize: 8 }}
                    scroll={{ x: 1220 }}
                  />
                </Card>
              </Space>
            )}

            {activeSection === 'followups' && (
              <Card
                className="glass-card"
                title="跟进记录"
                bordered={false}
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      followUpForm.resetFields();
                      setFollowUpFile(null);
                      setFollowUpModalOpen(true);
                    }}
                  >
                    新增跟进
                  </Button>
                }
              >
                <Table
                  rowKey="id"
                  columns={followUpColumns}
                  dataSource={followUps}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 980 }}
                />
              </Card>
            )}
            {activeSection === 'search' && (
              <Space direction="vertical" size={18} style={{ width: '100%' }}>
                <Card className="glass-card search-intro-card" bordered={false}>
                  <Text strong>组合检索</Text>
                  <Paragraph style={{ marginBottom: 0, marginTop: 8 }}>
                    支持关键词搜索和多标签交集查询，例如“上海 + 半导体 + 关键决策者”。
                  </Paragraph>
                </Card>

                <Card className="glass-card" title="开始检索" bordered={false}>
                  <Form
                    form={searchForm}
                    layout="vertical"
                    onFinish={(values) => void runSearch(values)}
                    initialValues={{ entityType: 'all' }}
                  >
                    <Row gutter={[16, 0]}>
                      <Col xs={24} lg={10}>
                        <Form.Item name="q" label="关键词">
                          <Input placeholder="搜索名称、编号、简称、电话、备注、公司、关系说明" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12} lg={6}>
                        <Form.Item name="entityType" label="检索范围">
                          <Select
                            options={[
                              { value: 'all', label: '全部' },
                              { value: 'customer', label: '仅客户' },
                              { value: 'contact', label: '仅人脉' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12} lg={8}>
                        <Form.Item name="tagIds" label="标签交集">
                          <Select
                            mode="multiple"
                            allowClear
                            options={tagSelectOptions}
                            placeholder="可同时选择多个标签"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Space>
                      <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                        执行检索
                      </Button>
                      <Button
                        onClick={() => {
                          searchForm.resetFields();
                          setSearchResults({ customers: [], contacts: [] });
                        }}
                      >
                        清空条件
                      </Button>
                    </Space>
                  </Form>
                </Card>

                <Row gutter={[16, 16]}>
                  <Col xs={24} xl={12}>
                    <Card className="glass-card" title="匹配客户" bordered={false}>
                      {searchResults.customers.length ? (
                        <List
                          dataSource={searchResults.customers}
                          renderItem={(item) => (
                            <List.Item
                              actions={[
                                <Button type="link" key="view" onClick={() => void openCustomerDetail(item.id)}>
                                  查看
                                </Button>,
                              ]}
                            >
                              <List.Item.Meta
                                title={item.name}
                                description={
                                  <Space direction="vertical" size={8}>
                                    <Text type="secondary">
                                      {fallback(item.industry, '未填写行业')} · {fallback(item.region, '未填写地区')}
                                      {item.customerCode ? ` · 编号：${item.customerCode}` : ''}
                                      {item.shortName ? ` · 简称：${item.shortName}` : ''}
                                    </Text>
                                    <TagPills tags={item.tags ?? []} />
                                  </Space>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty description="执行检索后，这里会显示匹配的客户" />
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} xl={12}>
                    <Card className="glass-card" title="匹配人脉" bordered={false}>
                      {searchResults.contacts.length ? (
                        <List
                          dataSource={searchResults.contacts}
                          renderItem={(item) => (
                            <List.Item
                              actions={[
                                <Button type="link" key="view" onClick={() => void openContactDetail(item.id)}>
                                  查看
                                </Button>,
                              ]}
                            >
                              <List.Item.Meta
                                title={item.name}
                                description={
                                  <Space direction="vertical" size={8}>
                                    <Text type="secondary">
                                      {fallback(item.title, '未填写职位')} ·{' '}
                                      {fallback(item.companyName || item.customerName, '未填写所属公司')}
                                    </Text>
                                    <TagPills tags={item.tags ?? []} />
                                  </Space>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty description="执行检索后，这里会显示匹配的人脉" />
                      )}
                    </Card>
                  </Col>
                </Row>
              </Space>
            )}

            {activeSection === 'tags' && (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} xl={10}>
                    <Card
                      className="glass-card"
                      title="标签组"
                      bordered={false}
                      extra={
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setTagGroupModalOpen(true)}>
                          新建标签组
                        </Button>
                      }
                    >
                      <List
                        dataSource={tagGroups}
                        locale={{ emptyText: '还没有标签组' }}
                        renderItem={(group) => (
                          <List.Item>
                            <List.Item.Meta title={group.name} description={group.description || '暂无说明'} />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} xl={14}>
                    <Card
                      className="glass-card"
                      title="标签"
                      bordered={false}
                      extra={
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setTagModalOpen(true)}>
                          新建标签
                        </Button>
                      }
                    >
                      <Space direction="vertical" size={18} style={{ width: '100%' }}>
                        {tagGroups.length ? (
                          tagGroups.map((group) => (
                            <div key={group.id}>
                              <Text strong>{group.name}</Text>
                              <div style={{ marginTop: 10 }}>
                                <Space wrap>
                                  {group.tags.map((tag) => (
                                    <Tag key={tag.id} color={tag.color}>
                                      {tag.name}
                                    </Tag>
                                  ))}
                                </Space>
                              </div>
                            </div>
                          ))
                        ) : (
                          <Empty description="还没有可用标签" />
                        )}
                      </Space>
                    </Card>
                  </Col>
                </Row>

                <Card
                  className="glass-card"
                  title="产品库"
                  bordered={false}
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setProductModalOpen(true)}>
                      新建产品
                    </Button>
                  }
                >
                  <List
                    dataSource={products}
                    locale={{ emptyText: '还没有产品，先添加客户经营产品' }}
                    renderItem={(product) => (
                      <List.Item>
                        <List.Item.Meta
                          title={product.name}
                          description={[product.category, product.notes].filter(Boolean).join(' / ') || '暂无说明'}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Space>
            )}
          </Content>
        </Layout>
      </Layout>

      <Drawer
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        width={720}
        title={selectedCustomer?.name}
        destroyOnClose
        extra={
          selectedCustomer ? (
            <Space>
              <Button
                onClick={() =>
                  setTimelineModal({ open: true, entityType: 'customer', entityId: selectedCustomer.id })
                }
              >
                添加联系记录
              </Button>
              <Button
                icon={<UploadOutlined />}
                onClick={() =>
                  setAttachmentModal({ open: true, entityType: 'customer', entityId: selectedCustomer.id })
                }
              >
                添加附件
              </Button>
            </Space>
          ) : null
        }
      >
        {selectedCustomer && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="行业">{fallback(selectedCustomer.industry, '--')}</Descriptions.Item>
              <Descriptions.Item label="客户编号">{fallback(selectedCustomer.customerCode, '--')}</Descriptions.Item>
              <Descriptions.Item label="客户简称">{fallback(selectedCustomer.shortName, '--')}</Descriptions.Item>
              <Descriptions.Item label="详细地址">{fallback(selectedCustomer.detailedAddress, '--')}</Descriptions.Item>
              <Descriptions.Item label="产品">
                {(selectedCustomer.products ?? []).length ? (
                  <Space wrap>
                    {selectedCustomer.products.map((product) => (
                      <Tag key={product.id} color="blue">
                        {product.name}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  '--'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="公司简介">{fallback(selectedCustomer.companyProfile, '--')}</Descriptions.Item>
              <Descriptions.Item label="地区">{fallback(selectedCustomer.region, '--')}</Descriptions.Item>
              <Descriptions.Item label="Tel">{fallback(selectedCustomer.phone, '--')}</Descriptions.Item>
              <Descriptions.Item label="E-mail">{fallback(selectedCustomer.email, '--')}</Descriptions.Item>
              <Descriptions.Item label="Instagram">{fallback(selectedCustomer.instagram, '--')}</Descriptions.Item>
              <Descriptions.Item label="WhatsApp">{fallback(selectedCustomer.whatsapp, '--')}</Descriptions.Item>
              <Descriptions.Item label="Web">{fallback(selectedCustomer.website, '--')}</Descriptions.Item>
              <Descriptions.Item label="LinkedIn">{fallback(selectedCustomer.linkedin, '--')}</Descriptions.Item>
              <Descriptions.Item label="Facebook">{fallback(selectedCustomer.facebook, '--')}</Descriptions.Item>
              <Descriptions.Item label="合作状态">
                {fallback(selectedCustomer.cooperationStatus, '--')}
              </Descriptions.Item>
              <Descriptions.Item label="备注">{fallback(selectedCustomer.notes, '--')}</Descriptions.Item>
            </Descriptions>

            <Card className="glass-card" title="标签" bordered={false}>
              <TagPills tags={selectedCustomer.tags} />
            </Card>

            <Card
              className="glass-card"
              title="关联人脉"
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    openContactCreate({
                      customerId: selectedCustomer.id,
                      customerName: selectedCustomer.name,
                      companyName: selectedCustomer.name,
                    })
                  }
                >
                  添加人脉
                </Button>
              }
            >
              <List
                locale={{ emptyText: '暂无关联人脉' }}
                dataSource={selectedCustomer.contacts}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button type="link" key="view" onClick={() => void openContactDetail(item.id)}>
                        查看
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={`${fallback(item.title, '未填写职位')} · ${fallback(item.phone, '--')}`}
                    />
                  </List.Item>
                )}
              />
            </Card>

            <Card className="glass-card" title="跟进时间轴" bordered={false}>
              <List
                locale={{ emptyText: '暂无跟进记录' }}
                dataSource={selectedCustomer.timeline}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.followUpType} · ${formatDate(item.followUpDate)}`}
                      description={
                        <Space direction="vertical" size={4}>
                          <Text>{item.summary}</Text>
                          <Text type="secondary">
                            回访提醒：{formatDate(item.todoReminderAt)}
                            {item.contactName ? ` · 关联人脉：${item.contactName}` : ''}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            <Card className="glass-card" title="附件" bordered={false}>
              <List
                locale={{ emptyText: '暂无附件' }}
                dataSource={selectedCustomer.attachments}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <a href={item.fileUrl} target="_blank" rel="noreferrer" key="open">
                        打开
                      </a>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.fileName}
                      description={`${item.fileType} · ${fallback(item.notes, '暂无备注')}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        )}
      </Drawer>

      <Drawer
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        width={680}
        title={selectedContact?.name}
        destroyOnClose
        extra={
          selectedContact ? (
            <Space>
              <Button onClick={() => openContactEdit(selectedContact)}>编辑</Button>
              <Button
                onClick={() =>
                  setTimelineModal({ open: true, entityType: 'contact', entityId: selectedContact.id })
                }
              >
                添加跟进
              </Button>
              <Button
                icon={<UploadOutlined />}
                onClick={() =>
                  setAttachmentModal({ open: true, entityType: 'contact', entityId: selectedContact.id })
                }
              >
                添加附件
              </Button>
              <Button
                danger
                onClick={() => {
                  Modal.confirm({
                    title: '确认删除人脉？',
                    content: `删除后会移除「${selectedContact.name}」的人脉档案、标签、附件和联系记录。`,
                    okText: '删除',
                    okButtonProps: { danger: true },
                    cancelText: '取消',
                    onOk: () => deleteContact(selectedContact),
                  });
                }}
              >
                删除
              </Button>
            </Space>
          ) : null
        }
      >
        {selectedContact && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="职位">{fallback(selectedContact.title, '--')}</Descriptions.Item>
              <Descriptions.Item label="部门">{fallback(selectedContact.department, '--')}</Descriptions.Item>
              <Descriptions.Item label="所属公司">{fallback(selectedContact.companyName, '--')}</Descriptions.Item>
              <Descriptions.Item label="关联客户">{fallback(selectedContact.customerName, '--')}</Descriptions.Item>
              <Descriptions.Item label="电话">{fallback(selectedContact.phone, '--')}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{fallback(selectedContact.email, '--')}</Descriptions.Item>
              <Descriptions.Item label="微信">{fallback(selectedContact.wechat, '--')}</Descriptions.Item>
              <Descriptions.Item label="社交账号">{fallback(selectedContact.socialHandle, '--')}</Descriptions.Item>
              <Descriptions.Item label="关系备注">
                {fallback(selectedContact.relationshipNote, '--')}
              </Descriptions.Item>
              <Descriptions.Item label="相识场景">
                {fallback(selectedContact.meetingContext, '--')}
              </Descriptions.Item>
              <Descriptions.Item label="核心价值">{fallback(selectedContact.coreValue, '--')}</Descriptions.Item>
              <Descriptions.Item label="名片文件">
                {selectedContact.businessCardUrl ? (
                  <a href={selectedContact.businessCardUrl} target="_blank" rel="noreferrer">
                    {selectedContact.businessCardName || '打开文件'}
                  </a>
                ) : (
                  '--'
                )}
              </Descriptions.Item>
            </Descriptions>

            <Card className="glass-card" title="标签" bordered={false}>
              <TagPills tags={selectedContact.tags} />
            </Card>

            <Card className="glass-card" title="联系记录" bordered={false}>
              <List
                locale={{ emptyText: '暂无联系记录' }}
                dataSource={selectedContact.timeline}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.followUpType} · ${formatDate(item.followUpDate)}`}
                      description={
                        <Space direction="vertical" size={4}>
                          <Text>{item.summary}</Text>
                          <Text type="secondary">
                            回访提醒：{formatDate(item.todoReminderAt)}
                            {item.customerName ? ` · 关联客户：${item.customerName}` : ''}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            <Card className="glass-card" title="附件" bordered={false}>
              <List
                locale={{ emptyText: '暂无附件' }}
                dataSource={selectedContact.attachments}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <a href={item.fileUrl} target="_blank" rel="noreferrer" key="open">
                        打开
                      </a>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.fileName}
                      description={`${item.fileType} · ${fallback(item.notes, '暂无备注')}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        )}
      </Drawer>

      <Modal
        title={editingCustomer ? '编辑客户' : '新建客户'}
        open={customerModalOpen}
        width={1040}
        onCancel={() => {
          setCustomerModalOpen(false);
          setEditingCustomer(null);
          customerForm.resetFields();
        }}
        onOk={() => customerForm.submit()}
      >
        <Form form={customerForm} layout="vertical" onFinish={(values) => void submitCustomer(values)}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="customerCode" label="客户编号">
                <Input placeholder="例如 C-2026-001" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="shortName" label="客户简称">
                <Input placeholder="便于列表识别" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="industry" label="行业">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="region" label="国家/地区">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="cooperationStatus" label="合作状态" initialValue="潜在客户">
                <Select
                  options={['潜在客户', '跟进中', '已合作', '暂停合作'].map((value) => ({ value, label: value }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="detailedAddress" label="详细地址">
                <Input placeholder="公司详细地址、仓库地址或办公地址" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="phone" label="Tel">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="email" label="E-mail">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="website" label="Web">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="instagram" label="Instagram">
                <Input placeholder="@account 或主页链接" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="whatsapp" label="WhatsApp">
                <Input placeholder="WhatsApp 号码或链接" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="linkedin" label="LinkedIn">
                <Input placeholder="LinkedIn 主页" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="facebook" label="Facebook">
                <Input placeholder="Facebook 主页" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="productIds" label="产品">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  maxTagCount="responsive"
                  optionFilterProp="label"
                  options={productSelectOptions}
                  placeholder="选择客户经营产品"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="tagIds" label="标签">
                <Select mode="multiple" allowClear maxTagCount="responsive" options={tagSelectOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="companyProfile"
                label="公司简介"
                rules={[{ max: 5000, message: '公司简介最多 5000 字符' }]}
              >
                <TextArea rows={7} maxLength={5000} showCount placeholder="记录公司背景、业务范围、优势资源等" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item name="notes" label="备注">
                <TextArea rows={7} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={importTarget === 'customer' ? '导入客户数据' : '导入人脉数据'}
        open={!!importTarget}
        onCancel={closeImportModal}
        onOk={() => void submitImport()}
        confirmLoading={importing}
        okText="开始导入"
        cancelText="取消"
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card size="small" bordered={false} className="import-guide-card">
            <Space direction="vertical" size={8}>
              <Text strong>导入步骤</Text>
              <Text type="secondary">1. 下载模板；2. 按表头填写数据；3. 保存为 CSV 后上传导入。</Text>
              <Text type="secondary">
                多个标签或产品请用分号隔开，例如：集运客户；跨境电商。产品、标签和所属客户会按现有名称自动匹配。
              </Text>
            </Space>
          </Card>

          <Button
            icon={<DownloadOutlined />}
            onClick={() => importTarget && downloadCsvTemplate(importTarget)}
          >
            下载{importTarget === 'customer' ? '客户' : '人脉'}导入模板
          </Button>

          <Form layout="vertical">
            <Form.Item label="上传 CSV 文件" required>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">{importFile ? `已选择：${importFile.name}` : '请选择按模板填写的 CSV 文件'}</Text>
              </div>
            </Form.Item>
          </Form>
        </Space>
      </Modal>

      <Modal
        title={editingContact ? '编辑人脉' : '新建人脉'}
        open={contactModalOpen}
        width={980}
        onCancel={() => {
          setContactModalOpen(false);
          setEditingContact(null);
          setContactCardFile(null);
          contactForm.resetFields();
        }}
        onOk={() => contactForm.submit()}
      >
        <Form form={contactForm} layout="vertical" onFinish={(values) => void createContact(values)}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="title" label="职位">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="department" label="部门">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="customerId" label="关联客户">
                <Select allowClear showSearch optionFilterProp="label" options={customerOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="companyName" label="所属公司">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="phone" label="电话">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="email" label="邮箱">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="wechat" label="微信">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="socialHandle" label="社交账号">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="tagIds" label="标签">
                <Select mode="multiple" allowClear maxTagCount="responsive" options={tagSelectOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={8}>
              <Form.Item name="meetingContext" label="相识场景">
                <TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item name="relationshipNote" label="关系备注">
                <TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item name="coreValue" label="核心价值">
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="businessCardName" label="名片文件名">
                <Input placeholder="可填写名片或 OCR 备注" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="businessCardUrl" label="名片文件链接">
                <Input placeholder="上传后自动填入或手动粘贴" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="上传名片">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  capture="environment"
                  onChange={(event) => setContactCardFile(event.target.files?.[0] ?? null)}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    {contactCardFile ? `已选择：${contactCardFile.name}` : '支持拍照、图片或 PDF'}
                  </Text>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={timelineModal.entityType === 'contact' ? '添加联系记录' : '添加跟进记录'}
        open={timelineModal.open}
        onCancel={() => setTimelineModal({ ...timelineModal, open: false, entityId: null })}
        onOk={() => timelineForm.submit()}
      >
        <Form form={timelineForm} layout="vertical" onFinish={(values) => void createTimeline(values)}>
          <Form.Item
            name="followUpDate"
            label={timelineModal.entityType === 'contact' ? '联系日期' : '跟进时间'}
            rules={[{ required: true, message: timelineModal.entityType === 'contact' ? '请选择联系日期' : '请选择跟进时间' }]}
          >
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="followUpType" label={timelineModal.entityType === 'contact' ? '联系类型' : '跟进方式'} initialValue="回访跟进">
            <Select options={followUpTypeOptions} />
          </Form.Item>
          <Form.Item
            name="summary"
            label={timelineModal.entityType === 'contact' ? '联系内容' : '沟通要点'}
            rules={[{ required: true, message: timelineModal.entityType === 'contact' ? '请输入联系内容' : '请输入沟通要点' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="todoReminderAt" label="后续提醒时间">
            <Input type="datetime-local" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新增跟进记录"
        open={followUpModalOpen}
        onCancel={() => {
          setFollowUpModalOpen(false);
          setFollowUpFile(null);
        }}
        onOk={() => followUpForm.submit()}
      >
        <Form
          form={followUpForm}
          layout="vertical"
          onFinish={(values) => void createFollowUp(values)}
          initialValues={{ followUpType: '回访跟进' }}
        >
          <Form.Item name="target" label="跟进对象" rules={[{ required: true, message: '请选择客户或人脉' }]}>
            <Select showSearch options={followUpTargetOptions} placeholder="选择客户或人脉" optionFilterProp="label" />
          </Form.Item>
          <Form.Item name="followUpDate" label="跟进时间" rules={[{ required: true, message: '请选择跟进时间' }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="followUpType" label="跟进类型" rules={[{ required: true, message: '请选择跟进类型' }]}>
            <Select options={followUpTypeOptions} />
          </Form.Item>
          <Form.Item name="summary" label="详情" rules={[{ required: true, message: '请输入跟进详情' }]}>
            <TextArea rows={4} placeholder="记录沟通背景、结果、下一步动作等" />
          </Form.Item>
          <Form.Item name="todoReminderAt" label="下次提醒时间">
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item label="附件">
            <Input
              type="file"
              accept="image/*,.pdf"
              capture="environment"
              onChange={(event) => setFollowUpFile(event.target.files?.[0] ?? null)}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">{followUpFile ? `已选择：${followUpFile.name}` : '支持照片、截图和 PDF 文件'}</Text>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加附件"
        open={attachmentModal.open}
        onCancel={() => {
          setAttachmentModal({ ...attachmentModal, open: false, entityId: null });
          setAttachmentFile(null);
        }}
        onOk={() => attachmentForm.submit()}
      >
        <Form form={attachmentForm} layout="vertical" onFinish={(values) => void createAttachment(values)}>
          <Form.Item name="fileName" label="文件名">
            <Input placeholder="例如：方案.pdf / 名片.jpg" />
          </Form.Item>
          <Form.Item name="fileType" label="文件类型" initialValue="application/pdf">
            <Input placeholder="例如：application/pdf / image/jpeg" />
          </Form.Item>
          <Form.Item name="fileUrl" label="文件地址">
            <Input placeholder="可粘贴已上传文件地址" />
          </Form.Item>
          <Form.Item name="fileSize" label="文件大小（字节）">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="上传文件">
            <input
              type="file"
              accept="image/*,.pdf"
              capture="environment"
              onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {attachmentFile ? `已选择：${attachmentFile.name}` : '支持 PDF、图片和名片文件'}
              </Text>
            </div>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建标签组"
        open={tagGroupModalOpen}
        onCancel={() => setTagGroupModalOpen(false)}
        onOk={() => tagGroupForm.submit()}
      >
        <Form form={tagGroupForm} layout="vertical" onFinish={(values) => void createTagGroup(values)}>
          <Form.Item name="name" label="标签组名称" rules={[{ required: true, message: '请输入标签组名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建标签"
        open={tagModalOpen}
        onCancel={() => setTagModalOpen(false)}
        onOk={() => tagForm.submit()}
      >
        <Form form={tagForm} layout="vertical" onFinish={(values) => void createTag(values)}>
          <Form.Item name="groupId" label="所属标签组" rules={[{ required: true, message: '请选择标签组' }]}>
            <Select options={tagGroups.map((group) => ({ value: group.id, label: group.name }))} />
          </Form.Item>
          <Form.Item name="name" label="标签名称" rules={[{ required: true, message: '请输入标签名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="color" label="颜色" initialValue="blue">
            <Select
              options={['blue', 'green', 'gold', 'purple', 'orange', 'volcano', 'cyan', 'lime', 'geekblue'].map(
                (value) => ({
                  value,
                  label: value,
                }),
              )}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建产品"
        open={productModalOpen}
        onCancel={() => setProductModalOpen(false)}
        onOk={() => productForm.submit()}
      >
        <Form form={productForm} layout="vertical" onFinish={(values) => void createProduct(values)}>
          <Form.Item name="name" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}>
            <Input placeholder="例如：鲜花、服装、机械设备" />
          </Form.Item>
          <Form.Item name="category" label="产品分类">
            <Input placeholder="例如：农产品、跨境电商、工业品" />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="可记录产品说明、运输注意事项等" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
