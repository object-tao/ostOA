import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Progress,
  Segmented,
  Select,
  Space,
  Spin,
  Statistic,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  LogoutOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { apiRequest } from './api/client';
import { clearSession, getSessionUser, getToken, saveSession, type SessionUser } from './api/auth';
import './styles/mobile.css';

const { Text, Title } = Typography;
const { TextArea } = Input;

type MobileTab = 'home' | 'todos' | 'tasks' | 'tracking' | 'me';

type WorkflowTodo = {
  id: string;
  taskId: string;
  title: string;
  owner?: string | null;
  dueAt?: string | null;
  status?: string | null;
  priority?: string | null;
  projectName?: string | null;
  customerName?: string | null;
  taskNo?: string | null;
  nodeName?: string | null;
};

type WorkflowNode = {
  id: string;
  nodeName: string;
  status?: string | null;
  owner?: string | null;
};

type MobileTask = {
  id: string;
  projectId: string;
  projectName: string;
  customerName?: string | null;
  taskNo: string;
  vehicleNo?: string | null;
  vehicleType?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  cargoSummary?: string | null;
  plannedDepartureDate?: string | null;
  status?: string | null;
  progress?: number | null;
  workflowCurrentNodeId?: string | null;
  workflowCurrentNodeName?: string | null;
  workflowCurrentNodeStatus?: string | null;
  workflowNodes?: WorkflowNode[];
};

type MobileProject = {
  id: string;
  name: string;
  projectNo?: string | null;
  customerName?: string | null;
  origin?: string | null;
  destination?: string | null;
  status?: string | null;
  progress?: number | null;
  pendingTodoCount?: number | null;
  abnormalCount?: number | null;
  tasks?: MobileTask[];
};

type TrackingRecord = {
  id: string;
  nodeName?: string | null;
  trackedAt?: string | null;
  location?: string | null;
  trackingStatus?: string | null;
  content?: string | null;
  operator?: string | null;
};

type TrackingResult = MobileTask & {
  projectNo?: string | null;
  origin?: string | null;
  destination?: string | null;
  trackingRecords?: TrackingRecord[];
};

const todoDoneStatus = '已完成';
const taskStatusOptions = ['待发车', '运输中', '已到达', '已完成', '异常'];
const trackingStatusOptions = ['现场签到', '已装车', '已发车', '到达节点', '清关中', '已交付', '异常反馈'];

function isDone(status?: string | null) {
  return status === todoDoneStatus || status === 'DONE' || status === 'COMPLETED';
}

function shortDate(value?: string | null) {
  if (!value) return '-';
  return value.slice(0, 10);
}

function statusColor(status?: string | null) {
  if (!status) return 'default';
  if (status.includes('完成') || status === 'COMPLETED') return 'green';
  if (status.includes('异常')) return 'red';
  if (status.includes('运输') || status.includes('进行')) return 'blue';
  return 'gold';
}

function priorityColor(priority?: string | null) {
  if (!priority) return 'default';
  if (priority.includes('高') || priority.toUpperCase() === 'HIGH') return 'red';
  if (priority.includes('低') || priority.toUpperCase() === 'LOW') return 'default';
  return 'gold';
}

function flattenTasks(projects: MobileProject[]) {
  return projects.flatMap((project) =>
    (project.tasks ?? []).map((task) => ({
      ...task,
      projectId: project.id,
      projectName: project.name,
      customerName: task.customerName ?? project.customerName,
    })),
  );
}

