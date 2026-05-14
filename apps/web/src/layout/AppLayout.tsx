import {
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  BellOutlined,
  CarOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileSearchOutlined,
  FullscreenOutlined,
  MenuFoldOutlined,
  MessageOutlined,
  PartitionOutlined,
  ProfileOutlined,
  RocketOutlined,
  SearchOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Input, Layout, Menu, Space, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getSessionUser } from '../api/auth';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    type: 'group',
    label: '看板',
    children: [{ key: '/dashboard', icon: <DashboardOutlined />, label: '分析总览' }],
  },
  {
    type: 'group',
    label: '大件业务',
    children: [
      { key: '/inquiries', icon: <FileSearchOutlined />, label: '询价单管理' },
      { key: '/projects', icon: <ProfileOutlined />, label: '项目管理' },
      { key: '/batches', icon: <PartitionOutlined />, label: '批次管理' },
      { key: '/vehicle-orders', icon: <CarOutlined />, label: '车辆运输单' },
      { key: '/dispatch', icon: <BarChartOutlined />, label: '调度中心' },
      { key: '/in-transit', icon: <EnvironmentOutlined />, label: '在途管理' },
      { key: '/abnormal-events', icon: <WarningOutlined />, label: '异常管理' },
      { key: '/finance', icon: <DollarOutlined />, label: '财务汇总' },
      { key: '/oversize-transport', icon: <RocketOutlined />, label: '超限运输引擎' },
      { key: '/vehicle-templates', icon: <DatabaseOutlined />, label: '车型管理' },
    ],
  },
  {
    type: 'group',
    label: '跨境业务',
    children: [
      { key: '/waybills', icon: <ShoppingOutlined />, label: '运单管理' },
      { key: '/tasks', icon: <PartitionOutlined />, label: '任务管理' },
      { key: '/customs', icon: <DatabaseOutlined />, label: '关务管理' },
      { key: '/capacity', icon: <TeamOutlined />, label: '运力资源' },
      { key: '/approvals', icon: <AuditOutlined />, label: '审批中心' },
      { key: '/system-admin', icon: <SettingOutlined />, label: '系统管理' },
    ],
  },
  {
    type: 'group',
    label: '应用入口',
    children: [
      { key: '/projects?view=calendar', icon: <AppstoreOutlined />, label: '项目日历' },
      { key: '/dispatch?view=kanban', icon: <BarChartOutlined />, label: '调度看板' },
    ],
  },
];

const heavyCargoGroup = menuItems[1];
if (heavyCargoGroup && 'children' in heavyCargoGroup && Array.isArray(heavyCargoGroup.children)) {
  const hasCustomerMenu = heavyCargoGroup.children.some((item) => item && typeof item === 'object' && 'key' in item && item.key === '/customers');
  if (!hasCustomerMenu) {
    heavyCargoGroup.children.splice(8, 0, { key: '/customers', icon: <TeamOutlined />, label: '客户管理' });
  }
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getSessionUser();

  return (
    <Layout className="mantis-shell">
      <Sider width={296} theme="light" className="mantis-sider">
        <div className="mantis-brand">
          <div className="mantis-brand-mark">
            <span />
          </div>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Mantis Cargo
            </Typography.Title>
            <Typography.Text type="secondary">Heavy Cargo OS</Typography.Text>
          </div>
        </div>

        <div className="mantis-section-label">Workspace</div>
        <div className="mantis-workspace-card">
          <Space size={12}>
            <div className="mantis-workspace-icon" />
            <div>
              <Typography.Text strong>Eurosender China</Typography.Text>
              <div>
                <Tag color="blue">Enterprise</Tag>
              </div>
            </div>
          </Space>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="mantis-menu"
          onClick={(event) => {
            if (event.key.includes('?')) {
              navigate(event.key);
              return;
            }
            navigate(event.key);
          }}
        />

        <div className="mantis-user-card">
          <Space align="start">
            <Avatar size={52}>{user?.realName?.slice(0, 1) ?? 'U'}</Avatar>
            <div style={{ flex: 1 }}>
              <Typography.Text strong>{user?.realName ?? '未登录'}</Typography.Text>
              <div>
                <Typography.Text type="secondary">{user?.roleName ?? '访客'}</Typography.Text>
              </div>
            </div>
            <Button
              type="text"
              onClick={() => {
                clearSession();
                navigate('/login');
              }}
            >
              退出
            </Button>
          </Space>
        </div>
      </Sider>

      <Layout>
        <Header className="mantis-header">
          <Space size={18} style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space size={16}>
              <Button shape="circle" icon={<MenuFoldOutlined />} />
              <Input prefix={<SearchOutlined />} placeholder="搜索项目、询价单、运单、任务" className="mantis-search" />
            </Space>

            <Space size={18}>
              <AppstoreOutlined className="mantis-header-icon" />
              <Badge count={2} size="small">
                <BellOutlined className="mantis-header-icon" />
              </Badge>
              <MessageOutlined className="mantis-header-icon" />
              <FullscreenOutlined className="mantis-header-icon" />
              <SettingOutlined className="mantis-header-icon" />
              <Avatar>{user?.realName?.slice(0, 1) ?? 'U'}</Avatar>
            </Space>
          </Space>
        </Header>

        <Content className="mantis-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
