import { Button, Card, Col, Descriptions, List, Row, Space, Table, Tag, Timeline } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { formatBeijingTime } from '../utils/date';

const projectStatusMap: Record<string, string> = {
  DRAFT: '草稿',
  IN_PROGRESS: '执行中',
  COMPLETED: '已完成',
  CLOSED: '已关闭',
};

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    void apiRequest(`/api/projects/${id}`).then(setProject);
  }, [id]);

  if (!project) return null;

  return (
    <>
      <PageHeader title={project.projectName} subtitle="项目详情页展示项目下全部批次、车辆执行、节点轨迹和异常情况。" />
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card className="glass-card" title="基础信息" extra={<Button type="link" onClick={() => navigate('/projects')}>返回列表</Button>}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="项目编号">{project.projectNo}</Descriptions.Item>
              <Descriptions.Item label="客户">{project.customer.customerName}</Descriptions.Item>
              <Descriptions.Item label="线路">
                {project.originPlace} {'->'} {project.destinationPlace}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color="green">{projectStatusMap[project.projectStatus] ?? project.projectStatus}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card className="glass-card" title="财务汇总">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="合同金额">{String(project.contractAmount)}</Descriptions.Item>
              <Descriptions.Item label="预计成本">{String(project.estimatedCost)}</Descriptions.Item>
              <Descriptions.Item label="实际成本">{String(project.actualCost)}</Descriptions.Item>
              <Descriptions.Item label="毛利">{String(project.grossProfit)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card
            className="glass-card"
            title="批次列表"
            extra={
              <Button size="small" onClick={() => navigate(`/batches?project=${encodeURIComponent(project.projectName)}`)}>
                查看全部批次
              </Button>
            }
          >
            <List
              dataSource={project.batches}
              renderItem={(item: any) => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span>{item.batchName}</span>
                    <span>{item.batchStatus}</span>
                    <span>计划车数 {item.plannedVehicleCount}</span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Card
            className="glass-card"
            title="车辆列表"
            extra={
              <Button size="small" onClick={() => navigate(`/vehicle-orders?project=${encodeURIComponent(project.projectName)}`)}>
                查看全部车辆单
              </Button>
            }
          >
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={project.vehicleOrders}
              columns={[
                { title: '车辆单号', dataIndex: 'vehicleOrderNo' },
                { title: '货物', dataIndex: 'cargoName' },
                { title: '状态', dataIndex: 'currentStatus' },
                { title: '车辆', render: (_, row: any) => row.vehicle?.vehicleNo ?? '-' },
                { title: '司机', render: (_, row: any) => row.driver?.driverName ?? '-' },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card className="glass-card" title="节点时间轴">
            <Timeline
              items={project.vehicleOrders.flatMap((order: any) =>
                order.trackingNodes.map((node: any) => ({
                  children: `${order.vehicleOrderNo} · ${node.nodeName} · ${formatBeijingTime(node.nodeTime, true)}`,
                })),
              )}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            className="glass-card"
            title="异常记录"
            extra={
              <Button size="small" onClick={() => navigate(`/abnormal-events?project=${encodeURIComponent(project.projectName)}`)}>
                查看异常中心
              </Button>
            }
          >
            <List
              dataSource={project.abnormalEvents}
              renderItem={(item: any) => (
                <List.Item>
                  {item.abnormalType} / {item.abnormalStatus} / {item.description}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
