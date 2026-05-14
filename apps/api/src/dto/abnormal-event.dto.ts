import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAbnormalEventDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  vehicleOrderId?: string;

  @IsString()
  abnormalType!: string;

  @IsString()
  abnormalLevel!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  locationText?: string;

  @IsOptional()
  @IsNumber()
  impactAmount?: number;

  @IsOptional()
  @IsNumber()
  impactHours?: number;

  @IsOptional()
  @IsString()
  solutionText?: string;
}

export class HandleAbnormalEventDto {
  @IsString()
  abnormalStatus!: string;

  @IsOptional()
  @IsString()
  solutionText?: string;
}
