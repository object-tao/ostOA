import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildPagedResult } from '../common/utils/pagination';
import { toNumber } from '../common/utils/serializers';
import { CreateProjectCostDto, CreateProjectIncomeDto, CreateReceiptPaymentDto } from '../dto/finance.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  createCost(dto: CreateProjectCostDto) {
    return this.prisma.projectCost.create({
      data: {
        projectId: dto.projectId,
        batchId: dto.batchId,
        vehicleOrderId: dto.vehicleOrderId,
        costType: dto.costType,
        supplierId: dto.supplierId,
        amount: dto.amount,
        currency: dto.currency ?? 'CNY',
        remark: dto.remark,
        createdBy: 'finance',
      },
    });
  }

  async getCosts(query: PaginationQueryDto) {
    const where = query.keyword
      ? {
          OR: [
            { costType: { contains: query.keyword, mode: 'insensitive' as const } },
            { project: { projectName: { contains: query.keyword, mode: 'insensitive' as const } } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      this.prisma.projectCost.findMany({
        where,
        include: { project: true, batch: true, vehicleOrder: true, supplier: true },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.projectCost.count({ where }),
    ]);

    return buildPagedResult(items, total, query.page, query.pageSize);
  }

  createIncome(dto: CreateProjectIncomeDto) {
    return this.prisma.projectIncome.create({
      data: {
        projectId: dto.projectId,
        incomeType: dto.incomeType,
        amount: dto.amount,
        currency: dto.currency ?? 'CNY',
        remark: dto.remark,
      },
    });
  }

  async getSummary(projectId: string) {
    const [project, incomes, costs, receipts] = await Promise.all([
      this.prisma.project.findUnique({ where: { id: projectId } }),
      this.prisma.projectIncome.findMany({ where: { projectId } }),
      this.prisma.projectCost.findMany({ where: { projectId } }),
      this.prisma.receiptPayment.findMany({ where: { projectId } }),
    ]);

    const totalIncome = incomes.reduce((sum, item) => sum + toNumber(item.amount), 0);
    const totalCost = costs.reduce((sum, item) => sum + toNumber(item.amount), 0);
    const receiptsAmount = receipts.reduce((sum, item) => sum + toNumber(item.amount), 0);

    return {
      project,
      totalIncome,
      totalCost,
      grossProfit: totalIncome - totalCost,
      receiptsAmount,
      incomes,
      costs,
      receipts,
    };
  }

  createReceiptPayment(dto: CreateReceiptPaymentDto) {
    return this.prisma.receiptPayment.create({
      data: {
        projectId: dto.projectId,
        relatedType: dto.relatedType as never,
        amount: dto.amount,
        currency: dto.currency ?? 'CNY',
        paymentStatus: dto.paymentStatus ?? 'PENDING',
        payerPayeeName: dto.payerPayeeName,
      },
    });
  }
}
