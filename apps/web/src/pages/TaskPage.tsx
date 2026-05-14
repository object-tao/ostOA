import { Button, Card, Descriptions, Divider, Drawer, Form, Input, Select, Space, Table, Tag, Timeline, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const taskStatusMap: Record<string, string> = {
  PENDING: '待执行',
  ASSIGNED: '已分配',
  RUNNING: '执行中',
  FINISHED: '已完成',
};

export function TaskPage() {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [waybills, setWaybills] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [keyword, setKeyword] = useState(searchParams.get('waybill') ?? '');

  const load = async () => {
    const res = await apiRequest<{ items: any[] }>('/api/tasks?page=1&pageSize=20');
    setData(res.items);
  };

  useEffect(() => {
    void load();
    void apiRequest<{ items: any[] }>('/api/waybills?page=1&pageSize=20')
      .then((res) => setWaybills(res.items))
      .catch(() => setWaybills([]));
  }, []);

  const filtered = useMemo(
    () =>
      data.filter(
        (item) =>
          !keyword ||
          item.taskNo?.includes(keyword) ||
          item.waybill?.waybillNo?.includes(keyword) ||
          item.taskType?.includes(keyword),
      ),
    [data, keyword],
  );

  return (
    <>
      <PageHeader title="任务管理" subtitle="管理拆单任务、司机执行、路线安排和配件说明。" />
      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Input.Search
            allowClear
            value={keyword}
            placeholder="搜索任务号、运单号或任务类型"
            onChange={(event) => setKeyword(event.target.value)}
            onSearch={setKeyword}
          />
          <Button type="primary" onClick={() => setOpen(true)}>
            新建任务
          </Button>
        </Space>
      </Card>
      <Card className="glass-card">
        <Table
          rowKey="id"
          dataSource={filtered}
          scroll={{ x: 1120 }}
          columns={[
            { title: '任务号', dataIndex: 'taskNo', width: 180 },
            { title: '关联运单', render: (_, row) => row.waybill?.waybillNo ?? '-', width: 180 },
            { title: '任务类型', dataIndex: 'taskType', width: 140 },
            { title: '运力资源', dataIndex: 'resourceName', width: 150 },
            { title: '司机', dataIndex: 'driverName', width: 120 },
            { title: '路线', dataIndex: 'routeText', width: 220 },
            { title: '配件清单', dataIndex: 'accessoriesSummary', width: 180 },
            {
              title: '状态',
              width: 120,
              render: (_, row) => <Tag color="blue">{taskStatusMap[row.status] ?? row.status}</Tag>,
            },
            {
              title: '操作',
              width: 120,
              render: (_, row) => (
                <Button type="link" onClick={() => setDetail(row)}>
                  查看详情
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <Drawer title="新建任务" width={640} open={open} onClose={() => setOpen(false)} destroyOnHidden>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'PENDING' }}
          onFinish={async (values) => {
            try {
              await apiRequest('/api/tasks', { method: 'POST', body: JSON.stringify(values) });
              message.success('任务已创建');
              setOpen(false);
              form.resetFields();
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="waybillId" label="关联运单" rules={[{ required: true, message: '请选择关联运单' }]}>
            <Select options={waybills.map((item) => ({ label: item.waybillNo, value: item.id }))} />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="taskType" label="任务类型" rules={[{ required: true, message: '请选择任务类型' }]} style={{ flex: 1 }}>
              <Select
                options={[
                  { label: '提货任务', value: '提货任务' },
                  { label: '口岸转运', value: '口岸转运' },
                  { label: '末端配送', value: '末端配送' },
                ]}
              />
            </Form.Item>
            <Form.Item name="resourceName" label="运力资源" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="driverName" label="司机" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="routeText" label="路线" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="accessoriesSummary" label="配件清单">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Drawer>
      <Drawer title="任务详情" width={760} open={Boolean(detail)} onClose={() => setDetail(null)} destroyOnHidden>
        {detail ? (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="任务号">{detail.taskNo}</Descriptions.Item>
              <Descriptions.Item label="关联运单">{detail.waybill?.waybillNo ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="任务类型">{detail.taskType}</Descriptions.Item>
              <Descriptions.Item label="运力资源">{detail.resourceName || '-'}</Descriptions.Item>
              <Descriptions.Item label="司机">{detail.driverName || '-'}</Descriptions.Item>
              <Descriptions.Item label="路线">{detail.routeText || '-'}</Descriptions.Item>
              <Descriptions.Item label="配件清单">{detail.accessoriesSummary || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">{taskStatusMap[detail.status] ?? detail.status}</Descriptions.Item>
              <Descriptions.Item label="备注">{detail.remark || '-'}</Descriptions.Item>
            </Descriptions>
            <Divider>执行记录</Divider>
            <Timeline
              items={(detail.history ?? []).map((item: any) => ({
                color: item.status === '已完成' ? 'green' : item.status === '执行中' ? 'blue' : 'gold',
                children: `${item.time} · ${item.status}${item.operator ? ` · ${item.operator}` : ''}${item.remark ? ` · ${item.remark}` : ''}`,
              }))}
            />
          </>
        ) : null}
      </Drawer>
    </>
  );
}
