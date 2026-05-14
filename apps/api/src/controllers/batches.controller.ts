import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { CreateBatchDto, UpdateBatchDto } from '../dto/batch.dto';
import { BatchesService } from '../services/batches.service';

@Controller()
@Roles('ADMIN', 'DISPATCHER')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get('batches')
  findAll() {
    return this.batchesService.findAll();
  }

  @Post('projects/:projectId/batches')
  create(@Param('projectId') projectId: string, @Body() dto: CreateBatchDto) {
    return this.batchesService.create(projectId, dto);
  }

  @Get('projects/:projectId/batches')
  findByProject(@Param('projectId') projectId: string) {
    return this.batchesService.findByProject(projectId);
  }

  @Get('batches/:id')
  findOne(@Param('id') id: string) {
    return this.batchesService.findOne(id);
  }

  @Put('batches/:id')
  update(@Param('id') id: string, @Body() dto: UpdateBatchDto) {
    return this.batchesService.update(id, dto);
  }

  @Post('batches/:id/close')
  close(@Param('id') id: string) {
    return this.batchesService.close(id);
  }
}
