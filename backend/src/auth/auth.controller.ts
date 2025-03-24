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
    // Make sure we always use the production URL for redirects
    this.frontendUrl = 'https://tez-social.vercel.app';
    this.logger.log(`AuthController initialized with frontend URL: ${this.frontendUrl}`);
    
    // Log that we're using paths with /api prefix
    this.logger.log(`Auth routes configured with /api prefix. Google OAuth will use: /api/auth/google and /api/auth/google/callback`);
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
    this.logger.log(`Google OAuth route accessed at /api/auth/google - redirecting to Google login.`);
    this.logger.log(`RedirectTo param: ${redirectTo || 'not provided'}`);
    
    // We don't need to store redirectTo anymore as we'll use a fixed URL
    // This will redirect to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: any, @Res() res: Response) {
    this.logger.log('Google OAuth callback received at /api/auth/google/callback');
    
    try {
      this.logger.log(`Google OAuth callback data: ${JSON.stringify(req.user || {})}`);
      const { access_token, user } = req.user || {};
      
      if (!access_token || !user) {
        this.logger.error('Missing user data or access token in Google callback');
        return res.redirect(`${this.frontendUrl}/auth/callback?error=authentication_failed&reason=missing_data`);
      }
      
      // Always use a fixed production redirect URL
      const callbackUrl = `${this.frontendUrl}/auth/callback`;
      
      // Add token and user data to the redirect URL
      const finalRedirectUrl = `${callbackUrl}?token=${access_token}&googleUser=${encodeURIComponent(JSON.stringify(user))}&source=google`;
      
      this.logger.log(`Redirecting to: ${finalRedirectUrl}`);
      return res.redirect(finalRedirectUrl);
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