import {
  AbnormalStatus,
  BatchStatus,
  DriverStatus,
  OperatorType,
  OversizePermitMode,
  OversizeReviewStatus,
  OwnerType,
  PrismaClient,
  ProjectStatus,
  ReceiptPaymentType,
  SignStatus,
  TaskStatus,
  VehicleOrderStatus,
  VehicleStatus,
  WaybillStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.systemRole.upsert({
    where: { roleCode: 'ADMIN' },
    update: {},
    create: { roleCode: 'ADMIN', roleName: '系统管理员' },
  });

  const dispatcherRole = await prisma.systemRole.upsert({
    where: { roleCode: 'DISPATCHER' },
    update: {},
    create: { roleCode: 'DISPATCHER', roleName: '调度主管' },
  });

  await prisma.systemUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: 'admin123',
      realName: '系统管理员',
      roleId: adminRole.id,
    },
  });

  await prisma.systemUser.upsert({
    where: { username: 'dispatcher' },
    update: {},
    create: {
      username: 'dispatcher',
      passwordHash: 'dispatcher123',
      realName: '调度主管',
      roleId: dispatcherRole.id,
    },
  });

  const customer = await prisma.customer.upsert({
    where: { customerCode: 'CUS-001' },
    update: {},
    create: {
      customerCode: 'CUS-001',
      customerName: '华东重工',
      contactName: '李经理',
      contactPhone: '13800000001',
      country: '中国',
      address: '上海浦东新区',
      settlementType: '月结',
      creditDays: 30,
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { supplierCode: 'SUP-001' },
    update: {},
    create: {
      supplierCode: 'SUP-001',
      supplierName: '远程车队',
      contactName: '周队',
      contactPhone: '13900000001',
      country: '中国',
      supplierType: '车队',
      settlementType: '单结',
      supplierStatus: 'ACTIVE',
    },
  });

  const vehicle = await prisma.vehicleResource.upsert({
    where: { vehicleNo: '沪A-8899' },
    update: {},
    create: {
      vehicleNo: '沪A-8899',
      vehicleType: '17.5米平板',
      vehicleLength: 17.5,
      vehicleWidth: 3.2,
      maxLoadWeight: 80,
      ownerType: OwnerType.OUTSOURCED,
      supplierId: supplier.id,
      vehicleStatus: VehicleStatus.AVAILABLE,
      gpsDeviceNo: 'GPS-001',
    },
  });

  const driver = await prisma.driver.upsert({
    where: { driverPhone: '13700000001' },
    update: {},
    create: {
      driverName: '王师傅',
      driverPhone: '13700000001',
      licenseNo: 'LIC-001',
      nationality: '中国',
      supplierId: supplier.id,
      driverStatus: DriverStatus.AVAILABLE,
    },
  });

  const inquiry = await prisma.inquiry.upsert({
    where: { inquiryNo: 'INQ-20260324-001' },
    update: {},
    create: {
      inquiryNo: 'INQ-20260324-001',
      customerId: customer.id,
      cargoName: '风电设备',
      cargoDescription: '大型叶片与塔筒',
      requirementDescription: '需要跨境运输与关务协同',
      requirementAttachments: JSON.stringify(['requirements.pdf']),
      quoteAttachments: JSON.stringify(['quotation.pdf']),
      originPlace: '上海',
      destinationPlace: '阿拉木图',
      totalWeight: 120,
      totalVolume: 180,
      totalQuantity: 8,
      specialRequirement: '多车联运',
      inquiryStatus: 'QUOTED',
      quotedAmount: 680000,
      quoteCurrency: 'CNY',
    },
  });

  const project = await prisma.project.upsert({
    where: { projectNo: 'PRJ-20260324-001' },
    update: {},
    create: {
      projectNo: 'PRJ-20260324-001',
      projectName: '华东重工阿拉木图风电设备运输项目',
      customerId: customer.id,
      inquiryId: inquiry.id,
      businessType: '跨境大件运输',
      originPlace: '上海',
      destinationPlace: '阿拉木图',
      contractAmount: 680000,
      estimatedCost: 480000,
      actualCost: 310000,
      grossProfit: 370000,
      grossProfitRate: 54.41,
      plannedVehicleCount: 6,
      actualVehicleCount: 3,
      completedVehicleCount: 1,
      projectStatus: ProjectStatus.IN_PROGRESS,
      createdBy: 'admin',
    },
  });

  await prisma.inquiry.update({
    where: { id: inquiry.id },
    data: { convertedProjectId: project.id },
  });

  const batch = await prisma.shipmentBatch.upsert({
    where: { batchNo: 'BAT-20260324-001' },
    update: {},
    create: {
      batchNo: 'BAT-20260324-001',
      projectId: project.id,
      batchName: '第一批',
      sequenceNo: 1,
      plannedVehicleCount: 3,
      actualVehicleCount: 2,
      batchStatus: BatchStatus.IN_TRANSIT,
      createdBy: 'dispatcher',
    },
  });

  const vehicleOrder = await prisma.vehicleOrder.upsert({
    where: { vehicleOrderNo: 'VO-20260324-001' },
    update: {},
    create: {
      vehicleOrderNo: 'VO-20260324-001',
      projectId: project.id,
      batchId: batch.id,
      customerId: customer.id,
      vehicleId: vehicle.id,
      driverId: driver.id,
      supplierId: supplier.id,
      cargoName: '风电叶片',
      cargoDescription: '超长件',
      loadAddress: '上海临港设备厂',
      unloadAddress: '阿拉木图风场',
      customsPort: '霍尔果斯',
      destinationCountry: '哈萨克斯坦',
      currentNodeCode: 'EXITED_COUNTRY',
      currentStatus: VehicleOrderStatus.EXITED_COUNTRY,
      signStatus: SignStatus.UNSIGNED,
      createdBy: 'dispatcher',
    },
  });

  await prisma.trackingNode.createMany({
    data: [
      {
        vehicleOrderId: vehicleOrder.id,
        nodeCode: 'DISPATCHED',
        nodeName: '已派车',
        nodeStatus: 'DONE',
        nodeTime: new Date('2026-03-21T10:00:00.000Z'),
        locationText: '上海',
        operatorType: OperatorType.DISPATCHER,
      },
      {
        vehicleOrderId: vehicleOrder.id,
        nodeCode: 'EXITED_COUNTRY',
        nodeName: '已出境',
        nodeStatus: 'DONE',
        nodeTime: new Date('2026-03-24T03:20:00.000Z'),
        locationText: '霍尔果斯口岸',
        longitude: 80.4134,
        latitude: 44.2147,
        operatorType: OperatorType.SYSTEM,
      },
    ],
  });

  await prisma.dispatchRecord.upsert({
    where: { dispatchNo: 'DSP-20260324-001' },
    update: {},
    create: {
      dispatchNo: 'DSP-20260324-001',
      projectId: project.id,
      batchId: batch.id,
      vehicleOrderId: vehicleOrder.id,
      vehicleId: vehicle.id,
      driverId: driver.id,
      dispatcherId: 'dispatcher',
      dispatchTime: new Date('2026-03-21T10:00:00.000Z'),
      dispatchStatus: 'ASSIGNED',
      instructionText: '24小时内完成装货出厂',
    },
  });

  await prisma.abnormalEvent.upsert({
    where: { abnormalNo: 'ABN-20260324-001' },
    update: {},
    create: {
      abnormalNo: 'ABN-20260324-001',
      projectId: project.id,
      vehicleOrderId: vehicleOrder.id,
      abnormalType: '口岸排队',
      abnormalLevel: 'MEDIUM',
      abnormalStatus: AbnormalStatus.PROCESSING,
      description: '霍尔果斯口岸查验排队造成延误 6 小时',
      impactHours: 6,
      solutionText: '协调优先过关窗口并调整后续派送计划',
      locationText: '霍尔果斯口岸',
    },
  });

  await prisma.projectIncome.create({
    data: {
      projectId: project.id,
      incomeType: '合同收入',
      amount: 680000,
      currency: 'CNY',
    },
  });

  await prisma.projectCost.createMany({
    data: [
      {
        projectId: project.id,
        batchId: batch.id,
        vehicleOrderId: vehicleOrder.id,
        supplierId: supplier.id,
        costType: '运费',
        amount: 260000,
        currency: 'CNY',
      },
      {
        projectId: project.id,
        costType: '报关费',
        amount: 50000,
        currency: 'CNY',
      },
    ],
  });

  await prisma.receiptPayment.create({
    data: {
      projectId: project.id,
      relatedType: ReceiptPaymentType.RECEIVABLE,
      amount: 340000,
      currency: 'CNY',
      paymentStatus: 'PARTIAL',
      dueDate: new Date('2026-04-10T00:00:00.000Z'),
      payerPayeeName: '华东重工',
    },
  });

  const waybill = await prisma.waybill.upsert({
    where: { waybillNo: 'WB-20260331-001' },
    update: {},
    create: {
      waybillNo: 'WB-20260331-001',
      customerId: customer.id,
      projectId: project.id,
      cargoName: '风电主机',
      cargoDescription: '跨境公路运输主单',
      originPlace: '上海',
      destinationPlace: '阿拉木图',
      portName: '霍尔果斯',
      declarationNo: 'DEC-778812',
      cmrNo: 'CMR-001',
      cmrStatus: '已签发',
      status: WaybillStatus.DECLARING,
      remark: '关联阿拉木图一期项目',
      createdBy: 'dispatcher',
    },
  });

  await prisma.taskExecution.upsert({
    where: { taskNo: 'TASK-20260331-001' },
    update: {},
    create: {
      taskNo: 'TASK-20260331-001',
      waybillId: waybill.id,
      vehicleOrderId: vehicleOrder.id,
      taskType: '口岸转运',
      resourceName: supplier.supplierName,
      driverName: driver.driverName,
      routeText: '上海 -> 霍尔果斯 -> 阿拉木图',
      accessoriesSummary: '绑带 8 条，垫木 24 块',
      status: TaskStatus.RUNNING,
      remark: '口岸过关后立即安排末端配送',
      createdBy: 'dispatcher',
    },
  });

  await prisma.customsRecord.upsert({
    where: { recordNo: 'CUS-20260331-001' },
    update: {},
    create: {
      recordNo: 'CUS-20260331-001',
      waybillId: waybill.id,
      recordType: '报关',
      portName: '霍尔果斯',
      nodeName: '报关资料审核',
      status: '处理中',
      remark: '等待海关放行',
      createdBy: 'dispatcher',
    },
  });

  await prisma.approvalRequest.upsert({
    where: { approvalNo: 'APR-20260331-001' },
    update: {},
    create: {
      approvalNo: 'APR-20260331-001',
      approvalType: '付款申请审批',
      relatedNo: 'PAY-20260331-009',
      amount: 86000,
      applicantName: '李财务',
      approverName: '财务总监',
      status: 'PENDING',
      createdBy: '李财务',
    },
  });

  await prisma.approvalRequest.upsert({
    where: { approvalNo: 'APR-20260331-002' },
    update: {},
    create: {
      approvalNo: 'APR-20260331-002',
      approvalType: '费用调整审批',
      relatedNo: 'ADJ-20260331-003',
      amount: 5000,
      applicantName: '张运营',
      approverName: '部门主管',
      status: 'APPROVED',
      createdBy: '张运营',
    },
  });

  await prisma.portDirectory.upsert({
    where: { portCode: 'PORT-HGS' },
    update: {},
    create: {
      portCode: 'PORT-HGS',
      portName: '霍尔果斯',
      country: '中国 / 哈萨克斯坦',
      mode: '公路口岸',
    },
  });

  await prisma.portDirectory.upsert({
    where: { portCode: 'PORT-ALSK' },
    update: {},
    create: {
      portCode: 'PORT-ALSK',
      portName: '阿拉山口',
      country: '中国 / 哈萨克斯坦',
      mode: '铁路口岸',
    },
  });

  await prisma.operationLog.create({
    data: {
      moduleName: '审批中心',
      businessId: 'APR-20260331-001',
      actionType: 'CREATE',
      operatorId: 'dispatcher',
      operatorName: '李财务',
      afterData: JSON.stringify({ approvalNo: 'APR-20260331-001', status: 'PENDING' }),
    },
  });
  const existingRuleCount = await prisma.oversizeCountryRule.count();
  if (existingRuleCount === 0) {
    const uzRule = await prisma.oversizeCountryRule.create({
      data: {
        countryCode: 'UZ',
        countryName: '乌兹别克斯坦',
        permitMode: OversizePermitMode.AUTO,
        maxTotalWeight: 44,
        maxAxleWeight: 10,
        maxLength: 20,
        maxWidth: 2.55,
        maxHeight: 4,
        manualReviewWeight: 80,
        manualReviewWidth: 3.5,
        manualReviewHeight: 4.5,
        escortWidth: 3.8,
        escortWeight: 90,
        permitLeadDays: 4,
        currency: 'USD',
        riskHints: JSON.stringify(['桥梁通行限制', '需提前确认地方许可']),
      },
    });

    const kzRule = await prisma.oversizeCountryRule.create({
      data: {
        countryCode: 'KZ',
        countryName: '哈萨克斯坦',
        permitMode: OversizePermitMode.SEMI_AUTO,
        maxTotalWeight: 38,
        maxAxleWeight: 10,
        maxLength: 20,
        maxWidth: 2.55,
        maxHeight: 4,
        manualReviewWeight: 80,
        manualReviewWidth: 3.5,
        manualReviewHeight: 4.5,
        escortWidth: 3.6,
        escortWeight: 85,
        permitLeadDays: 6,
        currency: 'USD',
        riskHints: JSON.stringify(['边境换装资源紧张', '路线协调依赖地方路政']),
      },
    });

    const ruRule = await prisma.oversizeCountryRule.create({
      data: {
        countryCode: 'RU',
        countryName: '俄罗斯',
        permitMode: OversizePermitMode.MANUAL,
        maxTotalWeight: 44,
        maxAxleWeight: 10,
        maxLength: 20,
        maxWidth: 2.55,
        maxHeight: 4,
        manualReviewWeight: 80,
        manualReviewWidth: 3.5,
        manualReviewHeight: 4.5,
        escortWidth: 3.5,
        escortWeight: 80,
        permitLeadDays: 10,
        currency: 'USD',
        riskHints: JSON.stringify(['地方审批周期波动大', '需评估道路损害和警车护送']),
      },
    });

    await prisma.oversizeFeeRule.createMany({
      data: [
        { countryRuleId: uzRule.id, feeType: 'weight', basis: 'excess_weight', rate: 14, unit: 'ton', minimumCharge: 120 },
        { countryRuleId: uzRule.id, feeType: 'axle', basis: 'excess_axle_weight', rate: 90, unit: 'axle', minimumCharge: 80 },
        { countryRuleId: uzRule.id, feeType: 'size', basis: 'oversize_dimension_sum', rate: 22, unit: 'm', minimumCharge: 150 },
        { countryRuleId: uzRule.id, feeType: 'permit', basis: 'flat', rate: 220, unit: 'case', minimumCharge: 220 },
        { countryRuleId: kzRule.id, feeType: 'permit', basis: 'flat', rate: 260, unit: 'case', minimumCharge: 260 },
        { countryRuleId: kzRule.id, feeType: 'route', basis: 'distance_km', rate: 0.45, unit: 'km', minimumCharge: 300 },
        { countryRuleId: kzRule.id, feeType: 'weight', basis: 'cargo_weight', rate: 4.2, unit: 'ton', minimumCharge: 160 },
        { countryRuleId: kzRule.id, feeType: 'axle', basis: 'max_axle_weight', rate: 36, unit: 'ton', minimumCharge: 120 },
        { countryRuleId: kzRule.id, feeType: 'escort', basis: 'distance_km', rate: 0.28, unit: 'km', minimumCharge: 180 },
        { countryRuleId: ruRule.id, feeType: 'damage', basis: 'cargo_weight', rate: 7.8, unit: 'ton', minimumCharge: 300, manualOnly: true },
        { countryRuleId: ruRule.id, feeType: 'route', basis: 'distance_km', rate: 0.62, unit: 'km', minimumCharge: 360, manualOnly: true },
        { countryRuleId: ruRule.id, feeType: 'escort', basis: 'distance_km', rate: 0.35, unit: 'km', minimumCharge: 240, manualOnly: true },
        { countryRuleId: ruRule.id, feeType: 'special', basis: 'flat', rate: 500, unit: 'case', minimumCharge: 500, manualOnly: true },
      ],
    });

    await prisma.oversizeQuote.create({
      data: {
        quoteNo: 'OVQ-20260403-001',
        countryRuleId: uzRule.id,
        countryCode: 'UZ',
        countryName: '乌兹别克斯坦',
        originPlace: '霍尔果斯',
        destinationPlace: '塔什干',
        routeDistanceKm: 1250,
        vehicleType: '6轴液压板',
        axleCount: 6,
        axleWeightDistribution: JSON.stringify([
          { axleName: 'A1', weight: 11.5 },
          { axleName: 'A2', weight: 11.2 },
        ]),
        cargoName: '反应器筒体',
        cargoWeight: 72,
        cargoLength: 18,
        cargoWidth: 3.8,
        cargoHeight: 4.6,
        isIndivisible: true,
        oversizeFlags: JSON.stringify(['超重', '超轴', '超宽', '超高']),
        riskFlags: JSON.stringify(['桥梁通行限制', '需提前确认地方许可', '人工审核: 高度超过 4.5 米']),
        requiresPermit: true,
        requiresEscort: true,
        reviewStatus: OversizeReviewStatus.MANUAL_REVIEW,
        costBreakdown: JSON.stringify([
          { key: 'weight', label: '超重费', amount: 448, formula: '32.00 x 14' },
          { key: 'axle', label: '轴荷费', amount: 108, formula: '1.20 x 90' },
          { key: 'size', label: '尺寸费', amount: 580.8, formula: '26.40 x 22' },
          { key: 'permit', label: '许可费', amount: 220, formula: '1.00 x 220' },
        ]),
        totalCost: 1356.8,
        quotedPrice: 1519.62,
        currency: 'USD',
        permitLeadDays: 4,
        remark: '超高触发人工审核',
        createdBy: 'admin',
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
