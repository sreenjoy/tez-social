import { Controller, Post, Body, UseGuards, Get, Req, Res, HttpStatus, Logger, Query } from '@nestjs/common';
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
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'https://tez-social.vercel.app';
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
  googleAuth(@Query('redirectTo') redirectTo: string, @Req() req: any) {
    this.logger.log(`Google OAuth route accessed - redirecting to Google login. 
      RedirectTo param: ${redirectTo || 'not provided'}`);
    
    // Store redirectTo in session if provided, otherwise use default
    if (req.session) {
      req.session.redirectTo = redirectTo || `${this.frontendUrl}/auth/callback`;
      this.logger.log(`Stored redirectTo in session: ${req.session.redirectTo}`);
    }
    
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
        return res.redirect(`${this.frontendUrl}/auth/callback?error=authentication_failed&reason=missing_data`);
      }
      
      // Get redirectTo from session or use default
      const redirectTo = req.session?.redirectTo || `${this.frontendUrl}/auth/callback`;
      
      // Check if redirectTo is already a full URL
      const redirectUrl = redirectTo.includes('://') 
        ? `${redirectTo}?token=${access_token}&googleUser=${encodeURIComponent(JSON.stringify(user))}&source=google`
        : `${this.frontendUrl}${redirectTo}?token=${access_token}&googleUser=${encodeURIComponent(JSON.stringify(user))}&source=google`;
      
      this.logger.log(`Redirecting to frontend URL: ${redirectUrl}`);
      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(`Error in Google callback: ${error.message}`);
      this.logger.error(error.stack);
      return res.redirect(`${this.frontendUrl}/auth/callback?error=authentication_failed&reason=server_error`);
    }
  }
  
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getCurrentUser(@Req() req: any) {
    return req.user;
  }
} 