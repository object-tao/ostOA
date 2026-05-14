import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { ResourcesService } from '../services/resources.service';

@Controller('resources')
@Roles('ADMIN', 'DISPATCHER')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get('vehicles/available')
  availableVehicles() {
    return this.resourcesService.getAvailableVehicles();
  }

  @Get('drivers/available')
  availableDrivers() {
    return this.resourcesService.getAvailableDrivers();
  }

  @Get('capacities')
  capacities() {
    return this.resourcesService.getCapacities();
  }

  @Post('capacities')
  createCapacity(@Body() body: Record<string, unknown>) {
    return this.resourcesService.createCapacity(body);
  }
}

@Controller()
@Roles('ADMIN', 'DISPATCHER')
export class MasterDataController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get('customers')
  customers() {
    return this.resourcesService.getCustomers();
  }

  @Post('customers')
  createCustomer(@Body() body: Record<string, unknown>) {
    return this.resourcesService.createCustomer(body);
  }

  @Get('suppliers')
  suppliers() {
    return this.resourcesService.getSuppliers();
  }

  @Post('suppliers')
  createSupplier(@Body() body: Record<string, unknown>) {
    return this.resourcesService.createSupplier(body);
  }

  @Get('vehicles')
  vehicles() {
    return this.resourcesService.getVehicles();
  }

  @Post('vehicles')
  createVehicle(@Body() body: Record<string, unknown>) {
    return this.resourcesService.createVehicle(body);
  }

  @Get('drivers')
  drivers() {
    return this.resourcesService.getDrivers();
  }

  @Post('drivers')
  createDriver(@Body() body: Record<string, unknown>) {
    return this.resourcesService.createDriver(body);
  }

  @Get('users')
  users() {
    return this.resourcesService.getUsers();
  }

  @Post('users')
  @Roles('ADMIN')
  createUser(@Body() body: Record<string, unknown>) {
    return this.resourcesService.createUser(body);
  }

  @Get('roles')
  roles() {
    return this.resourcesService.getRoles();
  }

  @Post('roles')
  @Roles('ADMIN')
  createRole(@Body() body: Record<string, unknown>) {
    return this.resourcesService.createRole(body);
  }

  @Get('ports')
  ports() {
    return this.resourcesService.getPorts();
  }

  @Post('ports')
  @Roles('ADMIN')
  createPort(@Body() body: Record<string, unknown>) {
    return this.resourcesService.createPort(body);
  }

  @Get('operation-logs')
  operationLogs() {
    return this.resourcesService.getOperationLogs();
  }

  @Get('capacities')
  capacities() {
    return this.resourcesService.getCapacities();
  }

  @Post('capacities')
  createCapacity(@Body() body: Record<string, unknown>) {
    return this.resourcesService.createCapacity(body);
  }
}