export default function MobileApp() {
  const [loginForm] = Form.useForm();
  const [trackingForm] = Form.useForm();
  const [taskForm] = Form.useForm();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(getSessionUser());
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [todoFilter, setTodoFilter] = useState<'open' | 'all'>('open');
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [loginLoading, setLoginLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todos, setTodos] = useState<WorkflowTodo[]>([]);
  const [projects, setProjects] = useState<MobileProject[]>([]);
  const [selectedTask, setSelectedTask] = useState<MobileTask | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [trackingKeyword, setTrackingKeyword] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResults, setTrackingResults] = useState<TrackingResult[]>([]);
  const [trackingTarget, setTrackingTarget] = useState<TrackingResult | null>(null);
  const [postingTracking, setPostingTracking] = useState(false);

  const tasks = useMemo(() => flattenTasks(projects), [projects]);
  const activeTodos = useMemo(() => todos.filter((item) => !isDone(item.status)), [todos]);
  const visibleTodos = todoFilter === 'open' ? activeTodos : todos;
  const abnormalTasks = useMemo(() => tasks.filter((item) => item.status?.includes('异常')), [tasks]);
  const activeTasks = useMemo(() => tasks.filter((item) => !isDone(item.status)), [tasks]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [todoRes, projectRes] = await Promise.all([
        apiRequest<{ items: WorkflowTodo[] }>('/api/workflow/todos'),
        apiRequest<{ items: MobileProject[] }>('/api/oversize-projects'),
      ]);
      setTodos(todoRes.items ?? []);
      setProjects(projectRes.items ?? []);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    void apiRequest<{ user: SessionUser }>('/api/auth/me')
      .then((result) => {
        if (result.user) {
          const token = getToken();
          setSessionUser(result.user);
          if (token) saveSession(token, result.user);
        }
      })
      .finally(() => void loadData());
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
    setTodos([]);
    setProjects([]);
    setTrackingResults([]);
  };

  const updateTodo = async (todo: WorkflowTodo, status: string) => {
    try {
      await apiRequest(`/api/workflow/todos/${todo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      message.success(status === todoDoneStatus ? '待办已完成' : '待办已更新');
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const openTask = (task: MobileTask) => {
    setSelectedTask(task);
    taskForm.setFieldsValue({
      status: task.status,
      progress: task.progress ?? 0,
      notes: task.cargoSummary,
    });
    setTaskDrawerOpen(true);
  };

  const updateTask = async (values: { status?: string; progress?: number; notes?: string }) => {
    if (!selectedTask) return;
    try {
      await apiRequest(`/api/oversize-project-tasks/${selectedTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(values),
      });
      message.success('任务已更新');
      setTaskDrawerOpen(false);
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const searchTracking = async () => {
    const keyword = trackingKeyword.trim();
    if (!keyword) {
      message.warning('请输入任务号、项目名或客户名');
      return;
    }

    setTrackingLoading(true);
    try {
      const result = await apiRequest<{ items: TrackingResult[] }>(`/api/task-tracking?keyword=${encodeURIComponent(keyword)}`);
      setTrackingResults(result.items ?? []);
      if (!result.items?.length) {
        message.info('没有找到匹配任务');
      }
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setTrackingLoading(false);
    }
  };

  const fillDeviceLocation = () => {
    if (!navigator.geolocation) {
      message.warning('当前手机浏览器不支持定位');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        trackingForm.setFieldValue('location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      () => message.error('定位失败，请检查浏览器定位权限'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const openTrackingModal = (task: TrackingResult | MobileTask) => {
    const currentNodeId = task.workflowCurrentNodeId ?? task.workflowNodes?.find((node) => !isDone(node.status))?.id;
    if (!currentNodeId) {
      message.warning('当前任务还没有可记录的流程节点');
      return;
    }
    setTrackingTarget({ ...(task as TrackingResult), workflowCurrentNodeId: currentNodeId });
    trackingForm.resetFields();
    trackingForm.setFieldsValue({
      trackingStatus: '现场签到',
      operator: sessionUser?.realName,
      customerVisible: true,
    });
  };

  const submitTracking = async (values: {
    location?: string;
    trackingStatus?: string;
    content?: string;
    operator?: string;
    customerVisible?: boolean;
  }) => {
    if (!trackingTarget?.workflowCurrentNodeId) return;
    setPostingTracking(true);
    try {
      await apiRequest(`/api/workflow/instance-nodes/${trackingTarget.workflowCurrentNodeId}/tracking-records`, {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          trackedAt: new Date().toISOString(),
          visibilityLevel: values.customerVisible ? 'customer' : 'internal',
        }),
      });
      message.success('现场记录已提交');
      setTrackingTarget(null);
      if (trackingKeyword.trim()) {
        await searchTracking();
      }
      await loadData();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setPostingTracking(false);
    }
  };

  if (loading) {
    return (
      <div className="mobile-loading">
        <Spin />
        <Text type="secondary">正在进入 m.ostoa.org</Text>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <main className="mobile-login">
        <section className="mobile-login-panel">
          <div className="mobile-brand">
            <div className="mobile-brand-mark">M</div>
            <div>
              <Title level={3}>m.ostoa.org</Title>
              <Text type="secondary">OST-TMS 外勤手机端</Text>
            </div>
          </div>
          <Form form={loginForm} layout="vertical" onFinish={(values) => void login(values)}>
            <Form.Item name="email" label="账号" rules={[{ required: true, message: '请输入账号' }]}>
              <Input size="large" autoComplete="username" placeholder="邮箱或账号" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password size="large" autoComplete="current-password" placeholder="请输入密码" />
            </Form.Item>
            <Button type="primary" size="large" block htmlType="submit" loading={loginLoading}>
              登录
            </Button>
          </Form>
        </section>
      </main>
    );
  }

  return (
    <main className="mobile-shell">
      <header className="mobile-topbar">
        <div>
          <Text className="mobile-kicker">OST-TMS Mobile</Text>
          <Title level={4}>外勤工作台</Title>
        </div>
        <Button shape="circle" icon={<ReloadOutlined />} loading={refreshing} onClick={() => void loadData()} />
      </header>

      <section className="mobile-content">
        {activeTab === 'home' && (
          <div className="mobile-stack">
            <Card className="mobile-hero">
              <Space direction="vertical" size={4}>
                <Text>早上好，{sessionUser.realName}</Text>
                <Title level={3}>今天优先处理现场任务和待办节点</Title>
              </Space>
            </Card>
            <div className="mobile-metrics">
              <Card>
                <Statistic title="未完成待办" value={activeTodos.length} />
              </Card>
              <Card>
                <Statistic title="执行中任务" value={activeTasks.length} />
              </Card>
              <Card>
                <Statistic title="异常任务" value={abnormalTasks.length} valueStyle={{ color: '#cf1322' }} />
              </Card>
            </div>
            <Card title="快捷操作">
              <div className="mobile-actions">
                <Button icon={<UnorderedListOutlined />} onClick={() => setActiveTab('todos')}>
                  待办
                </Button>
                <Button icon={<CompassOutlined />} onClick={() => setActiveTab('tasks')}>
                  任务
                </Button>
                <Button type="primary" icon={<EnvironmentOutlined />} onClick={() => setActiveTab('tracking')}>
                  轨迹记录
                </Button>
              </div>
            </Card>
            <Card title="最近待办">
              <TodoList items={activeTodos.slice(0, 4)} onDone={(todo) => void updateTodo(todo, todoDoneStatus)} />
            </Card>
          </div>
        )}

        {activeTab === 'todos' && (
          <Card title="我的待办" extra={<Tag color="blue">{activeTodos.length}</Tag>}>
            <Segmented
              block
              options={[
                { label: '未完成', value: 'open' },
                { label: '全部', value: 'all' },
              ]}
              value={todoFilter}
              onChange={(value) => setTodoFilter(value as 'open' | 'all')}
            />
            <TodoList
              items={visibleTodos}
              showDone
              onDone={(todo) => void updateTodo(todo, todoDoneStatus)}
              onReopen={(todo) => void updateTodo(todo, '未处理')}
            />
          </Card>
        )}

        {activeTab === 'tasks' && (
          <Card title="运输任务" extra={<Tag color="blue">{tasks.length}</Tag>}>
            <List
              dataSource={tasks}
              locale={{ emptyText: <Empty description="暂无运输任务" /> }}
              renderItem={(task) => (
                <List.Item onClick={() => openTask(task)}>
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <Text strong>{task.taskNo}</Text>
                        <Tag color={statusColor(task.status)}>{task.status || '未开始'}</Tag>
                      </Space>
                    }
                    description={
                      <div className="mobile-item-copy">
                        <Text>{task.projectName}</Text>
                        <Text type="secondary">{task.vehicleNo || '待派车'} · {task.driverName || '待安排司机'}</Text>
                        <Progress percent={Number(task.progress ?? 0)} size="small" />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {activeTab === 'tracking' && (
          <div className="mobile-stack">
            <Card title="轨迹查询">
              <Space.Compact block>
                <Input
                  size="large"
                  value={trackingKeyword}
                  onChange={(event) => setTrackingKeyword(event.target.value)}
                  onPressEnter={() => void searchTracking()}
                  placeholder="任务号 / 项目 / 客户"
                />
                <Button size="large" type="primary" icon={<SearchOutlined />} loading={trackingLoading} onClick={() => void searchTracking()} />
              </Space.Compact>
            </Card>
            <Card title="查询结果">
              <List
                dataSource={trackingResults}
                locale={{ emptyText: <Empty description="请输入关键词查询任务" /> }}
                renderItem={(task) => (
                  <List.Item
                    actions={[
                      <Button key="track" type="primary" size="small" icon={<SendOutlined />} onClick={() => openTrackingModal(task)}>
                        记录
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Text strong>{task.taskNo}</Text>}
                      description={
                        <div className="mobile-item-copy">
                          <Text>{task.projectName}</Text>
                          <Text type="secondary">{task.origin || '-'} → {task.destination || '-'}</Text>
                          <Text type="secondary">当前节点：{task.workflowCurrentNodeName || '-'}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}

        {activeTab === 'me' && (
          <div className="mobile-stack">
            <Card>
              <Space align="center">
                <Avatar size={54} icon={<UserOutlined />} />
                <div>
                  <Title level={4}>{sessionUser.realName}</Title>
                  <Text type="secondary">{sessionUser.roleName}</Text>
                </div>
              </Space>
            </Card>
            <Alert message="手机端已接入同一套 OST-TMS 权限与 API，适合外勤进行任务查看、待办处理和现场轨迹上报。" type="info" showIcon />
            <Button danger icon={<LogoutOutlined />} onClick={logout}>
              退出登录
            </Button>
          </div>
        )}
      </section>

      <nav className="mobile-tabbar">
        <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
          <HomeOutlined />
          首页
        </button>
        <button className={activeTab === 'todos' ? 'active' : ''} onClick={() => setActiveTab('todos')}>
          <UnorderedListOutlined />
          待办
        </button>
        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
          <CompassOutlined />
          任务
        </button>
        <button className={activeTab === 'tracking' ? 'active' : ''} onClick={() => setActiveTab('tracking')}>
          <EnvironmentOutlined />
          轨迹
        </button>
        <button className={activeTab === 'me' ? 'active' : ''} onClick={() => setActiveTab('me')}>
          <UserOutlined />
          我的
        </button>
      </nav>

      <Drawer
        title={selectedTask?.taskNo ?? '任务详情'}
        open={taskDrawerOpen}
        placement="bottom"
        height="82vh"
        onClose={() => setTaskDrawerOpen(false)}
      >
        {selectedTask && (
          <div className="mobile-stack">
            <Card>
              <Space direction="vertical" size={8}>
                <Text strong>{selectedTask.projectName}</Text>
                <Text type="secondary">客户：{selectedTask.customerName || '-'}</Text>
                <Text type="secondary">车辆：{selectedTask.vehicleNo || selectedTask.vehicleType || '待安排'}</Text>
                <Text type="secondary">司机：{selectedTask.driverName || '-'} {selectedTask.driverPhone ? ` / ${selectedTask.driverPhone}` : ''}</Text>
                <Text type="secondary">计划发车：{shortDate(selectedTask.plannedDepartureDate)}</Text>
                <Text type="secondary">当前节点：{selectedTask.workflowCurrentNodeName || '-'}</Text>
              </Space>
            </Card>
            <Form form={taskForm} layout="vertical" onFinish={(values) => void updateTask(values)}>
              <Form.Item name="status" label="任务状态">
                <Select options={taskStatusOptions.map((value) => ({ value, label: value }))} />
              </Form.Item>
              <Form.Item name="progress" label="进度">
                <InputNumber min={0} max={100} addonAfter="%" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="notes" label="备注">
                <TextArea rows={3} />
              </Form.Item>
              <Space.Compact block>
                <Button block onClick={() => openTrackingModal(selectedTask)} icon={<EnvironmentOutlined />}>
                  现场记录
                </Button>
                <Button block type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                  保存
                </Button>
              </Space.Compact>
            </Form>
          </div>
        )}
      </Drawer>

      <Modal
        title={trackingTarget ? `记录轨迹 ${trackingTarget.taskNo}` : '记录轨迹'}
        open={Boolean(trackingTarget)}
        onCancel={() => setTrackingTarget(null)}
        onOk={() => trackingForm.submit()}
        okText="提交"
        confirmLoading={postingTracking}
      >
        <Form form={trackingForm} layout="vertical" onFinish={(values) => void submitTracking(values)}>
          <Form.Item name="trackingStatus" label="现场状态" rules={[{ required: true, message: '请选择现场状态' }]}>
            <Select options={trackingStatusOptions.map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item name="location" label="位置">
            <Input
              placeholder="地点或经纬度"
              addonAfter={
                <Button type="link" size="small" onClick={fillDeviceLocation}>
                  定位
                </Button>
              }
            />
          </Form.Item>
          <Form.Item name="content" label="记录内容" rules={[{ required: true, message: '请输入记录内容' }]}>
            <TextArea rows={4} placeholder="例如：已到达装车点，司机已联系现场负责人。" />
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input />
          </Form.Item>
          <Form.Item name="customerVisible" label="客户可见" valuePropName="checked">
            <Switch checkedChildren="可见" unCheckedChildren="内部" />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}

function TodoList({
  items,
  showDone,
  onDone,
  onReopen,
}: {
  items: WorkflowTodo[];
  showDone?: boolean;
  onDone: (todo: WorkflowTodo) => void;
  onReopen?: (todo: WorkflowTodo) => void;
}) {
  const visibleItems = showDone ? items : items.filter((item) => !isDone(item.status));

  return (
    <List
      dataSource={visibleItems}
      locale={{ emptyText: <Empty description="暂无待办" /> }}
      renderItem={(todo) => {
        const done = isDone(todo.status);
        return (
          <List.Item
            actions={[
              done ? (
                <Button key="reopen" size="small" onClick={() => onReopen?.(todo)}>
                  重开
                </Button>
              ) : (
                <Button key="done" type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => onDone(todo)}>
                  完成
                </Button>
              ),
            ]}
          >
            <List.Item.Meta
              title={
                <Space wrap>
                  <Text strong delete={done}>{todo.title}</Text>
                  <Tag color={priorityColor(todo.priority)}>{todo.priority || '普通'}</Tag>
                  {done ? <Tag color="green">已完成</Tag> : null}
                </Space>
              }
              description={
                <div className="mobile-item-copy">
                  <Text type="secondary">{todo.projectName || '-'}</Text>
                  <Text type="secondary">{todo.taskNo || '-'} · {todo.nodeName || '-'}</Text>
                  <Text type="secondary">负责人：{todo.owner || '-'} · 截止：{shortDate(todo.dueAt)}</Text>
                </div>
              }
            />
          </List.Item>
        );
      }}
    />
  );
}
