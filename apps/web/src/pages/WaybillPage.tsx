import { Button, Card, Descriptions, Divider, Drawer, Form, Input, Select, Space, Table, Tag, Timeline, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const statusMap: Record<string, { text: string; color: string }> = {
  CREATED: { text: '已创建', color: 'default' },
  DECLARING: { text: '报关中', color: 'blue' },
  CUSTOMS_CLEARING: { text: '清关中', color: 'gold' },
  IN_TRANSIT: { text: '运输中', color: 'cyan' },
  ARRIVED: { text: '已到达', color: 'green' },
};

export function WaybillPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);

  const load = async () => {
    const res = await apiRequest<{ items: any[] }>('/api/waybills?page=1&pageSize=20');
    setData(res.items);
  };

  useEffect(() => {
    void load();
    void apiRequest<any[]>('/api/customers').then(setCustomers).catch(() => setCustomers([]));
  }, []);

  return (
    <>
      <PageHeader title="运单管理" subtitle="集中管理跨境主运单、口岸信息、报关进度和运输备注。" />
      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          新建运单
        </Button>
      </Card>
      <Card className="glass-card">
        <Table
          rowKey="id"
          dataSource={data}
          scroll={{ x: 1180 }}
          columns={[
            { title: '运单号', dataIndex: 'waybillNo', width: 180 },
            { title: '客户', render: (_, row) => row.customer?.customerName ?? '-', width: 140 },
            { title: '货物名称', dataIndex: 'cargoName', width: 160 },
            { title: '线路', render: (_, row) => `${row.originPlace} -> ${row.destinationPlace}`, width: 220 },
            { title: '口岸', dataIndex: 'portName', width: 140 },
            { title: '报关单号', dataIndex: 'declarationNo', width: 180 },
            { title: 'CMR 状态', dataIndex: 'cmrStatus', width: 140 },
            {
              title: '状态',
              width: 120,
              render: (_, row) => {
                const status = statusMap[row.status] ?? statusMap.CREATED;
                return <Tag color={status.color}>{status.text}</Tag>;
              },
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
      <Drawer title="新建运单" width={640} open={open} onClose={() => setOpen(false)} destroyOnHidden>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'CREATED', cmrStatus: '待签收' }}
          onFinish={async (values) => {
            try {
              await apiRequest('/api/waybills', { method: 'POST', body: JSON.stringify(values) });
              message.success('运单已创建');
              setOpen(false);
              form.resetFields();
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="customerId" label="客户" rules={[{ required: true, message: '请选择客户' }]}>
            <Select options={customers.map((item) => ({ label: item.customerName, value: item.id }))} />
          </Form.Item>
          <Form.Item name="cargoName" label="货物名称" rules={[{ required: true, message: '请输入货物名称' }]}>
            <Input />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="originPlace" label="起运地" rules={[{ required: true, message: '请输入起运地' }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item
              name="destinationPlace"
              label="目的地"
              rules={[{ required: true, message: '请输入目的地' }]}
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="portName" label="口岸" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="declarationNo" label="报关单号" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Drawer>
      <Drawer title="运单详情" width={760} open={Boolean(detail)} onClose={() => setDetail(null)} destroyOnHidden>
        {detail ? (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="运单号">{detail.waybillNo}</Descriptions.Item>
              <Descriptions.Item label="客户">{detail.customer?.customerName ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="货物名称">{detail.cargoName}</Descriptions.Item>
              <Descriptions.Item label="起运地">{detail.originPlace}</Descriptions.Item>
              <Descriptions.Item label="目的地">{detail.destinationPlace}</Descriptions.Item>
              <Descriptions.Item label="口岸">{detail.portName || '-'}</Descriptions.Item>
              <Descriptions.Item label="报关单号">{detail.declarationNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="CMR 状态">{detail.cmrStatus || '-'}</Descriptions.Item>
              <Descriptions.Item label="当前状态">{statusMap[detail.status]?.text ?? detail.status}</Descriptions.Item>
              <Descriptions.Item label="备注">{detail.remark || '-'}</Descriptions.Item>
            </Descriptions>
            <Divider>随附资料</Divider>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="运单附件">
                {(detail.attachments ?? []).length > 0 ? (detail.attachments ?? []).join('、') : '暂无'}
              </Descriptions.Item>
              <Descriptions.Item label="报关附件">
                {(detail.customsAttachments ?? []).length > 0 ? (detail.customsAttachments ?? []).join('、') : '暂无'}
              </Descriptions.Item>
            </Descriptions>
            <Divider>节点轨迹</Divider>
            <Timeline
              items={(detail.trackingNodes ?? []).map((node: any) => ({
                color: 'blue',
                children: `${node.nodeTime} · ${node.nodeName}${node.locationText ? ` · ${node.locationText}` : ''}`,
              }))}
            />
            <Divider>业务联动</Divider>
            <Space>
              <Button onClick={() => navigate(`/tasks?waybill=${encodeURIComponent(detail.waybillNo)}`)}>查看关联任务</Button>
              <Button onClick={() => navigate(`/customs?waybill=${encodeURIComponent(detail.waybillNo)}`)}>查看关务记录</Button>
            </Space>
          </>
        ) : null}
      </Drawer>
    </>
  );
}
