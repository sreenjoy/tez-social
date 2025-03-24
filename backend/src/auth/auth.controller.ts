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
        return this.sendAuthSuccessPage(res, null, null, 'Authentication failed: Missing user data or access token');
      }
      
      // Debug information about the frontend URL
      this.logger.log(`DEBUG: frontendUrl from config: "${this.frontendUrl}"`);
      this.logger.log(`DEBUG: frontendUrl type: ${typeof this.frontendUrl}`);
      
      // Since we're having issues with Vercel deployment, let's send a success page with the token and user data
      return this.sendAuthSuccessPage(res, access_token, user);
      
    } catch (error) {
      this.logger.error(`Error in Google callback: ${error.message}`);
      this.logger.error(error.stack);
      return this.sendAuthSuccessPage(res, null, null, `Authentication failed: ${error.message}`);
    }
  }
  
  private sendAuthSuccessPage(res: Response, token: string | null, userData: any, errorMessage?: string) {
    const htmlResponse = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${errorMessage ? 'Authentication Error' : 'Authentication Successful'}</title>
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.5;
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
          color: #333;
        }
        .card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        h1 {
          color: ${errorMessage ? '#e53e3e' : '#3182ce'};
          margin-top: 0;
        }
        pre {
          background-color: #f7fafc;
          border-radius: 4px;
          padding: 1rem;
          overflow-x: auto;
        }
        .success {
          color: #38a169;
          font-weight: bold;
        }
        .error {
          color: #e53e3e;
          font-weight: bold;
        }
        .btn {
          display: inline-block;
          background-color: #3182ce;
          color: white;
          font-weight: bold;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
          margin: 1rem 0;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>${errorMessage ? 'Authentication Error' : 'Authentication Successful'}</h1>
        
        ${errorMessage 
          ? `<p class="error">${errorMessage}</p>` 
          : `<p class="success">You have successfully authenticated with Google!</p>`
        }
        
        <p>Since the Vercel deployment is currently not accessible, please use the following authentication data:</p>
        
        ${token && userData ? `
        <h2>Authentication Data:</h2>
        <pre>
// Token:
${token}

// User Data:
${JSON.stringify(userData, null, 2)}
        </pre>
        
        <div>
          <p>To manually authenticate:</p>
          <ol>
            <li>Open your browser console (F12)</li>
            <li>Paste and run the following code:</li>
          </ol>
          
          <pre>
// Store token
localStorage.setItem('token', '${token}');

// Store user data
localStorage.setItem('user', '${JSON.stringify(userData).replace(/'/g, "\\'")}');

// Set login state
localStorage.setItem('isLoggedIn', 'true');

console.log('Authentication data stored successfully!');
          </pre>
          
          <button class="btn" onclick="
            localStorage.setItem('token', '${token}');
            localStorage.setItem('user', '${JSON.stringify(userData).replace(/'/g, "\\'")}');
            localStorage.setItem('isLoggedIn', 'true');
            alert('Authentication data stored successfully! You can now navigate to your application.');
          ">
            Store Authentication Data
          </button>
        </div>
        ` : ''}
        
        <p>
          Please contact the administrator if you continue to experience issues.
        </p>
      </div>
    </body>
    </html>
    `;
    
    return res.type('html').send(htmlResponse);
  }
} 