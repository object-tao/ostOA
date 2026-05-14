import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildCode } from '../common/utils/business';
import { buildPagedResult } from '../common/utils/pagination';
import { CreateAbnormalEventDto, HandleAbnormalEventDto } from '../dto/abnormal-event.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AbnormalEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAbnormalEventDto) {
    if (!dto.projectId && !dto.vehicleOrderId) {
      throw new BadRequestException('异常必须关联项目或车辆运输单');
    }

    const event = await this.prisma.abnormalEvent.create({
      data: {
        abnormalNo: buildCode('ABN'),
        projectId: dto.projectId,
        batchId: dto.batchId,
        vehicleOrderId: dto.vehicleOrderId,
        abnormalType: dto.abnormalType,
        abnormalLevel: dto.abnormalLevel,
        description: dto.description,
        locationText: dto.locationText,
        impactAmount: dto.impactAmount,
        impactHours: dto.impactHours,
        solutionText: dto.solutionText,
      },
    });

    if (dto.vehicleOrderId) {
      await this.prisma.vehicleOrder.update({
        where: { id: dto.vehicleOrderId },
        data: { isAbnormal: true, currentStatus: 'ABNORMAL' },
      });
    }

    return event;
  }

  async findAll(query: PaginationQueryDto) {
    const where: Prisma.AbnormalEventWhereInput = {
      abnormalStatus: query.status ? (query.status as never) : undefined,
      OR: query.keyword
        ? [
            { abnormalNo: { contains: query.keyword } },
            { abnormalType: { contains: query.keyword } },
            { description: { contains: query.keyword } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.abnormalEvent.findMany({
        where,
        include: { project: true, vehicleOrder: true },
        orderBy: { reportTime: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.abnormalEvent.count({ where }),
    ]);

    return buildPagedResult(items, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const item = await this.prisma.abnormalEvent.findUnique({
      where: { id },
      include: { project: true, batch: true, vehicleOrder: true },
    });

    if (!item) {
      throw new NotFoundException('异常不存在');
    }

    return item;
  }

  async handle(id: string, dto: HandleAbnormalEventDto) {
    await this.findOne(id);
    return this.prisma.abnormalEvent.update({
      where: { id },
      data: {
        abnormalStatus: dto.abnormalStatus as never,
        solutionText: dto.solutionText,
      },
    });
  }

  async close(id: string) {
    const item = await this.findOne(id);

    if (item.vehicleOrderId) {
      await this.prisma.vehicleOrder.update({
        where: { id: item.vehicleOrderId },
        data: { isAbnormal: false },
      });
    }

    return this.prisma.abnormalEvent.update({
      where: { id },
      data: {
        abnormalStatus: 'CLOSED',
        closedBy: 'dispatcher',
        closedTime: new Date(),
      },
    });
  }
}
