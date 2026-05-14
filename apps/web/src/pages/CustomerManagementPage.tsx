import { Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Space, Statistic, Table, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

type Customer = {
  id: string;
  name: string;
  shortName?: string;
  phone: string;
  contactPerson?: string;
  address?: string;
  remark?: string;
  createdAt?: string;
};

export function CustomerManagementPage() {
  const [form] = Form.useForm<Customer>();
  const [data, setData] = useState<Customer[]>([]);
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const result = await apiRequest<Customer[]>('/api/customers');
    setData(result);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) {
      return data;
    }

    return data.filter((item) =>
      [item.name, item.shortName, item.phone, item.contactPerson, item.address, item.remark]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [data, keyword]);

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditing(customer);
    form.setFieldsValue(customer);
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editing) {
        await apiRequest(`/api/customers/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
        message.success('客户信息已更新');
      } else {
        await apiRequest('/api/customers', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        message.success('客户已新增');
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
      await load();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    try {
      await apiRequest(`/api/customers/${customer.id}`, { method: 'DELETE' });
      message.success('客户已删除');
      await load();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  return (
    <>
      <PageHeader title="客户管理" subtitle="维护客户名称、客户电话、联系人和地址等基本信息，支持新增、修改、删除。" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card className="glass-card">
            <Statistic title="客户总数" value={data.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="glass-card">
            <Statistic title="当前筛选结果" value={filtered.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="glass-card">
            <Statistic title="已录入联系电话" value={data.filter((item) => item.phone).length} />
          </Card>
        </Col>
      </Row>

      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input
            allowClear
            placeholder="搜索客户名称、电话、联系人、地址"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ width: 360 }}
          />
          <Button type="primary" onClick={openCreateModal}>
            新增客户
          </Button>
        </Space>
      </Card>

      <Card className="glass-card">
        <Table
          rowKey="id"
          dataSource={filtered}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          columns={[
            { title: '客户名称', dataIndex: 'name', width: 220 },
            { title: '客户简称', dataIndex: 'shortName', width: 160, render: (value) => value || '-' },
            { title: '客户电话', dataIndex: 'phone', width: 160 },
            { title: '联系人', dataIndex: 'contactPerson', width: 140, render: (value) => value || '-' },
            { title: '地址', dataIndex: 'address', render: (value) => value || '-' },
            { title: '备注', dataIndex: 'remark', render: (value) => value || '-' },
            { title: '创建时间', dataIndex: 'createdAt', width: 180, render: (value) => value || '-' },
            {
              title: '操作',
              key: 'actions',
              width: 160,
              fixed: 'right',
              render: (_, record) => (
                <Space>
                  <Button type="link" onClick={() => openEditModal(record)}>
                    修改
                  </Button>
                  <Popconfirm title="确定删除这个客户吗？" onConfirm={() => void handleDelete(record)}>
                    <Button type="link" danger>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        destroyOnHidden
        open={open}
        title={editing ? '修改客户' : '新增客户'}
        confirmLoading={submitting}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={() => void handleSubmit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="客户名称" name="name" rules={[{ required: true, message: '请输入客户名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="客户简称" name="shortName">
            <Input />
          </Form.Item>
          <Form.Item label="客户电话" name="phone" rules={[{ required: true, message: '请输入客户电话' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="联系人" name="contactPerson">
            <Input />
          </Form.Item>
          <Form.Item label="地址" name="address">
            <Input />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
