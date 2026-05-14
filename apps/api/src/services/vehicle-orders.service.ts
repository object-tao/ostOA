import { Injectable, NotFoundException } from '@nestjs/common';
import { DriverStatus, OperatorType, Prisma, SignStatus, VehicleOrderStatus, VehicleStatus } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildCode } from '../common/utils/business';
import { buildPagedResult } from '../common/utils/pagination';
import {
  CreateVehicleOrderDto,
  DispatchVehicleOrderDto,
  UpdateVehicleOrderDto,
  UpdateVehicleStatusDto,
} from '../dto/vehicle-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehicleOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateVehicleOrderDto) {
    return this.prisma.vehicleOrder.create({
      data: {
        vehicleOrderNo: buildCode('VO'),
        projectId: dto.projectId,
        batchId: dto.batchId,
        customerId: dto.customerId,
        cargoName: dto.cargoName,
        cargoDescription: dto.cargoDescription,
        loadAddress: dto.loadAddress,
        unloadAddress: dto.unloadAddress,
        customsPort: dto.customsPort,
        destinationCountry: dto.destinationCountry,
        plannedDepartureTime: dto.plannedDepartureTime ? new Date(dto.plannedDepartureTime) : undefined,
        estimatedArrivalTime: dto.estimatedArrivalTime ? new Date(dto.estimatedArrivalTime) : undefined,
        remark: dto.remark,
        createdBy: 'dispatcher',
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const where: Prisma.VehicleOrderWhereInput = {
      currentStatus: query.status ? (query.status as never) : undefined,
      OR: query.keyword
        ? [
            { vehicleOrderNo: { contains: query.keyword } },
            { cargoName: { contains: query.keyword } },
            { project: { projectName: { contains: query.keyword } } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.vehicleOrder.findMany({
        where,
        include: {
          project: true,
          batch: true,
          vehicle: true,
          driver: true,
          supplier: true,
          abnormalEvents: { where: { abnormalStatus: { in: ['OPEN', 'PROCESSING'] } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.vehicleOrder.count({ where }),
    ]);

    return buildPagedResult(items, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const item = await this.prisma.vehicleOrder.findUnique({
      where: { id },
      include: {
        project: true,
        batch: true,
        vehicle: true,
        driver: true,
        supplier: true,
        trackingNodes: { orderBy: { nodeTime: 'asc' } },
        abnormalEvents: { orderBy: { reportTime: 'desc' } },
        costs: true,
      },
    });

    if (!item) {
      throw new NotFoundException('车辆运输单不存在');
    }

    return item;
  }

  async update(id: string, dto: UpdateVehicleOrderDto) {
    await this.findOne(id);
    return this.prisma.vehicleOrder.update({
      where: { id },
      data: {
        projectId: dto.projectId,
        batchId: dto.batchId,
        customerId: dto.customerId,
        cargoName: dto.cargoName,
        cargoDescription: dto.cargoDescription,
        loadAddress: dto.loadAddress,
        unloadAddress: dto.unloadAddress,
        customsPort: dto.customsPort,
        destinationCountry: dto.destinationCountry,
        plannedDepartureTime: dto.plannedDepartureTime ? new Date(dto.plannedDepartureTime) : undefined,
        estimatedArrivalTime: dto.estimatedArrivalTime ? new Date(dto.estimatedArrivalTime) : undefined,
        remark: dto.remark,
      },
    });
  }

  async dispatch(id: string, dto: DispatchVehicleOrderDto) {
    const order = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.vehicleOrder.update({
        where: { id },
        data: {
          batchId: dto.batchId ?? order.batchId,
          vehicleId: dto.vehicleId,
          driverId: dto.driverId,
          supplierId: dto.supplierId,
          currentStatus: VehicleOrderStatus.DISPATCHED,
          currentNodeCode: 'DISPATCHED',
        },
      });

      if (dto.vehicleId) {
        await tx.vehicleResource.update({
          where: { id: dto.vehicleId },
          data: { vehicleStatus: VehicleStatus.DISPATCHED },
        });
      }

      if (dto.driverId) {
        await tx.driver.update({
          where: { id: dto.driverId },
          data: { driverStatus: DriverStatus.ON_DUTY },
        });
      }

      await tx.dispatchRecord.create({
        data: {
          dispatchNo: buildCode('DSP'),
          projectId: order.projectId,
          batchId: dto.batchId ?? order.batchId,
          vehicleOrderId: id,
          vehicleId: dto.vehicleId,
          driverId: dto.driverId,
          dispatcherId: dto.dispatcherId ?? 'dispatcher',
          dispatchTime: new Date(),
          dispatchStatus: 'ASSIGNED',
          instructionText: dto.instructionText,
        },
      });

      await tx.trackingNode.create({
        data: {
          vehicleOrderId: id,
          nodeCode: 'DISPATCHED',
          nodeName: '已派车',
          nodeStatus: 'DONE',
          nodeTime: new Date(),
          operatorType: OperatorType.DISPATCHER,
          operatorId: dto.dispatcherId ?? 'dispatcher',
          remark: dto.instructionText,
          photoUrls: '[]',
        },
      });

      return updatedOrder;
    });
  }

  async updateStatus(id: string, dto: UpdateVehicleStatusDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.vehicleOrder.update({
        where: { id },
        data: {
          currentStatus: dto.status as VehicleOrderStatus,
          currentNodeCode: dto.nodeCode,
          actualArrivalTime: ['SIGNED', 'COMPLETED'].includes(dto.status) ? new Date() : undefined,
          isAbnormal: dto.status === 'ABNORMAL',
          signStatus: dto.status === 'SIGNED' ? SignStatus.SIGNED : undefined,
        },
      });

      await tx.trackingNode.create({
        data: {
          vehicleOrderId: id,
          nodeCode: dto.nodeCode,
          nodeName: dto.nodeName,
          nodeStatus: 'DONE',
          nodeTime: new Date(),
          locationText: dto.locationText,
          longitude: dto.longitude,
          latitude: dto.latitude,
          operatorType: (dto.operatorType as OperatorType) ?? OperatorType.SYSTEM,
          operatorId: dto.operatorId,
          photoUrls: JSON.stringify(dto.photoUrls ?? []),
          remark: dto.remark,
        },
      });

      return updated;
    });
  }

  sign(id: string) {
    return this.updateStatus(id, {
      status: 'SIGNED',
      nodeCode: 'SIGNED',
      nodeName: '已签收',
      operatorType: 'SYSTEM',
    });
  }

  async getTrackingNodes(id: string) {
    await this.findOne(id);
    return this.prisma.trackingNode.findMany({
      where: { vehicleOrderId: id },
      orderBy: { nodeTime: 'asc' },
    });
  }

  async reportLocation(id: string, dto: UpdateVehicleStatusDto) {
    await this.findOne(id);
    return this.prisma.trackingNode.create({
      data: {
        vehicleOrderId: id,
        nodeCode: dto.nodeCode,
        nodeName: dto.nodeName,
        nodeStatus: 'LOCATION',
        nodeTime: new Date(),
        locationText: dto.locationText,
        longitude: dto.longitude,
        latitude: dto.latitude,
        operatorType: (dto.operatorType as OperatorType) ?? OperatorType.SYSTEM,
        operatorId: dto.operatorId,
        photoUrls: JSON.stringify(dto.photoUrls ?? []),
        remark: dto.remark,
      },
    });
  }
}
