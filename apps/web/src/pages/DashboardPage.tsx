import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FundOutlined,
  ProjectOutlined,
  RocketOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Empty, List, message, Progress, Row, Space, Statistic, Table, Tag, Timeline, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getSessionUser } from '../api/auth';
import { apiRequest } from '../api/client';
import { formatBeijingTime } from '../utils/date';

const { Text, Title } = Typography;

type DashboardData = {
  totals: {
    inquiryCount: number;
    pendingQuoteCount: number;
    projectCount: number;
    taskCount: number;
    activeTaskCount: number;
    todoCount: number;
    exceptionCount: number;
  };
  finance: {
    confirmedReceivable: number;
    confirmedPayable: number;
    grossProfit: number;
    unreceived: number;
    unpaid: number;
  };
  taskStatus: Array<{ status: string; count: number }>;
  nodeStatus: Array<{ nodeName: string; count: number }>;
  recentTasks: Array<{
    id: string;
    taskNo: string;
    projectName: string;
    customerName: string;
    currentNode: string;
    status: string;
    progress: number;
    updatedAt: string;
  }>;
  todos: Array<{
    id: string;
    title: string;
    taskNo: string;
    projectName: string;
    customerName: string;
    nodeName: string;
    status: string;
    createdAt: string;
  }>;
  trackingRecords: Array<{
    id: string;
    taskNo: string;
    nodeName: string;
    location?: string | null;
    trackingStatus?: string | null;
    content: string;
    trackedAt: string;
  }>;
};

type FeishuBinding = {
  bound: boolean;
  employeeMissing?: boolean;
  employeeName?: string;
  email?: string;
  feishuOpenId?: string;
  feishuUserId?: string;
  message?: string;
};

const emptyDashboard: DashboardData = {
  totals: {
    inquiryCount: 0,
    pendingQuoteCount: 0,
    projectCount: 0,
    taskCount: 0,
    activeTaskCount: 0,
    todoCount: 0,
    exceptionCount: 0,
  },
  finance: {
    confirmedReceivable: 0,
    confirmedPayable: 0,
    grossProfit: 0,
    unreceived: 0,
    unpaid: 0,
  },
  taskStatus: [],
  nodeStatus: [],
  recentTasks: [],
  todos: [],
  trackingRecords: [],
};

