import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { saveSession } from '../api/auth';
import { apiRequest } from '../api/client';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Card className="glass-card" style={{ width: 420 }}>
        <Space direction="vertical" size={4} style={{ marginBottom: 24 }}>
          <Typography.Title level={2} style={{ marginBottom: 0 }}>
            登录系统
          </Typography.Title>
          <Typography.Text type="secondary">默认账号：admin / admin123</Typography.Text>
        </Space>
        <Form
          layout="vertical"
          initialValues={{ username: 'admin', password: 'admin123' }}
          onFinish={async (values) => {
            try {
              const result = await apiRequest<{ accessToken: string; user: any }>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(values),
              });
              saveSession(result.accessToken, result.user);
              message.success('登录成功');
              navigate('/dashboard');
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            进入系统
          </Button>
        </Form>
      </Card>
    </div>
  );
}
