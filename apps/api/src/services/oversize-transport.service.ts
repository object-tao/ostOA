import { Injectable, NotFoundException } from '@nestjs/common';
import { OversizePermitMode, OversizeReviewStatus, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildCode } from '../common/utils/business';
import { buildPagedResult } from '../common/utils/pagination';
import {
  CreateOversizeCountryRuleDto,
  CreateOversizeQuoteDto,
  SimulateLoadPlanDto,
  SimulateOversizeQuoteDto,
} from '../dto/oversize-transport.dto';
import { PrismaService } from '../prisma/prisma.service';

type FeeBreakdownItem = {
  key: string;
  label: string;
  amount: number;
  formula: string;
  manualOnly?: boolean;
};

type VehicleTemplate = {
  code: string;
  category: string;
  name: string;
  lines: number;
  axles: number;
  effectiveLengthM: number;
  effectiveWidthM: number;
  maxLoadKg: number;
  maxHeightM: number;
  maxCargoLengthM: number;
  maxCargoWidthM: number;
  maxCargoHeightM: number;
  scenarios: string[];
};

const VEHICLE_TEMPLATES: VehicleTemplate[] = [
  { code: 'DTD-5X5', category: '大通道', name: '普通平板车', lines: 5, axles: 5, effectiveLengthM: 13.5, effectiveWidthM: 2.4, maxLoadKg: 22000, maxHeightM: 3.0, maxCargoLengthM: 13.8, maxCargoWidthM: 3.6, maxCargoHeightM: 3.8, scenarios: ['普货', '设备'] },
  { code: 'DTD-6X6', category: '大通道', name: '普通平板车', lines: 6, axles: 6, effectiveLengthM: 13.5, effectiveWidthM: 2.4, maxLoadKg: 27000, maxHeightM: 3.0, maxCargoLengthM: 13.8, maxCargoWidthM: 3.8, maxCargoHeightM: 3.8, scenarios: ['普货', '设备'] },
  { code: 'DTD-7X7', category: '大通道', name: '二节车', lines: 7, axles: 7, effectiveLengthM: 12.5, effectiveWidthM: 3.0, maxLoadKg: 34000, maxHeightM: 3.2, maxCargoLengthM: 13.2, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: ['大件', '通道项目'] },
  { code: 'DTD-8X8', category: '大通道', name: '二节车', lines: 8, axles: 8, effectiveLengthM: 12.5, effectiveWidthM: 3.0, maxLoadKg: 40000, maxHeightM: 3.2, maxCargoLengthM: 13.2, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: ['大件', '通道项目'] },
  { code: 'PCB-5X5', category: '普通平板车', name: '13.6米平板', lines: 5, axles: 5, effectiveLengthM: 13.6, effectiveWidthM: 2.4, maxLoadKg: 22000, maxHeightM: 2.8, maxCargoLengthM: 13.6, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: ['钢材', '箱货', '超限设备'] },
  { code: 'PCB-6X6', category: '普通平板车', name: '13.6米平板', lines: 6, axles: 6, effectiveLengthM: 13.6, effectiveWidthM: 2.4, maxLoadKg: 28000, maxHeightM: 2.8, maxCargoLengthM: 13.8, maxCargoWidthM: 4.0, maxCargoHeightM: 4.0, scenarios: ['钢材', '箱货', '超限设备'] },
  { code: 'LZC-5X5', category: '冷藏车', name: '冷藏车', lines: 5, axles: 5, effectiveLengthM: 13.5, effectiveWidthM: 2.35, maxLoadKg: 21500, maxHeightM: 2.6, maxCargoLengthM: 13.5, maxCargoWidthM: 2.35, maxCargoHeightM: 2.6, scenarios: ['温控货物'] },
  { code: 'TXC-5X5', category: '特种板', name: '17米特种板', lines: 5, axles: 5, effectiveLengthM: 16.5, effectiveWidthM: 2.8, maxLoadKg: 22000, maxHeightM: 3.2, maxCargoLengthM: 19.5, maxCargoWidthM: 4.2, maxCargoHeightM: 4.0, scenarios: ['长大件'] },
  { code: 'TXC-6X6', category: '特种板', name: '17米特种板', lines: 6, axles: 6, effectiveLengthM: 16.5, effectiveWidthM: 2.8, maxLoadKg: 28000, maxHeightM: 3.2, maxCargoLengthM: 19.5, maxCargoWidthM: 4.2, maxCargoHeightM: 4.0, scenarios: ['长大件'] },
  { code: 'TXC-7X7', category: '特种板', name: '17米特种板', lines: 7, axles: 7, effectiveLengthM: 16.5, effectiveWidthM: 2.8, maxLoadKg: 34000, maxHeightM: 3.2, maxCargoLengthM: 19.5, maxCargoWidthM: 4.2, maxCargoHeightM: 4.0, scenarios: ['长大件'] },
  { code: 'CLR-1X1', category: '超限车', name: '抽拉板', lines: 1, axles: 1, effectiveLengthM: 28, effectiveWidthM: 3.0, maxLoadKg: 26000, maxHeightM: 3.5, maxCargoLengthM: 28.5, maxCargoWidthM: 4.2, maxCargoHeightM: 4.0, scenarios: ['超长件'] },
  { code: 'CLB-1X1', category: '超限车', name: '超低板', lines: 1, axles: 1, effectiveLengthM: 16, effectiveWidthM: 3.2, maxLoadKg: 32000, maxHeightM: 3.8, maxCargoLengthM: 16.5, maxCargoWidthM: 4.2, maxCargoHeightM: 4.5, scenarios: ['超高件', '设备'] },
  { code: 'TTB-1X1', category: '超限车', name: '塔筒板', lines: 1, axles: 1, effectiveLengthM: 28, effectiveWidthM: 3.2, maxLoadKg: 36000, maxHeightM: 4.2, maxCargoLengthM: 28.5, maxCargoWidthM: 4.5, maxCargoHeightM: 4.8, scenarios: ['塔筒'] },
  { code: 'YPB-1X1', category: '超限车', name: '叶片板', lines: 1, axles: 1, effectiveLengthM: 70, effectiveWidthM: 3.4, maxLoadKg: 22000, maxHeightM: 4.5, maxCargoLengthM: 70, maxCargoWidthM: 4.6, maxCargoHeightM: 4.8, scenarios: ['风电叶片'] },
  { code: 'ZXC-1X2', category: '超限车', name: '轴线车', lines: 1, axles: 2, effectiveLengthM: 13.6, effectiveWidthM: 3.4, maxLoadKg: 100000, maxHeightM: 4.5, maxCargoLengthM: 16, maxCargoWidthM: 5.0, maxCargoHeightM: 5.0, scenarios: ['超重设备'] },
  { code: 'PJB-1X2', category: '超限车', name: '拼接板', lines: 1, axles: 2, effectiveLengthM: 30, effectiveWidthM: 3.4, maxLoadKg: 40000, maxHeightM: 4.0, maxCargoLengthM: 30, maxCargoWidthM: 5.0, maxCargoHeightM: 4.8, scenarios: ['超宽件', '异形件'] },
];

