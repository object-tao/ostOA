import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateApprovalDto {
  @IsString()
  approvalType!: string;

  @IsOptional()
  @IsString()
  relatedNo?: string;

  @IsOptional()
  @IsString()
  relatedId?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsString()
  applicantName!: string;

  @IsString()
  approverName!: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class ApprovalDecisionDto {
  @IsString()
  decision!: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
