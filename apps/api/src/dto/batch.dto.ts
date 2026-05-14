import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  batchName!: string;

  @IsOptional()
  @IsNumber()
  sequenceNo?: number;

  @IsOptional()
  @IsNumber()
  plannedVehicleCount?: number;

  @IsOptional()
  @IsString()
  batchStatus?: string;

  @IsOptional()
  @IsDateString()
  loadingDate?: string;

  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @IsOptional()
  @IsDateString()
  estimatedArrivalDate?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateBatchDto extends CreateBatchDto {}
