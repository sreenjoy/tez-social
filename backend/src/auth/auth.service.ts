import { Injectable, UnauthorizedException, ConflictException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './schemas/user.schema';
import { RegisterDto, LoginDto, VerifyEmailDto } from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    
    try {
      // Check if email already exists (case insensitive)
      const existingUser = await this.userModel.findOne({ 
        email: new RegExp(`^${registerDto.email}$`, 'i') 
      });
      
      if (existingUser) {
        this.logger.warn(`Registration failed: Email ${registerDto.email} already in use`);
        throw new ConflictException('Email already in use');
      }

      // Check if username already exists
      const existingUsername = await this.userModel.findOne({ 
        username: registerDto.username 
      });
      
      if (existingUsername) {
        this.logger.warn(`Registration failed: Username ${registerDto.username} already in use`);
        throw new ConflictException('Username already in use');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Generate verification token
      const verificationToken = uuidv4();
      const tokenExpiration = new Date();
      tokenExpiration.setHours(tokenExpiration.getHours() + 24); // Token valid for 24 hours

      // Create new user with verification token
      const newUser = new this.userModel({
        ...registerDto,
        password: hashedPassword,
        email: registerDto.email.toLowerCase(),
        verificationToken,
        verificationTokenExpires: tokenExpiration,
        isEmailVerified: false,
      });

      const savedUser = await newUser.save();

      // Send verification email
      await this.sendVerificationEmail(savedUser.email, verificationToken);

      return {
        message: 'Registration successful. Please check your email to verify your account.',
        userId: savedUser._id,
      };
    } catch (error) {
      // Rethrow ConflictException but log and wrap other errors
      if (error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw new BadRequestException('Registration failed. Please try again later.');
    }
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    
    // Find user by email (case insensitive)
    const user = await this.userModel.findOne({ 
      email: new RegExp(`^${loginDto.email}$`, 'i') 
    });

    if (!user) {
      this.logger.warn(`Login failed: No user found with email ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if password is set (for users who might have registered with OAuth)
    if (!user.password) {
      this.logger.warn(`Login failed: User ${loginDto.email} has no password set`);
      throw new UnauthorizedException('This account cannot be accessed with password');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for user ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      this.logger.warn(`Login attempt with unverified email: ${loginDto.email}`);
      throw new UnauthorizedException('Email not verified. Please check your inbox for verification link.');
    }

    // Generate JWT
    const payload = { sub: user._id, email: user.email, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: user.toSafeObject(),
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    this.logger.log(`Email verification attempt with token: ${verifyEmailDto.token.substring(0, 8)}...`);
    
    try {
      // Find user by verification token
      const user = await this.userModel.findOne({ 
        verificationToken: verifyEmailDto.token,
        verificationTokenExpires: { $gt: new Date() } // Token must not be expired
      });

      if (!user) {
        this.logger.warn(`Email verification failed: Invalid or expired token`);
        throw new BadRequestException('Invalid or expired verification token');
      }

      // Update user as verified
      user.isEmailVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

      return {
        message: 'Email verified successfully',
        userId: user._id,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Email verification failed: ${error.message}`, error.stack);
      throw new BadRequestException('Email verification failed. Please try again later.');
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    // In a real application, you would use a proper email service like SendGrid, AWS SES, etc.
    this.logger.log(`Sending verification email to ${email} with token ${token.substring(0, 8)}...`);
    
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/auth/verify?token=${token}`;
    
    // Log the verification URL for development purposes
    this.logger.debug(`Verification URL: ${verificationUrl}`);
    
    // Here would be the actual email sending logic
    // For now, we'll just log that we would send an email
    this.logger.log(`[EMAIL SERVICE] Email verification link sent to ${email}`);
    
    return true;
  }

  async resendVerificationEmail(email: string) {
    this.logger.log(`Resend verification email request for ${email}`);
    
    try {
      // Find user by email
      const user = await this.userModel.findOne({ email: new RegExp(`^${email}$`, 'i') });
      
      if (!user) {
        this.logger.warn(`Resend verification failed: No user found with email ${email}`);
        throw new NotFoundException('User not found');
      }
      
      if (user.isEmailVerified) {
        this.logger.warn(`Resend verification failed: Email ${email} already verified`);
        throw new BadRequestException('Email already verified');
      }
      
      // Generate new verification token
      const verificationToken = uuidv4();
      const tokenExpiration = new Date();
      tokenExpiration.setHours(tokenExpiration.getHours() + 24); // Token valid for 24 hours
      
      // Update user with new verification token
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = tokenExpiration;
      await user.save();
      
      // Send new verification email
      await this.sendVerificationEmail(user.email, verificationToken);
      
      return {
        message: 'Verification email resent. Please check your inbox.',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Resend verification failed: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to resend verification email. Please try again later.');
    }
  }

  async validateUser(userId: string, email: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (user && user.email === email) {
      return user.toSafeObject();
    }
    return null;
  }

  async getUserOnboardingStatus(userId: string) {
    try {
      const user = await this.userModel.findById(userId);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      return {
        isEmailVerified: user.isEmailVerified,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      };
    } catch (error) {
      this.logger.error(`Failed to get user onboarding status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshToken(userId: string) {
    try {
      const user = await this.userModel.findById(userId);
      
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      
      // Generate new JWT
      const payload = { sub: user._id, email: user.email, role: user.role };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: user.toSafeObject(),
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
      throw error;
    }
  }
} 