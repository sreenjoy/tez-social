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
    this.logger.log(`AuthController initialized with frontend URL: ${this.frontendUrl}`);
    
    // Debug all environment variables
    this.logger.log(`DEBUG: All environment variables: ${JSON.stringify(process.env)}`);
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
  googleAuth() {
    this.logger.log('Google OAuth route accessed - redirecting to Google login');
    // This will redirect to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: any, @Res() res: Response) {
    this.logger.log('Google OAuth callback received');
    
    try {
      this.logger.log(`Google OAuth callback data: ${JSON.stringify(req.user || {})}`);
      const { access_token, user } = req.user || {};
      
      if (!access_token || !user) {
        this.logger.error('Missing user data or access token in Google callback');
        return res.redirect(`${this.frontendUrl}/login?error=authentication_failed&reason=missing_data`);
      }
      
      // Debug information about the frontend URL
      this.logger.log(`DEBUG: frontendUrl from config: "${this.frontendUrl}"`);
      this.logger.log(`DEBUG: frontendUrl type: ${typeof this.frontendUrl}`);
      
      // Force use the correct frontend URL
      const correctFrontendUrl = 'https://tez-social-frontend.vercel.app';
      this.logger.log(`DEBUG: Using hardcoded frontend URL: ${correctFrontendUrl}`);
      
      // Store auth data in local storage using a landing page
      // The success page doesn't exist yet, so redirect to a login page with params
      const redirectUrl = `${correctFrontendUrl}/login?token=${access_token}&googleUser=${encodeURIComponent(JSON.stringify(user))}&source=google`;
      
      // Log the exact redirect URL for debugging
      this.logger.log(`Redirecting to frontend URL: ${redirectUrl}`);
      
      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(`Error in Google callback: ${error.message}`);
      this.logger.error(error.stack);
      return res.redirect(`${this.frontendUrl}/login?error=authentication_failed&reason=server_error`);
    }
  }
} 