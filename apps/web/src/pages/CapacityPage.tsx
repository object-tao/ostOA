import { Button, Card, Drawer, Form, Input, Select, Space, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export function CapacityPage() {
  const [form] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const res = await apiRequest<any[]>('/api/capacities');
    setData(res);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <>
      <PageHeader title="运力资源" subtitle="管理承运商、外包车队、车辆、司机和挂靠关系。" />
      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          新增运力资源
        </Button>
      </Card>
      <Card className="glass-card">
        <Table
          rowKey="id"
          dataSource={data}
          scroll={{ x: 1000 }}
          columns={[
            { title: '资源编号', dataIndex: 'resourceNo', width: 180 },
            { title: '承运商/车队', dataIndex: 'resourceName', width: 180 },
            { title: '资源类型', dataIndex: 'resourceType', width: 130 },
            { title: '车辆', dataIndex: 'vehicleNo', width: 140 },
            { title: '司机', dataIndex: 'driverName', width: 120 },
            { title: '联系方式', dataIndex: 'driverPhone', width: 150 },
            { title: '状态', render: (_, row) => <Tag color="green">{row.status}</Tag>, width: 120 },
            { title: '备注', dataIndex: 'remark', width: 200 }
          ]}
        />
      </Card>
      <Drawer title="新增运力资源" width={640} open={open} onClose={() => setOpen(false)} destroyOnHidden>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'ACTIVE' }}
          onFinish={async (values) => {
            try {
              await apiRequest('/api/capacities', { method: 'POST', body: JSON.stringify(values) });
              message.success('运力资源已创建');
              setOpen(false);
              form.resetFields();
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="resourceName" label="承运商/车队" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="resourceType" label="资源类型" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select
                options={[
                  { label: '自有车队', value: '自有车队' },
                  { label: '外包车队', value: '外包车队' },
                  { label: '承运商', value: '承运商' }
                ]}
              />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="vehicleNo" label="车辆" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="driverName" label="司机" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="driverPhone" label="司机电话" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="status" label="状态" style={{ flex: 1 }}>
              <Select
                options={[
                  { label: '启用中', value: 'ACTIVE' },
                  { label: '停用', value: 'INACTIVE' }
                ]}
              />
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
    </>
  );
}
