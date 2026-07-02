import { useMemo, useState } from 'react';
import { Button, Card, Descriptions, Empty, Form, Input, Space, Table, Tag, Timeline, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PaperClipOutlined, SearchOutlined } from '@ant-design/icons';
import { apiRequest } from '../api/client';
import { beijingTimeValue, formatBeijingTime } from '../utils/date';

const { Text } = Typography;

type ProjectFile = {
  key?: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  fileUrl: string;
  customerVisible?: boolean;
  visibilityLevel?: string;
};

type TrackingRecord = {
  id: string;
  nodeName: string;
  trackedAt: string;
  location?: string | null;
  trackingStatus?: string | null;
  content: string;
  operator?: string | null;
  customerVisible?: boolean;
  visibilityLevel?: string | null;
  files?: ProjectFile[];
  remark?: string | null;
};

type TrackingTask = {
  taskId: string;
  taskNo: string;
  status: string;
  progress: number;
  projectNo: string;
  projectName: string;
  origin?: string | null;
  destination?: string | null;
  customerName?: string | null;
  workflowStatus?: string | null;
  workflowCurrentNodeName?: string | null;
  workflowCurrentNodeStatus?: string | null;
  trackingRecords: TrackingRecord[];
};

function fileUrl(value: string) {
  if (value.startsWith('http')) return value;
  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://api.ostoa.org';
  const isLocalBrowser =
    typeof window !== 'undefined' &&
    (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.'));
  return isLocalBrowser ? value : `${configuredApiBaseUrl}${value}`;
}

function dateText(value?: string | null) {
  return formatBeijingTime(value);
}

function trackingTimeValue(value?: string | null) {
  return beijingTimeValue(value);
}

function sortTrackingRecords(records?: TrackingRecord[]) {
  return [...(records ?? [])].sort((a, b) => trackingTimeValue(b.trackedAt) - trackingTimeValue(a.trackedAt));
}

function routeDurationText(task: TrackingTask) {
  const origin = task.origin || '-';
  const destination = task.destination || '-';
  const records = sortTrackingRecords(task.trackingRecords);
  if (records.length < 2) {
    return `${origin} → ${destination} (0 天 / 0 小时)`;
  }
  const latest = trackingTimeValue(records[0]?.trackedAt);
  const first = trackingTimeValue(records[records.length - 1]?.trackedAt);
  const diffMs = latest > first ? latest - first : 0;
  const diffDays = diffMs > 0 ? Math.ceil(diffMs / (24 * 60 * 60 * 1000)) : 0;
  const diffHours = diffMs > 0 ? Math.ceil(diffMs / (60 * 60 * 1000)) : 0;
  return `${origin} → ${destination} (${diffDays} 天 / ${diffHours} 小时)`;
}

export function TrackingPage() {
  const [form] = Form.useForm<{ taskNo: string }>();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<TrackingTask[]>([]);
  const [searched, setSearched] = useState(false);

  const totalRecords = useMemo(() => items.reduce((sum, item) => sum + (item.trackingRecords?.length ?? 0), 0), [items]);

  const search = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const result = await apiRequest<{ items: TrackingTask[] }>(`/api/task-tracking?taskNo=${encodeURIComponent(values.taskNo.trim())}`);
      setItems((result.items ?? []).map((item) => ({ ...item, trackingRecords: sortTrackingRecords(item.trackingRecords) })));
      setSearched(true);
      if (!(result.items ?? []).length) {
        message.info('没有找到匹配的运输任务。');
      }
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<TrackingRecord> = [
    { title: '时间', dataIndex: 'trackedAt', width: 150, render: dateText },
    { title: '节点', dataIndex: 'nodeName', width: 120, render: (value) => <Tag color="blue">{value}</Tag> },
    { title: '状态', dataIndex: 'trackingStatus', width: 120, render: (value) => value || '-' },
    { title: '地点', dataIndex: 'location', width: 160, render: (value) => value || '-' },
    { title: '跟踪内容', dataIndex: 'content', width: 320 },
    { title: '操作人', dataIndex: 'operator', width: 110, render: (value) => value || '-' },
    {
      title: '附件',
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
    { title: '可见级别', dataIndex: 'visibilityLevel', width: 130, render: (value) => value || '-' },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card className="glass-card" title="轨迹跟踪" bordered={false}>
        <Form form={form} layout="inline" onFinish={search}>
          <Form.Item name="taskNo" rules={[{ required: true, message: '请输入任务号' }]} style={{ minWidth: 360 }}>
            <Input allowClear placeholder="输入任务号，也可输入客户名称/项目名称辅助查询" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
            查询
          </Button>
          {searched ? <Text type="secondary">匹配任务 {items.length} 个，跟踪记录 {totalRecords} 条</Text> : null}
        </Form>
      </Card>

      {items.map((task) => (
        <Card
          key={task.taskId}
          className="glass-card"
          bordered={false}
          title={
            <Space>
              <Text strong>{task.taskNo}</Text>
              <Tag color={task.status === '已完成' ? 'success' : 'processing'}>{task.status}</Tag>
              {task.workflowCurrentNodeName ? <Tag color="blue">{task.workflowCurrentNodeName}</Tag> : null}
            </Space>
          }
        >
          <Descriptions column={{ xs: 1, md: 2 }} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="客户名称">{task.customerName || '-'}</Descriptions.Item>
            <Descriptions.Item label="项目名称">{task.projectName}</Descriptions.Item>
            <Descriptions.Item label="项目编号">{task.projectNo}</Descriptions.Item>
            <Descriptions.Item label="运输线路">{routeDurationText(task)}</Descriptions.Item>
          </Descriptions>

          {task.trackingRecords?.length ? (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Timeline
                items={sortTrackingRecords(task.trackingRecords).slice(0, 8).map((record) => ({
                  color: record.customerVisible ? 'blue' : 'gray',
                  children: (
                    <Space direction="vertical" size={2}>
                      <Space wrap>
                        <Text strong>{record.nodeName}</Text>
                        <Text type="secondary">{dateText(record.trackedAt)}</Text>
                        {record.trackingStatus ? <Tag>{record.trackingStatus}</Tag> : null}
                        {record.location ? <Tag color="geekblue">{record.location}</Tag> : null}
                      </Space>
                      <Text>{record.content}</Text>
                      {record.operator ? <Text type="secondary">操作人：{record.operator}</Text> : null}
                    </Space>
                  ),
                }))}
              />
              <Table rowKey="id" size="small" dataSource={sortTrackingRecords(task.trackingRecords)} columns={columns} scroll={{ x: 1250 }} pagination={false} />
            </Space>
          ) : (
            <Empty description="该任务暂无节点跟踪记录" />
          )}
        </Card>
      ))}

      {searched && !items.length ? <Empty description="没有找到匹配任务" /> : null}
    </Space>
  );
}
