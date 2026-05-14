import { Button, Card, Descriptions, Divider, Drawer, Form, Input, InputNumber, Space, Table, Tag, Timeline, message } from 'antd';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export function ApprovalPage() {
  const [form] = Form.useForm();
  const [decisionForm] = Form.useForm();
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decisionTarget, setDecisionTarget] = useState<{ id: string; decision: 'APPROVED' | 'REJECTED' } | null>(null);

  const load = async () => {
    const res = await apiRequest<{ items: any[] }>('/api/approvals?page=1&pageSize=20');
    setData(res.items);
  };

  useEffect(() => {
    void load();
  }, []);

  const openDecisionDrawer = (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setDecisionTarget({ id, decision });
    decisionForm.setFieldsValue({
      remark: decision === 'APPROVED' ? '同意，请按流程继续办理。' : '请补充说明后重新提交。',
    });
    setDecisionOpen(true);
  };

  const submitDecision = async (values: { remark: string }) => {
    if (!decisionTarget) {
      return;
    }

    try {
      await apiRequest(`/api/approvals/${decisionTarget.id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision: decisionTarget.decision, remark: values.remark }),
      });
      message.success(decisionTarget.decision === 'APPROVED' ? '已通过审批' : '已驳回审批');
      setDecisionOpen(false);
      setDecisionTarget(null);
      decisionForm.resetFields();
      if (detail?.id === decisionTarget.id) {
        setDetail(null);
      }
      void load();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <>
      <PageHeader title="审批中心" subtitle="覆盖付款申请、费用调整和关键业务节点审批。" />
      <Card className="glass-card" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          新建审批单
        </Button>
      </Card>
      <Card className="glass-card">
        <Table
          rowKey="id"
          dataSource={data}
          scroll={{ x: 980 }}
          columns={[
            { title: '审批单号', dataIndex: 'approvalNo', width: 180 },
            { title: '审批类型', dataIndex: 'approvalType', width: 180 },
            { title: '关联单据', dataIndex: 'relatedNo', width: 180 },
            { title: '金额', dataIndex: 'amount', width: 120 },
            { title: '发起人', dataIndex: 'applicantName', width: 120 },
            { title: '审批人', dataIndex: 'approverName', width: 120 },
            {
              title: '状态',
              width: 120,
              render: (_, row) => {
                const text = row.statusText ?? row.status;
                const color = text === '已通过' ? 'green' : text === '已驳回' ? 'red' : 'gold';
                return <Tag color={color}>{text}</Tag>;
              },
            },
            {
              title: '操作',
              width: 240,
              render: (_, row) => {
                const pending = (row.statusText ?? row.status) === '待审批' || row.status === 'PENDING';
                return (
                  <Space>
                    <Button size="small" onClick={() => setDetail(row)}>
                      详情
                    </Button>
                    <Button size="small" type="primary" disabled={!pending} onClick={() => openDecisionDrawer(row.id, 'APPROVED')}>
                      通过
                    </Button>
                    <Button size="small" danger disabled={!pending} onClick={() => openDecisionDrawer(row.id, 'REJECTED')}>
                      驳回
                    </Button>
                  </Space>
                );
              },
            },
          ]}
        />
      </Card>
      <Drawer title="新建审批单" width={520} open={open} onClose={() => setOpen(false)} destroyOnHidden>
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await apiRequest('/api/approvals', {
                method: 'POST',
                body: JSON.stringify(values),
              });
              message.success('审批单已创建');
              setOpen(false);
              form.resetFields();
              void load();
            } catch (error) {
              message.error((error as Error).message);
            }
          }}
        >
          <Form.Item name="approvalType" label="审批类型" rules={[{ required: true, message: '请输入审批类型' }]}>
            <Input placeholder="例如：付款申请审批" />
          </Form.Item>
          <Form.Item name="relatedNo" label="关联单据">
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="金额">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="applicantName" label="发起人" rules={[{ required: true, message: '请输入发起人' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="approverName" label="审批人" rules={[{ required: true, message: '请输入审批人' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="申请备注">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Drawer>
      <Drawer
        title={decisionTarget?.decision === 'APPROVED' ? '填写通过意见' : '填写驳回意见'}
        width={520}
        open={decisionOpen}
        onClose={() => {
          setDecisionOpen(false);
          setDecisionTarget(null);
          decisionForm.resetFields();
        }}
        destroyOnHidden
      >
        <Form form={decisionForm} layout="vertical" onFinish={submitDecision}>
          <Form.Item name="remark" label="审批意见" rules={[{ required: true, message: '请输入审批意见' }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            提交审批结果
          </Button>
        </Form>
      </Drawer>
      <Drawer title="审批详情" width={760} open={Boolean(detail)} onClose={() => setDetail(null)} destroyOnHidden>
        {detail ? (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="审批单号">{detail.approvalNo}</Descriptions.Item>
              <Descriptions.Item label="审批类型">{detail.approvalType}</Descriptions.Item>
              <Descriptions.Item label="关联单据">{detail.relatedNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="金额">{detail.amount ?? 0}</Descriptions.Item>
              <Descriptions.Item label="发起人">{detail.applicantName || '-'}</Descriptions.Item>
              <Descriptions.Item label="审批人">{detail.approverName || '-'}</Descriptions.Item>
              <Descriptions.Item label="当前状态">{detail.statusText ?? detail.status}</Descriptions.Item>
              <Descriptions.Item label="申请备注">{detail.remark || '-'}</Descriptions.Item>
              <Descriptions.Item label="审批备注">{detail.decisionRemark || '-'}</Descriptions.Item>
            </Descriptions>
            <Divider>审批历史</Divider>
            <Timeline
              items={(detail.history ?? []).map((item: any) => ({
                color: item.decision === '已通过' ? 'green' : item.decision === '已驳回' ? 'red' : 'blue',
                children: `${item.time} · ${item.operator} · ${item.decision}${item.remark ? ` · ${item.remark}` : ''}`,
              }))}
            />
          </>
        ) : null}
      </Drawer>
    </>
  );
}
