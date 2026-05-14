import { Button, Card, Col, List, Row, Select, Space, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export function DispatchPage() {
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState<any | null>(null);
  const [vehicleId, setVehicleId] = useState<Record<string, string>>({});
  const [driverId, setDriverId] = useState<Record<string, string>>({});
  const vehicleOrderKeyword = searchParams.get('vehicleOrder') ?? '';

  const load = () => apiRequest('/api/dispatch/board').then(setBoard);

  useEffect(() => {
    void load();
  }, []);

  const pendingOrders = useMemo(
    () =>
      (board?.pendingOrders ?? []).filter(
        (item: any) => !vehicleOrderKeyword || item.vehicleOrderNo?.includes(vehicleOrderKeyword),
      ),
    [board, vehicleOrderKeyword],
  );

  if (!board) return null;

  return (
    <>
      <PageHeader title="调度中心" subtitle="把待派车任务、可用资源和调度记录放到同一个中心视图中。" />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="glass-card" title="待派车车辆运输单">
            <List
              dataSource={pendingOrders}
              renderItem={(item: any) => (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      {item.vehicleOrderNo} / {item.project.projectName}
                    </div>
                    <Space wrap>
                      <Select
                        style={{ width: 180 }}
                        placeholder="选择车辆"
                        options={board.availableVehicles.map((vehicle: any) => ({
                          label: `${vehicle.vehicleNo} ${vehicle.vehicleType}`,
                          value: vehicle.id,
                        }))}
                        onChange={(value) => setVehicleId((prev) => ({ ...prev, [item.id]: value }))}
                      />
                      <Select
                        style={{ width: 180 }}
                        placeholder="选择司机"
                        options={board.availableDrivers.map((driver: any) => ({
                          label: `${driver.driverName} ${driver.driverPhone}`,
                          value: driver.id,
                        }))}
                        onChange={(value) => setDriverId((prev) => ({ ...prev, [item.id]: value }))}
                      />
                      <Button
                        type="primary"
                        onClick={async () => {
                          try {
                            await apiRequest('/api/dispatch/assign', {
                              method: 'POST',
                              body: JSON.stringify({
                                vehicleOrderId: item.id,
                                batchId: item.batchId,
                                vehicleId: vehicleId[item.id],
                                driverId: driverId[item.id],
                              }),
                            });
                            message.success('派车成功');
                            void load();
                          } catch (error) {
                            message.error((error as Error).message);
                          }
                        }}
                      >
                        派车
                      </Button>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="glass-card" title="预警信息">
            <List
              dataSource={board.abnormalAlerts}
              renderItem={(item: any) => (
                <List.Item>
                  {item.abnormalType} / <Tag color="red">{item.abnormalStatus}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="glass-card" title="可用车辆池">
            <List dataSource={board.availableVehicles} renderItem={(item: any) => <List.Item>{item.vehicleNo} / {item.vehicleType}</List.Item>} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="glass-card" title="可用司机池">
            <List dataSource={board.availableDrivers} renderItem={(item: any) => <List.Item>{item.driverName} / {item.driverPhone}</List.Item>} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
