import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InTransitService {
  constructor(private readonly prisma: PrismaService) {}

  async getMap() {
    const orders = await this.prisma.vehicleOrder.findMany({
      where: {
        currentStatus: {
          in: ['DEPARTED', 'ARRIVED_PORT', 'CUSTOMS_DECLARING', 'EXITED_COUNTRY', 'ENTERED_COUNTRY', 'DELIVERING'],
        },
      },
      include: {
        project: true,
        vehicle: true,
        driver: true,
        trackingNodes: {
          orderBy: { nodeTime: 'desc' },
          take: 1,
        },
        abnormalEvents: {
          where: { abnormalStatus: { in: ['OPEN', 'PROCESSING'] } },
        },
      },
    });

    return {
      mapCenter: [87.6168, 43.8256],
      routeApiReserved: true,
      vehicles: orders.map((item) => ({
        id: item.id,
        vehicleOrderNo: item.vehicleOrderNo,
        projectName: item.project.projectName,
        vehicleNo: item.vehicle?.vehicleNo ?? '待分配',
        driverName: item.driver?.driverName ?? '待分配',
        currentStatus: item.currentStatus,
        currentNodeCode: item.currentNodeCode,
        location: item.trackingNodes[0]?.locationText ?? null,
        longitude: item.trackingNodes[0]?.longitude ?? null,
        latitude: item.trackingNodes[0]?.latitude ?? null,
        abnormal: item.abnormalEvents.length > 0,
        lastUpdatedAt: item.trackingNodes[0]?.nodeTime ?? item.updatedAt,
      })),
    };
  }

  async getOverview() {
    const [total, abnormal, alerts, statuses] = await Promise.all([
      this.prisma.vehicleOrder.count(),
      this.prisma.vehicleOrder.count({ where: { isAbnormal: true } }),
      this.prisma.abnormalEvent.count({ where: { abnormalStatus: { in: ['OPEN', 'PROCESSING'] } } }),
      this.prisma.vehicleOrder.groupBy({
        by: ['currentStatus'],
        _count: true,
      }),
    ]);

    return {
      totalVehicles: total,
      abnormalVehicles: abnormal,
      activeAlerts: alerts,
      statusBreakdown: statuses,
    };
  }
}
