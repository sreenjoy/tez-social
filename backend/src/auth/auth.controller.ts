import { Controller, Post, Body, UseGuards, Get, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly frontendUrl: string;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get('FRONTEND_URL') || '';
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
      data: await this.authService.register(registerDto),
      timestamp: new Date().toISOString(),
      path: '/api/auth/register',
    };
  }

  @Post('login')
  async login(@Body() loginDto: any) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
      data: await this.authService.login(loginDto.email, loginDto.password),
      timestamp: new Date().toISOString(),
      path: '/api/auth/login',
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(@Req() req: any) {
    // Add detailed logging
    this.logger.log('Google OAuth request received');
    this.logger.log(`Request URL: ${req.url}`);
    this.logger.log(`Host: ${req.headers.host}`);
    
    // This will redirect to Google OAuth
    return { message: 'Redirecting to Google OAuth' };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: any, @Res() res: Response) {
    this.logger.log('Google OAuth callback received');
    this.logger.log(`Callback URL: ${req.url}`);
    
    const { access_token, user } = req.user;
    
    // Create a URL with the token as a parameter
    const redirectUrl = `${this.frontendUrl}/auth/google/success?token=${access_token}&user=${encodeURIComponent(JSON.stringify(user))}`;
    
    // Redirect to frontend with token
    this.logger.log(`Redirecting to frontend: ${redirectUrl}`);
    res.redirect(redirectUrl);
  }
} 