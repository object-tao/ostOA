import { LockOutlined, ReloadOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  List,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getToken, saveSession, type SessionUser } from '../api/auth';
import { apiRequest } from '../api/client';
import { formatBeijingTime } from '../utils/date';

const { Text, Title } = Typography;

const zh = {
  title: '\u7ecf\u8425\u5927\u76d8',
  mobileSub: '\u9879\u76ee\u3001\u4efb\u52a1\u3001\u98ce\u9669\u548c\u4eca\u65e5\u8282\u70b9\u52a8\u6001\u3002',
  loginSub:
    '\u8bf7\u5148\u767b\u5f55\u7cfb\u7edf\u8d26\u53f7\uff0c\u767b\u5f55\u540e\u7ee7\u7eed\u67e5\u770b\u79fb\u52a8\u7ecf\u8425\u5927\u76d8\u3002',
  email: '\u90ae\u7bb1',
  password: '\u5bc6\u7801',
  login: '\u767b\u5f55',
  inputEmail: '\u8bf7\u8f93\u5165\u90ae\u7bb1',
  inputPassword: '\u8bf7\u8f93\u5165\u5bc6\u7801',
  loginOk: '\u767b\u5f55\u6210\u529f',
  loginFailed: '\u767b\u5f55\u5931\u8d25',
  tokenMissing: '\u767b\u5f55\u63a5\u53e3\u672a\u8fd4\u56de\u8bbf\u95ee\u4ee4\u724c',
  loadFailed: '\u7ecf\u8425\u5927\u76d8\u52a0\u8f7d\u5931\u8d25',
  refresh: '\u5237\u65b0',
  activeProjects: '\u8fd0\u884c\u9879\u76ee',
  activeTasks: '\u8fd0\u884c\u4efb\u52a1',
  pendingTodos: '\u5f85\u529e\u8282\u70b9',
  overdueNodes: '\u8d85\u65f6\u8282\u70b9',
  todayDynamics: '\u4eca\u65e5\u52a8\u6001',
  riskTasks: '\u98ce\u9669\u4efb\u52a1',
  noRisk: '\u6682\u65e0\u8d85\u65f6\u98ce\u9669',
  dynamics: '\u8282\u70b9\u52a8\u6001\uff08\u4eca\u65e5\uff09',
  noDynamics: '\u4eca\u65e5\u6682\u65e0\u8282\u70b9\u66f4\u65b0',
  nodeOverview: '\u8282\u70b9\u6982\u89c8',
  noNodes: '\u6682\u65e0\u8fd0\u884c\u8282\u70b9',
  runningTasks: '\u8fd0\u884c\u4efb\u52a1',
  task: '\u4efb\u52a1',
  routeNode: '\u8def\u7ebf / \u5f53\u524d\u8282\u70b9',
  vehicle: '\u8f66\u8f86',
  duration: '\u8017\u65f6',
  progress: '\u8fdb\u5ea6',
  actual: '\u5b9e\u9645',
  planned: '\u9884\u8ba1',
  owner: '\u8d1f\u8d23\u4eba',
  active: '\u8fd0\u884c',
  processing: '\u5904\u7406\u4e2d',
  completedToday: '\u4eca\u65e5\u5b8c\u6210',
  overduePrefix: '\u5f53\u524d\u6709',
  overdueSuffix: '\u4e2a\u8d85\u65f6\u8282\u70b9',
  overdueDesc: '\u5efa\u8bae\u4f18\u5148\u67e5\u770b\u98ce\u9669\u4efb\u52a1\uff0c\u5e76\u50ac\u529e\u5f53\u524d\u8282\u70b9\u64cd\u4f5c\u4eba\u3002',
  minutes: '\u5206\u949f',
  hours: '\u5c0f\u65f6',
  days: '\u5929',
};

type ExecutiveSummary = {
  activeProjects: number;
  activeTasks: number;
  pendingTodos: number;
  overdueNodes: number;
  todayDynamics: number;
};

type ExecutiveRisk = {
  taskId: string;
  taskNo: string;
  nodeName: string;
  owner?: string;
  projectName?: string;
  customerShortName?: string;
  vehicleNo?: string;
  plannedHours: number;
  actualHours: number;
};

type ExecutiveDynamic = {
  id: string;
  taskNo?: string;
  customerShortName?: string;
  projectName?: string;
  nodeName?: string;
  action?: string;
  operator?: string;
  content?: string;
  happenedAt?: string;
};

type ExecutiveNodeStat = {
  nodeName: string;
  active: number;
  processing: number;
  overdue: number;
  completedToday: number;
};

type ExecutiveTask = {
  taskId: string;
  taskNo: string;
  customerShortName?: string;
  projectName?: string;
  route?: string;
  vehicleNo?: string;
  nodeName?: string;
  owner?: string;
  progress: number;
  plannedHours: number;
  actualHours: number;
  overdue: boolean;
};

type ExecutiveDashboardData = {
  generatedAt: string;
  summary: ExecutiveSummary;
  nodeStats: ExecutiveNodeStat[];
  risks: ExecutiveRisk[];
  dynamics: ExecutiveDynamic[];
  runningTasks: ExecutiveTask[];
};

