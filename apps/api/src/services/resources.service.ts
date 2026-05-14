import { Injectable } from '@nestjs/common';
import { DriverStatus, OwnerType, VehicleStatus } from '@prisma/client';
import { buildCode } from '../common/utils/business';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  getAvailableVehicles() {
    return this.prisma.vehicleResource.findMany({
      where: { vehicleStatus: 'AVAILABLE' },
      include: { supplier: true },
    });
  }

  getAvailableDrivers() {
    return this.prisma.driver.findMany({
      where: { driverStatus: 'AVAILABLE' },
      include: { supplier: true },
    });
  }

  getCustomers() {
    return this.prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createCustomer(body: Record<string, unknown>) {
    return this.prisma.customer.create({
      data: {
        customerCode: String(body.customerCode ?? buildCode('CUS')),
        customerName: String(body.customerName ?? '新客户'),
        contactName: body.contactName ? String(body.contactName) : undefined,
        contactPhone: body.contactPhone ? String(body.contactPhone) : undefined,
        country: body.country ? String(body.country) : undefined,
        address: body.address ? String(body.address) : undefined,
      },
    });
  }

  getSuppliers() {
    return this.prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createSupplier(body: Record<string, unknown>) {
    return this.prisma.supplier.create({
      data: {
        supplierCode: String(body.supplierCode ?? buildCode('SUP')),
        supplierName: String(body.supplierName ?? '新供应商'),
        contactName: body.contactName ? String(body.contactName) : undefined,
        contactPhone: body.contactPhone ? String(body.contactPhone) : undefined,
        country: body.country ? String(body.country) : undefined,
        supplierType: body.supplierType ? String(body.supplierType) : '车队',
        supplierStatus: 'ACTIVE',
      },
    });
  }

  getVehicles() {
    return this.prisma.vehicleResource.findMany({
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createVehicle(body: Record<string, unknown>) {
    return this.prisma.vehicleResource.create({
      data: {
        vehicleNo: String(body.vehicleNo ?? buildCode('VEH')),
        vehicleType: String(body.vehicleType ?? '平板车'),
        vehicleLength: body.vehicleLength ? Number(body.vehicleLength) : undefined,
        vehicleWidth: body.vehicleWidth ? Number(body.vehicleWidth) : undefined,
        maxLoadWeight: body.maxLoadWeight ? Number(body.maxLoadWeight) : undefined,
        ownerType: (body.ownerType as OwnerType) ?? OwnerType.OUTSOURCED,
        supplierId: body.supplierId ? String(body.supplierId) : undefined,
        vehicleStatus: (body.vehicleStatus as VehicleStatus) ?? VehicleStatus.AVAILABLE,
        gpsDeviceNo: body.gpsDeviceNo ? String(body.gpsDeviceNo) : undefined,
      },
    });
  }

  getDrivers() {
    return this.prisma.driver.findMany({
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createDriver(body: Record<string, unknown>) {
    return this.prisma.driver.create({
      data: {
        driverName: String(body.driverName ?? '新司机'),
        driverPhone: String(
          body.driverPhone ??
            `13${Math.floor(Math.random() * 1000000000)
              .toString()
              .padStart(9, '0')}`,
        ),
        supplierId: body.supplierId ? String(body.supplierId) : undefined,
        nationality: body.nationality ? String(body.nationality) : undefined,
        driverStatus: (body.driverStatus as DriverStatus) ?? DriverStatus.AVAILABLE,
      },
    });
  }

  getUsers() {
    return this.prisma.systemUser.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createUser(body: Record<string, unknown>) {
    return this.prisma.systemUser.create({
      data: {
        username: String(body.username ?? buildCode('USR').toLowerCase()),
        passwordHash: String(body.passwordHash ?? '123456'),
        realName: String(body.realName ?? '新用户'),
        roleId: body.roleId ? String(body.roleId) : undefined,
        mobile: body.mobile ? String(body.mobile) : undefined,
        email: body.email ? String(body.email) : undefined,
      },
      include: { role: true },
    });
  }

  getRoles() {
    return this.prisma.systemRole.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createRole(body: Record<string, unknown>) {
    return this.prisma.systemRole.create({
      data: {
        roleCode: String(body.roleCode ?? buildCode('ROLE')),
        roleName: String(body.roleName ?? '新角色'),
        remark: body.remark ? String(body.remark) : undefined,
      },
    });
  }

  getPorts() {
    return this.prisma.portDirectory.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createPort(body: Record<string, unknown>) {
    return this.prisma.portDirectory.create({
      data: {
        portCode: String(body.portCode ?? buildCode('PORT')),
        portName: String(body.portName ?? '新口岸'),
        country: String(body.country ?? '未设置'),
        mode: String(body.mode ?? '公路口岸'),
        status: String(body.status ?? 'ACTIVE'),
        remark: body.remark ? String(body.remark) : undefined,
      },
    });
  }

  getOperationLogs() {
    return this.prisma.operationLog.findMany({
      orderBy: { actionTime: 'desc' },
      take: 50,
    });
  }

  async getCapacities() {
    const suppliers = await this.prisma.supplier.findMany({
      include: {
        vehicles: { orderBy: { createdAt: 'desc' } },
        drivers: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return suppliers.map((supplier) => ({
      id: supplier.id,
      resourceNo: supplier.supplierCode,
      resourceName: supplier.supplierName,
      resourceType: supplier.supplierType ?? '承运商',
      vehicleNo: supplier.vehicles[0]?.vehicleNo ?? '',
      driverName: supplier.drivers[0]?.driverName ?? '',
      driverPhone: supplier.drivers[0]?.driverPhone ?? '',
      status: supplier.supplierStatus ?? 'ACTIVE',
      remark: supplier.remark ?? '',
      supplierId: supplier.id,
      vehicleId: supplier.vehicles[0]?.id ?? null,
      driverId: supplier.drivers[0]?.id ?? null,
    }));
  }

  async createCapacity(body: Record<string, unknown>) {
    const supplier = await this.prisma.supplier.create({
      data: {
        supplierCode: buildCode('CAP'),
        supplierName: String(body.resourceName ?? '新运力资源'),
        supplierType: String(body.resourceType ?? '承运商'),
        supplierStatus: String(body.status ?? 'ACTIVE'),
        remark: body.remark ? String(body.remark) : undefined,
        contactPhone: body.driverPhone ? String(body.driverPhone) : undefined,
      },
    });

    let vehicle = null;
    if (body.vehicleNo) {
      vehicle = await this.prisma.vehicleResource.create({
        data: {
          vehicleNo: String(body.vehicleNo),
          vehicleType: '平板车',
          ownerType: OwnerType.OUTSOURCED,
          supplierId: supplier.id,
          vehicleStatus: VehicleStatus.AVAILABLE,
        },
      });
    }

    let driver = null;
    if (body.driverName || body.driverPhone) {
      driver = await this.prisma.driver.create({
        data: {
          driverName: String(body.driverName ?? '新司机'),
          driverPhone: String(
            body.driverPhone ??
              `13${Math.floor(Math.random() * 1000000000)
                .toString()
                .padStart(9, '0')}`,
          ),
          supplierId: supplier.id,
          driverStatus: DriverStatus.AVAILABLE,
        },
      });
    }

    return {
      id: supplier.id,
      resourceNo: supplier.supplierCode,
      resourceName: supplier.supplierName,
      resourceType: supplier.supplierType,
      vehicleNo: vehicle?.vehicleNo ?? '',
      driverName: driver?.driverName ?? '',
      driverPhone: driver?.driverPhone ?? '',
      status: supplier.supplierStatus,
      remark: supplier.remark ?? '',
      supplierId: supplier.id,
      vehicleId: vehicle?.id ?? null,
      driverId: driver?.id ?? null,
    };
  }
}
