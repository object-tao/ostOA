import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TariffQuoteDto {
  @IsString()
  countryCode!: string;

  @IsString()
  hsCode!: string;

  @IsOptional()
  @IsString()
  originCountryCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  invoiceValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freightCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  insuranceCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customsValue?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  additionalTaxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  additionalTaxAmount?: number;

  @IsOptional()
  @IsString()
  additionalTaxLabel?: string;
}
