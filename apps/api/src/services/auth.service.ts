import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.systemUser.findUnique({
      where: { username: dto.username },
      include: { role: true },
    });

    if (!user || user.passwordHash !== dto.password) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        username: user.username,
        roleCode: user.role?.roleCode ?? 'USER',
      }),
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        roleCode: user.role?.roleCode ?? 'USER',
        roleName: user.role?.roleName ?? '普通用户',
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.systemUser.findFirst({
      where: userId ? { id: userId } : { username: 'admin' },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      roleCode: user.role?.roleCode ?? 'USER',
      roleName: user.role?.roleName ?? '普通用户',
    };
  }
}
