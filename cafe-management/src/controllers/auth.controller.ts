import { Controller, Post, Body } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import { AuthService } from '../services/auth.service';
import { Public } from '../decorators/public.decorator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
