import { Card, Col, Descriptions, Drawer, Input, Row, Select, Space, Statistic, Table, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

type VehicleTemplate = {
  code: string;
  category: string;
  name: string;
  allowOversize?: boolean;
  lines: number;
  axles: number;
  effectiveLengthM: number;
  effectiveVolumeText?: string;
  effectiveWidthM: number;
  maxLoadKg: number;
  loadLimitText?: string;
  maxHeightM: number;
  scenarios: string[];
};

export function VehicleTemplateManagementPage() {
  const [data, setData] = useState<VehicleTemplate[]>([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>();
  const [selected, setSelected] = useState<VehicleTemplate | null>(null);

  useEffect(() => {
    void apiRequest<VehicleTemplate[]>('/api/oversize-transport/vehicle-templates').then(setData);
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(data.map((item) => item.category))).map((item) => ({ label: item, value: item })),
    [data],
  );

  const filtered = useMemo(
    () =>
      data.filter((item) => {
        const hitCategory = !category || item.category === category;
        const query = keyword.trim().toLowerCase();
        const hitKeyword =
          !query ||
          item.code.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.scenarios.some((scenario) => scenario.toLowerCase().includes(query));
        return hitCategory && hitKeyword;
      }),
    [category, data, keyword],
  );

  return (
    <>
      <PageHeader title="车型管理" subtitle="查看当前车型模板库，核对分类、尺寸、载重和适用场景，为后续导入和维护真实车型数据做准备。" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic title="车型总数" value={data.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic title="分类数" value={categories.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic title="最大载重" value={data.length ? Math.max(...data.map((item) => item.maxLoadKg)) : 0} suffix="kg" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="glass-card">
            <Statistic title="最长有效长度" value={data.length ? Math.max(...data.map((item) => item.effectiveLengthM)) : 0} suffix="m" />
          </Card>
        </Col>
      </Row>

      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            allowClear
            placeholder="搜索车型编码、名称、分类、场景"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ width: 320 }}
          />
          <Select
            allowClear
            placeholder="按分类筛选"
            options={categories}
            value={category}
            onChange={setCategory}
            style={{ width: 220 }}
          />
        </Space>
      </Card>

      <Card className="glass-card">
        <Table
          rowKey="code"
          dataSource={filtered}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: false,
          }}
          onRow={(record) => ({
            onClick: () => setSelected(record),
          })}
          columns={[
            { title: '车型编码', dataIndex: 'code', width: 140, fixed: 'left' },
            { title: '分类', dataIndex: 'category', width: 140, render: (value) => <Tag color="blue">{value}</Tag> },
            { title: '车型名称', dataIndex: 'name', width: 160 },
            {
              title: '可超限',
              dataIndex: 'allowOversize',
              width: 100,
              render: (value) => <Tag color={value ? 'orange' : 'default'}>{value ? '允许' : '不允许'}</Tag>,
            },
            { title: '线数', dataIndex: 'lines', width: 90 },
            { title: '轴数', dataIndex: 'axles', width: 90 },
            { title: '有效长度(m)', dataIndex: 'effectiveLengthM', width: 120 },
            { title: '有效方数', dataIndex: 'effectiveVolumeText', width: 120, render: (value) => value ?? '-' },
            { title: '有效宽度(m)', dataIndex: 'effectiveWidthM', width: 120 },
            { title: '最大装载高度(m)', dataIndex: 'maxHeightM', width: 150 },
            { title: '载重', width: 220, render: (_, row) => row.loadLimitText ?? `${row.maxLoadKg} kg` },
            {
              title: '适用场景',
              width: 260,
              render: (_, row) => (
                <Space wrap>
                  {row.scenarios.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Drawer title="车型详情" width={560} open={!!selected} onClose={() => setSelected(null)} destroyOnHidden>
        {selected ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="车型编码">{selected.code}</Descriptions.Item>
            <Descriptions.Item label="分类">{selected.category}</Descriptions.Item>
            <Descriptions.Item label="车型名称">{selected.name}</Descriptions.Item>
            <Descriptions.Item label="是否可超限">{selected.allowOversize ? '允许' : '不允许'}</Descriptions.Item>
            <Descriptions.Item label="线数 / 轴数">
              {selected.lines} / {selected.axles}
            </Descriptions.Item>
            <Descriptions.Item label="有效长度">{selected.effectiveLengthM} m</Descriptions.Item>
            <Descriptions.Item label="有效方数">{selected.effectiveVolumeText ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="有效宽度">{selected.effectiveWidthM} m</Descriptions.Item>
            <Descriptions.Item label="最大装载高度">{selected.maxHeightM} m</Descriptions.Item>
            <Descriptions.Item label="载重">{selected.loadLimitText ?? `${selected.maxLoadKg} kg`}</Descriptions.Item>
            <Descriptions.Item label="适用场景">
              <Space wrap>
                {selected.scenarios.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>
    </>
  );
}
