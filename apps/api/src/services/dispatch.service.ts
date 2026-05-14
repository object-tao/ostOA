import { Injectable } from '@nestjs/common';
import { AssignDispatchDto } from '../dto/dispatch.dto';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleOrdersService } from './vehicle-orders.service';

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehicleOrdersService: VehicleOrdersService,
  ) {}

  async getBoard() {
    const [pendingOrders, availableVehicles, availableDrivers, dispatchRecords, abnormalAlerts] = await Promise.all([
      this.prisma.vehicleOrder.findMany({
        where: { currentStatus: 'PENDING_DISPATCH' },
        include: { project: true, batch: true },
        take: 10,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.vehicleResource.findMany({
        where: { vehicleStatus: 'AVAILABLE' },
        take: 10,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.driver.findMany({
        where: { driverStatus: 'AVAILABLE' },
        take: 10,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.dispatchRecord.findMany({
        take: 10,
        orderBy: { dispatchTime: 'desc' },
        include: { vehicleOrder: true, vehicle: true, driver: true },
      }),
      this.prisma.abnormalEvent.findMany({
        where: { abnormalStatus: { in: ['OPEN', 'PROCESSING'] } },
        take: 10,
        orderBy: { reportTime: 'desc' },
      }),
    ]);

    return { pendingOrders, availableVehicles, availableDrivers, dispatchRecords, abnormalAlerts };
  }

  assign(dto: AssignDispatchDto) {
    return this.vehicleOrdersService.dispatch(dto.vehicleOrderId, dto);
  }

  reassign(dto: AssignDispatchDto) {
    return this.vehicleOrdersService.dispatch(dto.vehicleOrderId, {
      ...dto,
      instructionText: dto.instructionText ?? '改派',
    });
  }
}
