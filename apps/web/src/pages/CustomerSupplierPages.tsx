import { Button, Card, Col, Descriptions, Divider, Form, Input, InputNumber, List, Modal, Popconfirm, Row, Select, Space, Table, Tag, Upload, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

export type ManagedCustomer = {
  id: string;
  name: string;
  customerCode?: string | null;
  shortName?: string | null;
  contactName?: string | null;
  detailedAddress?: string | null;
  phone?: string | null;
  contractStatus?: string | null;
  contractFiles?: ManagedFile[];
  invoiceInfo?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ManagedFile = {
  fileName: string;
  fileType?: string;
  fileSize?: number;
  fileUrl: string;
};

type SupplierVehicle = {
  id: string;
  supplierId: string;
  plateNo?: string | null;
  vehicleType?: string | null;
  requiredVehicleType?: string | null;
  vehicleLength?: string | null;
  axle?: string | null;
  drivingLicenseFiles?: ManagedFile[];
  brandModel?: string | null;
  roadTransportCertNo?: string | null;
  experienceLicenseNo?: string | null;
  inspectionValidUntil?: string | null;
  operationCertReviewDate?: string | null;
  mandatoryScrapDate?: string | null;
  vehiclePhotoFiles?: ManagedFile[];
  otherFiles?: ManagedFile[];
};

type SupplierDriver = {
  id: string;
  supplierId: string;
  name: string;
  phone?: string | null;
  idCardNo?: string | null;
  notes?: string | null;
  payee?: string | null;
  bankPhone?: string | null;
  bankCardNo?: string | null;
  bankName?: string | null;
  idFrontFiles?: ManagedFile[];
  idBackFiles?: ManagedFile[];
  driverLicenseFiles?: ManagedFile[];
  insuranceFiles?: ManagedFile[];
  internationalRoadPermitFiles?: ManagedFile[];
};

type Supplier = {
  id: string;
  name: string;
  supplierCode?: string | null;
  type: string;
  contactInfo?: string | null;
  payee?: string | null;
  bankPhone?: string | null;
  bankCardNo?: string | null;
  bankName?: string | null;
  notes?: string | null;
  contractStatus?: string | null;
  contractFiles?: ManagedFile[];
  attachments?: ManagedFile[];
  vehicles?: SupplierVehicle[];
  drivers?: SupplierDriver[];
};

const supplierTypes = ['报关行', '清关行', '国内经纪人', '国内车队', '国外车队', '国外经纪人', '转关行', '自营业务'];
const requiredVehicleTypes = ['平板', '厢式', '篷布车', '二节子', '高栏', '冷藏', '特种板', '笼车'];
const vehicleLengths = ['9.6米', '13.75米', '17米', '13米', '14.5米', '17.5米', '13.5米', '16米', '抽拉板'];
const axles = ['4轴', '6轴', '8轴', '10轴', '13轴', '17轴', '21轴', '5轴', '7轴', '9轴', '11轴', '15轴', '19轴', '23轴'];
const customerContractStatuses = ['未签署', '签署中', '已签署', '已过期', '无需合同'];

function fileListValue(event: { fileList?: UploadFile[] }) {
  return event?.fileList ?? [];
}

function fileLinks(files?: ManagedFile[]) {
  if (!files?.length) return '-';
  return (
    <Space wrap>
      {files.map((file, index) => (
        <Button key={`${file.fileUrl}-${index}`} type="link" href={file.fileUrl} target="_blank" rel="noreferrer">
          {file.fileName}
        </Button>
      ))}
    </Space>
  );
}

async function uploadFiles(files: UploadFile[] | undefined, folder: string) {
  const uploaded: ManagedFile[] = [];
  for (const item of files ?? []) {
    if (!item.originFileObj) continue;
    const formData = new FormData();
    formData.append('file', item.originFileObj);
    formData.append('folder', folder);
    uploaded.push(await apiRequest<ManagedFile>('/api/uploads', { method: 'POST', body: formData }));
  }
  return uploaded;
}

export function CustomerManagementPage({ customers, loading, onReload }: { customers: ManagedCustomer[]; loading: boolean; onReload: () => Promise<void> }) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedCustomer | null>(null);

  const openModal = (record?: ManagedCustomer) => {
    setEditing(record ?? null);
    form.resetFields();
    form.setFieldsValue(record ? { ...record, contractUploads: [] } : { contractStatus: '未签署', contractUploads: [] });
    setOpen(true);
  };

  const save = async (values: Partial<ManagedCustomer> & { contractUploads?: UploadFile[] }) => {
    try {
      const contractFiles = [...(editing?.contractFiles ?? []), ...(await uploadFiles(values.contractUploads, 'customer-contracts'))];
      await apiRequest(editing ? `/api/customers/${editing.id}` : '/api/customers', {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify({ ...values, contractUploads: undefined, contractFiles }),
      });
      message.success(editing ? '客户已更新' : '客户已创建');
      setOpen(false);
      await onReload();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const remove = async (record: ManagedCustomer) => {
    try {
      await apiRequest(`/api/customers/${record.id}`, { method: 'DELETE' });
      message.success('客户已删除');
      await onReload();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const columns: ColumnsType<ManagedCustomer> = [
    { title: '客户名称', dataIndex: 'name', width: 220 },
    { title: '客户简称', dataIndex: 'shortName', width: 160, render: (value) => value || '-' },
    { title: '客户编号', dataIndex: 'customerCode', width: 160, render: (value) => value || '-' },
    { title: '联系人', dataIndex: 'contactName', width: 140, render: (value) => value || '-' },
    { title: '电话', dataIndex: 'phone', width: 160, render: (value) => value || '-' },
    { title: '地址', dataIndex: 'detailedAddress', width: 220, render: (value) => value || '-' },
    { title: '合同状态', dataIndex: 'contractStatus', width: 120, render: (value) => <Tag color={value === '已签署' ? 'green' : value === '签署中' ? 'blue' : value === '已过期' ? 'red' : 'default'}>{value || '未签署'}</Tag> },
    { title: '合同附件', width: 100, render: (_, row) => row.contractFiles?.length ?? 0 },
    { title: '开票信息', dataIndex: 'invoiceInfo', width: 280, render: (value) => value || '-' },
    { title: '备注', dataIndex: 'notes', width: 260, render: (value) => value || '-' },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      render: (_, row) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal(row)}>
            修改
          </Button>
          <Popconfirm title="确认删除该客户？" onConfirm={() => void remove(row)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card className="glass-card" title="客户管理" bordered={false} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增客户</Button>}>
        <Table rowKey="id" loading={loading} dataSource={customers} columns={columns} scroll={{ x: 1890 }} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title={editing ? '修改客户' : '新增客户'} open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} width={720} okText="保存">
        <Form form={form} layout="vertical" onFinish={(values) => void save(values)}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="name" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="customerCode" label="客户编号"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="shortName" label="客户简称"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="contactName" label="联系人"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="电话"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="contractStatus" label="合同签署状态"><Select options={customerContractStatuses.map((item) => ({ value: item, label: item }))} /></Form.Item></Col>
          </Row>
          <Form.Item name="detailedAddress" label="地址"><Input.TextArea rows={2} /></Form.Item>
          {editing?.contractFiles?.length ? <Form.Item label="已有合同附件">{fileLinks(editing.contractFiles)}</Form.Item> : null}
          <Form.Item name="contractUploads" label="上传合同附件" valuePropName="fileList" getValueFromEvent={fileListValue}>
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>选择附件</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="invoiceInfo" label="开票信息"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="notes" label="备注"><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [supplierForm] = Form.useForm();
  const [vehicleForm] = Form.useForm();
  const [driverForm] = Form.useForm();
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<SupplierVehicle | null>(null);
  const [editingDriver, setEditingDriver] = useState<SupplierDriver | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const result = await apiRequest<{ items: Supplier[] }>('/api/suppliers');
      setSuppliers(result.items ?? []);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSuppliers();
  }, []);

  const openSupplier = (record?: Supplier) => {
    setEditingSupplier(record ?? null);
    supplierForm.resetFields();
    supplierForm.setFieldsValue(record ? { ...record, attachmentUploads: [], contractUploads: [] } : { type: '国内车队', contractStatus: '未签署', attachmentUploads: [], contractUploads: [] });
    setSupplierOpen(true);
  };

  const saveSupplier = async (values: Partial<Supplier> & { attachmentUploads?: UploadFile[]; contractUploads?: UploadFile[] }) => {
    try {
      const attachments = [...(editingSupplier?.attachments ?? []), ...(await uploadFiles(values.attachmentUploads, 'suppliers'))];
      const contractFiles = [...(editingSupplier?.contractFiles ?? []), ...(await uploadFiles(values.contractUploads, 'supplier-contracts'))];
      await apiRequest(editingSupplier ? `/api/suppliers/${editingSupplier.id}` : '/api/suppliers', {
        method: editingSupplier ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...values,
          supplierCode: undefined,
          attachmentUploads: undefined,
          contractUploads: undefined,
          attachments,
          contractFiles,
        }),
      });
      message.success(editingSupplier ? '供应商已更新' : '供应商已创建');
      setSupplierOpen(false);
      await loadSuppliers();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const removeSupplier = async (record: Supplier) => {
    try {
      await apiRequest(`/api/suppliers/${record.id}`, { method: 'DELETE' });
      message.success('供应商已删除');
      await loadSuppliers();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const openVehicle = (supplier: Supplier, record?: SupplierVehicle) => {
    setSelectedSupplier(supplier);
    setEditingVehicle(record ?? null);
    vehicleForm.resetFields();
    vehicleForm.setFieldsValue(record ? { ...record } : {});
    setVehicleOpen(true);
  };

  const saveVehicle = async (values: SupplierVehicle & Record<string, UploadFile[]>) => {
    if (!selectedSupplier) return;
    try {
      const payload = {
        ...values,
        drivingLicenseFiles: [...(editingVehicle?.drivingLicenseFiles ?? []), ...(await uploadFiles(values.drivingLicenseUploads, 'supplier-vehicles'))],
        vehiclePhotoFiles: [...(editingVehicle?.vehiclePhotoFiles ?? []), ...(await uploadFiles(values.vehiclePhotoUploads, 'supplier-vehicles'))],
        otherFiles: [...(editingVehicle?.otherFiles ?? []), ...(await uploadFiles(values.otherUploads, 'supplier-vehicles'))],
      };
      await apiRequest(editingVehicle ? `/api/supplier-vehicles/${editingVehicle.id}` : `/api/suppliers/${selectedSupplier.id}/vehicles`, {
        method: editingVehicle ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      message.success('车辆信息已保存');
      setVehicleOpen(false);
      await loadSuppliers();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const removeVehicle = async (record: SupplierVehicle) => {
    await apiRequest(`/api/supplier-vehicles/${record.id}`, { method: 'DELETE' });
    message.success('车辆已删除');
    await loadSuppliers();
  };

  const openDriver = (supplier: Supplier, record?: SupplierDriver) => {
    setSelectedSupplier(supplier);
    setEditingDriver(record ?? null);
    driverForm.resetFields();
    driverForm.setFieldsValue(record ? { ...record } : {});
    setDriverOpen(true);
  };

  const saveDriver = async (values: SupplierDriver & Record<string, UploadFile[]>) => {
    if (!selectedSupplier) return;
    try {
      const payload = {
        ...values,
        idFrontFiles: [...(editingDriver?.idFrontFiles ?? []), ...(await uploadFiles(values.idFrontUploads, 'supplier-drivers'))],
        idBackFiles: [...(editingDriver?.idBackFiles ?? []), ...(await uploadFiles(values.idBackUploads, 'supplier-drivers'))],
        driverLicenseFiles: [...(editingDriver?.driverLicenseFiles ?? []), ...(await uploadFiles(values.driverLicenseUploads, 'supplier-drivers'))],
        insuranceFiles: [...(editingDriver?.insuranceFiles ?? []), ...(await uploadFiles(values.insuranceUploads, 'supplier-drivers'))],
        internationalRoadPermitFiles: [...(editingDriver?.internationalRoadPermitFiles ?? []), ...(await uploadFiles(values.internationalRoadPermitUploads, 'supplier-drivers'))],
      };
      await apiRequest(editingDriver ? `/api/supplier-drivers/${editingDriver.id}` : `/api/suppliers/${selectedSupplier.id}/drivers`, {
        method: editingDriver ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      message.success('司机信息已保存');
      setDriverOpen(false);
      await loadSuppliers();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const removeDriver = async (record: SupplierDriver) => {
    await apiRequest(`/api/supplier-drivers/${record.id}`, { method: 'DELETE' });
    message.success('司机已删除');
    await loadSuppliers();
  };

  const supplierColumns: ColumnsType<Supplier> = [
    {
      title: '供应商编号',
      dataIndex: 'supplierCode',
      width: 220,
      render: (value, row) =>
        value ? (
          <Button
            type="link"
            style={{ padding: 0, maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={value}
            onClick={() => setDetailSupplier(row)}
          >
            {value}
          </Button>
        ) : (
          <Button type="link" style={{ padding: 0 }} onClick={() => setDetailSupplier(row)}>
            查看资料
          </Button>
        ),
    },
    { title: '供应商名称', dataIndex: 'name', width: 240 },
    { title: '类型', dataIndex: 'type', width: 140, render: (value) => <Tag color="blue">{value}</Tag> },
    { title: '联系方式', dataIndex: 'contactInfo', width: 180, render: (value) => value || '-' },
    { title: '合同状态', dataIndex: 'contractStatus', width: 120, render: (value) => <Tag color={value === '已签署' ? 'green' : value === '签署中' ? 'blue' : value === '已过期' ? 'red' : 'default'}>{value || '未签署'}</Tag> },
    { title: '合同附件', width: 100, render: (_, row) => row.contractFiles?.length ?? 0 },
    { title: '收款人', dataIndex: 'payee', width: 130, render: (value) => value || '-' },
    { title: '银行卡号', dataIndex: 'bankCardNo', width: 180, render: (value) => value || '-' },
    { title: '附件', width: 120, render: (_, row) => row.attachments?.length ?? 0 },
    {
      title: '操作',
      width: 240,
      fixed: 'right',
      render: (_, row) => (
        <Space>
          <Button type="link" onClick={() => openVehicle(row)}>加车辆</Button>
          <Button type="link" onClick={() => openDriver(row)}>加司机</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openSupplier(row)}>修改</Button>
          <Popconfirm title="确认删除该供应商？" onConfirm={() => void removeSupplier(row)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const vehicleColumns = (supplier: Supplier): ColumnsType<SupplierVehicle> => [
    { title: '车牌号', dataIndex: 'plateNo' },
    { title: '车辆类型', dataIndex: 'vehicleType' },
    { title: '需求车型', dataIndex: 'requiredVehicleType' },
    { title: '车长', dataIndex: 'vehicleLength' },
    { title: '车轴', dataIndex: 'axle' },
    { title: '品牌型号', dataIndex: 'brandModel' },
    { title: '行驶证', render: (_, row) => fileLinks(row.drivingLicenseFiles) },
    { title: '车辆照片', render: (_, row) => fileLinks(row.vehiclePhotoFiles) },
    { title: '操作', width: 150, render: (_, row) => <Space><Button type="link" onClick={() => openVehicle(supplier, row)}>修改</Button><Popconfirm title="确认删除车辆？" onConfirm={() => void removeVehicle(row)}><Button type="link" danger>删除</Button></Popconfirm></Space> },
  ];

  const driverColumns = (supplier: Supplier): ColumnsType<SupplierDriver> => [
    { title: '司机名称', dataIndex: 'name' },
    { title: '司机电话', dataIndex: 'phone' },
    { title: '身份证号', dataIndex: 'idCardNo' },
    { title: '收款人', dataIndex: 'payee' },
    { title: '银行卡号', dataIndex: 'bankCardNo' },
    { title: '驾驶证', render: (_, row) => fileLinks(row.driverLicenseFiles) },
    { title: '操作', width: 150, render: (_, row) => <Space><Button type="link" onClick={() => openDriver(supplier, row)}>修改</Button><Popconfirm title="确认删除司机？" onConfirm={() => void removeDriver(row)}><Button type="link" danger>删除</Button></Popconfirm></Space> },
  ];

  return (
    <>
      <Card className="glass-card" title="供应商管理" bordered={false} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openSupplier()}>新增供应商</Button>}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={suppliers}
          columns={supplierColumns}
          scroll={{ x: 1630 }}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record) => (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Descriptions size="small" bordered column={2}>
                  <Descriptions.Item label="开户手机">{record.bankPhone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="开户行">{record.bankName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="合同签署状态">{record.contractStatus || '未签署'}</Descriptions.Item>
                  <Descriptions.Item label="合同附件">{fileLinks(record.contractFiles)}</Descriptions.Item>
                  <Descriptions.Item label="备注">{record.notes || '-'}</Descriptions.Item>
                  <Descriptions.Item label="附件">{fileLinks(record.attachments)}</Descriptions.Item>
                </Descriptions>
                <Card size="small" title="车辆信息" extra={<Button size="small" icon={<PlusOutlined />} onClick={() => openVehicle(record)}>新增车辆</Button>}>
                  <Table rowKey="id" size="small" dataSource={record.vehicles ?? []} columns={vehicleColumns(record)} pagination={false} scroll={{ x: 1200 }} />
                </Card>
                <Card size="small" title="司机信息" extra={<Button size="small" icon={<PlusOutlined />} onClick={() => openDriver(record)}>新增司机</Button>}>
                  <Table rowKey="id" size="small" dataSource={record.drivers ?? []} columns={driverColumns(record)} pagination={false} scroll={{ x: 1100 }} />
                </Card>
              </Space>
            ),
          }}
        />
      </Card>

      <Modal title={editingSupplier ? '修改供应商' : '新增供应商'} open={supplierOpen} onCancel={() => setSupplierOpen(false)} onOk={() => supplierForm.submit()} width={860} okText="保存">
        <Form form={supplierForm} layout="vertical" onFinish={(values) => void saveSupplier(values)}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="name" label="供应商名称" rules={[{ required: true, message: '请输入供应商名称' }]}><Input /></Form.Item></Col>
            <Col span={8}>
              <Form.Item name="supplierCode" label="供应商编号">
                <Input disabled placeholder="系统自动生成" />
              </Form.Item>
            </Col>
            <Col span={8}><Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}><Select options={supplierTypes.map((value) => ({ value, label: value }))} /></Form.Item></Col>
          </Row>
          <Form.Item name="contactInfo" label="联系方式"><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="payee" label="收款人"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="bankPhone" label="开户手机"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="bankCardNo" label="银行卡号"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="bankName" label="开户行"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="contractStatus" label="合同签署状态">
            <Select options={customerContractStatuses.map((item) => ({ value: item, label: item }))} />
          </Form.Item>
          <Form.Item name="contractUploads" label="上传合同附件" valuePropName="fileList" getValueFromEvent={fileListValue}>
            <Upload beforeUpload={() => false} multiple><Button icon={<UploadOutlined />}>选择附件</Button></Upload>
          </Form.Item>
          {editingSupplier?.contractFiles?.length ? <List size="small" header="已有合同附件" dataSource={editingSupplier.contractFiles} renderItem={(item) => <List.Item>{fileLinks([item])}</List.Item>} /> : null}
          <Form.Item name="notes" label="备注"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="attachmentUploads" label="附件" valuePropName="fileList" getValueFromEvent={fileListValue}>
            <Upload beforeUpload={() => false} multiple><Button icon={<UploadOutlined />}>选择附件</Button></Upload>
          </Form.Item>
          {editingSupplier?.attachments?.length ? <List size="small" header="已有附件" dataSource={editingSupplier.attachments} renderItem={(item) => <List.Item>{fileLinks([item])}</List.Item>} /> : null}
        </Form>
      </Modal>

      <Modal title="供应商资料" open={Boolean(detailSupplier)} onCancel={() => setDetailSupplier(null)} footer={null} width={980}>
        {detailSupplier ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="供应商名称">{detailSupplier.name}</Descriptions.Item>
              <Descriptions.Item label="供应商编号">{detailSupplier.supplierCode || '-'}</Descriptions.Item>
              <Descriptions.Item label="类型">{detailSupplier.type}</Descriptions.Item>
              <Descriptions.Item label="联系方式">{detailSupplier.contactInfo || '-'}</Descriptions.Item>
              <Descriptions.Item label="收款人">{detailSupplier.payee || '-'}</Descriptions.Item>
              <Descriptions.Item label="开户手机">{detailSupplier.bankPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="银行卡号">{detailSupplier.bankCardNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="开户行">{detailSupplier.bankName || '-'}</Descriptions.Item>
              <Descriptions.Item label="合同签署状态">{detailSupplier.contractStatus || '未签署'}</Descriptions.Item>
              <Descriptions.Item label="合同附件">{fileLinks(detailSupplier.contractFiles)}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{detailSupplier.notes || '-'}</Descriptions.Item>
              <Descriptions.Item label="附件" span={2}>{fileLinks(detailSupplier.attachments)}</Descriptions.Item>
            </Descriptions>
            <Card size="small" title="车辆信息">
              <Table rowKey="id" size="small" dataSource={detailSupplier.vehicles ?? []} columns={vehicleColumns(detailSupplier)} pagination={false} scroll={{ x: 1200 }} />
            </Card>
            <Card size="small" title="司机信息">
              <Table rowKey="id" size="small" dataSource={detailSupplier.drivers ?? []} columns={driverColumns(detailSupplier)} pagination={false} scroll={{ x: 1100 }} />
            </Card>
          </Space>
        ) : null}
      </Modal>

      <Modal title={editingVehicle ? '修改车辆' : '新增车辆'} open={vehicleOpen} onCancel={() => setVehicleOpen(false)} onOk={() => vehicleForm.submit()} width={900} okText="保存">
        <Form form={vehicleForm} layout="vertical" onFinish={(values) => void saveVehicle(values)}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="plateNo" label="车牌号"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="vehicleType" label="车辆类型"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="requiredVehicleType" label="需求车型"><Select allowClear options={requiredVehicleTypes.map((value) => ({ value, label: value }))} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="vehicleLength" label="车长"><Select allowClear options={vehicleLengths.map((value) => ({ value, label: value }))} /></Form.Item></Col>
            <Col span={8}><Form.Item name="axle" label="车轴"><Select allowClear options={axles.map((value) => ({ value, label: value }))} /></Form.Item></Col>
            <Col span={8}><Form.Item name="brandModel" label="品牌型号"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="roadTransportCertNo" label="道运证号"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="experienceLicenseNo" label="经验许可证号"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="inspectionValidUntil" label="车辆检验有效期"><Input type="date" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="operationCertReviewDate" label="营运证年审日期"><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="mandatoryScrapDate" label="强制报废日期"><Input type="date" /></Form.Item></Col>
          </Row>
          <Divider />
          <Row gutter={12}>
            <Col span={8}><Form.Item name="drivingLicenseUploads" label="行驶证" valuePropName="fileList" getValueFromEvent={fileListValue}><Upload beforeUpload={() => false} multiple><Button icon={<UploadOutlined />}>上传</Button></Upload></Form.Item></Col>
            <Col span={8}><Form.Item name="vehiclePhotoUploads" label="车辆照片" valuePropName="fileList" getValueFromEvent={fileListValue}><Upload beforeUpload={() => false} multiple><Button icon={<UploadOutlined />}>上传</Button></Upload></Form.Item></Col>
            <Col span={8}><Form.Item name="otherUploads" label="其他文件" valuePropName="fileList" getValueFromEvent={fileListValue}><Upload beforeUpload={() => false} multiple><Button icon={<UploadOutlined />}>上传</Button></Upload></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title={editingDriver ? '修改司机' : '新增司机'} open={driverOpen} onCancel={() => setDriverOpen(false)} onOk={() => driverForm.submit()} width={900} okText="保存">
        <Form form={driverForm} layout="vertical" onFinish={(values) => void saveDriver(values)}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="name" label="司机名称" rules={[{ required: true, message: '请输入司机名称' }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="phone" label="司机电话"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="idCardNo" label="身份证号"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="payee" label="收款人"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="bankPhone" label="开户手机"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="bankCardNo" label="银行卡号"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="bankName" label="开户行"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="notes" label="备注"><Input.TextArea rows={3} /></Form.Item>
          <Divider />
          <Row gutter={12}>
            <Col span={8}><Form.Item name="idFrontUploads" label="身份证正面" valuePropName="fileList" getValueFromEvent={fileListValue}><Upload beforeUpload={() => false}><Button icon={<UploadOutlined />}>上传</Button></Upload></Form.Item></Col>
            <Col span={8}><Form.Item name="idBackUploads" label="身份证反面" valuePropName="fileList" getValueFromEvent={fileListValue}><Upload beforeUpload={() => false}><Button icon={<UploadOutlined />}>上传</Button></Upload></Form.Item></Col>
            <Col span={8}><Form.Item name="driverLicenseUploads" label="驾驶证" valuePropName="fileList" getValueFromEvent={fileListValue}><Upload beforeUpload={() => false}><Button icon={<UploadOutlined />}>上传</Button></Upload></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="insuranceUploads" label="保险" valuePropName="fileList" getValueFromEvent={fileListValue}><Upload beforeUpload={() => false}><Button icon={<UploadOutlined />}>上传</Button></Upload></Form.Item></Col>
            <Col span={12}><Form.Item name="internationalRoadPermitUploads" label="国际道路运证" valuePropName="fileList" getValueFromEvent={fileListValue}><Upload beforeUpload={() => false}><Button icon={<UploadOutlined />}>上传</Button></Upload></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
