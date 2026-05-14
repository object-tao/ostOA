import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  customerId!: string;

  @IsString()
  cargoName!: string;

  @IsOptional()
  @IsString()
  cargoDescription?: string;

  @IsOptional()
  @IsString()
  requirementDescription?: string;

  @IsOptional()
  @IsArray()
  requirementAttachments?: string[];

  @IsOptional()
  @IsArray()
  quoteAttachments?: string[];

  @IsString()
  originPlace!: string;

  @IsString()
  destinationPlace!: string;

  @IsOptional()
  @IsNumber()
  totalWeight?: number;

  @IsOptional()
  @IsNumber()
  totalVolume?: number;

  @IsOptional()
  @IsNumber()
  totalQuantity?: number;

  @IsOptional()
  @IsDateString()
  expectedTime?: string;

  @IsOptional()
  @IsString()
  specialRequirement?: string;
}

export class QuoteInquiryDto {
  @IsNumber()
  quotedAmount!: number;

  @IsString()
  quoteCurrency!: string;

  @IsDateString()
  quoteValidUntil!: string;

  @IsOptional()
  @IsArray()
  quoteAttachments?: string[];
}
