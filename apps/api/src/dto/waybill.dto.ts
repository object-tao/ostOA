import { IsOptional, IsString } from 'class-validator';

export class CreateWaybillDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  cargoName!: string;

  @IsOptional()
  @IsString()
  cargoDescription?: string;

  @IsString()
  originPlace!: string;

  @IsString()
  destinationPlace!: string;

  @IsOptional()
  @IsString()
  portName?: string;

  @IsOptional()
  @IsString()
  declarationNo?: string;

  @IsOptional()
  @IsString()
  cmrNo?: string;

  @IsOptional()
  @IsString()
  cmrStatus?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateWaybillDto extends CreateWaybillDto {}