function money(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusColor(status: string) {
  if (['已完成', '完成', '已收款', '已付款'].includes(status)) return 'green';
  if (['异常', '已退回', '作废'].includes(status)) return 'red';
  if (['处理中', '运输中', '进行中'].includes(status)) return 'blue';
  return 'default';
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(false);
  const [feishuBinding, setFeishuBinding] = useState<FeishuBinding | null>(null);
  const [feishuLoading, setFeishuLoading] = useState(false);
  const [adminTipLoading, setAdminTipLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setData(await apiRequest<DashboardData>('/api/dashboard'));
    } finally {
      setLoading(false);
    }
  };

  const loadFeishuBinding = async () => {
    try {
      setFeishuBinding(await apiRequest<FeishuBinding>('/api/feishu/binding'));
    } catch (error) {
      setFeishuBinding({ bound: false, message: (error as Error).message });
    }
  };

  const cleanFeishuCallbackUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const bindFeishuWithCode = async (code: string) => {
    setFeishuLoading(true);
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      await apiRequest('/api/feishu/bind', {
        method: 'POST',
        body: JSON.stringify({ code, redirectUri }),
      });
      message.success('飞书账号已绑定');
      cleanFeishuCallbackUrl();
      await loadFeishuBinding();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setFeishuLoading(false);
    }
  };

  const startFeishuBind = async () => {
    setFeishuLoading(true);
    try {
      const redirect = `${window.location.origin}${window.location.pathname}`;
      const result = await apiRequest<{ authUrl: string }>(`/api/feishu/auth-url?redirect=${encodeURIComponent(redirect)}&state=feishu-bind`);
      window.location.href = result.authUrl;
    } catch (error) {
      message.error((error as Error).message);
      setFeishuLoading(false);
    }
  };

  const sendAdminTip = async () => {
    setAdminTipLoading(true);
    try {
      const result = await apiRequest<{ sent?: number; failed?: number }>('/api/dashboard/admin-tip', { method: 'POST' });
      message.success(`提示已发送给 ${result.sent ?? 0} 位管理员。`);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setAdminTipLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    void loadFeishuBinding();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (code && state === 'feishu-bind') {
      void bindFeishuWithCode(code);
    }
  }, []);

  const taskColumns: ColumnsType<DashboardData['recentTasks'][number]> = [
    { title: '任务号', dataIndex: 'taskNo', width: 170 },
    { title: '客户', dataIndex: 'customerName', width: 150, render: (value) => value || '-' },
    { title: '项目', dataIndex: 'projectName', width: 180, render: (value) => value || '-' },
    { title: '当前节点', dataIndex: 'currentNode', width: 120, render: (value) => (value ? <Tag color="blue">{value}</Tag> : '-') },
    { title: '状态', dataIndex: 'status', width: 110, render: (value) => <Tag color={statusColor(value)}>{value}</Tag> },
    { title: '进度', dataIndex: 'progress', width: 140, render: (value) => <Progress percent={Number(value ?? 0)} size="small" /> },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card className="glass-card" bordered={false} loading={loading}>
        <Row gutter={[18, 18]} align="middle">
          <Col xs={24} lg={12}>
            <Text type="secondary" style={{ letterSpacing: 2, fontWeight: 700 }}>
              CENTRAL ASIA TRANSPORT
            </Text>
            <Title level={2} style={{ margin: '8px 0 0' }}>
              运营中控台
            </Title>
            <Text type="secondary">聚合询单、项目、运输任务、流程待办、轨迹与财务毛利。</Text>
          </Col>
          <Col xs={24} lg={12}>
            <div style={{ textAlign: 'right', marginBottom: 12 }}>
              <Button type="primary" loading={adminTipLoading} onClick={sendAdminTip}>
                提示
              </Button>
            </div>
            <Row gutter={[12, 12]}>
              <Col span={8}>
                <Statistic title="待报价" value={data.totals.pendingQuoteCount} prefix={<FileTextOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="待办" value={data.totals.todoCount} prefix={<ClockCircleOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="毛利" value={data.finance.grossProfit} precision={2} suffix="CNY" prefix={<WalletOutlined />} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Card className="glass-card" bordered={false}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={4}>
              <Text strong>飞书绑定</Text>
              {feishuBinding?.bound ? (
                <Text type="secondary">
                  当前员工 {feishuBinding.employeeName || getSessionUser()?.realName || '-'} 已绑定飞书，可接收流程待办、节点催办和流转提醒。
                </Text>
              ) : (
                <Text type="secondary">当前账号尚未绑定飞书。绑定后，节点待办和催办消息会直接推送到对应员工飞书。</Text>
              )}
              {feishuBinding?.message ? <Alert type="warning" showIcon message={feishuBinding.message} /> : null}
            </Space>
          </Col>
          <Col xs={24} lg={8} style={{ textAlign: 'right' }}>
            {feishuBinding?.bound ? (
              <Tag color="green" style={{ padding: '6px 12px' }}>
                已绑定
              </Tag>
            ) : (
              <Button type="primary" loading={feishuLoading} onClick={startFeishuBind}>
                绑定飞书
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={4}>
          <Card className="metric-card">
            <Statistic title="询单总数" value={data.totals.inquiryCount} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card className="metric-card">
            <Statistic title="项目管理" value={data.totals.projectCount} prefix={<ProjectOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card className="metric-card">
            <Statistic title="运输任务" value={data.totals.taskCount} prefix={<RocketOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card className="metric-card">
            <Statistic title="进行中任务" value={data.totals.activeTaskCount} prefix={<FundOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card className="metric-card">
            <Statistic title="异常记录" value={data.totals.exceptionCount} prefix={<AlertOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={4}>
          <Card className="metric-card">
            <Statistic title="待收/待付" value={`${money(data.finance.unreceived)} / ${money(data.finance.unpaid)}`} suffix="CNY" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card className="glass-card" title="状态跟进" bordered={false}>
            {data.nodeStatus.length ? (
              <div style={{ height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={data.nodeStatus}>
                    <CartesianGrid stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="nodeName" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="任务数" fill="#1677ff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="暂无节点任务" />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card className="glass-card" title="财务概览" bordered={false}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Row gutter={12}>
                <Col span={12}>
                  <Statistic title="已确认应收" value={data.finance.confirmedReceivable} precision={2} suffix="CNY" />
                </Col>
                <Col span={12}>
                  <Statistic title="已确认应付" value={data.finance.confirmedPayable} precision={2} suffix="CNY" />
                </Col>
              </Row>
              <Progress
                percent={
                  data.finance.confirmedReceivable
                    ? Math.max(0, Math.min(100, Math.round((data.finance.grossProfit / data.finance.confirmedReceivable) * 100)))
                    : 0
                }
                strokeColor="#22c55e"
              />
              <Text type="secondary">毛利率按已确认应收和应付测算，后续可细分到项目、客户和业务员。</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card className="glass-card" title="近期运输任务" bordered={false}>
            <Table rowKey="id" dataSource={data.recentTasks} columns={taskColumns} pagination={false} scroll={{ x: 900 }} />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card className="glass-card" title="我的待办" bordered={false}>
            <List
              dataSource={data.todos}
              locale={{ emptyText: '暂无待办' }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<ClockCircleOutlined style={{ color: '#1677ff' }} />}
                    title={<span>{item.title}</span>}
                    description={`${item.customerName || '-'} / ${item.taskNo || '-'} / ${item.nodeName || '-'}`}
                  />
                  <Tag color={statusColor(item.status)}>{item.status}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card className="glass-card" title="最新轨迹" bordered={false}>
        {data.trackingRecords.length ? (
          <Timeline
            items={data.trackingRecords.map((item) => ({
              dot: <CheckCircleOutlined />,
              children: (
                <Space direction="vertical" size={2}>
                  <Text strong>
                    {item.taskNo} / {item.nodeName} / {item.trackingStatus || '跟踪记录'}
                  </Text>
                  <Text>{item.content}</Text>
                  <Text type="secondary">
                    {item.location || '-'} / {formatBeijingTime(item.trackedAt, true)}
                  </Text>
                </Space>
              ),
            }))}
          />
        ) : (
          <Empty description="暂无轨迹记录" />
        )}
      </Card>
    </Space>
  );
}
