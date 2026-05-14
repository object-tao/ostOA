import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVehicleOrderDto {
  @IsString()
  projectId!: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsString()
  customerId!: string;

  @IsString()
  cargoName!: string;

  @IsOptional()
  @IsString()
  cargoDescription?: string;

  @IsString()
  loadAddress!: string;

  @IsString()
  unloadAddress!: string;

  @IsOptional()
  @IsString()
  customsPort?: string;

  @IsOptional()
  @IsString()
  destinationCountry?: string;

  @IsOptional()
  @IsDateString()
  plannedDepartureTime?: string;

  @IsOptional()
  @IsDateString()
  estimatedArrivalTime?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateVehicleOrderDto extends CreateVehicleOrderDto {}

export class DispatchVehicleOrderDto {
  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  dispatcherId?: string;

  @IsOptional()
  @IsString()
  instructionText?: string;
}

export class UpdateVehicleStatusDto {
  @IsString()
  status!: string;

  @IsString()
  nodeCode!: string;

  @IsString()
  nodeName!: string;

  @IsOptional()
  @IsString()
  locationText?: string;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsString()
  operatorType?: string;

  @IsOptional()
  @IsString()
  operatorId?: string;

  @IsOptional()
  @IsArray()
  photoUrls?: string[];

  @IsOptional()
  @IsString()
  remark?: string;
}