type LoginResult = {
  accessToken?: string;
  token?: string;
  user: SessionUser;
};

function cleanText(value?: string | number | null) {
  if (value === undefined || value === null || value === '') return '-';
  return String(value);
}

function hoursText(hours?: number) {
  const value = Number(hours ?? 0);
  if (!Number.isFinite(value) || value <= 0) return '-';
  if (value < 1) return `${Math.max(1, Math.round(value * 60))}${zh.minutes}`;
  if (value < 24) return `${value.toFixed(value >= 10 ? 0 : 1)}${zh.hours}`;
  return `${(value / 24).toFixed(1)}${zh.days}`;
}

function isUnauthorizedError(error: unknown) {
  const text = error instanceof Error ? error.message : String(error ?? '');
  return /unauthorized|sign in|not authorized|login/i.test(text);
}

export function ExecutiveDashboardPage({ mobile = false }: { mobile?: boolean }) {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(() => Boolean(getToken()));
  const [loginLoading, setLoginLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (mobile && !getToken()) {
      setHasSession(false);
      return;
    }

    setLoading(true);
    try {
      const result = await apiRequest<ExecutiveDashboardData>('/api/executive-dashboard');
      setData(result);
      setHasSession(true);
    } catch (error) {
      if (mobile && isUnauthorizedError(error)) {
        setHasSession(false);
      }
      message.error(error instanceof Error ? error.message : zh.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [mobile]);

  useEffect(() => {
    if (mobile && !hasSession) return;
    void loadData();
  }, [hasSession, loadData, mobile]);

  const handleMobileLogin = async (values: { email: string; password: string }) => {
    setLoginLoading(true);
    try {
      const result = await apiRequest<LoginResult>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      const token = result.accessToken ?? result.token;
      if (!token) throw new Error(zh.tokenMissing);
      saveSession(token, result.user);
      setHasSession(true);
      message.success(zh.loginOk);
      await loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : zh.loginFailed);
    } finally {
      setLoginLoading(false);
    }
  };

  const summary = data?.summary ?? {
    activeProjects: 0,
    activeTasks: 0,
    pendingTodos: 0,
    overdueNodes: 0,
    todayDynamics: 0,
  };

  const taskColumns = useMemo<ColumnsType<ExecutiveTask>>(
    () => [
      {
        title: zh.task,
        dataIndex: 'taskNo',
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Text strong>{cleanText(record.taskNo)}</Text>
            <Text type="secondary">
              {cleanText(record.customerShortName)} / {cleanText(record.projectName)}
            </Text>
          </Space>
        ),
      },
      {
        title: zh.routeNode,
        width: 240,
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Text>{cleanText(record.route)}</Text>
            <Space size={6} wrap>
              <Tag color={record.overdue ? 'red' : 'blue'}>{cleanText(record.nodeName)}</Tag>
              <Text type="secondary">{cleanText(record.owner)}</Text>
            </Space>
          </Space>
        ),
      },
      {
        title: zh.vehicle,
        dataIndex: 'vehicleNo',
        width: 150,
        render: (value) => cleanText(value),
      },
      {
        title: zh.duration,
        width: 150,
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Text type={record.overdue ? 'danger' : undefined}>
              {zh.actual}: {hoursText(record.actualHours)}
            </Text>
            <Text type="secondary">
              {zh.planned}: {hoursText(record.plannedHours)}
            </Text>
          </Space>
        ),
      },
      {
        title: zh.progress,
        dataIndex: 'progress',
        width: 140,
        render: (value) => <Progress percent={Number(value ?? 0)} size="small" />,
      },
    ],
    [],
  );

  if (mobile && !hasSession) {
    return (
      <div className="mobile-executive-page mobile-executive-login">
        <Card bordered={false} className="mobile-executive-login-card">
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <Space direction="vertical" size={4}>
              <Text type="secondary">OSTOA MOBILE</Text>
              <Title level={2} style={{ margin: 0 }}>
                {zh.title}
              </Title>
              <Text type="secondary">{zh.loginSub}</Text>
            </Space>

            <Form layout="vertical" onFinish={handleMobileLogin}>
              <Form.Item name="email" label={zh.email} rules={[{ required: true, message: zh.inputEmail }]}>
                <Input prefix={<UserOutlined />} size="large" autoComplete="username" />
              </Form.Item>
              <Form.Item
                name="password"
                label={zh.password}
                rules={[{ required: true, message: zh.inputPassword }]}
              >
                <Input.Password prefix={<LockOutlined />} size="large" autoComplete="current-password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loginLoading} size="large" block>
                {zh.login}
              </Button>
            </Form>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <Spin spinning={loading}>
      <div className={mobile ? 'mobile-executive-page' : undefined}>
        <Space direction="vertical" size={mobile ? 12 : 16} style={{ width: '100%' }}>
          {mobile ? (
            <Card bordered={false}>
              <Space direction="vertical" size={4}>
                <Text type="secondary">OSTOA MOBILE</Text>
                <Title level={2} style={{ margin: 0 }}>
                  {zh.title}
                </Title>
                <Text type="secondary">{zh.mobileSub}</Text>
              </Space>
            </Card>
          ) : null}

          <Card bordered={false}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={12} md={4}>
                <Statistic title={zh.activeProjects} value={summary.activeProjects} />
              </Col>
              <Col xs={12} md={4}>
                <Statistic title={zh.activeTasks} value={summary.activeTasks} />
              </Col>
              <Col xs={12} md={4}>
                <Statistic title={zh.pendingTodos} value={summary.pendingTodos} />
              </Col>
              <Col xs={12} md={4}>
                <Statistic
                  title={zh.overdueNodes}
                  value={summary.overdueNodes}
                  valueStyle={{ color: summary.overdueNodes ? '#cf1322' : undefined }}
                />
              </Col>
              <Col xs={12} md={4}>
                <Statistic title={zh.todayDynamics} value={summary.todayDynamics} />
              </Col>
              <Col xs={12} md={4}>
                <Button block icon={<ReloadOutlined />} onClick={loadData}>
                  {zh.refresh}
                </Button>
              </Col>
            </Row>
          </Card>

          {summary.overdueNodes ? (
            <Alert
              type="error"
              showIcon
              message={`${zh.overduePrefix} ${summary.overdueNodes} ${zh.overdueSuffix}`}
              description={zh.overdueDesc}
            />
          ) : null}

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={10}>
              <Card title={zh.riskTasks} bordered={false}>
                {data?.risks.length ? (
                  <List
                    dataSource={data.risks}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<WarningOutlined style={{ color: '#cf1322' }} />}
                          title={
                            <Space wrap>
                              <Text strong>{cleanText(item.taskNo)}</Text>
                              <Tag color="red">{cleanText(item.nodeName)}</Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={2}>
                              <Text>
                                {cleanText(item.customerShortName)} / {cleanText(item.projectName)}
                              </Text>
                              <Text type="danger">
                                {zh.actual} {hoursText(item.actualHours)} / {zh.planned}{' '}
                                {hoursText(item.plannedHours)}
                              </Text>
                              <Text type="secondary">
                                {zh.owner}: {cleanText(item.owner)}; {zh.vehicle}: {cleanText(item.vehicleNo)}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description={zh.noRisk} />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={14}>
              <Card title={zh.dynamics} bordered={false}>
                {data?.dynamics.length ? (
                  <List
                    dataSource={data.dynamics}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Space wrap>
                              <Text strong>{cleanText(item.nodeName)}</Text>
                              <Tag>{cleanText(item.action)}</Tag>
                              <Text type="secondary">{formatBeijingTime(item.happenedAt)}</Text>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={2}>
                              <Text>
                                {cleanText(item.taskNo)} / {cleanText(item.customerShortName)} /{' '}
                                {cleanText(item.projectName)}
                              </Text>
                              <Text type="secondary">
                                {cleanText(item.operator)}: {cleanText(item.content)}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description={zh.noDynamics} />
                )}
              </Card>
            </Col>
          </Row>

          <Card title={zh.nodeOverview} bordered={false}>
            {data?.nodeStats.length ? (
              <List
                grid={mobile ? undefined : { gutter: 12, column: 4 }}
                dataSource={data.nodeStats}
                renderItem={(item) => (
                  <List.Item>
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text strong>{item.nodeName}</Text>
                      <Space wrap size={6}>
                        {item.overdue ? (
                          <Tag color="red">
                            {zh.overdueNodes} {item.overdue}
                          </Tag>
                        ) : null}
                        <Tag color="blue">
                          {zh.active} {item.active}
                        </Tag>
                        <Tag>
                          {zh.processing} {item.processing}
                        </Tag>
                        <Tag>
                          {zh.completedToday} {item.completedToday}
                        </Tag>
                      </Space>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description={zh.noNodes} />
            )}
          </Card>

          <Card title={zh.runningTasks} bordered={false}>
            {mobile ? (
              <List
                dataSource={data?.runningTasks ?? []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space wrap>
                          <Text strong>{cleanText(item.taskNo)}</Text>
                          <Tag color={item.overdue ? 'red' : 'blue'}>{cleanText(item.nodeName)}</Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={2}>
                          <Text>
                            {cleanText(item.customerShortName)} / {cleanText(item.projectName)}
                          </Text>
                          <Text>{cleanText(item.route)}</Text>
                          <Text type={item.overdue ? 'danger' : undefined}>
                            {cleanText(item.vehicleNo)} / {zh.actual} {hoursText(item.actualHours)} / {zh.planned}{' '}
                            {hoursText(item.plannedHours)}
                          </Text>
                          <Progress percent={Number(item.progress ?? 0)} size="small" />
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Table
                rowKey="taskId"
                columns={taskColumns}
                dataSource={data?.runningTasks ?? []}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 900 }}
              />
            )}
          </Card>
        </Space>
      </div>
    </Spin>
  );
}
