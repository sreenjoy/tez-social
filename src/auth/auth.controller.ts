import { Controller, Post, Body, UseGuards, Get, Req, Res, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Registration failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google OAuth2 redirect - handled by Passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.authService.validateGoogleUser(req.user);
      const { access_token } = await this.authService.login(user);
      
      // Redirect to frontend with token
      const redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/callback?token=${access_token}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      // Redirect to frontend with error
      const redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/error?message=${encodeURIComponent(error.message)}`;
      return res.redirect(redirectUrl);
    }
  }
} 