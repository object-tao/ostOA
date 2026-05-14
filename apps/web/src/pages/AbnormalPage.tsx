import { Button, Card, Drawer, Form, Input, Select, Space, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export function AbnormalPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [vehicleOrders, setVehicleOrders] = useState<any[]>([]);
  const [keyword, setKeyword] = useState(searchParams.get('project') ?? '');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);

  const load = () =>
    apiRequest<{ items: any[] }>(`/api/abnormal-events?page=1&pageSize=20&keyword=${keyword}&status=${status}`).then((res) =>
      setData(res.items),
    );

  useEffect(() => {
    void load();
  }, [keyword, status]);

  useEffect(() => {
    void Promise.all([
      apiRequest<{ items: any[] }>('/api/projects?page=1&pageSize=50'),
      apiRequest<{ items: any[] }>('/api/vehicle-orders?page=1&pageSize=50'),
    ]).then(([projectRes, orderRes]) => {
      setProjects(projectRes.items);
      setVehicleOrders(orderRes.items);
    });
  }, []);

  return (
    <>
      <PageHeader title="异常管理" subtitle="异常必须关联项目或车辆，形成可追踪的闭环处理记录。" />
      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flex: 1 }}>
            <Input.Search
              allowClear
              value={keyword}
              placeholder="搜索异常编号、项目名或异常描述"
              onChange={(event) => setKeyword(event.target.value)}
              onSearch={setKeyword}
            />
            <Select
              allowClear
              style={{ width: 180 }}
              placeholder="筛选状态"
              onChange={(value) => setStatus(value ?? '')}
              options={[
                { label: '待处理', value: 'OPEN' },
                { label: '处理中', value: 'PROCESSING' },
                { label: '已关闭', value: 'CLOSED' },
              ]}
            />
          </div>
          <Button type="primary" onClick={() => setOpen(true)}>
            新增异常
          </Button>
        </Space>
      </Card>
      <Card className="glass-card">
        <Table
          rowKey="id"
          dataSource={data}
          columns={[
            { title: '异常编号', dataIndex: 'abnormalNo' },
            { title: '类型', dataIndex: 'abnormalType' },
            { title: '等级', dataIndex: 'abnormalLevel' },
            { title: '状态', dataIndex: 'abnormalStatus', render: (value) => <Tag color="red">{value}</Tag> },
            { title: '描述', dataIndex: 'description' },
            { title: '位置', dataIndex: 'locationText' },
            {
              title: '操作',
              render: (_, row) => (
                <Button type="link" onClick={() => navigate('/vehicle-orders')}>
                  查看关联车辆
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <Drawer title="新增异常" width={520} open={open} onClose={() => setOpen(false)} destroyOnHidden>
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await apiRequest('/api/abnormal-events', {
                method: 'POST',
                body: JSON.stringify(values),
              });
              message.success('异常已创建');
              form.resetFields();
              setOpen(false);
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="projectId" label="关联项目">
            <Select allowClear options={projects.map((item) => ({ label: item.projectName, value: item.id }))} />
          </Form.Item>
          <Form.Item name="vehicleOrderId" label="关联车辆单">
            <Select allowClear options={vehicleOrders.map((item) => ({ label: item.vehicleOrderNo, value: item.id }))} />
          </Form.Item>
          <Form.Item name="abnormalType" label="异常类型" rules={[{ required: true, message: '请输入异常类型' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="abnormalLevel" label="异常等级" rules={[{ required: true, message: '请选择异常等级' }]}>
            <Select
              options={[
                { label: '低', value: 'LOW' },
                { label: '中', value: 'MEDIUM' },
                { label: '高', value: 'HIGH' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="异常描述" rules={[{ required: true, message: '请输入异常描述' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Drawer>
    </>
  );
}
