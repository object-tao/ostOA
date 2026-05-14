import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [roles, ports, logs] = await Promise.all([
      this.prisma.systemRole.findMany({
        orderBy: { createdAt: 'desc' },
        include: { users: true },
      }),
      this.prisma.portDirectory.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.operationLog.findMany({
        orderBy: { actionTime: 'desc' },
        take: 8,
      }),
    ]);

    return {
      roles: roles.map((role) => ({
        roleName: role.roleName,
        scope: `${role.roleCode} / 用户数 ${role.users.length}`,
      })),
      dictionaries: [
        { name: '口岸字典', description: `已维护 ${ports.length} 个口岸资料` },
        { name: '角色权限', description: `已维护 ${roles.length} 个系统角色` },
        { name: '操作日志', description: `最近展示 ${logs.length} 条关键操作日志` },
      ],
      ports: ports.map((port) => ({
        portName: port.portName,
        country: port.country,
        mode: port.mode,
      })),
      logs,
    };
  }
}
