import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { InTransitService } from '../services/in-transit.service';

@Controller('in-transit')
@Roles('ADMIN', 'DISPATCHER')
export class InTransitController {
  constructor(private readonly inTransitService: InTransitService) {}

  @Get('map')
  map() {
    return this.inTransitService.getMap();
  }

  @Get('overview')
  overview() {
    return this.inTransitService.getOverview();
  }
}
