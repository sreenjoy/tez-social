import { Controller, Post, Body, UseGuards, Get, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Controller('auth')
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
      path: '/auth/register',
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
      path: '/auth/login',
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    this.logger.log('Redirecting to Google OAuth');
    // This will redirect to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: any, @Res() res: Response) {
    this.logger.log('Google OAuth callback received');
    
    try {
      const { access_token, user } = req.user || {};
      
      if (!access_token || !user) {
        this.logger.error('Missing user data or access token');
        return res.redirect(`${this.frontendUrl}/login?error=authentication_failed`);
      }
      
      // Create a URL with the token as a parameter
      const redirectUrl = `${this.frontendUrl}/auth/google/success?token=${access_token}&user=${encodeURIComponent(JSON.stringify(user))}`;
      
      // Redirect to frontend with token
      this.logger.log(`Redirecting to frontend: ${redirectUrl}`);
      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(`Error in Google callback: ${error.message}`);
      return res.redirect(`${this.frontendUrl}/login?error=authentication_failed`);
    }
  }
} 