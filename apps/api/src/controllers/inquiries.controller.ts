import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateInquiryDto, QuoteInquiryDto } from '../dto/inquiry.dto';
import { InquiriesService } from '../services/inquiries.service';

@Controller('inquiries')
@Roles('ADMIN', 'DISPATCHER')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.inquiriesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateInquiryDto) {
    return this.inquiriesService.update(id, dto);
  }

  @Post(':id/quote')
  quote(@Param('id') id: string, @Body() dto: QuoteInquiryDto) {
    return this.inquiriesService.quote(id, dto);
  }

  @Post(':id/convert-project')
  convertProject(@Param('id') id: string) {
    return this.inquiriesService.convertToProject(id);
  }
}
