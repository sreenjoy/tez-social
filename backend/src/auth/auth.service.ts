import { Injectable, UnauthorizedException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(userData: RegisterDto) {
    try {
      const { email, password, username } = userData;
      
      // Convert email to lowercase for case insensitivity
      const normalizedEmail = email.toLowerCase();

      // Check if user already exists (case insensitive)
      const existingUser = await this.userModel.findOne({ 
        email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
      });
      
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new this.userModel({
        email: normalizedEmail, // Store email in lowercase
        password: hashedPassword,
        username,
      });

      await newUser.save();

      return this.generateAuthResponse(newUser);
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      
      if (error instanceof ConflictException) {
        throw error; // Rethrow conflict exceptions
      }
      
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Invalid input data');
      }
      
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      
      // Convert email to lowercase for case insensitivity
      const normalizedEmail = email.toLowerCase();

      // Find user (case insensitive)
      const user = await this.userModel.findOne({ 
        email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
      });
      
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password || '');
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException) {
        throw error; // Rethrow unauthorized exceptions
      }
      
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Invalid input data');
      }
      
      throw error;
    }
  }

  async refreshToken(userId: string) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      
      return this.generateAuthResponse(user);
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private generateAuthResponse(user: User) {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        picture: user.picture,
      },
    };
  }
} 