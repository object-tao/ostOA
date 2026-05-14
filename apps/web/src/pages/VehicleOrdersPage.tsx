import { Button, Card, Descriptions, Drawer, Form, Input, Modal, Select, Space, Table, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const vehicleStatusMap: Record<string, string> = {
  PENDING_DISPATCH: '待派车',
  DISPATCHED: '已派车',
  DEPARTED: '已发车',
  ARRIVED_PORT: '已到口岸',
  CUSTOMS_DECLARING: '报关中',
  EXITED_COUNTRY: '已出境',
  ENTERED_COUNTRY: '已入境',
  DELIVERING: '派送中',
  SIGNED: '已签收',
  ABNORMAL: '异常',
};

export function VehicleOrdersPage() {
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [keyword, setKeyword] = useState(searchParams.get('project') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [statusModal, setStatusModal] = useState<{ open: boolean; id?: string }>({ open: false });

  const load = () =>
    apiRequest<{ items: any[] }>(`/api/vehicle-orders?page=1&pageSize=30&keyword=${keyword}&status=${status}`).then((res) =>
      setData(res.items),
    );

  useEffect(() => {
    void load();
  }, [keyword, status]);

  useEffect(() => {
    void Promise.all([apiRequest<{ items: any[] }>('/api/projects?page=1&pageSize=50'), apiRequest<any[]>('/api/customers')]).then(
      ([projectRes, customerRes]) => {
        setProjects(projectRes.items);
        setCustomers(customerRes);
      },
    );
  }, []);

  const currentOrder = useMemo(() => data.find((item) => item.id === statusModal.id), [data, statusModal.id]);

  return (
    <>
      <PageHeader title="车辆运输单" subtitle="车辆是执行单元，状态流转全部沉淀在节点轨迹中。" />
      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flex: 1 }}>
            <Input.Search
              allowClear
              value={keyword}
              placeholder="搜索车辆单号、项目名或货物"
              onChange={(event) => setKeyword(event.target.value)}
              onSearch={setKeyword}
            />
            <Select
              allowClear
              value={status || undefined}
              style={{ width: 220 }}
              placeholder="筛选状态"
              onChange={(value) => setStatus(value ?? '')}
              options={[
                { label: '待派车', value: 'PENDING_DISPATCH' },
                { label: '已派车', value: 'DISPATCHED' },
                { label: '已发车', value: 'DEPARTED' },
                { label: '异常', value: 'ABNORMAL' },
              ]}
            />
          </div>
          <Button type="primary" onClick={() => setOpen(true)}>
            新建车辆单
          </Button>
        </Space>
      </Card>
      <Card className="glass-card">
        <Table
          rowKey="id"
          dataSource={data}
          columns={[
            { title: '车辆单号', dataIndex: 'vehicleOrderNo' },
            { title: '项目', render: (_, row) => row.project?.projectName ?? '-' },
            { title: '货物', dataIndex: 'cargoName' },
            { title: '状态', dataIndex: 'currentStatus', render: (value) => <Tag color="blue">{vehicleStatusMap[value] ?? value}</Tag> },
            { title: '当前节点', dataIndex: 'currentNodeCode' },
            { title: '车辆', render: (_, row) => row.vehicle?.vehicleNo ?? '-' },
            { title: '司机', render: (_, row) => row.driver?.driverName ?? '-' },
            {
              title: '操作',
              render: (_, row) => (
                <Space>
                  <Button type="link" onClick={() => setDetail(row)}>
                    详情
                  </Button>
                  <Button
                    type="link"
                    onClick={() => {
                      statusForm.setFieldsValue({
                        status: row.currentStatus,
                        nodeCode: row.currentNodeCode,
                        nodeName: row.currentNodeCode,
                      });
                      setStatusModal({ open: true, id: row.id });
                    }}
                  >
                    更新状态
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <Drawer title="新建车辆运输单" width={520} open={open} onClose={() => setOpen(false)} destroyOnHidden>
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await apiRequest('/api/vehicle-orders', {
                method: 'POST',
                body: JSON.stringify(values),
              });
              message.success('车辆运输单已创建');
              form.resetFields();
              setOpen(false);
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="projectId" label="所属项目" rules={[{ required: true, message: '请选择项目' }]}>
            <Select options={projects.map((item) => ({ label: item.projectName, value: item.id }))} />
          </Form.Item>
          <Form.Item name="customerId" label="客户" rules={[{ required: true, message: '请选择客户' }]}>
            <Select options={customers.map((item) => ({ label: item.customerName, value: item.id }))} />
          </Form.Item>
          <Form.Item name="cargoName" label="货物名称" rules={[{ required: true, message: '请输入货物名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="loadAddress" label="装货地" rules={[{ required: true, message: '请输入装货地' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="unloadAddress" label="卸货地" rules={[{ required: true, message: '请输入卸货地' }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Drawer>
      <Drawer title="车辆单详情" width={720} open={Boolean(detail)} onClose={() => setDetail(null)} destroyOnHidden>
        {detail ? (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="车辆单号">{detail.vehicleOrderNo}</Descriptions.Item>
              <Descriptions.Item label="项目">{detail.project?.projectName ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="货物">{detail.cargoName}</Descriptions.Item>
              <Descriptions.Item label="状态">{vehicleStatusMap[detail.currentStatus] ?? detail.currentStatus}</Descriptions.Item>
              <Descriptions.Item label="当前节点">{detail.currentNodeCode}</Descriptions.Item>
              <Descriptions.Item label="装货地">{detail.loadAddress}</Descriptions.Item>
              <Descriptions.Item label="卸货地">{detail.unloadAddress}</Descriptions.Item>
              <Descriptions.Item label="车辆">{detail.vehicle?.vehicleNo ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="司机">{detail.driver?.driverName ?? '-'}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <Button onClick={() => navigate(`/projects/${detail.projectId}`)}>查看所属项目</Button>
              <Button onClick={() => navigate(`/dispatch?vehicleOrder=${encodeURIComponent(detail.vehicleOrderNo)}`)}>前往调度中心</Button>
              <Button onClick={() => navigate(`/in-transit?vehicleOrder=${encodeURIComponent(detail.vehicleOrderNo)}`)}>前往在途管理</Button>
              <Button onClick={() => navigate(`/abnormal-events?project=${encodeURIComponent(detail.project?.projectName ?? '')}`)}>查看异常</Button>
            </div>
          </>
        ) : null}
      </Drawer>
      <Modal
        title={`更新车辆状态${currentOrder ? ` · ${currentOrder.vehicleOrderNo}` : ''}`}
        open={statusModal.open}
        onCancel={() => setStatusModal({ open: false })}
        onOk={() => statusForm.submit()}
        destroyOnHidden
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await apiRequest(`/api/vehicle-orders/${statusModal.id}/update-status`, {
                method: 'POST',
                body: JSON.stringify(values),
              });
              message.success('状态已更新');
              setStatusModal({ open: false });
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select
              options={[
                { label: '已到厂', value: 'ARRIVED_FACTORY' },
                { label: '装货中', value: 'LOADING' },
                { label: '已发车', value: 'DEPARTED' },
                { label: '已到口岸', value: 'ARRIVED_PORT' },
                { label: '报关中', value: 'CUSTOMS_DECLARING' },
                { label: '已出境', value: 'EXITED_COUNTRY' },
                { label: '已入境', value: 'ENTERED_COUNTRY' },
                { label: '派送中', value: 'DELIVERING' },
                { label: '已签收', value: 'SIGNED' },
                { label: '异常', value: 'ABNORMAL' },
              ]}
            />
          </Form.Item>
          <Form.Item name="nodeCode" label="节点编码" rules={[{ required: true, message: '请输入节点编码' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nodeName" label="节点名称" rules={[{ required: true, message: '请输入节点名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="locationText" label="位置">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
