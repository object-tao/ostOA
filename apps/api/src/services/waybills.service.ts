import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WaybillStatus } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildCode } from '../common/utils/business';
import { buildPagedResult } from '../common/utils/pagination';
import { CreateWaybillDto, UpdateWaybillDto } from '../dto/waybill.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaybillsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateWaybillDto) {
    return this.prisma.waybill.create({
      data: {
        waybillNo: buildCode('WB'),
        customerId: dto.customerId,
        projectId: dto.projectId,
        cargoName: dto.cargoName,
        cargoDescription: dto.cargoDescription,
        originPlace: dto.originPlace,
        destinationPlace: dto.destinationPlace,
        portName: dto.portName,
        declarationNo: dto.declarationNo,
        cmrNo: dto.cmrNo,
        cmrStatus: dto.cmrStatus,
        status: (dto.status as WaybillStatus) ?? WaybillStatus.CREATED,
        remark: dto.remark,
        createdBy: 'operator',
      },
      include: {
        customer: true,
        project: true,
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const where: Prisma.WaybillWhereInput = {
      status: query.status ? (query.status as WaybillStatus) : undefined,
      OR: query.keyword
        ? [
            { waybillNo: { contains: query.keyword } },
            { cargoName: { contains: query.keyword } },
            { declarationNo: { contains: query.keyword } },
            { customer: { customerName: { contains: query.keyword } } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.waybill.findMany({
        where,
        include: {
          customer: true,
          project: true,
          tasks: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.waybill.count({ where }),
    ]);

    return buildPagedResult(items, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const item = await this.prisma.waybill.findUnique({
      where: { id },
      include: {
        customer: true,
        project: true,
        tasks: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!item) {
      throw new NotFoundException('运单不存在');
    }

    return item;
  }

  async update(id: string, dto: UpdateWaybillDto) {
    await this.findOne(id);
    return this.prisma.waybill.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        projectId: dto.projectId,
        cargoName: dto.cargoName,
        cargoDescription: dto.cargoDescription,
        originPlace: dto.originPlace,
        destinationPlace: dto.destinationPlace,
        portName: dto.portName,
        declarationNo: dto.declarationNo,
        cmrNo: dto.cmrNo,
        cmrStatus: dto.cmrStatus,
        status: dto.status as WaybillStatus,
        remark: dto.remark,
      },
      include: {
        customer: true,
        project: true,
      },
    });
  }
}
