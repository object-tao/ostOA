import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { ProjectsService } from '../services/projects.service';

@Controller('projects')
@Roles('ADMIN', 'DISPATCHER')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Get(':id/dashboard')
  dashboard(@Param('id') id: string) {
    return this.projectsService.getDashboard(id);
  }

  @Get(':id/profit')
  profit(@Param('id') id: string) {
    return this.projectsService.getProfit(id);
  }
}
