import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { LoginDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  profile(@Req() req: { user?: { sub: string } }) {
    return this.authService.getProfile(req.user?.sub ?? '');
  }
}
