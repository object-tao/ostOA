import { Card, Col, Row, Table, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export function InTransitPage() {
  const [searchParams] = useSearchParams();
  const [mapData, setMapData] = useState<any | null>(null);
  const vehicleOrderKeyword = searchParams.get('vehicleOrder') ?? '';

  useEffect(() => {
    void apiRequest('/api/in-transit/map').then(setMapData);
  }, []);

  const vehicles = useMemo(
    () =>
      (mapData?.vehicles ?? []).filter(
        (item: any) => !vehicleOrderKeyword || item.vehicleOrderNo?.includes(vehicleOrderKeyword),
      ),
    [mapData, vehicleOrderKeyword],
  );

  if (!mapData) return null;

  return (
    <>
      <PageHeader title="在途管理" subtitle="车辆定位、地图占位与轨迹接口预留都在这里汇总。" />
      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <div className="map-placeholder">地图占位区 / 后续可接高德或 Mapbox 轨迹接口</div>
      </Card>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card className="glass-card" title="在途车辆">
            <Table
              rowKey="id"
              dataSource={vehicles}
              columns={[
                { title: '车辆单号', dataIndex: 'vehicleOrderNo' },
                { title: '项目', dataIndex: 'projectName' },
                { title: '车辆', dataIndex: 'vehicleNo' },
                { title: '司机', dataIndex: 'driverName' },
                { title: '当前状态', dataIndex: 'currentStatus', render: (value) => <Tag color="cyan">{value}</Tag> },
                { title: '当前位置', dataIndex: 'location' },
                { title: '异常', dataIndex: 'abnormal', render: (value) => (value ? <Tag color="red">异常</Tag> : <Tag>正常</Tag>) },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
