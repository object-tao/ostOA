import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateWaybillDto, UpdateWaybillDto } from '../dto/waybill.dto';
import { WaybillsService } from '../services/waybills.service';

@Controller('waybills')
@Roles('ADMIN', 'DISPATCHER')
export class WaybillsController {
  constructor(private readonly waybillsService: WaybillsService) {}

  @Post()
  create(@Body() dto: CreateWaybillDto) {
    return this.waybillsService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.waybillsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.waybillsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWaybillDto) {
    return this.waybillsService.update(id, dto);
  }
}
