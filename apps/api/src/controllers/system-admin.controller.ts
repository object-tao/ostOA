import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { SystemAdminService } from '../services/system-admin.service';

@Controller('system-admin')
@Roles('ADMIN', 'DISPATCHER')
export class SystemAdminController {
  constructor(private readonly systemAdminService: SystemAdminService) {}

  @Get('overview')
  overview() {
    return this.systemAdminService.getOverview();
  }
}
