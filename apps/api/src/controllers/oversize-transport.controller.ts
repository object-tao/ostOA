import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import {
  CreateOversizeCountryRuleDto,
  CreateOversizeQuoteDto,
  SimulateLoadPlanDto,
  SimulateOversizeQuoteDto,
} from '../dto/oversize-transport.dto';
import { OversizeTransportService } from '../services/oversize-transport.service';

@Controller('oversize-transport')
@Roles('ADMIN', 'DISPATCHER')
export class OversizeTransportController {
  constructor(private readonly oversizeTransportService: OversizeTransportService) {}

  @Get('dashboard')
  dashboard() {
    return this.oversizeTransportService.getDashboard();
  }

  @Get('country-rules')
  countryRules() {
    return this.oversizeTransportService.getCountryRules();
  }

  @Post('country-rules')
  createCountryRule(@Body() dto: CreateOversizeCountryRuleDto) {
    return this.oversizeTransportService.createCountryRule(dto);
  }

  @Post('simulate')
  simulate(@Body() dto: SimulateOversizeQuoteDto) {
    return this.oversizeTransportService.simulate(dto);
  }

  @Get('vehicle-templates')
  vehicleTemplates() {
    return this.oversizeTransportService.getVehicleTemplates();
  }

  @Post('load-plans/simulate')
  simulateLoadPlan(@Body() dto: SimulateLoadPlanDto) {
    return this.oversizeTransportService.simulateLoadPlan(dto);
  }

  @Post('quotes')
  createQuote(@Body() dto: CreateOversizeQuoteDto) {
    return this.oversizeTransportService.createQuote(dto);
  }

  @Get('quotes')
  quotes(@Query() query: PaginationQueryDto) {
    return this.oversizeTransportService.findQuotes(query);
  }

  @Get('quotes/:id')
  quote(@Param('id') id: string) {
    return this.oversizeTransportService.findQuote(id);
  }
}
