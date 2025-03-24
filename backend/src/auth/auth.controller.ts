import { Controller, Post, Body, UseGuards, Get, Req, Res, HttpStatus, Logger, Query, All } from '@nestjs/common';
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
    console.log(`[AuthController] Initialized with frontend URL: ${this.frontendUrl}`);
  }

  @Post('register')
  async register(@Body() registerDto: any) {
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
    console.log(`[AuthController] Google auth started with redirectTo: ${redirectTo || 'not provided'}`);
    
    // Store the redirect URL in session if available
    if (redirectTo && req.session) {
      req.session.redirectTo = redirectTo;
      console.log(`[AuthController] Stored redirectTo in session: ${redirectTo}`);
    }
    
    // This will redirect to Google OAuth
  }

  // Handle both paths for the callback
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: any, @Res() res: Response) {
    console.log(`[AuthController] Received callback at /auth/google/callback`);
    return this.handleGoogleCallback(req, res);
  }
  
  private handleGoogleCallback(@Req() req: any, @Res() res: Response) {
    console.log(`[AuthController] Processing Google auth callback`);
    console.log(`[AuthController] Callback data:`, req.user ? 'User data present' : 'No user data');
    
    try {
      const { access_token, user } = req.user || {};
      
      if (!access_token || !user) {
        console.log(`[AuthController] Missing user data or token in callback`);
        return res.redirect(`${this.frontendUrl}/auth/login?error=authentication_failed&reason=missing_data`);
      }
      
      // Get the redirectTo URL from session or use the default
      let redirectPage = `${this.frontendUrl}/auth/login`;
      
      // Check if we have a stored redirectTo URL
      if (req.session?.redirectTo) {
        redirectPage = req.session.redirectTo;
        console.log(`[AuthController] Using stored redirect URL: ${redirectPage}`);
        // Clear the session storage
        delete req.session.redirectTo;
      } else {
        console.log(`[AuthController] No stored redirect, using default: ${redirectPage}`);
      }
      
      // Add token and user data to the redirect URL
      const finalRedirectUrl = `${redirectPage}?token=${access_token}&googleUser=${encodeURIComponent(JSON.stringify(user))}&source=google`;
      
      console.log(`[AuthController] Redirecting to: ${redirectPage} (with query params)`);
      return res.redirect(finalRedirectUrl);
    } catch (error) {
      console.error(`[AuthController] Error in callback:`, error);
      return res.redirect(`${this.frontendUrl}/auth/login?error=authentication_failed&reason=server_error`);
    }
  }
  
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getCurrentUser(@Req() req: any) {
    return req.user;
  }
} 