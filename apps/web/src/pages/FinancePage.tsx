import { Card, Col, Row, Table } from 'antd';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';

export function FinancePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);

  useEffect(() => {
    void apiRequest<{ items: any[] }>('/api/projects?page=1&pageSize=10').then((res) => {
      setProjects(res.items);
      if (res.items[0]) {
        void apiRequest(`/api/projects/${res.items[0].id}/finance-summary`).then(setSummary);
      }
    });
    void apiRequest<{ items: any[] }>('/api/project-costs?page=1&pageSize=20').then((res) => setCosts(res.items));
  }, []);

  return (
    <>
      <PageHeader title="财务汇总" subtitle="按项目聚合收入、成本、回款和毛利。" />
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={8}>
          <MetricCard title="项目数" value={projects.length} />
        </Col>
        <Col xs={24} lg={8}>
          <MetricCard title="成本记录数" value={costs.length} />
        </Col>
        <Col xs={24} lg={8}>
          <MetricCard title="当前项目毛利" value={summary?.grossProfit ?? 0} suffix="CNY" />
        </Col>
      </Row>
      <Card className="glass-card" title="成本列表">
        <Table
          rowKey="id"
          dataSource={costs}
          columns={[
            { title: '项目', render: (_, row) => row.project.projectName },
            { title: '成本类型', dataIndex: 'costType' },
            { title: '金额', dataIndex: 'amount', render: (value) => String(value) },
            { title: '供应商', render: (_, row) => row.supplier?.supplierName ?? '-' },
          ]}
        />
      </Card>
    </>
  );
}
