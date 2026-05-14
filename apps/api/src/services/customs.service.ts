import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildCode } from '../common/utils/business';
import { buildPagedResult } from '../common/utils/pagination';
import { CreateCustomsRecordDto, UpdateCustomsRecordDto } from '../dto/customs.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCustomsRecordDto) {
    return this.prisma.customsRecord.create({
      data: {
        recordNo: buildCode('CUS'),
        waybillId: dto.waybillId,
        recordType: dto.recordType,
        portName: dto.portName,
        nodeName: dto.nodeName,
        status: dto.status ?? '处理中',
        remark: dto.remark,
        createdBy: 'operator',
      },
      include: {
        waybill: true,
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const where: Prisma.CustomsRecordWhereInput = {
      status: query.status || undefined,
      OR: query.keyword
        ? [
            { recordNo: { contains: query.keyword } },
            { recordType: { contains: query.keyword } },
            { portName: { contains: query.keyword } },
            { waybill: { waybillNo: { contains: query.keyword } } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.customsRecord.findMany({
        where,
        include: {
          waybill: {
            include: {
              customer: true,
              project: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.customsRecord.count({ where }),
    ]);

    return buildPagedResult(items, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const item = await this.prisma.customsRecord.findUnique({
      where: { id },
      include: {
        waybill: {
          include: {
            customer: true,
            project: true,
            tasks: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('关务记录不存在');
    }

    return item;
  }

  async update(id: string, dto: UpdateCustomsRecordDto) {
    await this.findOne(id);
    return this.prisma.customsRecord.update({
      where: { id },
      data: {
        waybillId: dto.waybillId,
        recordType: dto.recordType,
        portName: dto.portName,
        nodeName: dto.nodeName,
        status: dto.status,
        remark: dto.remark,
      },
      include: {
        waybill: true,
      },
    });
  }
}
