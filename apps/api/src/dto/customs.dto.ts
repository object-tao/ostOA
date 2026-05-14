import { IsOptional, IsString } from 'class-validator';

export class CreateCustomsRecordDto {
  @IsString()
  waybillId!: string;

  @IsString()
  recordType!: string;

  @IsOptional()
  @IsString()
  portName?: string;

  @IsOptional()
  @IsString()
  nodeName?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateCustomsRecordDto extends CreateCustomsRecordDto {}
