import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateAbnormalEventDto, HandleAbnormalEventDto } from '../dto/abnormal-event.dto';
import { AbnormalEventsService } from '../services/abnormal-events.service';

@Controller('abnormal-events')
@Roles('ADMIN', 'DISPATCHER')
export class AbnormalEventsController {
  constructor(private readonly abnormalEventsService: AbnormalEventsService) {}

  @Post()
  create(@Body() dto: CreateAbnormalEventDto) {
    return this.abnormalEventsService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.abnormalEventsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.abnormalEventsService.findOne(id);
  }

  @Post(':id/handle')
  handle(@Param('id') id: string, @Body() dto: HandleAbnormalEventDto) {
    return this.abnormalEventsService.handle(id, dto);
  }

  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.abnormalEventsService.close(id);
  }
}
