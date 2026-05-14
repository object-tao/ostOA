import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class AxleLoadDto {
  @IsString()
  @MaxLength(32)
  axleName!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight!: number;
}

export class SimulateOversizeQuoteDto {
  @IsString()
  countryCode!: string;

  @IsString()
  originPlace!: string;

  @IsString()
  destinationPlace!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  routeDistanceKm!: number;

  @IsString()
  vehicleType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  axleCount!: number;

  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => AxleLoadDto)
  axleLoads: AxleLoadDto[] = [];

  @IsOptional()
  @IsString()
  cargoName?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cargoWeight!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cargoLength!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cargoWidth!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cargoHeight!: number;

  @IsBoolean()
  isIndivisible = true;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quoteMarkupRate?: number;
}

export class CreateOversizeQuoteDto extends SimulateOversizeQuoteDto {
  @IsOptional()
  @IsString()
  inquiryId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quotedPrice?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateOversizeCountryRuleDto {
  @IsString()
  countryCode!: string;

  @IsString()
  countryName!: string;

  @IsString()
  permitMode!: string;

  @Type(() => Number)
  @IsNumber()
  maxTotalWeight!: number;

  @Type(() => Number)
  @IsNumber()
  maxAxleWeight!: number;

  @Type(() => Number)
  @IsNumber()
  maxLength!: number;

  @Type(() => Number)
  @IsNumber()
  maxWidth!: number;

  @Type(() => Number)
  @IsNumber()
  maxHeight!: number;

  @Type(() => Number)
  @IsNumber()
  manualReviewWeight!: number;

  @Type(() => Number)
  @IsNumber()
  manualReviewWidth!: number;

  @Type(() => Number)
  @IsNumber()
  manualReviewHeight!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  escortWidth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  escortWeight?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  permitLeadDays!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskHints?: string[];
}

export class LoadPlanItemDto {
  @IsString()
  boxNo!: string;

  @IsString()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lengthMm!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  widthMm!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  heightMm!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKg!: number;

  @IsBoolean()
  allowRotate = false;

  @IsBoolean()
  allowStack = false;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class SimulateLoadPlanDto {
  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoadPlanItemDto)
  items: LoadPlanItemDto[] = [];
}
