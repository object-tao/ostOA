import { Button, Card, Col, List, Row, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import welcomeBanner from '../styles/mantis-welcome-banner.png';
import welcomeArrow from '../styles/mantis-welcome-arrow.png';

type ProjectItem = {
  id: string;
  projectName: string;
  projectStatus: string;
  actualVehicleCount: number;
  abnormalCount: number;
  contractAmount: number;
};

type TransitOverview = {
  totalVehicles: number;
  abnormalVehicles: number;
  activeAlerts: number;
};

const sparkData = [
  { name: '1', value: 18 },
  { name: '2', value: 20 },
  { name: '3', value: 19 },
  { name: '4', value: 17 },
  { name: '5', value: 16 },
  { name: '6', value: 12 },
  { name: '7', value: 15 },
  { name: '8', value: 18 },
  { name: '9', value: 21 },
  { name: '10', value: 23 },
  { name: '11', value: 20 },
  { name: '12', value: 18 },
];

const projectStatusMap: Record<string, string> = {
  DRAFT: '草稿',
  IN_PROGRESS: '执行中',
  COMPLETED: '已完成',
  CLOSED: '已关闭',
};

export function DashboardPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [overview, setOverview] = useState<TransitOverview | null>(null);
  const [todayInquiryCount, setTodayInquiryCount] = useState(0);

  useEffect(() => {
    void Promise.all([
      apiRequest<{ items: ProjectItem[] }>('/api/projects?page=1&pageSize=6'),
      apiRequest<TransitOverview>('/api/in-transit/overview'),
      apiRequest<{ items: Array<{ createdAt?: string }> }>('/api/inquiries?page=1&pageSize=100'),
    ]).then(([projectData, overviewData, inquiryData]) => {
      setProjects(projectData.items);
      setOverview(overviewData);
      const today = new Date().toLocaleDateString('zh-CN');
      setTodayInquiryCount(
        inquiryData.items.filter((item) => (item.createdAt ? item.createdAt.includes(today) : false)).length,
      );
    });
  }, []);

  if (!overview) {
    return <Spin />;
  }

  const totalIncome = projects.reduce((sum, item) => sum + item.contractAmount, 0);
  const activeProjects = projects.filter((item) => item.projectStatus === 'IN_PROGRESS').length;
  const chartData = projects.map((item) => ({
    name: item.projectName.length > 8 ? `${item.projectName.slice(0, 8)}...` : item.projectName,
    amount: item.contractAmount,
  }));

  return (
    <>
      <PageHeader title="分析总览" subtitle="项目、调度、在途和利润的统一分析视图。" />

      <section className="mantis-hero">
        <div className="mantis-hero-copy">
          <Typography.Title className="mantis-hero-title">Welcome to Mantis Cargo</Typography.Title>
          <Typography.Paragraph className="mantis-hero-text">
            参考 Mantis Analytics 模板重构后的首页分析台。现在可以把询价单、项目、批次、车辆运输单、异常和利润放在同一套管理视图里。
          </Typography.Paragraph>
          <Button size="large" ghost>
            查看完整统计
          </Button>
        </div>
        <div className="mantis-hero-art">
          <img src={welcomeBanner} alt="Mantis welcome banner" className="mantis-hero-banner" />
          <img src={welcomeArrow} alt="Mantis arrow" className="mantis-hero-arrow" />
        </div>
      </section>

      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12} xl={6}>
          <Card className="mantis-card mantis-stat-card" bordered={false}>
            <div className="mantis-stat-top">
              <span className="mantis-stat-label">今日询价</span>
              <span className="mantis-stat-chip blue">+12.0%</span>
            </div>
            <div className="mantis-stat-value">{todayInquiryCount}</div>
            <div style={{ width: '100%', height: 96, marginTop: 14 }}>
              <ResponsiveContainer>
                <AreaChart data={sparkData}>
                  <defs>
                    <linearGradient id="inquiryFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.34} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#16a34a" fill="url(#inquiryFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="mantis-card mantis-stat-card" bordered={false}>
            <div className="mantis-stat-top">
              <span className="mantis-stat-label">项目总数</span>
              <span className="mantis-stat-chip blue">+18.4%</span>
            </div>
            <div className="mantis-stat-value">{projects.length}</div>
            <div style={{ width: '100%', height: 96, marginTop: 14 }}>
              <ResponsiveContainer>
                <BarChart data={sparkData}>
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="mantis-card mantis-stat-card" bordered={false}>
            <div className="mantis-stat-top">
              <span className="mantis-stat-label">在途车辆</span>
              <span className="mantis-stat-chip red">-6.2%</span>
            </div>
            <div className="mantis-stat-value">{overview.totalVehicles}</div>
            <div style={{ width: '100%', height: 96, marginTop: 14 }}>
              <ResponsiveContainer>
                <AreaChart data={sparkData}>
                  <defs>
                    <linearGradient id="transitFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.38} />
                      <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#ff5b5b" fill="url(#transitFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="mantis-card mantis-stat-card" bordered={false}>
            <div className="mantis-stat-top">
              <span className="mantis-stat-label">合同总额</span>
              <span className="mantis-stat-chip amber">+24.0%</span>
            </div>
            <div className="mantis-stat-value">¥{totalIncome.toLocaleString()}</div>
            <div style={{ width: '100%', height: 96, marginTop: 14 }}>
              <ResponsiveContainer>
                <BarChart data={sparkData}>
                  <Bar dataKey="value" fill="#f7b731" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="mantis-card mantis-stat-card" bordered={false}>
            <div className="mantis-stat-top">
              <span className="mantis-stat-label">当前预警</span>
              <span className="mantis-stat-chip blue">+70.5%</span>
            </div>
            <div className="mantis-stat-value">{overview.activeAlerts}</div>
            <div style={{ width: '100%', height: 96, marginTop: 14 }}>
              <ResponsiveContainer>
                <AreaChart data={sparkData}>
                  <defs>
                    <linearGradient id="alertFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.34} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#alertFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} xl={16}>
          <Card className="mantis-card" bordered={false}>
            <div className="mantis-panel-title">经营收入概览</div>
            <Typography.Text type="secondary">
              当前执行中项目 {activeProjects} 个，对比样本项目合同额和整体经营趋势。
            </Typography.Text>
            <div style={{ width: '100%', height: 340, marginTop: 20 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#5aa2ff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card className="mantis-card mantis-list-card" bordered={false}>
            <div className="mantis-panel-title">项目关注度排行</div>
            <List
              itemLayout="horizontal"
              dataSource={projects}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.projectName}
                    description={`状态 ${projectStatusMap[item.projectStatus] ?? item.projectStatus} · 车辆 ${item.actualVehicleCount} · 异常 ${item.abnormalCount}`}
                  />
                  <Typography.Text strong style={{ color: '#2563eb', fontSize: 24 }}>
                    {7755 - index * 1488}
                  </Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
