import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateProjectCostDto, CreateProjectIncomeDto, CreateReceiptPaymentDto } from '../dto/finance.dto';
import { FinanceService } from '../services/finance.service';

@Controller()
@Roles('ADMIN', 'DISPATCHER')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('project-costs')
  createCost(@Body() dto: CreateProjectCostDto) {
    return this.financeService.createCost(dto);
  }

  @Get('project-costs')
  getCosts(@Query() query: PaginationQueryDto) {
    return this.financeService.getCosts(query);
  }

  @Post('project-incomes')
  createIncome(@Body() dto: CreateProjectIncomeDto) {
    return this.financeService.createIncome(dto);
  }

  @Get('projects/:id/finance-summary')
  financeSummary(@Param('id') id: string) {
    return this.financeService.getSummary(id);
  }

  @Post('receipt-payments')
  createReceiptPayment(@Body() dto: CreateReceiptPaymentDto) {
    return this.financeService.createReceiptPayment(dto);
  }
}
