import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/schema/user.schema';
import { RegisterDTO } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() register : RegisterDTO) {
    return this.authService.register(register);
  }

  @Post('login')
  login(@Body()body: { username: string; password: string }) {
    return this.authService.login(body.username,body.password);
  }
  
  @Post('refresh')
   async refresh(@Body() body: { refreshToken: string }) {
      const user = await this.authService.validateRefreshToken(body.refreshToken);
      if (!user) {
         throw new Error('Invalid refresh token');
      }

      const newAccessToken = this.authService.generateAccessToken(user);
      return {
         access_token: newAccessToken,
      };
   }
}
