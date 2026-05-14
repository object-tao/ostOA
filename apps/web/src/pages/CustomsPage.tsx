import { DownloadOutlined, HistoryOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Descriptions, Divider, Drawer, Form, Input, InputNumber, Row, Select, Space, Table, Tag, Timeline, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

const originOptions = [
  { label: 'World / MFN', value: '' },
  { label: 'United States', value: 'USA' },
  { label: 'Kazakhstan', value: 'KAZ' },
  { label: 'Tajikistan', value: 'TJK' },
];

function exportHistoryCsv(rows: any[]) {
  const headers = [
    'Query Time',
    'Destination',
    'Origin',
    'HS6',
    'Product Description',
    'Currency',
    'Customs Value',
    'Duty Rate',
    'Duty Amount',
    'VAT Rate',
    'VAT Amount',
    'Additional Tax Rate',
    'Additional Tax Amount',
    'Total Tax',
    'Landed Cost',
    'Data Source',
    'Cache Hit',
  ];

  const lines = rows.map((item) =>
    [
      item.createdAt ?? '',
      item.destinationCountryName ?? '',
      item.originCountryName ?? '',
      item.hsCode ?? '',
      item.productDescription ?? '',
      item.currency ?? '',
      item.customsValue ?? 0,
      item.dutyRate ?? 0,
      item.dutyAmount ?? 0,
      item.vatRate ?? 0,
      item.vatAmount ?? 0,
      item.additionalTaxRate ?? 0,
      item.additionalTaxAmount ?? 0,
      item.totalTaxAmount ?? 0,
      item.landedCost ?? 0,
      item.dataSource ?? '',
      item.cacheHit ? 'Yes' : 'No',
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','),
  );

  const csv = '\uFEFF' + [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tajikistan-tariff-history-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function CustomsPage() {
  const [form] = Form.useForm();
  const [tariffForm] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [waybills, setWaybills] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [keyword, setKeyword] = useState(searchParams.get('waybill') ?? '');
  const [tariffLoading, setTariffLoading] = useState(false);
  const [tariffResult, setTariffResult] = useState<any | null>(null);
  const [tariffHistory, setTariffHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = async () => {
    const res = await apiRequest<{ items: any[] }>('/api/customs-records?page=1&pageSize=20');
    setData(res.items);
  };

  const loadTariffHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await apiRequest<{ items: any[] }>('/api/tariffs/history?page=1&pageSize=20');
      setTariffHistory(res.items);
    } catch {
      setTariffHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void load();
    void loadTariffHistory();
    void apiRequest<{ items: any[] }>('/api/waybills?page=1&pageSize=20')
      .then((res) => setWaybills(res.items))
      .catch(() => setWaybills([]));
  }, []);

  const filtered = useMemo(
    () =>
      data.filter(
        (item) =>
          !keyword ||
          item.recordNo?.includes(keyword) ||
          item.waybill?.waybillNo?.includes(keyword) ||
          item.recordType?.includes(keyword),
      ),
    [data, keyword],
  );

  return (
    <>
      <PageHeader
        title="Customs Management"
        subtitle="Tajikistan tariff lookup now includes duty, import VAT, additional tax, landed cost, history, cache, and CSV export."
      />

      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Tajikistan Tariff Lookup</div>
            <div style={{ color: '#5f6b7a', fontSize: 13 }}>
              This first version uses the free WITS / UNCTAD TRAINS source, queries Tajikistan at HS6 level, and estimates
              duty, import VAT, additional tax, and landed cost.
            </div>
          </div>
          <Form
            form={tariffForm}
            layout="vertical"
            initialValues={{
              countryCode: 'TJK',
              originCountryCode: '',
              hsCode: '870323',
              invoiceValue: 10000,
              freightCost: 800,
              insuranceCost: 100,
              currency: 'USD',
            }}
            onFinish={async (values) => {
              try {
                setTariffLoading(true);
                const result = await apiRequest('/api/tariffs/quote', {
                  method: 'POST',
                  body: JSON.stringify(values),
                });
                setTariffResult(result);
                message.success('Tariff quote completed');
                void loadTariffHistory();
              } catch (error) {
                message.error((error as Error).message);
              } finally {
                setTariffLoading(false);
              }
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={6}>
                <Form.Item name="countryCode" label="Destination" rules={[{ required: true, message: 'Select a destination country' }]}>
                  <Select
                    options={[
                      { label: 'Tajikistan (live)', value: 'TJK' },
                      { label: 'United States (next)', value: 'USA', disabled: true },
                      { label: 'Kazakhstan (next)', value: 'KAZ', disabled: true },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="originCountryCode" label="Origin / Partner">
                  <Select options={originOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="hsCode"
                  label="HS Code"
                  rules={[
                    { required: true, message: 'Enter an HS code' },
                    { pattern: /^[0-9.\-\s]{6,12}$/, message: 'Enter at least 6 digits' },
                  ]}
                >
                  <Input placeholder="e.g. 870323" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="currency" label="Currency">
                  <Select options={[{ label: 'USD', value: 'USD' }, { label: 'CNY', value: 'CNY' }]} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={6}>
                <Form.Item name="invoiceValue" label="Invoice Value">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="freightCost" label="Freight">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="insuranceCost" label="Insurance">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="customsValue" label="Customs Value Override">
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="Optional. Overrides invoice + freight + insurance." />
                </Form.Item>
              </Col>
            </Row>
            <Space>
              <Button type="primary" htmlType="submit" loading={tariffLoading}>
                Quote Landed Cost
              </Button>
              <Button
                onClick={() => {
                  tariffForm.resetFields();
                  setTariffResult(null);
                }}
              >
                Reset
              </Button>
            </Space>
          </Form>

          {tariffResult ? (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {(tariffResult.warnings ?? []).map((warning: string) => (
                <Alert key={warning} type="warning" showIcon message={warning} />
              ))}
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Destination">{tariffResult.country?.name}</Descriptions.Item>
                <Descriptions.Item label="Year">{tariffResult.year}</Descriptions.Item>
                <Descriptions.Item label="HS6">{tariffResult.hsCode}</Descriptions.Item>
                <Descriptions.Item label="Product">{tariffResult.productDescription ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="Source">{tariffResult.dataSource?.provider}</Descriptions.Item>
                <Descriptions.Item label="Cache Hit">{tariffResult.dataSource?.cacheHit ? 'Yes' : 'No'}</Descriptions.Item>
                <Descriptions.Item label="Tariff Type">{tariffResult.tariff?.tariffType ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="Duty Rate">{`${tariffResult.tariff?.simpleAverageRate ?? 0}%`}</Descriptions.Item>
                <Descriptions.Item label="Customs Value">{`${tariffResult.calculation?.currency} ${tariffResult.calculation?.customsValue ?? 0}`}</Descriptions.Item>
                <Descriptions.Item label="Duty Amount">{`${tariffResult.calculation?.currency} ${tariffResult.calculation?.dutyAmount ?? 0}`}</Descriptions.Item>
                <Descriptions.Item label="Import VAT">
                  {`${tariffResult.calculation?.vatRate ?? 0}% / ${tariffResult.calculation?.currency} ${tariffResult.calculation?.vatAmount ?? 0}`}
                </Descriptions.Item>
                <Descriptions.Item label={tariffResult.calculation?.additionalTaxLabel ?? 'Additional tax'}>
                  {`${tariffResult.calculation?.additionalTaxRate ?? 0}% / ${tariffResult.calculation?.currency} ${tariffResult.calculation?.additionalTaxAmount ?? 0}`}
                </Descriptions.Item>
                <Descriptions.Item label="Total Tax">{`${tariffResult.calculation?.currency} ${tariffResult.calculation?.totalTaxAmount ?? 0}`}</Descriptions.Item>
                <Descriptions.Item label="Landed Cost">{`${tariffResult.calculation?.currency} ${tariffResult.calculation?.landedCost ?? 0}`}</Descriptions.Item>
              </Descriptions>
              {(tariffResult.calculation?.countrySpecificCharges ?? []).length ? (
                <Table
                  rowKey="code"
                  pagination={false}
                  size="small"
                  dataSource={tariffResult.calculation?.countrySpecificCharges ?? []}
                  columns={[
                    { title: 'Rule', dataIndex: 'label' },
                    { title: 'Type', dataIndex: 'kind', width: 120 },
                    { title: 'Rate', dataIndex: 'rate', width: 120, render: (value) => (value === null ? '-' : `${value}%`) },
                    { title: 'Amount', dataIndex: 'amount', width: 120 },
                    { title: 'Note', dataIndex: 'note' },
                  ]}
                />
              ) : null}
            </Space>
          ) : null}
        </Space>
      </Card>

      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <HistoryOutlined />
            <span>Tariff Query History</span>
          </Space>
          <Space>
            <Button onClick={() => void loadTariffHistory()} loading={historyLoading}>
              Refresh History
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => exportHistoryCsv(tariffHistory)} disabled={!tariffHistory.length}>
              Export CSV
            </Button>
          </Space>
        </Space>
        <Table
          style={{ marginTop: 16 }}
          rowKey="id"
          loading={historyLoading}
          dataSource={tariffHistory}
          pagination={false}
          scroll={{ x: 1200 }}
          columns={[
            { title: 'Time', dataIndex: 'createdAt', width: 180 },
            { title: 'Destination', dataIndex: 'destinationCountryName', width: 120 },
            { title: 'Origin', dataIndex: 'originCountryName', width: 120, render: (value) => value || '-' },
            { title: 'HS6', dataIndex: 'hsCode', width: 100 },
            { title: 'Duty Rate', dataIndex: 'dutyRate', width: 90, render: (value) => `${value ?? 0}%` },
            { title: 'Duty', dataIndex: 'dutyAmount', width: 100 },
            { title: 'VAT', dataIndex: 'vatAmount', width: 100 },
            { title: 'Additional', dataIndex: 'additionalTaxAmount', width: 100 },
            { title: 'Total Tax', dataIndex: 'totalTaxAmount', width: 100 },
            { title: 'Landed Cost', dataIndex: 'landedCost', width: 130 },
            {
              title: 'Cache',
              dataIndex: 'cacheHit',
              width: 90,
              render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? 'Hit' : 'Miss'}</Tag>,
            },
          ]}
        />
      </Card>

      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Input.Search
            allowClear
            value={keyword}
            placeholder="Search record no, waybill no, or record type"
            onChange={(event) => setKeyword(event.target.value)}
            onSearch={setKeyword}
          />
          <Button type="primary" onClick={() => setOpen(true)}>
            New Customs Record
          </Button>
        </Space>
      </Card>

      <Card className="glass-card">
        <Table
          rowKey="id"
          dataSource={filtered}
          scroll={{ x: 1040 }}
          columns={[
            { title: 'Record No', dataIndex: 'recordNo', width: 180 },
            { title: 'Waybill', render: (_, row) => row.waybill?.waybillNo ?? '-', width: 180 },
            { title: 'Type', dataIndex: 'recordType', width: 120 },
            { title: 'Port', dataIndex: 'portName', width: 140 },
            { title: 'Current Node', dataIndex: 'nodeName', width: 160 },
            { title: 'Status', render: (_, row) => <Tag color="processing">{row.status}</Tag>, width: 120 },
            { title: 'Remark', dataIndex: 'remark', width: 220 },
            {
              title: 'Action',
              width: 120,
              render: (_, row) => (
                <Button type="link" onClick={() => setDetail(row)}>
                  View
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Drawer title="New Customs Record" width={640} open={open} onClose={() => setOpen(false)} destroyOnHidden>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: '处理中' }}
          onFinish={async (values) => {
            try {
              await apiRequest('/api/customs-records', { method: 'POST', body: JSON.stringify(values) });
              message.success('Customs record created');
              setOpen(false);
              form.resetFields();
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="waybillId" label="Waybill" rules={[{ required: true, message: 'Select a waybill' }]}>
            <Select options={waybills.map((item) => ({ label: item.waybillNo, value: item.id }))} />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="recordType" label="Type" rules={[{ required: true, message: 'Select a type' }]} style={{ flex: 1 }}>
              <Select
                options={[
                  { label: '报关', value: '报关' },
                  { label: '清关', value: '清关' },
                  { label: '转关', value: '转关' },
                  { label: '出入境', value: '出入境' },
                ]}
              />
            </Form.Item>
            <Form.Item name="portName" label="Port" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="nodeName" label="Current Node" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="status" label="Status" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="remark" label="Remark">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form>
      </Drawer>

      <Drawer title="Customs Details" width={760} open={Boolean(detail)} onClose={() => setDetail(null)} destroyOnHidden>
        {detail ? (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Record No">{detail.recordNo}</Descriptions.Item>
              <Descriptions.Item label="Waybill">{detail.waybill?.waybillNo ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Type">{detail.recordType}</Descriptions.Item>
              <Descriptions.Item label="Port">{detail.portName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Current Node">{detail.nodeName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Status">{detail.status || '-'}</Descriptions.Item>
              <Descriptions.Item label="Remark">{detail.remark || '-'}</Descriptions.Item>
            </Descriptions>
            <Divider>Process Timeline</Divider>
            <Timeline
              items={(detail.history ?? []).map((item: any) => ({
                color: 'blue',
                children: `${item.time} · ${item.nodeName}${item.operator ? ` · ${item.operator}` : ''}${item.remark ? ` · ${item.remark}` : ''}`,
              }))}
            />
          </>
        ) : null}
      </Drawer>
    </>
  );
}
