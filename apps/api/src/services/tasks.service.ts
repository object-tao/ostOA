import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildCode } from '../common/utils/business';
import { buildPagedResult } from '../common/utils/pagination';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTaskDto) {
    return this.prisma.taskExecution.create({
      data: {
        taskNo: buildCode('TASK'),
        waybillId: dto.waybillId,
        vehicleOrderId: dto.vehicleOrderId,
        taskType: dto.taskType,
        resourceName: dto.resourceName,
        driverName: dto.driverName,
        routeText: dto.routeText,
        accessoriesSummary: dto.accessoriesSummary,
        status: (dto.status as TaskStatus) ?? TaskStatus.PENDING,
        remark: dto.remark,
        createdBy: 'operator',
      },
      include: {
        waybill: true,
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const where: Prisma.TaskExecutionWhereInput = {
      status: query.status ? (query.status as TaskStatus) : undefined,
      OR: query.keyword
        ? [
            { taskNo: { contains: query.keyword } },
            { taskType: { contains: query.keyword } },
            { driverName: { contains: query.keyword } },
            { waybill: { waybillNo: { contains: query.keyword } } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.taskExecution.findMany({
        where,
        include: {
          waybill: {
            include: {
              customer: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.taskExecution.count({ where }),
    ]);

    return buildPagedResult(items, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const item = await this.prisma.taskExecution.findUnique({
      where: { id },
      include: {
        waybill: {
          include: {
            customer: true,
            project: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('任务不存在');
    }

    return item;
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id);
    return this.prisma.taskExecution.update({
      where: { id },
      data: {
        waybillId: dto.waybillId,
        vehicleOrderId: dto.vehicleOrderId,
        taskType: dto.taskType,
        resourceName: dto.resourceName,
        driverName: dto.driverName,
        routeText: dto.routeText,
        accessoriesSummary: dto.accessoriesSummary,
        status: dto.status as TaskStatus,
        remark: dto.remark,
      },
      include: {
        waybill: true,
      },
    });
  }
}
