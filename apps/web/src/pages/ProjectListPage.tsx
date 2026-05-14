import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Drawer, Form, Input, InputNumber, Select, Space, Table, Tag, Upload, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

type StoredAttachment = {
  name: string;
  dataUrl?: string;
  type?: string;
};

type ProjectItem = {
  id: string;
  projectNo: string;
  projectName: string;
  projectStatus: string;
  originPlace: string;
  destinationPlace: string;
  plannedVehicleCount: number;
  completedVehicleCount: number;
  customerBookingAttachments?: StoredAttachment[];
  customer: { customerName: string; shortName?: string; name?: string };
};

const projectStatusMap: Record<string, string> = {
  DRAFT: '草稿',
  IN_PROGRESS: '执行中',
  COMPLETED: '已完成',
  CLOSED: '已关闭',
};

export function ProjectListPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [data, setData] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ keyword: '', status: '' });
  const [customers, setCustomers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const result = await apiRequest<{ items: ProjectItem[] }>(
      `/api/projects?page=1&pageSize=20&keyword=${filters.keyword}&status=${filters.status}`,
    );
    setData(result.items);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [filters.keyword, filters.status]);

  useEffect(() => {
    void apiRequest<any[]>('/api/customers').then(setCustomers).catch(() => setCustomers([]));
  }, []);

  const normalizeFiles = (value: any): UploadFile[] => {
    if (Array.isArray(value)) {
      return value;
    }
    return value?.fileList ?? [];
  };

  const serializeFiles = async (files: UploadFile[] = []): Promise<StoredAttachment[]> =>
    Promise.all(
      files.map(async (file) => {
        const origin = file.originFileObj;
        if (!origin) {
          return { name: file.name };
        }

        return await new Promise<StoredAttachment>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              name: file.name,
              dataUrl: typeof reader.result === 'string' ? reader.result : '',
              type: origin.type,
            });
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(origin);
        });
      }),
    );

  const columns: ColumnsType<ProjectItem> = [
    { title: '项目编号', dataIndex: 'projectNo' },
    { title: '项目名称', dataIndex: 'projectName' },
    { title: '客户', render: (_, row) => row.customer.shortName || row.customer.name || row.customer.customerName },
    { title: '线路', render: (_, row) => `${row.originPlace} -> ${row.destinationPlace}` },
    { title: '状态', dataIndex: 'projectStatus', render: (value) => <Tag color="green">{projectStatusMap[value] ?? value}</Tag> },
    { title: '计划车数', dataIndex: 'plannedVehicleCount' },
    { title: '完成车数', dataIndex: 'completedVehicleCount' },
    {
      title: '客户booking',
      render: (_, row) => <Tag>{row.customerBookingAttachments?.length ?? 0} 个</Tag>,
    },
    {
      title: '操作',
      render: (_, row) => (
        <Button type="link" onClick={() => navigate(`/projects/${row.id}`)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="项目管理" subtitle="以项目为经营主视角，统一查看批次、车辆、异常和利润。" />
      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Form layout="inline">
            <Form.Item label="关键字">
              <Input.Search allowClear onSearch={(keyword) => setFilters((prev) => ({ ...prev, keyword }))} />
            </Form.Item>
            <Form.Item label="状态">
              <Select
                allowClear
                style={{ width: 180 }}
                options={[
                  { label: '执行中', value: 'IN_PROGRESS' },
                  { label: '已完成', value: 'COMPLETED' },
                  { label: '已关闭', value: 'CLOSED' },
                ]}
                onChange={(status) => setFilters((prev) => ({ ...prev, status: status ?? '' }))}
              />
            </Form.Item>
          </Form>
          <Button type="primary" onClick={() => setOpen(true)}>
            新建项目
          </Button>
        </Space>
      </Card>
      <Card className="glass-card">
        <Table rowKey="id" loading={loading} columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
      </Card>
      <Drawer title="新建项目" width={520} open={open} onClose={() => setOpen(false)} destroyOnHidden>
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const customerBookingAttachments = await serializeFiles(values.customerBookingAttachments);
              await apiRequest('/api/projects', {
                method: 'POST',
                body: JSON.stringify({
                  ...values,
                  customerBookingAttachments,
                }),
              });
              message.success('项目已创建');
              form.resetFields();
              setOpen(false);
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="projectName" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="customerId" label="客户" rules={[{ required: true, message: '请选择客户' }]}>
            <Select options={customers.map((item) => ({ label: item.shortName || item.name || item.customerName, value: item.id }))} />
          </Form.Item>
          <Form.Item name="originPlace" label="起运地" rules={[{ required: true, message: '请输入起运地' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="destinationPlace" label="目的地" rules={[{ required: true, message: '请输入目的地' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contractAmount" label="合同金额">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="plannedVehicleCount" label="计划车数">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="customerBookingAttachments" label="客户booking" valuePropName="fileList" getValueFromEvent={normalizeFiles}>
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Drawer>
    </>
  );
}
