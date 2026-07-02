import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { TabsProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import type { Key } from 'react';
import { apiRequest } from '../api/client';
import { formatBeijingTime } from '../utils/date';

const { Text } = Typography;
const { TextArea } = Input;

type FinanceDirection = 'receivable' | 'payable';
type FinanceTabKey = 'receivable' | 'payable' | 'bills' | 'payments';

type FinancePageProps = {
  activeTab?: FinanceTabKey;
};

type FinanceItem = {
  id: string;
  itemNo: string;
  direction: FinanceDirection;
  projectId?: string | null;
  projectNo?: string | null;
  projectName?: string | null;
  taskId?: string | null;
  taskNo?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  feeName: string;
  currency: string;
  amount: number;
  exchangeRate: number;
  amountCny: number;
  status: string;
  occurrenceStage?: string | null;
  billId?: string | null;
  paymentRequestId?: string | null;
  notes?: string | null;
  updatedAt: string;
};

type FinanceBill = {
  id: string;
  billNo: string;
  customerName: string;
  title: string;
  totalAmountCny: number;
  status: string;
  confirmedAt?: string | null;
  items?: FinanceItem[];
};

type PaymentRequest = {
  id: string;
  requestNo: string;
  supplierName: string;
  title: string;
  totalAmountCny: number;
  status: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  paidAt?: string | null;
  items?: FinanceItem[];
};

type FinanceContext = {
  tasks: Array<{
    id: string;
    taskNo: string;
    projectId: string;
    projectNo: string;
    projectName: string;
    customerId?: string | null;
    customerName?: string | null;
  }>;
  customers: Array<{ id: string; name: string; customerCode?: string | null; shortName?: string | null }>;
  suppliers: Array<{ id: string; name: string; supplierCode?: string | null; type?: string | null }>;
};

type ExchangeRateOption = {
  id: string;
  currencyCode: string;
  currencyName?: string | null;
  rateToCny: number;
  enabled: boolean;
};

const fallbackExchangeRates: ExchangeRateOption[] = [
  { id: 'exr_cny', currencyCode: 'CNY', currencyName: 'CNY', rateToCny: 1, enabled: true },
  { id: 'exr_usd', currencyCode: 'USD', currencyName: 'USD', rateToCny: 7.2, enabled: true },
  { id: 'exr_kzt', currencyCode: 'KZT', currencyName: 'KZT', rateToCny: 0.015, enabled: true },
  { id: 'exr_rub', currencyCode: 'RUB', currencyName: 'RUB', rateToCny: 0.08, enabled: true },
];
const feeStatuses = [
  { value: 'draft', label: '草稿' },
  { value: 'confirmed', label: '已确认' },
  { value: 'billed', label: '已出账' },
  { value: 'partial_received', label: '部分收款' },
  { value: 'received', label: '已收款' },
  { value: 'payment_applied', label: '已申请付款' },
  { value: 'paid', label: '已付款' },
  { value: 'void', label: '作废' },
];

const statusText: Record<string, string> = {
  draft: '草稿',
  confirmed: '已确认',
  billed: '已出账',
  partial_received: '部分收款',
  received: '已收款',
  payment_applied: '已申请付款',
  paid: '已付款',
  void: '作废',
  submitted: '待财务审批',
  approved: '财务已批',
  rejected: '已驳回',
};

const statusColor: Record<string, string> = {
  draft: 'default',
  confirmed: 'blue',
  billed: 'purple',
  partial_received: 'gold',
  received: 'green',
  payment_applied: 'cyan',
  paid: 'green',
  void: 'red',
  submitted: 'blue',
  approved: 'green',
  rejected: 'red',
};

function money(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusTag(status: string) {
  return <Tag color={statusColor[status] ?? 'default'}>{statusText[status] ?? status}</Tag>;
}

export function FinancePage({ activeTab }: FinancePageProps = {}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [bills, setBills] = useState<FinanceBill[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [context, setContext] = useState<FinanceContext>({ tasks: [], customers: [], suppliers: [] });
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateOption[]>([]);
  const [summary, setSummary] = useState({ confirmedReceivable: 0, confirmedPayable: 0, grossProfit: 0, unreceived: 0, unpaid: 0 });
  const [feeOpen, setFeeOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FinanceItem | null>(null);
  const [selectedReceivables, setSelectedReceivables] = useState<Key[]>([]);
  const [selectedPayables, setSelectedPayables] = useState<Key[]>([]);
  const [feeForm] = Form.useForm();
  const [billForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const watchedDirection = Form.useWatch('direction', feeForm) as FinanceDirection | undefined;
  const watchedTaskId = Form.useWatch('taskId', feeForm) as string | undefined;
  const watchedAmount = Form.useWatch('amount', feeForm);
  const watchedRate = Form.useWatch('exchangeRate', feeForm);

  const selectedTask = useMemo(() => context.tasks.find((task) => task.id === watchedTaskId), [context.tasks, watchedTaskId]);
  const activeExchangeRates = useMemo(() => {
    const source = exchangeRates.length ? exchangeRates : fallbackExchangeRates;
    return source.filter((item) => item.enabled !== false);
  }, [exchangeRates]);
  const currencyOptions = useMemo(
    () =>
      activeExchangeRates.map((item) => ({
        value: item.currencyCode,
        label: item.currencyName ? `${item.currencyCode} / ${item.currencyName}` : item.currencyCode,
      })),
    [activeExchangeRates],
  );
  const exchangeRateForCurrency = (code?: string) =>
    activeExchangeRates.find((item) => item.currencyCode === code)?.rateToCny ?? (code === 'CNY' ? 1 : undefined);
  const selectedAmountCny = Number(watchedAmount || 0) * Number(watchedRate || 1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemRes, billRes, payRes, contextRes, summaryRes, exchangeRateRes] = await Promise.all([
        apiRequest<{ items: FinanceItem[] }>('/api/finance/items'),
        apiRequest<{ items: FinanceBill[] }>('/api/finance/bills'),
        apiRequest<{ items: PaymentRequest[] }>('/api/finance/payment-requests'),
        apiRequest<FinanceContext>('/api/finance/context'),
        apiRequest<typeof summary>('/api/finance/summary'),
        apiRequest<{ items: ExchangeRateOption[] }>('/api/exchange-rates'),
      ]);
      setItems(itemRes.items ?? []);
      setBills(billRes.items ?? []);
      setPaymentRequests(payRes.items ?? []);
      setContext(contextRes);
      setSummary(summaryRes);
      setExchangeRates(exchangeRateRes.items ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openFee = (direction: FinanceDirection, record?: FinanceItem) => {
    const defaultCurrency = record?.currency ?? (direction === 'receivable' ? 'USD' : 'CNY');
    setEditingFee(record ?? null);
    feeForm.resetFields();
    feeForm.setFieldsValue(
      record ?? {
        direction,
        currency: defaultCurrency,
        exchangeRate: exchangeRateForCurrency(defaultCurrency) ?? 1,
        status: 'confirmed',
        sourceType: 'manual',
      },
    );
    setFeeOpen(true);
  };

  const saveFee = async (values: Partial<FinanceItem> & { sourceType?: string }) => {
    const task = context.tasks.find((item) => item.id === values.taskId);
    const supplier = context.suppliers.find((item) => item.id === values.supplierId);
    const customer = context.customers.find((item) => item.id === values.customerId);
    const payload = {
      ...values,
      projectId: task?.projectId ?? values.projectId,
      customerId: task?.customerId ?? values.customerId,
      customerName: task?.customerName ?? customer?.name ?? values.customerName,
      supplierName: supplier?.name ?? values.supplierName,
    };
    await apiRequest(editingFee ? `/api/finance/items/${editingFee.id}` : '/api/finance/items', {
      method: editingFee ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    message.success(editingFee ? '费用已更新' : '费用已新增');
    setFeeOpen(false);
    await loadData();
  };

  const removeFee = async (record: FinanceItem) => {
    await apiRequest(`/api/finance/items/${record.id}`, { method: 'DELETE' });
    message.success('费用已删除');
    await loadData();
  };

  const createBill = async (values: { title: string; notes?: string }) => {
    const selected = items.filter((item) => selectedReceivables.includes(item.id));
    await apiRequest('/api/finance/bills', {
      method: 'POST',
      body: JSON.stringify({
        ...values,
        customerId: selected[0]?.customerId,
        customerName: selected[0]?.customerName,
        itemIds: selectedReceivables,
      }),
    });
    message.success('客户账单已生成');
    setBillOpen(false);
    setSelectedReceivables([]);
    await loadData();
  };

  const createPaymentRequest = async (values: { title: string; notes?: string }) => {
    const selected = items.filter((item) => selectedPayables.includes(item.id));
    await apiRequest('/api/finance/payment-requests', {
      method: 'POST',
      body: JSON.stringify({
        ...values,
        supplierId: selected[0]?.supplierId,
        supplierName: selected[0]?.supplierName,
        itemIds: selectedPayables,
      }),
    });
    message.success('付款申请已提交');
    setPaymentOpen(false);
    setSelectedPayables([]);
    await loadData();
  };

  const updatePaymentStatus = async (record: PaymentRequest, status: string) => {
    await apiRequest(`/api/finance/payment-requests/${record.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    message.success('付款申请状态已更新');
    await loadData();
  };

  const updateBillStatus = async (record: FinanceBill, status: string) => {
    await apiRequest(`/api/finance/bills/${record.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    message.success('客户账单状态已更新');
    await loadData();
  };

  const itemColumns: ColumnsType<FinanceItem> = [
    { title: '费用单号', dataIndex: 'itemNo', width: 160, fixed: 'left' },
    { title: '任务号', dataIndex: 'taskNo', width: 160, render: (value) => value || '-' },
    { title: '项目', dataIndex: 'projectName', width: 180, render: (value) => value || '-' },
    { title: '客户/供应商', width: 180, render: (_, row) => row.direction === 'receivable' ? row.customerName || '-' : row.supplierName || '-' },
    { title: '费用名称', dataIndex: 'feeName', width: 160 },
    { title: '币种', dataIndex: 'currency', width: 80 },
    { title: '金额', dataIndex: 'amount', width: 120, align: 'right', render: money },
    { title: '汇率', dataIndex: 'exchangeRate', width: 90 },
    { title: '折CNY', dataIndex: 'amountCny', width: 130, align: 'right', render: money },
    { title: '状态', dataIndex: 'status', width: 120, render: statusTag },
    { title: '节点/阶段', dataIndex: 'occurrenceStage', width: 120, render: (value) => value || '-' },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      render: (_, row) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} disabled={Boolean(row.billId || row.paymentRequestId)} onClick={() => openFee(row.direction, row)}>
            修改
          </Button>
          <Popconfirm title="确认删除这条费用？" onConfirm={() => void removeFee(row)}>
            <Button type="link" danger icon={<DeleteOutlined />} disabled={Boolean(row.billId || row.paymentRequestId)}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const billColumns: ColumnsType<FinanceBill> = [
    { title: '账单号', dataIndex: 'billNo', width: 170 },
    { title: '客户', dataIndex: 'customerName', width: 180 },
    { title: '标题', dataIndex: 'title', width: 220 },
    { title: '金额(CNY)', dataIndex: 'totalAmountCny', width: 140, align: 'right', render: money },
    { title: '状态', dataIndex: 'status', width: 120, render: statusTag },
    { title: '确认时间', dataIndex: 'confirmedAt', width: 190, render: (value) => formatBeijingTime(value, true) },
    {
      title: '操作',
      width: 180,
      render: (_, row) => (
        <Space>
          <Button size="small" disabled={row.status === 'received'} onClick={() => void updateBillStatus(row, 'partial_received')}>
            部分收款
          </Button>
          <Button size="small" type="primary" disabled={row.status === 'received'} onClick={() => void updateBillStatus(row, 'received')}>
            已收款
          </Button>
        </Space>
      ),
    },
    {
      title: '费用明细',
      render: (_, row) => row.items?.length ? row.items.map((item) => <Tag key={item.itemNo}>{item.taskNo || item.itemNo} · {item.feeName}</Tag>) : '-',
    },
  ];

  const paymentColumns: ColumnsType<PaymentRequest> = [
    { title: '申请单号', dataIndex: 'requestNo', width: 170 },
    { title: '供应商', dataIndex: 'supplierName', width: 180 },
    { title: '标题', dataIndex: 'title', width: 220 },
    { title: '金额(CNY)', dataIndex: 'totalAmountCny', width: 140, align: 'right', render: money },
    { title: '状态', dataIndex: 'status', width: 130, render: statusTag },
    { title: '提交时间', dataIndex: 'submittedAt', width: 190, render: (value) => formatBeijingTime(value, true) },
    {
      title: '操作',
      width: 190,
      render: (_, row) => (
        <Space>
          <Button size="small" disabled={row.status !== 'submitted'} onClick={() => void updatePaymentStatus(row, 'approved')}>
            财务审批
          </Button>
          <Button size="small" type="primary" disabled={row.status !== 'approved'} onClick={() => void updatePaymentStatus(row, 'paid')}>
            登记付款
          </Button>
        </Space>
      ),
    },
  ];

  const receivables = items.filter((item) => item.direction === 'receivable');
  const payables = items.filter((item) => item.direction === 'payable');
  const billableReceivables = receivables.filter((item) => item.status === 'confirmed' && !item.billId);
  const payableForRequest = payables.filter((item) => item.status === 'confirmed' && !item.paymentRequestId);
  const financeTabItems: TabsProps['items'] = [
    {
      key: 'receivable',
      label: '\u5e94\u6536\u8d39\u7528',
      children: (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openFee('receivable')}>
              {'\u65b0\u589e\u5e94\u6536'}
            </Button>
            <Button
              icon={<WalletOutlined />}
              disabled={!selectedReceivables.length}
              onClick={() => {
                billForm.resetFields();
                billForm.setFieldsValue({ title: '\u5ba2\u6237\u8d26\u5355 ' + formatBeijingTime(new Date().toISOString()).slice(0, 10) });
                setBillOpen(true);
              }}
            >
              {'\u751f\u6210\u5ba2\u6237\u8d26\u5355'}
            </Button>
          </Space>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={receivables}
            columns={itemColumns}
            scroll={{ x: 1680 }}
            rowSelection={{
              selectedRowKeys: selectedReceivables,
              onChange: setSelectedReceivables,
              getCheckboxProps: (record) => ({ disabled: !billableReceivables.some((item) => item.id === record.id) }),
            }}
          />
        </Space>
      ),
    },
    {
      key: 'payable',
      label: '\u5e94\u4ed8\u8d39\u7528',
      children: (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openFee('payable')}>
              {'\u65b0\u589e\u5e94\u4ed8'}
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              disabled={!selectedPayables.length}
              onClick={() => {
                paymentForm.resetFields();
                paymentForm.setFieldsValue({ title: '\u4ed8\u6b3e\u7533\u8bf7 ' + formatBeijingTime(new Date().toISOString()).slice(0, 10) });
                setPaymentOpen(true);
              }}
            >
              {'\u63d0\u4ea4\u4ed8\u6b3e\u7533\u8bf7'}
            </Button>
          </Space>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={payables}
            columns={itemColumns}
            scroll={{ x: 1680 }}
            rowSelection={{
              selectedRowKeys: selectedPayables,
              onChange: setSelectedPayables,
              getCheckboxProps: (record) => ({ disabled: !payableForRequest.some((item) => item.id === record.id) }),
            }}
          />
        </Space>
      ),
    },
    {
      key: 'bills',
      label: '\u5ba2\u6237\u8d26\u5355',
      children: <Table rowKey="id" loading={loading} dataSource={bills} columns={billColumns} scroll={{ x: 1100 }} />,
    },
    {
      key: 'payments',
      label: '\u4ed8\u6b3e\u7533\u8bf7',
      children: <Table rowKey="id" loading={loading} dataSource={paymentRequests} columns={paymentColumns} scroll={{ x: 1150 }} />,
    },
  ];
  const activeFinanceTab = activeTab ? financeTabItems.find((item) => item.key === activeTab) : undefined;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card className="metric-card">
            <Statistic title="已确认应收" value={summary.confirmedReceivable} precision={2} suffix="CNY" />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="metric-card">
            <Statistic title="已确认应付" value={summary.confirmedPayable} precision={2} suffix="CNY" />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="metric-card">
            <Statistic title="项目毛利" value={summary.grossProfit} precision={2} suffix="CNY" />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="metric-card">
            <Statistic title="待收/待付" value={money(summary.unreceived) + ' / ' + money(summary.unpaid)} suffix="CNY" />
          </Card>
        </Col>
      </Row>

      <Card
        className="glass-card"
        title={activeFinanceTab?.label ?? '\u8d22\u52a1\u7ba1\u7406'}
        bordered={false}
        extra={<Button icon={<ReloadOutlined />} onClick={() => void loadData()} loading={loading}>{'\u5237\u65b0'}</Button>}
      >
        {activeFinanceTab?.children ?? <Tabs items={financeTabItems} />}
      </Card>
      <Modal title={editingFee ? '修改费用' : watchedDirection === 'payable' ? '新增应付费用' : '新增应收费用'} open={feeOpen} onCancel={() => setFeeOpen(false)} onOk={() => feeForm.submit()} width={860} okText="保存">
        <Form form={feeForm} layout="vertical" onFinish={(values) => void saveFee(values)}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="direction" label="费用方向" rules={[{ required: true }]}>
                <Select options={[{ value: 'receivable', label: '应收' }, { value: 'payable', label: '应付' }]} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="taskId" label="关联任务">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={context.tasks.map((task) => ({ value: task.id, label: `${task.taskNo} · ${task.customerName || '-'} · ${task.projectName}` }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="feeName" label="费用名称" rules={[{ required: true, message: '请输入费用名称' }]}>
                <Input placeholder="如境外车辆运输费、出口报关操作费、压车费" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={watchedDirection === 'payable' ? 'supplierId' : 'customerId'} label={watchedDirection === 'payable' ? '供应商' : '客户'}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={
                    watchedDirection === 'payable'
                      ? context.suppliers.map((item) => ({ value: item.id, label: `${item.supplierCode || ''} ${item.name}` }))
                      : context.customers.map((item) => ({ value: item.id, label: `${item.customerCode || ''} ${item.shortName || item.name}` }))
                  }
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="currency" label="币种" rules={[{ required: true }]}>
                <Select
                  options={currencyOptions}
                  onChange={(value) => {
                    const rate = exchangeRateForCurrency(value);
                    if (rate) feeForm.setFieldValue('exchangeRate', rate);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
                <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="exchangeRate" label="折CNY汇率" rules={[{ required: true, message: '请输入汇率' }]}>
                <InputNumber min={0.0001} precision={4} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="折算人民币">
                <Input value={money(selectedAmountCny)} disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select options={feeStatuses} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="occurrenceStage" label="发生节点/阶段">
                <Input placeholder={selectedTask?.projectName ? `来自 ${selectedTask.projectName}` : '如国内运输、清关、任务完成后'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sourceType" label="来源">
                <Select options={[{ value: 'manual', label: '人工录入' }, { value: 'workflow', label: '节点服务' }, { value: 'quote', label: '报价' }]} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="notes" label="备注">
                <TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="生成客户账单" open={billOpen} onCancel={() => setBillOpen(false)} onOk={() => billForm.submit()} okText="生成">
        <Form form={billForm} layout="vertical" onFinish={(values) => void createBill(values)}>
          <Form.Item name="title" label="账单标题" rules={[{ required: true, message: '请输入账单标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="已选费用">
            <Text>{selectedReceivables.length} 条，合计 {money(items.filter((item) => selectedReceivables.includes(item.id)).reduce((sum, item) => sum + item.amountCny, 0))} CNY</Text>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="提交付款申请" open={paymentOpen} onCancel={() => setPaymentOpen(false)} onOk={() => paymentForm.submit()} okText="提交">
        <Form form={paymentForm} layout="vertical" onFinish={(values) => void createPaymentRequest(values)}>
          <Form.Item name="title" label="申请标题" rules={[{ required: true, message: '请输入申请标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="已选应付">
            <Text>{selectedPayables.length} 条，合计 {money(items.filter((item) => selectedPayables.includes(item.id)).reduce((sum, item) => sum + item.amountCny, 0))} CNY</Text>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
