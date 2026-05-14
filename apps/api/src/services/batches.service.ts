import { Injectable, NotFoundException } from '@nestjs/common';
import { buildCode } from '../common/utils/business';
import { CreateBatchDto, UpdateBatchDto } from '../dto/batch.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.shipmentBatch.findMany({
      include: { project: true, vehicleOrders: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(projectId: string, dto: CreateBatchDto) {
    return this.prisma.shipmentBatch.create({
      data: {
        batchNo: buildCode('BAT'),
        projectId,
        batchName: dto.batchName,
        sequenceNo: dto.sequenceNo ?? 1,
        plannedVehicleCount: dto.plannedVehicleCount ?? 0,
        batchStatus: (dto.batchStatus as never) ?? 'PENDING',
        loadingDate: dto.loadingDate ? new Date(dto.loadingDate) : undefined,
        departureDate: dto.departureDate ? new Date(dto.departureDate) : undefined,
        estimatedArrivalDate: dto.estimatedArrivalDate ? new Date(dto.estimatedArrivalDate) : undefined,
        remark: dto.remark,
        createdBy: 'dispatcher',
      },
    });
  }

  findByProject(projectId: string) {
    return this.prisma.shipmentBatch.findMany({
      where: { projectId },
      include: { vehicleOrders: true },
      orderBy: { sequenceNo: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.shipmentBatch.findUnique({
      where: { id },
      include: {
        project: true,
        vehicleOrders: { include: { vehicle: true, driver: true } },
        abnormalEvents: true,
      },
    });

    if (!item) {
      throw new NotFoundException('批次不存在');
    }

    return item;
  }

  async update(id: string, dto: UpdateBatchDto) {
    await this.findOne(id);
    return this.prisma.shipmentBatch.update({
      where: { id },
      data: {
        batchName: dto.batchName,
        sequenceNo: dto.sequenceNo,
        plannedVehicleCount: dto.plannedVehicleCount,
        batchStatus: dto.batchStatus as never,
        loadingDate: dto.loadingDate ? new Date(dto.loadingDate) : undefined,
        departureDate: dto.departureDate ? new Date(dto.departureDate) : undefined,
        estimatedArrivalDate: dto.estimatedArrivalDate ? new Date(dto.estimatedArrivalDate) : undefined,
        remark: dto.remark,
      },
    });
  }

  async close(id: string) {
    await this.findOne(id);
    return this.prisma.shipmentBatch.update({
      where: { id },
      data: { batchStatus: 'COMPLETED', actualArrivalDate: new Date() },
    });
  }
}
