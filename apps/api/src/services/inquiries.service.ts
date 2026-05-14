import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildCode } from '../common/utils/business';
import { buildPagedResult } from '../common/utils/pagination';
import { CreateInquiryDto, QuoteInquiryDto } from '../dto/inquiry.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInquiryDto) {
    return this.prisma.inquiry.create({
      data: {
        inquiryNo: buildCode('INQ'),
        customerId: dto.customerId,
        cargoName: dto.cargoName,
        cargoDescription: dto.cargoDescription,
        requirementDescription: dto.requirementDescription,
        requirementAttachments: JSON.stringify(dto.requirementAttachments ?? []),
        quoteAttachments: JSON.stringify(dto.quoteAttachments ?? []),
        originPlace: dto.originPlace,
        destinationPlace: dto.destinationPlace,
        totalWeight: dto.totalWeight,
        totalVolume: dto.totalVolume,
        totalQuantity: dto.totalQuantity,
        expectedTime: dto.expectedTime ? new Date(dto.expectedTime) : undefined,
        specialRequirement: dto.specialRequirement,
        inquiryStatus: 'CREATED',
        quoteStatus: 'UNQUOTED',
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const where: Prisma.InquiryWhereInput = {
      OR: query.keyword
        ? [
            { inquiryNo: { contains: query.keyword } },
            { cargoName: { contains: query.keyword } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        include: { customer: true, convertedProject: true },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return buildPagedResult(items, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const item = await this.prisma.inquiry.findUnique({
      where: { id },
      include: { customer: true, convertedProject: true },
    });

    if (!item) {
      throw new NotFoundException('询单不存在');
    }

    return item;
  }

  async update(id: string, dto: CreateInquiryDto) {
    await this.findOne(id);
    return this.prisma.inquiry.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        cargoName: dto.cargoName,
        cargoDescription: dto.cargoDescription,
        requirementDescription: dto.requirementDescription,
        requirementAttachments: JSON.stringify(dto.requirementAttachments ?? []),
        quoteAttachments: JSON.stringify(dto.quoteAttachments ?? []),
        originPlace: dto.originPlace,
        destinationPlace: dto.destinationPlace,
        totalWeight: dto.totalWeight,
        totalVolume: dto.totalVolume,
        totalQuantity: dto.totalQuantity,
        expectedTime: dto.expectedTime ? new Date(dto.expectedTime) : undefined,
        specialRequirement: dto.specialRequirement,
      },
    });
  }

  async quote(id: string, dto: QuoteInquiryDto) {
    await this.findOne(id);
    return this.prisma.inquiry.update({
      where: { id },
      data: {
        inquiryStatus: 'QUOTED',
        quoteStatus: 'QUOTED',
        quotedAmount: dto.quotedAmount,
        quoteCurrency: dto.quoteCurrency,
        quoteValidUntil: new Date(dto.quoteValidUntil),
        quoteAttachments: JSON.stringify(dto.quoteAttachments ?? []),
      },
    });
  }

  async convertToProject(id: string) {
    const inquiry = await this.findOne(id);
    if (inquiry.convertedProjectId) {
      return this.prisma.project.findUnique({ where: { id: inquiry.convertedProjectId } });
    }

    const project = await this.prisma.project.create({
      data: {
        projectNo: buildCode('PRJ'),
        projectName: `${inquiry.customer.customerName}-${inquiry.cargoName}项目`,
        customerId: inquiry.customerId,
        inquiryId: inquiry.id,
        originPlace: inquiry.originPlace,
        destinationPlace: inquiry.destinationPlace,
        contractAmount: inquiry.quotedAmount ?? 0,
        contractCurrency: inquiry.quoteCurrency ?? 'CNY',
        plannedVehicleCount: Math.max(1, inquiry.totalQuantity ?? 1),
        projectStatus: 'PENDING_APPROVAL',
      },
    });

    await this.prisma.inquiry.update({
      where: { id },
      data: {
        convertedProjectId: project.id,
        inquiryStatus: 'CONVERTED',
      },
    });

    return project;
  }
}
