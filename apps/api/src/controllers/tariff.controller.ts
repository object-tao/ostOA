import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { TariffQuoteDto } from '../dto/tariff.dto';
import { TariffService } from '../services/tariff.service';

@Controller('tariffs')
@Roles('ADMIN', 'DISPATCHER')
export class TariffController {
  constructor(private readonly tariffService: TariffService) {}

  @Post('quote')
  @Public()
  quote(@Body() dto: TariffQuoteDto) {
    return this.tariffService.quote(dto);
  }

  @Get('history')
  @Public()
  history(@Query() query: PaginationQueryDto) {
    return this.tariffService.getHistory(query);
  }
}