@Injectable()
export class OversizeTransportService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [rules, quotes] = await Promise.all([
      this.prisma.oversizeCountryRule.findMany({ include: { feeRules: true }, orderBy: { countryCode: 'asc' } }),
      this.prisma.oversizeQuote.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);

    const manualReviewCount = quotes.filter((item) => item.reviewStatus === OversizeReviewStatus.MANUAL_REVIEW).length;
    const totalCost = quotes.reduce((sum, item) => sum + item.totalCost, 0);

    return {
      metrics: [
        { label: '国家规则数', value: rules.length },
        { label: '报价单数', value: quotes.length },
        { label: '人工审核单', value: manualReviewCount },
        { label: '累计试算成本', value: Number(totalCost.toFixed(2)) },
      ],
      countries: rules.map((rule) => ({
        id: rule.id,
        countryCode: rule.countryCode,
        countryName: rule.countryName,
        permitMode: rule.permitMode,
        currency: rule.currency,
        feeRuleCount: rule.feeRules.length,
        maxTotalWeight: rule.maxTotalWeight,
        maxSize: `${rule.maxLength} x ${rule.maxWidth} x ${rule.maxHeight} m`,
        manualReviewThreshold: {
          weight: rule.manualReviewWeight,
          width: rule.manualReviewWidth,
          height: rule.manualReviewHeight,
        },
      })),
      recentQuotes: quotes.map((quote) => ({
        id: quote.id,
        quoteNo: quote.quoteNo,
        countryName: quote.countryName,
        route: `${quote.originPlace} -> ${quote.destinationPlace}`,
        cargoName: quote.cargoName,
        totalCost: quote.totalCost,
        quotedPrice: quote.quotedPrice,
        currency: quote.currency,
        reviewStatus: quote.reviewStatus,
        requiresPermit: quote.requiresPermit,
        requiresEscort: quote.requiresEscort,
        createdAt: quote.createdAt,
      })),
    };
  }

  async getCountryRules() {
    const rules = await this.prisma.oversizeCountryRule.findMany({
      include: { feeRules: true },
      orderBy: { countryCode: 'asc' },
    });

    return rules.map((rule) => ({
      ...rule,
      riskHints: this.parseJsonArray(rule.riskHints),
      feeRules: rule.feeRules.sort((a, b) => a.feeType.localeCompare(b.feeType)),
    }));
  }

  async createCountryRule(dto: CreateOversizeCountryRuleDto) {
    return this.prisma.oversizeCountryRule.create({
      data: {
        countryCode: dto.countryCode.toUpperCase(),
        countryName: dto.countryName,
        permitMode: dto.permitMode as OversizePermitMode,
        maxTotalWeight: dto.maxTotalWeight,
        maxAxleWeight: dto.maxAxleWeight,
        maxLength: dto.maxLength,
        maxWidth: dto.maxWidth,
        maxHeight: dto.maxHeight,
        manualReviewWeight: dto.manualReviewWeight,
        manualReviewWidth: dto.manualReviewWidth,
        manualReviewHeight: dto.manualReviewHeight,
        escortWidth: dto.escortWidth,
        escortWeight: dto.escortWeight,
        permitLeadDays: dto.permitLeadDays,
        currency: dto.currency ?? 'USD',
        riskHints: JSON.stringify(dto.riskHints ?? []),
      },
    });
  }

  async simulate(dto: SimulateOversizeQuoteDto) {
    const rule = await this.prisma.oversizeCountryRule.findUnique({
      where: { countryCode: dto.countryCode.toUpperCase() },
      include: { feeRules: true },
    });

    if (!rule) {
      throw new NotFoundException(`Country rule not found: ${dto.countryCode}`);
    }

    return this.buildSimulation(rule, dto);
  }

  async createQuote(dto: CreateOversizeQuoteDto) {
    const rule = await this.prisma.oversizeCountryRule.findUnique({
      where: { countryCode: dto.countryCode.toUpperCase() },
      include: { feeRules: true },
    });

    if (!rule) {
      throw new NotFoundException(`Country rule not found: ${dto.countryCode}`);
    }

    const simulation = this.buildSimulation(rule, dto);
    const quotedPrice = dto.quotedPrice ?? simulation.suggestedPrice;

    return this.prisma.oversizeQuote.create({
      data: {
        quoteNo: buildCode('OVQ'),
        inquiryId: dto.inquiryId,
        projectId: dto.projectId,
        countryRuleId: rule.id,
        countryCode: rule.countryCode,
        countryName: rule.countryName,
        originPlace: dto.originPlace,
        destinationPlace: dto.destinationPlace,
        routeDistanceKm: dto.routeDistanceKm,
        vehicleType: dto.vehicleType,
        axleCount: dto.axleCount,
        axleWeightDistribution: JSON.stringify(dto.axleLoads),
        cargoName: dto.cargoName,
        cargoWeight: dto.cargoWeight,
        cargoLength: dto.cargoLength,
        cargoWidth: dto.cargoWidth,
        cargoHeight: dto.cargoHeight,
        isIndivisible: dto.isIndivisible,
        oversizeFlags: JSON.stringify(simulation.oversizeFlags),
        riskFlags: JSON.stringify(simulation.riskFlags),
        requiresPermit: simulation.requiresPermit,
        requiresEscort: simulation.requiresEscort,
        reviewStatus: simulation.reviewStatus,
        costBreakdown: JSON.stringify(simulation.costBreakdown),
        totalCost: simulation.totalCost,
        quotedPrice,
        currency: rule.currency,
        permitLeadDays: rule.permitLeadDays,
        remark: dto.remark,
        createdBy: 'admin',
      },
    });
  }

  async findQuotes(query: PaginationQueryDto) {
    const where: Prisma.OversizeQuoteWhereInput = {
      countryName: query.keyword ? { contains: query.keyword } : undefined,
      reviewStatus: query.status ? (query.status as OversizeReviewStatus) : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.oversizeQuote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.oversizeQuote.count({ where }),
    ]);

    return buildPagedResult(
      items.map((item) => ({
        ...item,
        oversizeFlags: this.parseJsonArray(item.oversizeFlags),
        riskFlags: this.parseJsonArray(item.riskFlags),
        costBreakdown: this.parseJsonArray(item.costBreakdown),
        axleWeightDistribution: this.parseJsonArray(item.axleWeightDistribution),
      })),
      total,
      query.page,
      query.pageSize,
    );
  }

  async findQuote(id: string) {
    const item = await this.prisma.oversizeQuote.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Oversize quote not found');
    }

    return {
      ...item,
      oversizeFlags: this.parseJsonArray(item.oversizeFlags),
      riskFlags: this.parseJsonArray(item.riskFlags),
      costBreakdown: this.parseJsonArray(item.costBreakdown),
      axleWeightDistribution: this.parseJsonArray(item.axleWeightDistribution),
    };
  }

  getVehicleTemplates() {
    return VEHICLE_TEMPLATES;
  }

  simulateLoadPlan(dto: SimulateLoadPlanDto) {
    const expandedItems = dto.items.flatMap((item) =>
      Array.from({ length: item.quantity }).map((_, index) => ({
        boxNo: `${item.boxNo}-${index + 1}`,
        name: item.name,
        lengthM: Number((item.lengthMm / 1000).toFixed(3)),
        widthM: Number((item.widthMm / 1000).toFixed(3)),
        heightM: Number((item.heightMm / 1000).toFixed(3)),
        weightKg: item.weightKg,
        allowRotate: item.allowRotate,
        allowStack: item.allowStack,
        remark: item.remark,
      })),
    );

    const totalWeightKg = expandedItems.reduce((sum, item) => sum + item.weightKg, 0);
    const totalVolumeM3 = Number(
      expandedItems.reduce((sum, item) => sum + item.lengthM * item.widthM * item.heightM, 0).toFixed(3),
    );

    const candidates = VEHICLE_TEMPLATES
      .map((template) => this.buildVehiclePlan(template, expandedItems, totalWeightKg, totalVolumeM3))
      .sort((a, b) => a.score - b.score);

    return {
      summary: {
        totalBoxes: expandedItems.length,
        totalWeightKg,
        totalVolumeM3,
      },
      recommended: candidates.slice(0, 5),
      rejected: candidates.filter((item) => !item.feasible).slice(0, 5),
    };
  }

  private buildSimulation(
    rule: {
      id: string;
      countryCode: string;
      countryName: string;
      currency: string;
      permitMode: OversizePermitMode;
      maxTotalWeight: number;
      maxAxleWeight: number;
      maxLength: number;
      maxWidth: number;
      maxHeight: number;
      manualReviewWeight: number;
      manualReviewWidth: number;
      manualReviewHeight: number;
      escortWidth: number | null;
      escortWeight: number | null;
      permitLeadDays: number;
      riskHints: string;
      feeRules: Array<{
        feeType: string;
        basis: string;
        rate: number;
        minimumCharge: number | null;
        manualOnly: boolean;
      }>;
    },
    dto: SimulateOversizeQuoteDto,
  ) {
    const oversizeFlags: string[] = [];
    const riskFlags = this.parseJsonArray(rule.riskHints);
    const maxAxleLoad = dto.axleLoads.reduce((max, item) => Math.max(max, item.weight), 0);

    if (dto.cargoWeight > rule.maxTotalWeight) {
      oversizeFlags.push('超重');
    }
    if (maxAxleLoad > rule.maxAxleWeight) {
      oversizeFlags.push('超轴');
    }
    if (dto.cargoLength > rule.maxLength) {
      oversizeFlags.push('超长');
    }
    if (dto.cargoWidth > rule.maxWidth) {
      oversizeFlags.push('超宽');
    }
    if (dto.cargoHeight > rule.maxHeight) {
      oversizeFlags.push('超高');
    }
    if (!dto.isIndivisible && oversizeFlags.length > 0) {
      riskFlags.push('货物可拆分，需确认是否允许按超限方案申报');
    }

    const requiresPermit = oversizeFlags.length > 0;
    const requiresEscort =
      (rule.escortWidth !== null && dto.cargoWidth > rule.escortWidth) ||
      (rule.escortWeight !== null && dto.cargoWeight > rule.escortWeight);

    const manualReviewReasons: string[] = [];
    if (dto.cargoWeight > rule.manualReviewWeight) {
      manualReviewReasons.push(`总重超过 ${rule.manualReviewWeight} 吨`);
    }
    if (dto.cargoWidth > rule.manualReviewWidth) {
      manualReviewReasons.push(`宽度超过 ${rule.manualReviewWidth} 米`);
    }
    if (dto.cargoHeight > rule.manualReviewHeight) {
      manualReviewReasons.push(`高度超过 ${rule.manualReviewHeight} 米`);
    }
    if (rule.permitMode === OversizePermitMode.MANUAL) {
      manualReviewReasons.push('该国家以人工许可审批为主');
    }

    if (requiresEscort) {
      riskFlags.push('需安排引导/护送车辆');
    }
    if (requiresPermit) {
      riskFlags.push(`预计许可办理周期 ${rule.permitLeadDays} 天`);
    }
    if (manualReviewReasons.length > 0) {
      riskFlags.push(...manualReviewReasons.map((reason) => `人工审核: ${reason}`));
    }

    const computedBreakdown = this.calculateFees(rule, dto, requiresPermit, requiresEscort, oversizeFlags, maxAxleLoad);
    const totalCost = computedBreakdown.reduce((sum, item) => sum + item.amount, 0);
    const markupRate = dto.quoteMarkupRate ?? 0.12;
    const suggestedPrice = Number((totalCost * (1 + markupRate)).toFixed(2));

    return {
      countryCode: rule.countryCode,
      countryName: rule.countryName,
      permitMode: rule.permitMode,
      currency: rule.currency,
      oversizeFlags,
      riskFlags,
      requiresPermit,
      requiresEscort,
      reviewStatus:
        manualReviewReasons.length > 0 ? OversizeReviewStatus.MANUAL_REVIEW : OversizeReviewStatus.AUTO_APPROVED,
      permitLeadDays: rule.permitLeadDays,
      maxAxleLoad,
      costBreakdown: computedBreakdown,
      totalCost: Number(totalCost.toFixed(2)),
      suggestedPrice,
      markupRate,
      routeSummary: `${dto.originPlace} -> ${dto.destinationPlace}`,
      reviewAdvice:
        manualReviewReasons.length > 0 ? `建议人工审核: ${manualReviewReasons.join('；')}` : '满足自动试算条件',
    };
  }

  private calculateFees(
    rule: {
      feeRules: Array<{
        feeType: string;
        basis: string;
        rate: number;
        minimumCharge: number | null;
        manualOnly: boolean;
      }>;
    },
    dto: SimulateOversizeQuoteDto,
    requiresPermit: boolean,
    requiresEscort: boolean,
    oversizeFlags: string[],
    maxAxleLoad: number,
  ) {
    return rule.feeRules
      .filter((feeRule) => {
        if (feeRule.feeType === 'permit' && !requiresPermit) {
          return false;
        }
        if (feeRule.feeType === 'escort' && !requiresEscort) {
          return false;
        }
        if (feeRule.feeType === 'weight' && !oversizeFlags.includes('超重')) {
          return false;
        }
        if (feeRule.feeType === 'axle' && !oversizeFlags.includes('超轴')) {
          return false;
        }
        if (feeRule.feeType === 'size' && !oversizeFlags.some((flag) => ['超长', '超宽', '超高'].includes(flag))) {
          return false;
        }
        return true;
      })
      .map((feeRule) => {
        const basisValue = this.resolveBasisValue(feeRule.basis, dto, maxAxleLoad);
        const rawAmount = basisValue * feeRule.rate;
        const amount = Math.max(rawAmount, feeRule.minimumCharge ?? 0);

        return {
          key: feeRule.feeType,
          label: this.resolveFeeLabel(feeRule.feeType),
          amount: Number(amount.toFixed(2)),
          formula: `${basisValue.toFixed(2)} x ${feeRule.rate}`,
          manualOnly: feeRule.manualOnly,
        } satisfies FeeBreakdownItem;
      });
  }

  private resolveBasisValue(basis: string, dto: SimulateOversizeQuoteDto, maxAxleLoad: number) {
    switch (basis) {
      case 'distance_km':
        return dto.routeDistanceKm;
      case 'cargo_weight':
        return dto.cargoWeight;
      case 'max_axle_weight':
        return maxAxleLoad;
      case 'excess_weight':
        return Math.max(dto.cargoWeight - 40, 0);
      case 'excess_axle_weight':
        return Math.max(maxAxleLoad - 10, 0);
      case 'max_dimension':
        return Math.max(dto.cargoLength, dto.cargoWidth, dto.cargoHeight);
      case 'oversize_dimension_sum':
        return dto.cargoLength + dto.cargoWidth + dto.cargoHeight;
      case 'flat':
      default:
        return 1;
    }
  }

  private resolveFeeLabel(feeType: string) {
    switch (feeType) {
      case 'permit':
        return '许可费';
      case 'route':
        return '路线协调费';
      case 'weight':
        return '超重费';
      case 'axle':
        return '轴荷费';
      case 'size':
        return '尺寸费';
      case 'escort':
        return '护送费';
      case 'damage':
        return '道路损害费';
      case 'special':
        return '特殊费用';
      default:
        return feeType;
    }
  }

  private parseJsonArray(value: string) {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }

  private buildVehiclePlan(
    template: VehicleTemplate,
    expandedItems: Array<{
      boxNo: string;
      name: string;
      lengthM: number;
      widthM: number;
      heightM: number;
      weightKg: number;
      allowRotate: boolean;
      allowStack: boolean;
    }>,
    totalWeightKg: number,
    totalVolumeM3: number,
  ) {
    const warnings: string[] = [];
    const unfittedItems: string[] = [];
    const deckArea = template.effectiveLengthM * template.effectiveWidthM;
    let totalFootprintArea = 0;

    for (const item of expandedItems) {
      const orientations = item.allowRotate
        ? [
            { length: item.lengthM, width: item.widthM },
            { length: item.widthM, width: item.lengthM },
          ]
        : [{ length: item.lengthM, width: item.widthM }];

      const fit = orientations.find(
        (option) =>
          option.length <= template.maxCargoLengthM &&
          option.width <= template.maxCargoWidthM &&
          item.heightM <= template.maxCargoHeightM,
      );

      if (!fit) {
        unfittedItems.push(item.boxNo);
        continue;
      }

      if (fit.length > template.effectiveLengthM) {
        warnings.push(`${item.boxNo} 存在车尾伸出风险`);
      }
      if (fit.width > template.effectiveWidthM) {
        warnings.push(`${item.boxNo} 存在侧向超宽风险`);
      }
      if (item.heightM > template.maxHeightM) {
        warnings.push(`${item.boxNo} 存在装车后超高风险`);
      }
      if (
        fit.length > template.effectiveLengthM ||
        fit.width > template.effectiveWidthM ||
        item.heightM > template.maxHeightM
      ) {
        warnings.push(`${item.boxNo} 需按超限运输方案绑扎和申报`);
      }

      const stackFactor = item.allowStack && item.heightM * 2 <= template.maxHeightM ? 2 : 1;
      const supportLength = Math.min(fit.length, template.effectiveLengthM);
      const supportWidth = Math.min(fit.width, template.effectiveWidthM);
      totalFootprintArea += (supportLength * supportWidth) / stackFactor;
    }

    const weightVehicles = Math.max(1, Math.ceil(totalWeightKg / template.maxLoadKg));
    const areaVehicles = Math.max(1, Math.ceil(totalFootprintArea / deckArea));
    const vehicleCount = Math.max(weightVehicles, areaVehicles);
    const weightUtilization = Number(((totalWeightKg / (vehicleCount * template.maxLoadKg)) * 100).toFixed(2));
    const spaceUtilization = Number(((totalFootprintArea / (vehicleCount * deckArea)) * 100).toFixed(2));
    const feasible = unfittedItems.length === 0;

    if (weightUtilization > 100) {
      warnings.push('重量超出额定载重');
    }
    if (spaceUtilization > 100) {
      warnings.push('占板面积超出有效板面');
    }
    if (totalVolumeM3 > vehicleCount * deckArea * template.maxHeightM) {
      warnings.push('总体积超过经验可装载体积');
    }

    const fittedLength = this.getFittedLength(expandedItems, template);
    const fittedWidth = this.getFittedWidth(expandedItems, template);
    const maxHeightNeeded = this.getMaxItemHeight(expandedItems);
    const capacitySlackScore =
      Math.max(0, template.maxCargoLengthM - fittedLength) * 12 +
      Math.max(0, template.maxCargoWidthM - fittedWidth) * 24 +
      Math.max(0, template.maxCargoHeightM - maxHeightNeeded) * 10 +
      Math.max(0, (template.maxLoadKg - totalWeightKg) / 1000) * 6;
    const unnecessaryLargeVehiclePenalty =
      template.category === '普通平板车' &&
      template.effectiveLengthM > 13.6 &&
      fittedLength <= 13.6 &&
      totalWeightKg <= 22000
        ? 120
        : 0;
    const avoidOversizeSpecialBoardPenalty =
      template.category === '超限车' &&
      fittedLength <= 19.5 &&
      fittedWidth <= 2.8 &&
      maxHeightNeeded <= 4 &&
      totalWeightKg <= 22000
        ? 150
        : 0;

    const score = feasible
      ? vehicleCount * 100 +
        this.getVehicleCategoryPenalty(template.category) +
        Math.abs(85 - weightUtilization) * 0.5 +
        Math.abs(70 - spaceUtilization) * 0.5 +
        capacitySlackScore +
        unnecessaryLargeVehiclePenalty +
        avoidOversizeSpecialBoardPenalty
      : 9999;

    return {
      vehicle: template,
      feasible,
      vehicleCount,
      totalFootprintArea: Number(totalFootprintArea.toFixed(3)),
      deckArea: Number(deckArea.toFixed(3)),
      weightUtilization,
      spaceUtilization,
      score: Number(score.toFixed(2)),
      warnings: Array.from(new Set(warnings)),
      unfittedItems,
    };
  }

  private getVehicleCategoryPenalty(category: string) {
    const penaltyMap: Record<string, number> = {
      '鏅€氬钩鏉胯溅': 0,
      '澶ч€氶亾': 8,
      '鐗圭鏉?': 18,
      '瓒呴檺杞?': 35,
      '鍐疯棌杞?': 45,
    };

    return penaltyMap[category] ?? 20;
  }

  private getFittedLength(expandedItems: Array<{ lengthM: number; widthM: number; allowRotate: boolean }>, template: VehicleTemplate) {
    return expandedItems.reduce((max, item) => {
      const lengths = item.allowRotate ? [item.lengthM, item.widthM] : [item.lengthM];
      const fitted = lengths.find((length) => length <= template.maxCargoLengthM);
      return Math.max(max, fitted ?? item.lengthM);
    }, 0);
  }

  private getFittedWidth(expandedItems: Array<{ lengthM: number; widthM: number; allowRotate: boolean }>, template: VehicleTemplate) {
    return expandedItems.reduce((max, item) => {
      const widths = item.allowRotate ? [item.widthM, item.lengthM] : [item.widthM];
      const fitted = widths.find((width) => width <= template.maxCargoWidthM);
      return Math.max(max, fitted ?? item.widthM);
    }, 0);
  }

  private getMaxItemHeight(expandedItems: Array<{ heightM: number }>) {
    return expandedItems.reduce((max, item) => Math.max(max, item.heightM), 0);
  }
}
