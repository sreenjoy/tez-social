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
        return {
          property: error.property,
          constraints: error.constraints
        };
      });
      
      return new BadRequestException({
        message: 'Validation failed',
        errors: messages
      });
    }
  }))
  async register(@Body() registerDto: RegisterDto) {
    try {
      this.logger.log(`Registration attempt for email: ${registerDto.email}`);
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
      const userId = req.user.userId;
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
      const { userId, email } = req.user;
      
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
      const result = await this.authService.getUserOnboardingStatus(req.user.userId);
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
} 