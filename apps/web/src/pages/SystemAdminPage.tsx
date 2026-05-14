import { Button, Card, Col, Drawer, Form, Input, List, Row, Select, Table, Tabs, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export function SystemAdminPage() {
  const [roleForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [portForm] = Form.useForm();
  const [overview, setOverview] = useState<any | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [drawer, setDrawer] = useState<'role' | 'user' | 'port' | null>(null);

  const load = async () => {
    const [overviewRes, rolesRes, usersRes, portsRes, logsRes] = await Promise.all([
      apiRequest('/api/system-admin/overview'),
      apiRequest<any[]>('/api/roles'),
      apiRequest<any[]>('/api/users'),
      apiRequest<any[]>('/api/ports'),
      apiRequest<any[]>('/api/operation-logs'),
    ]);

    setOverview(overviewRes);
    setRoles(rolesRes);
    setUsers(usersRes);
    setPorts(portsRes);
    setLogs(logsRes);
  };

  useEffect(() => {
    void load().catch(() => {
      setOverview(null);
      setRoles([]);
      setUsers([]);
      setPorts([]);
      setLogs([]);
    });
  }, []);

  return (
    <>
      <PageHeader title="系统管理" subtitle="覆盖角色权限、基础字典、口岸资料和操作日志要求。" />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="glass-card" title="角色权限概览">
            <List
              dataSource={overview?.roles ?? []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta title={item.roleName} description={item.scope} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="glass-card" title="基础字典概览">
            <List
              dataSource={overview?.dictionaries ?? []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta title={item.name} description={item.description} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="glass-card" title="口岸概览">
            <List
              dataSource={overview?.ports ?? []}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta title={item.portName} description={item.country} />
                  <Tag color="blue">{item.mode}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card className="glass-card" style={{ marginTop: 16 }}>
        <Tabs
          items={[
            {
              key: 'roles',
              label: '角色',
              children: (
                <>
                  <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setDrawer('role')}>
                    新增角色
                  </Button>
                  <Table
                    rowKey="id"
                    dataSource={roles}
                    pagination={false}
                    columns={[
                      { title: '角色编码', dataIndex: 'roleCode' },
                      { title: '角色名称', dataIndex: 'roleName' },
                      { title: '状态', dataIndex: 'roleStatus', render: (value) => <Tag color="green">{value}</Tag> },
                      { title: '备注', dataIndex: 'remark' },
                    ]}
                  />
                </>
              ),
            },
            {
              key: 'users',
              label: '用户',
              children: (
                <>
                  <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setDrawer('user')}>
                    新增用户
                  </Button>
                  <Table
                    rowKey="id"
                    dataSource={users}
                    pagination={false}
                    columns={[
                      { title: '用户名', dataIndex: 'username' },
                      { title: '姓名', dataIndex: 'realName' },
                      { title: '角色', render: (_, row) => row.role?.roleName ?? '-' },
                      { title: '手机号', dataIndex: 'mobile' },
                      { title: '邮箱', dataIndex: 'email' },
                    ]}
                  />
                </>
              ),
            },
            {
              key: 'ports',
              label: '口岸',
              children: (
                <>
                  <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setDrawer('port')}>
                    新增口岸
                  </Button>
                  <Table
                    rowKey="id"
                    dataSource={ports}
                    pagination={false}
                    columns={[
                      { title: '口岸编码', dataIndex: 'portCode' },
                      { title: '口岸名称', dataIndex: 'portName' },
                      { title: '国家/区域', dataIndex: 'country' },
                      { title: '通行方式', dataIndex: 'mode', render: (value) => <Tag color="blue">{value}</Tag> },
                      { title: '状态', dataIndex: 'status' },
                    ]}
                  />
                </>
              ),
            },
            {
              key: 'logs',
              label: '日志',
              children: (
                <Table
                  rowKey="id"
                  dataSource={logs}
                  pagination={false}
                  columns={[
                    { title: '模块', dataIndex: 'moduleName' },
                    { title: '动作', dataIndex: 'actionType' },
                    { title: '业务编号', dataIndex: 'businessId' },
                    { title: '操作人', dataIndex: 'operatorName' },
                    { title: '时间', dataIndex: 'actionTime' },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>

      <Drawer title="新增角色" width={520} open={drawer === 'role'} onClose={() => setDrawer(null)} destroyOnHidden>
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await apiRequest('/api/roles', { method: 'POST', body: JSON.stringify(values) });
              message.success('角色已创建');
              setDrawer(null);
              roleForm.resetFields();
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="roleCode" label="角色编码">
            <Input />
          </Form.Item>
          <Form.Item name="roleName" label="角色名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Drawer>

      <Drawer title="新增用户" width={520} open={drawer === 'user'} onClose={() => setDrawer(null)} destroyOnHidden>
        <Form
          form={userForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await apiRequest('/api/users', { method: 'POST', body: JSON.stringify(values) });
              message.success('用户已创建');
              setDrawer(null);
              userForm.resetFields();
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="username" label="用户名">
            <Input />
          </Form.Item>
          <Form.Item name="realName" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleId" label="角色">
            <Select options={roles.map((item) => ({ label: item.roleName, value: item.id }))} />
          </Form.Item>
          <Form.Item name="mobile" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="passwordHash" label="初始密码">
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Drawer>

      <Drawer title="新增口岸" width={520} open={drawer === 'port'} onClose={() => setDrawer(null)} destroyOnHidden>
        <Form
          form={portForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await apiRequest('/api/ports', { method: 'POST', body: JSON.stringify(values) });
              message.success('口岸已创建');
              setDrawer(null);
              portForm.resetFields();
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="portCode" label="口岸编码">
            <Input />
          </Form.Item>
          <Form.Item name="portName" label="口岸名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="country" label="国家/区域" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="mode" label="通行方式">
            <Select
              options={[
                { label: '公路口岸', value: '公路口岸' },
                { label: '铁路口岸', value: '铁路口岸' },
                { label: '海运口岸', value: '海运口岸' },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Drawer>
    </>
  );
}
