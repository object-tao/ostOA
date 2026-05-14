import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildCode } from '../common/utils/business';
import { buildPagedResult } from '../common/utils/pagination';
import { toNumber } from '../common/utils/serializers';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        projectNo: buildCode('PRJ'),
        projectName: dto.projectName,
        customerId: dto.customerId,
        inquiryId: dto.inquiryId,
        businessType: dto.businessType,
        originPlace: dto.originPlace,
        destinationPlace: dto.destinationPlace,
        contractAmount: dto.contractAmount ?? 0,
        contractCurrency: dto.contractCurrency ?? 'CNY',
        estimatedCost: dto.estimatedCost ?? 0,
        plannedVehicleCount: dto.plannedVehicleCount ?? 0,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        projectStatus: (dto.projectStatus as never) ?? 'DRAFT',
        remark: dto.remark,
        createdBy: 'admin',
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const where: Prisma.ProjectWhereInput = {
      projectStatus: query.status ? (query.status as never) : undefined,
      OR: query.keyword
        ? [
            { projectNo: { contains: query.keyword } },
            { projectName: { contains: query.keyword } },
            { customer: { customerName: { contains: query.keyword } } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          customer: true,
          batches: true,
          vehicleOrders: true,
          abnormalEvents: { where: { abnormalStatus: { in: ['OPEN', 'PROCESSING'] } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.project.count({ where }),
    ]);

    return buildPagedResult(
      items.map((item) => ({
        ...item,
        contractAmount: toNumber(item.contractAmount),
        estimatedCost: toNumber(item.estimatedCost),
        actualCost: toNumber(item.actualCost),
        grossProfit: toNumber(item.grossProfit),
        abnormalCount: item.abnormalEvents.length,
      })),
      total,
      query.page,
      query.pageSize,
    );
  }

  async findOne(id: string) {
    const item = await this.prisma.project.findUnique({
      where: { id },
      include: {
        customer: true,
        inquiry: true,
        batches: { orderBy: { sequenceNo: 'asc' } },
        vehicleOrders: {
          include: {
            vehicle: true,
            driver: true,
            trackingNodes: { orderBy: { nodeTime: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
        abnormalEvents: { orderBy: { reportTime: 'desc' } },
        incomes: true,
        costs: true,
        receiptPayments: true,
      },
    });

    if (!item) {
      throw new NotFoundException('项目不存在');
    }

    return item;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        projectName: dto.projectName,
        customerId: dto.customerId,
        inquiryId: dto.inquiryId,
        businessType: dto.businessType,
        originPlace: dto.originPlace,
        destinationPlace: dto.destinationPlace,
        contractAmount: dto.contractAmount,
        contractCurrency: dto.contractCurrency,
        estimatedCost: dto.estimatedCost,
        plannedVehicleCount: dto.plannedVehicleCount,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        projectStatus: dto.projectStatus as never,
        remark: dto.remark,
      },
    });
  }

  async getDashboard(id: string) {
    const project = await this.findOne(id);
    const totalVehicles = project.vehicleOrders.length;
    const completedVehicles = project.vehicleOrders.filter((item) =>
      ['SIGNED', 'COMPLETED'].includes(item.currentStatus),
    ).length;

    return {
      projectId: project.id,
      projectNo: project.projectNo,
      projectName: project.projectName,
      progress: totalVehicles === 0 ? 0 : Number(((completedVehicles / totalVehicles) * 100).toFixed(2)),
      totalVehicles,
      completedVehicles,
      abnormalVehicles: project.vehicleOrders.filter((item) => item.isAbnormal).length,
      batches: project.batches.length,
    };
  }

  async getProfit(id: string) {
    const [incomes, costs] = await Promise.all([
      this.prisma.projectIncome.findMany({ where: { projectId: id } }),
      this.prisma.projectCost.findMany({ where: { projectId: id } }),
    ]);

    const totalIncome = incomes.reduce((sum, item) => sum + toNumber(item.amount), 0);
    const totalCost = costs.reduce((sum, item) => sum + toNumber(item.amount), 0);
    const grossProfit = totalIncome - totalCost;

    return {
      totalIncome,
      totalCost,
      grossProfit,
      grossProfitRate: totalIncome === 0 ? 0 : Number(((grossProfit / totalIncome) * 100).toFixed(2)),
    };
  }
}
