import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { AssignDispatchDto } from '../dto/dispatch.dto';
import { DispatchService } from '../services/dispatch.service';

@Controller('dispatch')
@Roles('ADMIN', 'DISPATCHER')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get('board')
  board() {
    return this.dispatchService.getBoard();
  }

  @Post('assign')
  assign(@Body() dto: AssignDispatchDto) {
    return this.dispatchService.assign(dto);
  }

  @Post('reassign')
  reassign(@Body() dto: AssignDispatchDto) {
    return this.dispatchService.reassign(dto);
  }
}
