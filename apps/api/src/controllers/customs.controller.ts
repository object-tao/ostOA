import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateCustomsRecordDto, UpdateCustomsRecordDto } from '../dto/customs.dto';
import { CustomsService } from '../services/customs.service';

@Controller('customs-records')
@Roles('ADMIN', 'DISPATCHER')
export class CustomsController {
  constructor(private readonly customsService: CustomsService) {}

  @Post()
  create(@Body() dto: CreateCustomsRecordDto) {
    return this.customsService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.customsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomsRecordDto) {
    return this.customsService.update(id, dto);
  }
}
