import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const user = await this.authService.signup(dto);
    const token = await this.authService.login({ email: dto.email, password: dto.password });
    return { user, token };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const token = await this.authService.login(dto);
    if (!token) throw new UnauthorizedException('Invalid credentials');
    return { token };
  }
}
