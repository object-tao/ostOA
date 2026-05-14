import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ApprovalDecisionDto, CreateApprovalDto } from '../dto/approval.dto';
import { ApprovalsService } from '../services/approvals.service';

@Controller('approvals')
@Roles('ADMIN', 'DISPATCHER')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  create(@Body() dto: CreateApprovalDto) {
    return this.approvalsService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.approvalsService.findAll(query);
  }

  @Post(':id/decision')
  decide(@Param('id') id: string, @Body() dto: ApprovalDecisionDto) {
    return this.approvalsService.decide(id, dto);
  }
}
