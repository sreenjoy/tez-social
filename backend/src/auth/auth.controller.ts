import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Req, 
  HttpStatus, 
  Logger, 
  HttpCode,
  ValidationPipe,
  UsePipes,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyEmailDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => {
        console.log('Validation error:', JSON.stringify(error));
        return {
          property: error.property,
          constraints: error.constraints
        };
      });
      
      console.log('All validation errors:', JSON.stringify(messages));
      
      return new BadRequestException({
        message: 'Validation failed',
        errors: messages
      });
    }
  }))
  async register(@Body() registerDto: RegisterDto) {
    try {
      this.logger.log(`Registration attempt with data: ${JSON.stringify(registerDto)}`);
      const result = await this.authService.register(registerDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Success',
        data: result,
        timestamp: new Date().toISOString(),
        path: '/api/auth/register',
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true
  }))
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: result,
        timestamp: new Date().toISOString(),
        path: '/api/auth/login',
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: any) {
    try {
      const userId = req.user.sub;
      const result = await this.authService.refreshToken(userId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: result,
        timestamp: new Date().toISOString(),
        path: '/api/auth/refresh-token',
      };
    } catch (error) {
      this.logger.error(`Token refresh error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any) {
    // In a stateless JWT approach, the server doesn't need to do anything
    // Client is responsible for removing the token, but we return a success response
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully logged out',
      timestamp: new Date().toISOString(),
      path: '/api/auth/logout',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    try {
      this.logger.log(`Get profile called for user: ${JSON.stringify(req.user)}`);
      
      // Check if we have the userId from the JWT strategy
      if (!req.user || !req.user.userId) {
        this.logger.warn(`Invalid user object in request: ${JSON.stringify(req.user)}`);
        throw new UnauthorizedException('Invalid user session');
      }
      
      const { userId, email } = req.user;
      
      // Log what we're trying to validate
      this.logger.log(`Validating user with userId: ${userId} and email: ${email}`);
      
      const user = await this.authService.validateUser(userId, email);
      
      if (!user) {
        this.logger.warn(`User validation failed for userId: ${userId}`);
        throw new UnauthorizedException('Invalid user session');
      }
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: user,
        timestamp: new Date().toISOString(),
        path: '/api/auth/me',
      };
    } catch (error) {
      this.logger.error(`Get profile error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body('email') email: string) {
    try {
      if (!email) {
        throw new BadRequestException('Email is required');
      }
      
      const result = await this.authService.resendVerificationEmail(email);
      return {
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: result,
        timestamp: new Date().toISOString(),
        path: '/api/auth/resend-verification',
      };
    } catch (error) {
      this.logger.error(`Resend verification error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('onboarding-status')
  @UseGuards(JwtAuthGuard)
  async getOnboardingStatus(@Req() req: any) {
    try {
      const result = await this.authService.getUserOnboardingStatus(req.user.sub);
      return {
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: result,
        timestamp: new Date().toISOString(),
        path: '/api/auth/onboarding-status',
      };
    } catch (error) {
      this.logger.error(`Get onboarding status error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('dev/verify-all-users')
  @HttpCode(HttpStatus.OK)
  async verifyAllUsers() {
    try {
      const result = await this.authService.verifyAllUsers();
      return {
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: result,
        timestamp: new Date().toISOString(),
        path: '/api/auth/dev/verify-all-users',
      };
    } catch (error) {
      this.logger.error(`Verify all users error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('dev/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { email: string; newPassword: string }) {
    try {
      if (!body.email || !body.newPassword) {
        throw new BadRequestException('Email and new password are required');
      }
      
      const result = await this.authService.resetUserPassword(body.email, body.newPassword);
      return {
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: result,
        timestamp: new Date().toISOString(),
        path: '/api/auth/dev/reset-password',
      };
    } catch (error) {
      this.logger.error(`Reset password error: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Test endpoint for debugging token validation
  @Get('test-auth')
  @UseGuards(JwtAuthGuard)
  testAuth(@Req() req) {
    this.logger.log(`Test auth endpoint called with user: ${JSON.stringify(req.user)}`);
    return {
      success: true,
      message: 'Authentication is working correctly',
      user: req.user,
      timestamp: new Date().toISOString()
    };
  }
} 