import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateVehicleOrderDto, DispatchVehicleOrderDto, UpdateVehicleOrderDto, UpdateVehicleStatusDto } from '../dto/vehicle-order.dto';
import { VehicleOrdersService } from '../services/vehicle-orders.service';

@Controller('vehicle-orders')
@Roles('ADMIN', 'DISPATCHER')
export class VehicleOrdersController {
  constructor(private readonly vehicleOrdersService: VehicleOrdersService) {}

  @Post()
  create(@Body() dto: CreateVehicleOrderDto) {
    return this.vehicleOrdersService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.vehicleOrdersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehicleOrdersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleOrderDto) {
    return this.vehicleOrdersService.update(id, dto);
  }

  @Post(':id/dispatch')
  dispatch(@Param('id') id: string, @Body() dto: DispatchVehicleOrderDto) {
    return this.vehicleOrdersService.dispatch(id, dto);
  }

  @Post(':id/update-status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateVehicleStatusDto) {
    return this.vehicleOrdersService.updateStatus(id, dto);
  }

  @Post(':id/sign')
  sign(@Param('id') id: string) {
    return this.vehicleOrdersService.sign(id);
  }

  @Get(':id/tracking-nodes')
  trackingNodes(@Param('id') id: string) {
    return this.vehicleOrdersService.getTrackingNodes(id);
  }

  @Post(':id/location')
  location(@Param('id') id: string, @Body() dto: UpdateVehicleStatusDto) {
    return this.vehicleOrdersService.reportLocation(id, dto);
  }
}
