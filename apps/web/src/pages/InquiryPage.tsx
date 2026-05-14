import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Divider, Drawer, Form, Input, InputNumber, List, Select, Space, Table, Tag, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

type StoredAttachment = {
  name: string;
  dataUrl?: string;
  type?: string;
};

const quoteStatusMap: Record<string, { text: string; color: string }> = {
  UNQUOTED: { text: '未报价', color: 'default' },
  QUOTED: { text: '已报价', color: 'blue' },
};

export function InquiryPage() {
  const [form] = Form.useForm();
  const [quoteForm] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  const load = async () => {
    const res = await apiRequest<{ items: any[] }>('/api/inquiries?page=1&pageSize=20');
    setData(res.items);
  };

  useEffect(() => {
    void load();
    void apiRequest<any[]>('/api/customers').then(setCustomers).catch(() => setCustomers([]));
  }, []);

  const normalizeFiles = (value: any): UploadFile[] => {
    if (Array.isArray(value)) {
      return value;
    }
    return value?.fileList ?? [];
  };

  const serializeFiles = async (files: UploadFile[] = []): Promise<StoredAttachment[]> =>
    Promise.all(
      files.map(async (file) => {
        const origin = file.originFileObj;
        if (!origin) {
          return { name: file.name };
        }

        return await new Promise<StoredAttachment>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              name: file.name,
              dataUrl: typeof reader.result === 'string' ? reader.result : '',
              type: origin.type,
            });
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(origin);
        });
      }),
    );

  const downloadAttachment = (attachment: StoredAttachment) => {
    if (!attachment.dataUrl) {
      message.warning('当前附件仅保存了文件名，暂无可下载内容');
      return;
    }

    const link = document.createElement('a');
    link.href = attachment.dataUrl;
    link.download = attachment.name;
    link.click();
  };

  const openDetail = (record: any) => {
    setSelectedInquiry(record);
    quoteForm.resetFields();
    setDetailOpen(true);
  };

  return (
    <>
      <PageHeader title="询价单管理" subtitle="支持需求说明、附件上传、报价状态管理，以及询价详情与方案下载。" />
      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          新建询价单
        </Button>
      </Card>
      <Card className="glass-card">
        <Table
          rowKey="id"
          dataSource={data}
          columns={[
            {
              title: '询价单编号',
              dataIndex: 'inquiryNo',
              render: (value, row) => (
                <Button type="link" style={{ paddingInline: 0 }} onClick={() => openDetail(row)}>
                  {value}
                </Button>
              ),
            },
            { title: '客户', render: (_, row) => row.customer?.shortName || row.customer?.name || row.customer?.customerName || '-' },
            { title: '货物', dataIndex: 'cargoName' },
            { title: '线路', render: (_, row) => `${row.originPlace} -> ${row.destinationPlace}` },
            { title: '需求说明', render: (_, row) => row.requirementDescription || '-' },
            { title: '需求附件', render: (_, row) => <Tag>{row.requirementAttachments?.length ?? 0} 个</Tag> },
            { title: '报价方案附件', render: (_, row) => <Tag color="green">{row.quoteAttachments?.length ?? 0} 个</Tag> },
            {
              title: '报价状态',
              render: (_, row) => {
                const status = quoteStatusMap[row.quoteStatus ?? 'UNQUOTED'] ?? quoteStatusMap.UNQUOTED;
                return <Tag color={status.color}>{status.text}</Tag>;
              },
            },
            {
              title: '操作',
              render: (_, row) =>
                row.quoteStatus === 'UNQUOTED' ? (
                  <Button type="link" onClick={() => openDetail(row)}>
                    询价
                  </Button>
                ) : (
                  <Button type="link" onClick={() => openDetail(row)}>
                    查看详情
                  </Button>
                ),
            },
          ]}
        />
      </Card>
      <Drawer title="新建询价单" width={640} open={open} onClose={() => setOpen(false)} destroyOnHidden>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ quoteStatus: 'UNQUOTED' }}
          onFinish={async (values) => {
            try {
              const requirementAttachments = await serializeFiles(values.requirementAttachments);
              await apiRequest('/api/inquiries', {
                method: 'POST',
                body: JSON.stringify({
                  ...values,
                  requirementAttachments,
                  quoteAttachments: [],
                }),
              });
              message.success('询价单已创建');
              setOpen(false);
              form.resetFields();
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
            <Select options={customers.map((item) => ({ label: item.shortName || item.name || item.customerName, value: item.id }))} />
          </Form.Item>
          <Form.Item name="cargoName" label="货物名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="requirementDescription" label="需求说明">
            <Input.TextArea rows={5} placeholder="填写客户需求说明、运输要求、时效约束等" />
          </Form.Item>
          <Form.Item name="originPlace" label="起运地" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="destinationPlace" label="目的地" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="totalWeight" label="总重量">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="quoteStatus" label="报价状态">
            <Select
              options={[
                { label: '未报价', value: 'UNQUOTED' },
                { label: '已报价', value: 'QUOTED' },
              ]}
            />
          </Form.Item>
          <Form.Item name="requirementAttachments" label="需求附件" valuePropName="fileList" getValueFromEvent={normalizeFiles}>
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Drawer>

      <Drawer
        title={selectedInquiry ? `询价单详情 · ${selectedInquiry.inquiryNo}` : '询价单详情'}
        width={720}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedInquiry(null);
          quoteForm.resetFields();
        }}
        destroyOnHidden
      >
        {selectedInquiry ? (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="询价单编号">{selectedInquiry.inquiryNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={(quoteStatusMap[selectedInquiry.quoteStatus ?? 'UNQUOTED'] ?? quoteStatusMap.UNQUOTED).color}>
                  {(quoteStatusMap[selectedInquiry.quoteStatus ?? 'UNQUOTED'] ?? quoteStatusMap.UNQUOTED).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="客户">{selectedInquiry.customer?.shortName || selectedInquiry.customer?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="货物">{selectedInquiry.cargoName || '-'}</Descriptions.Item>
              <Descriptions.Item label="起运地">{selectedInquiry.originPlace || '-'}</Descriptions.Item>
              <Descriptions.Item label="目的地">{selectedInquiry.destinationPlace || '-'}</Descriptions.Item>
              <Descriptions.Item label="总重量">{selectedInquiry.totalWeight || '-'} kg</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedInquiry.createdAt || '-'}</Descriptions.Item>
              <Descriptions.Item label="需求说明" span={2}>
                {selectedInquiry.requirementDescription || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>需求附件</Divider>
            <List
              bordered
              dataSource={selectedInquiry.requirementAttachments ?? []}
              locale={{ emptyText: '暂无需求附件' }}
              renderItem={(item: StoredAttachment) => (
                <List.Item
                  actions={[
                    <Button key="download" type="link" icon={<DownloadOutlined />} onClick={() => downloadAttachment(item)}>
                      下载
                    </Button>,
                  ]}
                >
                  {item.name}
                </List.Item>
              )}
            />

            <Divider>报价方案附件</Divider>
            <List
              bordered
              dataSource={selectedInquiry.quoteAttachments ?? []}
              locale={{ emptyText: '暂无报价方案附件' }}
              renderItem={(item: StoredAttachment) => (
                <List.Item
                  actions={[
                    <Button key="download" type="link" icon={<DownloadOutlined />} onClick={() => downloadAttachment(item)}>
                      下载
                    </Button>,
                  ]}
                >
                  {item.name}
                </List.Item>
              )}
            />

            {selectedInquiry.quoteStatus === 'UNQUOTED' ? (
              <>
                <Divider>询价操作</Divider>
                <Form
                  form={quoteForm}
                  layout="vertical"
                  onFinish={async (values) => {
                    try {
                      const quoteAttachments = await serializeFiles(values.quoteAttachments);
                      const updated = await apiRequest(`/api/inquiries/${selectedInquiry.id}/quote`, {
                        method: 'POST',
                        body: JSON.stringify({ quoteAttachments }),
                      });
                      message.success('报价方案已上传，状态已更新');
                      setSelectedInquiry(updated);
                      quoteForm.resetFields();
                      await load();
                    } catch (error) {
                      message.error((error as Error).message);
                    }
                  }}
                >
                  <Form.Item
                    name="quoteAttachments"
                    label="上传报价方案"
                    valuePropName="fileList"
                    getValueFromEvent={normalizeFiles}
                    rules={[{ required: true, message: '请上传报价方案附件' }]}
                  >
                    <Upload beforeUpload={() => false} multiple>
                      <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Upload>
                  </Form.Item>
                  <Space>
                    <Button type="primary" onClick={() => void quoteForm.submit()}>
                      提交询价结果
                    </Button>
                  </Space>
                </Form>
              </>
            ) : null}
          </>
        ) : null}
      </Drawer>
    </>
  );
}
