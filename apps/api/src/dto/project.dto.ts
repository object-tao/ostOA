import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  projectName!: string;

  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  inquiryId?: string;

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsString()
  originPlace!: string;

  @IsString()
  destinationPlace!: string;

  @IsOptional()
  @IsNumber()
  contractAmount?: number;

  @IsOptional()
  @IsString()
  contractCurrency?: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  plannedVehicleCount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  projectStatus?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateProjectDto extends CreateProjectDto {}
