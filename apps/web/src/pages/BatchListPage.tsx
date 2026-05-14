import { Button, Card, Input, Space, Table, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export function BatchListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [keyword, setKeyword] = useState(searchParams.get('project') ?? '');

  useEffect(() => {
    void apiRequest<any[]>('/api/batches').then(setData);
  }, []);

  const filtered = useMemo(
    () => data.filter((item) => !keyword || item.batchName?.includes(keyword) || item.project?.projectName?.includes(keyword)),
    [data, keyword],
  );

  return (
    <>
      <PageHeader title="批次管理" subtitle="按项目下发运输计划，组织批次执行和车辆投放。" />
      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          value={keyword}
          placeholder="搜索批次名称或项目名称"
          onChange={(event) => setKeyword(event.target.value)}
          onSearch={setKeyword}
        />
      </Card>
      <Card className="glass-card">
        <Table
          rowKey="id"
          dataSource={filtered}
          columns={[
            { title: '批次编号', dataIndex: 'batchNo' },
            { title: '批次名称', dataIndex: 'batchName' },
            { title: '所属项目', render: (_, row) => row.project?.projectName ?? '-' },
            { title: '状态', dataIndex: 'batchStatus', render: (value) => <Tag color="gold">{value}</Tag> },
            { title: '计划车数', dataIndex: 'plannedVehicleCount' },
            {
              title: '操作',
              render: (_, row) => (
                <Space>
                  <Button type="link" onClick={() => navigate(`/projects/${row.projectId}`)}>
                    查看项目
                  </Button>
                  <Button type="link" onClick={() => navigate(`/vehicle-orders?project=${encodeURIComponent(row.project?.projectName ?? '')}`)}>
                    查看车辆单
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
