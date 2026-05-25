import { Button, Card, Checkbox, Drawer, Form, Input, Modal, Select, Space, Switch, Table, Tabs, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { apiRequest } from '../api/client';

const { Text } = Typography;

export type RbacPermission = {
  id: string;
  code: string;
  name: string;
  module: string;
  action: string;
  description?: string | null;
  sortOrder?: number;
  enabled: boolean;
};

export type RbacRole = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  permissionCodes: string[];
};

type ManagedEmployee = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  department?: string | null;
  position?: string | null;
  isSalesperson: boolean;
  status: string;
  notes?: string | null;
  roles?: { id: string; name: string; code: string }[];
  roleIds?: string[];
};

type RoleFormValues = {
  code: string;
  name: string;
  description?: string;
  enabled?: boolean;
  permissionCodes?: string[];
};

type EmployeeFormValues = {
  name: string;
  phone?: string;
  email?: string;
  department?: string;
  position?: string;
  isSalesperson?: boolean;
  status?: string;
  notes?: string;
  roleIds?: string[];
};

export function PermissionManagementPage() {
  const [roleForm] = Form.useForm<RoleFormValues>();
  const [employeeForm] = Form.useForm<EmployeeFormValues>();
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [employees, setEmployees] = useState<ManagedEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [employeeDrawerOpen, setEmployeeDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RbacRole | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<ManagedEmployee | null>(null);

  const permissionGroups = useMemo(() => {
    const groups = new Map<string, RbacPermission[]>();
    permissions.forEach((permission) => {
      const items = groups.get(permission.module) ?? [];
      items.push(permission);
      groups.set(permission.module, items);
    });
    return [...groups.entries()];
  }, [permissions]);

  const load = async () => {
    setLoading(true);
    try {
      const [permissionRes, roleRes, employeeRes] = await Promise.all([
        apiRequest<{ items: RbacPermission[] }>('/api/rbac/permissions'),
        apiRequest<{ items: RbacRole[] }>('/api/rbac/roles'),
        apiRequest<{ items: ManagedEmployee[] }>('/api/employees'),
      ]);
      setPermissions(permissionRes.items ?? []);
      setRoles(roleRes.items ?? []);
      setEmployees(employeeRes.items ?? []);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openRoleDrawer = (role?: RbacRole) => {
    setEditingRole(role ?? null);
    roleForm.setFieldsValue(
      role
        ? {
            code: role.code,
            name: role.name,
            description: role.description ?? '',
            enabled: role.enabled,
            permissionCodes: role.permissionCodes,
          }
        : { enabled: true, permissionCodes: [] },
    );
    setRoleDrawerOpen(true);
  };

  const openEmployeeDrawer = (employee?: ManagedEmployee) => {
    setEditingEmployee(employee ?? null);
    employeeForm.setFieldsValue(
      employee
        ? {
            name: employee.name,
            phone: employee.phone ?? '',
            email: employee.email ?? '',
            department: employee.department ?? '',
            position: employee.position ?? '',
            isSalesperson: employee.isSalesperson,
            status: employee.status,
            notes: employee.notes ?? '',
            roleIds: employee.roleIds ?? employee.roles?.map((role) => role.id) ?? [],
          }
        : { status: 'ACTIVE', isSalesperson: false, roleIds: [] },
    );
    setEmployeeDrawerOpen(true);
  };

  const saveRole = async (values: RoleFormValues) => {
    try {
      await apiRequest(editingRole ? `/api/rbac/roles/${editingRole.id}` : '/api/rbac/roles', {
        method: editingRole ? 'PUT' : 'POST',
        body: JSON.stringify({ ...values, permissionCodes: values.permissionCodes ?? [] }),
      });
      message.success('角色已保存');
      setRoleDrawerOpen(false);
      roleForm.resetFields();
      await load();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const deleteRole = (role: RbacRole) => {
    Modal.confirm({
      title: '删除角色',
      content: `确认删除角色「${role.name}」？删除后会同步解除员工和流程节点中的角色关联。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await apiRequest(`/api/rbac/roles/${role.id}`, { method: 'DELETE' });
          message.success('角色已删除');
          await load();
        } catch (error) {
          message.error((error as Error).message);
        }
      },
    });
  };

  const saveEmployee = async (values: EmployeeFormValues) => {
    try {
      const { roleIds, ...employeeValues } = values;
      if (editingEmployee) {
        await apiRequest(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          body: JSON.stringify(employeeValues),
        });
        await apiRequest(`/api/employees/${editingEmployee.id}/roles`, {
          method: 'PUT',
          body: JSON.stringify({ roleIds: roleIds ?? [] }),
        });
      } else {
        const result = await apiRequest<{ id: string }>('/api/employees', {
          method: 'POST',
          body: JSON.stringify(employeeValues),
        });
        if (result.id) {
          await apiRequest(`/api/employees/${result.id}/roles`, {
            method: 'PUT',
            body: JSON.stringify({ roleIds: roleIds ?? [] }),
          });
        }
      }
      message.success('员工已保存');
      setEmployeeDrawerOpen(false);
      employeeForm.resetFields();
      await load();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const resetEmployeePassword = (employee: ManagedEmployee) => {
    Modal.confirm({
      title: '重置密码',
      content: `确认将 ${employee.name} 的登录密码重置为 ost987456？`,
      okText: '确认重置',
      cancelText: '取消',
      onOk: async () => {
        try {
          await apiRequest(`/api/employees/${employee.id}/reset-password`, { method: 'POST' });
          message.success('密码已重置为 ost987456');
        } catch (error) {
          message.error((error as Error).message);
        }
      },
    });
  };

  const employeeColumns: ColumnsType<ManagedEmployee> = [
    { title: '姓名', dataIndex: 'name', width: 140 },
    { title: '部门', render: (_, row) => row.department || '-', width: 140 },
    { title: '岗位', render: (_, row) => row.position || '-', width: 140 },
    { title: '电话', render: (_, row) => row.phone || '-', width: 140 },
    { title: '邮箱', render: (_, row) => row.email || '-', width: 190 },
    { title: '业务员', render: (_, row) => (row.isSalesperson ? <Tag color="blue">是</Tag> : <Tag>否</Tag>), width: 90 },
    { title: '角色', render: (_, row) => (row.roles?.length ? row.roles.map((role) => <Tag key={role.id}>{role.name}</Tag>) : '-'), width: 220 },
    { title: '状态', render: (_, row) => <Tag color={row.status === 'ACTIVE' ? 'green' : 'default'}>{row.status === 'ACTIVE' ? '启用' : '停用'}</Tag>, width: 90 },
    {
      title: '操作',
      fixed: 'right',
      width: 170,
      render: (_, row) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEmployeeDrawer(row)}>
            编辑
          </Button>
          <Button type="link" onClick={() => resetEmployeePassword(row)}>
            重置密码
          </Button>
        </Space>
      ),
    },
  ];

  const roleColumns: ColumnsType<RbacRole> = [
    { title: '角色编码', dataIndex: 'code', width: 180 },
    { title: '角色名称', dataIndex: 'name', width: 180 },
    { title: '状态', dataIndex: 'enabled', width: 100, render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? '启用' : '停用'}</Tag> },
    { title: '权限数', render: (_, row) => row.permissionCodes.length, width: 100 },
    { title: '备注', dataIndex: 'description' },
    {
      title: '操作',
      width: 100,
      render: (_, row) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openRoleDrawer(row)}>
          编辑
        </Button>
      ),
    },
  ];

  const roleColumnsWithDelete: ColumnsType<RbacRole> = [
    ...roleColumns,
    {
      title: '删除',
      width: 100,
      render: (_, row) => (
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteRole(row)} disabled={['admin', 'ADMIN'].includes(row.code)}>
          删除
        </Button>
      ),
    },
  ];

  const permissionColumns: ColumnsType<RbacPermission> = [
    { title: '模块', dataIndex: 'module', width: 160 },
    { title: '权限名称', dataIndex: 'name', width: 180 },
    { title: '权限编码', dataIndex: 'code', width: 220 },
    { title: '动作', dataIndex: 'action', width: 140 },
    { title: '状态', dataIndex: 'enabled', width: 100, render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? '启用' : '停用'}</Tag> },
  ];

  return (
    <>
      <Card className="glass-card" title="权限管理" bordered={false}>
        <Tabs
          items={[
            {
              key: 'employees',
              label: '员工管理',
              children: (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openEmployeeDrawer()}>
                    新增员工
                  </Button>
                  <Table rowKey="id" loading={loading} dataSource={employees} columns={employeeColumns} scroll={{ x: 1280 }} pagination={{ pageSize: 10 }} />
                </Space>
              ),
            },
            {
              key: 'roles',
              label: '角色管理',
              children: (
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openRoleDrawer()}>
                    新增角色
                  </Button>
                  <Table rowKey="id" loading={loading} dataSource={roles} columns={roleColumnsWithDelete} pagination={{ pageSize: 8 }} />
                </Space>
              ),
            },
            {
              key: 'permissions',
              label: '权限管理',
              children: <Table rowKey="id" loading={loading} dataSource={permissions} columns={permissionColumns} pagination={{ pageSize: 12 }} />,
            },
          ]}
        />
      </Card>

      <Drawer title={editingEmployee ? `编辑员工：${editingEmployee.name}` : '新增员工'} width={620} open={employeeDrawerOpen} onClose={() => setEmployeeDrawerOpen(false)} destroyOnHidden>
        <Form form={employeeForm} layout="vertical" onFinish={saveEmployee}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入员工姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleIds" label="角色">
            <EmployeeRoleSelect roles={roles} />
          </Form.Item>
          <Space size={12} style={{ width: '100%' }}>
            <Form.Item name="phone" label="电话" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="邮箱" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Space size={12} style={{ width: '100%' }}>
            <Form.Item name="department" label="部门" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="position" label="岗位" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Space size={12} style={{ width: '100%' }}>
            <Form.Item name="isSalesperson" label="是否业务员" valuePropName="checked" style={{ flex: 1 }}>
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue="ACTIVE" style={{ flex: 1 }}>
              <Select options={[{ value: 'ACTIVE', label: '启用' }, { value: 'INACTIVE', label: '停用' }]} />
            </Form.Item>
          </Space>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Drawer>

      <Drawer title={editingRole ? `编辑角色：${editingRole.name}` : '新增角色'} width={760} open={roleDrawerOpen} onClose={() => setRoleDrawerOpen(false)} destroyOnHidden>
        <Form form={roleForm} layout="vertical" onFinish={saveRole}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="code" label="角色编码" rules={[{ required: true, message: '请输入角色编码' }]}>
              <Input placeholder="如：operator" />
            </Form.Item>
            <Form.Item name="description" label="备注">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="enabled" label="是否启用" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="permissionCodes" label="权限配置">
              <Checkbox.Group style={{ width: '100%' }}>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  {permissionGroups.map(([module, items]) => (
                    <Card key={module} size="small" title={module}>
                      <Space wrap>
                        {items.map((permission) => (
                          <Checkbox key={permission.code} value={permission.code}>
                            <Text>{permission.name}</Text>
                          </Checkbox>
                        ))}
                      </Space>
                    </Card>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存
            </Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}

export function EmployeeRoleSelect({
  value,
  onChange,
  roles: providedRoles,
}: {
  value?: string[];
  onChange?: (value: string[]) => void;
  roles?: RbacRole[];
}) {
  const [roles, setRoles] = useState<RbacRole[]>(providedRoles ?? []);

  useEffect(() => {
    if (providedRoles) {
      setRoles(providedRoles);
      return;
    }
    void apiRequest<{ items: RbacRole[] }>('/api/rbac/roles')
      .then((result) => setRoles(result.items ?? []))
      .catch(() => setRoles([]));
  }, [providedRoles]);

  return <Select mode="multiple" allowClear value={value} onChange={onChange} options={roles.map((role) => ({ value: role.id, label: role.name }))} placeholder="选择角色" />;
}
