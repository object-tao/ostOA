import { Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalDecisionStatus, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildCode } from '../common/utils/business';
import { buildPagedResult } from '../common/utils/pagination';
import { ApprovalDecisionDto, CreateApprovalDto } from '../dto/approval.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateApprovalDto) {
    return this.prisma.approvalRequest.create({
      data: {
        approvalNo: buildCode('APR'),
        approvalType: dto.approvalType,
        relatedNo: dto.relatedNo,
        relatedId: dto.relatedId,
        amount: dto.amount ?? 0,
        applicantName: dto.applicantName,
        approverName: dto.approverName,
        remark: dto.remark,
        createdBy: dto.applicantName,
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const where: Prisma.ApprovalRequestWhereInput = {
      status: query.status ? (query.status as ApprovalDecisionStatus) : undefined,
      OR: query.keyword
        ? [
            { approvalNo: { contains: query.keyword } },
            { approvalType: { contains: query.keyword } },
            { relatedNo: { contains: query.keyword } },
            { applicantName: { contains: query.keyword } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.approvalRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.approvalRequest.count({ where }),
    ]);

    return buildPagedResult(
      items.map((item) => ({
        ...item,
        statusText:
          item.status === ApprovalDecisionStatus.APPROVED
            ? '已通过'
            : item.status === ApprovalDecisionStatus.REJECTED
              ? '已驳回'
              : '待审批',
      })),
      total,
      query.page,
      query.pageSize,
    );
  }

  async decide(id: string, dto: ApprovalDecisionDto) {
    const current = await this.prisma.approvalRequest.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('审批单不存在');
    }

    const status =
      dto.decision === 'APPROVED'
        ? ApprovalDecisionStatus.APPROVED
        : dto.decision === 'REJECTED'
          ? ApprovalDecisionStatus.REJECTED
          : ApprovalDecisionStatus.PENDING;

    return this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status,
        remark: dto.remark ?? current.remark,
      },
    });
  }
}
