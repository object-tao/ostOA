import { IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  waybillId!: string;

  @IsOptional()
  @IsString()
  vehicleOrderId?: string;

  @IsString()
  taskType!: string;

  @IsOptional()
  @IsString()
  resourceName?: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  routeText?: string;

  @IsOptional()
  @IsString()
  accessoriesSummary?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateTaskDto extends CreateTaskDto {}
