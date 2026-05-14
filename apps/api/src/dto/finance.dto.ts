import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProjectCostDto {
  @IsString()
  projectId!: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsString()
  vehicleOrderId?: string;

  @IsString()
  costType!: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateProjectIncomeDto {
  @IsString()
  projectId!: string;

  @IsString()
  incomeType!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateReceiptPaymentDto {
  @IsString()
  projectId!: string;

  @IsString()
  relatedType!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  payerPayeeName?: string;
}
