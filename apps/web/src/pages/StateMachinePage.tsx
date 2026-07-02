import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Popconfirm,
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

const { TextArea } = Input;

type StateMachineRule = {
  id: string;
  ruleName: string;
  scope: string;
  eventType: string;
  conditionJson: string;
  actionType: string;
  actionConfigJson: string;
  enabled: boolean;
  remark?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type StateMachineEvent = {
  id: string;
  source: string;
  scope: string;
  eventType: string;
  refId?: string | null;
  payloadJson?: string | null;
  status: string;
  createdAt?: string;
  processedAt?: string | null;
};

type StateMachineLog = {
  id: string;
  ruleId?: string | null;
  ruleName?: string | null;
  eventId: string;
  actionType: string;
  status: string;
  message?: string | null;
  createdAt?: string;
};

const scopeOptions = [
  { label: '流程节点', value: 'workflow_node' },
  { label: '运输任务', value: 'transport_task' },
  { label: '外部消息', value: 'external_message' },
  { label: 'GPS', value: 'gps' },
  { label: '财务', value: 'finance' },
  { label: '全部', value: 'all' },
];

const eventOptions = [
  { label: '任意事件', value: '*' },
  { label: '节点待处理', value: 'workflow.node.waiting' },
  { label: '节点开始', value: 'workflow.node.started' },
  { label: '节点保存', value: 'workflow.node.saved' },
  { label: '节点完成', value: 'workflow.node.completed' },
  { label: '节点退回', value: 'workflow.node.returned' },
  { label: '节点跳过', value: 'workflow.node.skipped' },
  { label: '节点挂起', value: 'workflow.node.held' },
  { label: '节点异常', value: 'workflow.node.exception' },
  { label: '节点重新分配', value: 'workflow.node.reassigned' },
  { label: '外部消息入库', value: 'external.message.received' },
  { label: 'GPS 异常', value: 'gps.position.abnormal' },
];

const actionOptions = [
  { label: '仅记录日志', value: 'log_only' },
  { label: '发送飞书卡片', value: 'feishu_card' },
  { label: '待办提醒', value: 'todo_reminder' },
];

function tryFormatJson(value?: string | null) {
  if (!value) return '-';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export function StateMachinePage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [rules, setRules] = useState<StateMachineRule[]>([]);
  const [events, setEvents] = useState<StateMachineEvent[]>([]);
  const [logs, setLogs] = useState<StateMachineLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<StateMachineRule | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ruleRes, eventRes, logRes] = await Promise.all([
        apiRequest<{ items: StateMachineRule[] }>('/api/state-machine/rules'),
        apiRequest<{ items: StateMachineEvent[] }>('/api/state-machine/events'),
        apiRequest<{ items: StateMachineLog[] }>('/api/state-machine/logs'),
      ]);
      setRules(ruleRes.items ?? []);
      setEvents(eventRes.items ?? []);
      setLogs(logRes.items ?? []);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '状态机数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openCreate = () => {
    setEditingRule(null);
    form.setFieldsValue({
      scope: 'workflow_node',
      eventType: 'workflow.node.waiting',
      actionType: 'log_only',
      conditionJson: '{}',
      actionConfigJson: '{}',
      enabled: true,
    });
    setDrawerOpen(true);
  };

  const openEdit = (record: StateMachineRule) => {
    setEditingRule(record);
    form.setFieldsValue({
      ruleName: record.ruleName,
      scope: record.scope,
      eventType: record.eventType,
      actionType: record.actionType,
      conditionJson: tryFormatJson(record.conditionJson),
      actionConfigJson: tryFormatJson(record.actionConfigJson),
      enabled: record.enabled,
      remark: record.remark,
    });
    setDrawerOpen(true);
  };

  const saveRule = async () => {
    try {
      const values = await form.validateFields();
      await apiRequest(editingRule ? `/api/state-machine/rules/${editingRule.id}` : '/api/state-machine/rules', {
        method: editingRule ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      });
      messageApi.success('规则已保存');
      setDrawerOpen(false);
      await loadData();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '规则保存失败');
    }
  };

  const deleteRule = async (id: string) => {
    try {
      await apiRequest(`/api/state-machine/rules/${id}`, { method: 'DELETE' });
      messageApi.success('规则已删除');
      await loadData();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '规则删除失败');
    }
  };

  const processEvent = async (id: string) => {
    try {
      await apiRequest(`/api/state-machine/events/${id}/process`, { method: 'POST' });
      messageApi.success('事件已重新处理');
      await loadData();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '事件处理失败');
    }
  };

  const ruleColumns: ColumnsType<StateMachineRule> = [
    { title: '规则名称', dataIndex: 'ruleName', width: 220 },
    { title: '监听范围', dataIndex: 'scope', width: 140 },
    { title: '事件类型', dataIndex: 'eventType', width: 220 },
    {
      title: '动作',
      dataIndex: 'actionType',
      width: 140,
      render: (value) => <Tag color={value === 'feishu_card' ? 'blue' : 'default'}>{value}</Tag>,
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 90,
      render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? '启用' : '停用'}</Tag>,
    },
    {
      title: '条件',
      dataIndex: 'conditionJson',
      width: 260,
      render: (value) => <pre className="compact-json">{tryFormatJson(value)}</pre>,
    },
    {
      title: '操作',
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="确认删除这条状态机规则？" onConfirm={() => void deleteRule(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const eventColumns: ColumnsType<StateMachineEvent> = [
    { title: '事件类型', dataIndex: 'eventType', width: 220 },
    { title: '来源', dataIndex: 'source', width: 110 },
    { title: '范围', dataIndex: 'scope', width: 130 },
    { title: '关联ID', dataIndex: 'refId', width: 180, render: (value) => value || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value) => <Tag color={value === 'processed' ? 'green' : 'orange'}>{value}</Tag>,
    },
    {
      title: '事件时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (value) => (value ? formatBeijingTime(value) : '-'),
    },
    {
      title: '处理时间',
      dataIndex: 'processedAt',
      width: 170,
      render: (value) => (value ? formatBeijingTime(value) : '-'),
    },
    {
      title: '事件数据',
      dataIndex: 'payloadJson',
      width: 360,
      render: (value) => <pre className="compact-json">{tryFormatJson(value)}</pre>,
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button size="small" onClick={() => void processEvent(record.id)}>
          重新处理
        </Button>
      ),
    },
  ];

  const logColumns: ColumnsType<StateMachineLog> = [
    { title: '规则', dataIndex: 'ruleName', width: 220, render: (value) => value || '-' },
    { title: '动作', dataIndex: 'actionType', width: 140 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value) => <Tag color={value === 'success' ? 'green' : value === 'failed' ? 'red' : 'default'}>{value}</Tag>,
    },
    { title: '说明', dataIndex: 'message', width: 360, render: (value) => value || '-' },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (value) => (value ? formatBeijingTime(value) : '-'),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {contextHolder}
      <Card>
        <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginTop: 0 }}>状态机</h3>
            <p style={{ marginBottom: 0, color: '#667085' }}>
              用于监听任务、流程节点和外部消息事件，按规则执行日志、飞书提醒等动作。第一版先把规则、事件和执行记录跑通。
            </p>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => void loadData()} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增规则
            </Button>
          </Space>
        </Space>
      </Card>

      <Card>
        <Tabs
          items={[
            {
              key: 'rules',
              label: '规则配置',
              children: <Table rowKey="id" columns={ruleColumns} dataSource={rules} loading={loading} scroll={{ x: 1200 }} />,
            },
            {
              key: 'events',
              label: '事件列表',
              children: <Table rowKey="id" columns={eventColumns} dataSource={events} loading={loading} scroll={{ x: 1500 }} />,
            },
            {
              key: 'logs',
              label: '执行日志',
              children: <Table rowKey="id" columns={logColumns} dataSource={logs} loading={loading} scroll={{ x: 1000 }} />,
            },
          ]}
        />
      </Card>

      <Drawer title={editingRule ? '编辑状态机规则' : '新增状态机规则'} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={720}>
        <Form form={form} layout="vertical">
          <Form.Item name="ruleName" label="规则名称" rules={[{ required: true, message: '请填写规则名称' }]}>
            <Input />
          </Form.Item>
          <Space size={16} style={{ width: '100%' }} align="start">
            <Form.Item name="scope" label="监听范围" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={scopeOptions} />
            </Form.Item>
            <Form.Item name="eventType" label="事件类型" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={eventOptions} showSearch />
            </Form.Item>
          </Space>
          <Space size={16} style={{ width: '100%' }} align="start">
            <Form.Item name="actionType" label="执行动作" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={actionOptions} />
            </Form.Item>
            <Form.Item name="enabled" label="启用状态" valuePropName="checked" style={{ flex: 1 }}>
              <Switch checkedChildren="启用" unCheckedChildren="停用" />
            </Form.Item>
          </Space>
          <Form.Item name="conditionJson" label="条件 JSON">
            <TextArea rows={5} placeholder='例如：{"nodeName":"国际运输"}' />
          </Form.Item>
          <Form.Item name="actionConfigJson" label="动作配置 JSON">
            <TextArea rows={5} placeholder='例如：{"title":"运输任务待处理"}' />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} />
          </Form.Item>
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={() => void saveRule()}>
              保存
            </Button>
          </Space>
        </Form>
      </Drawer>
    </Space>
  );
}
