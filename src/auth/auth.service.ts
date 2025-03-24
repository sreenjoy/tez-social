import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../common/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email, isActive: true });
      if (!user) {
        return null;
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return null;
      }
      
      const { password: _, ...result } = user.toObject();
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error validating user: ' + error.message);
    }
  }

  async login(user: any) {
    try {
      const payload = { 
        email: user.email, 
        sub: user._id,
        role: user.role
      };
      
      return {
        access_token: this.jwtService.sign(payload, {
          expiresIn: this.configService.get('jwt.expiresIn') || '24h',
          secret: this.configService.get('jwt.secret')
        }),
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      };
    } catch (error) {
      throw new InternalServerErrorException('Login failed: ' + error.message);
    }
  }

  async register(registerDto: RegisterDto) {
    const { email, password, ...rest } = registerDto;
    
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create new user
      const newUser = new this.userModel({
        email,
        password: hashedPassword,
        ...rest,
      });
      
      const savedUser = await newUser.save();
      const { password: _, ...result } = savedUser.toObject();
      
      // Return JWT token
      return this.login(result);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed: ' + error.message);
    }
  }

  async validateGoogleUser(profile: any) {
    try {
      if (!profile || !profile.email) {
        throw new BadRequestException('Invalid Google profile data');
      }
      
      let user = await this.userModel.findOne({ email: profile.email });
      
      if (!user) {
        // Create new user from Google profile
        const newUser = new this.userModel({
          email: profile.email,
          firstName: profile.firstName || profile.given_name,
          lastName: profile.lastName || profile.family_name,
          googleId: profile.googleId || profile.id,
          isEmailVerified: true,
          // Generate a random password for the user - they'll never use it
          password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
        });
        user = await newUser.save();
      } else if (!user.googleId) {
        // Update existing user with Google ID
        user.googleId = profile.googleId || profile.id;
        user.isEmailVerified = true;
        await user.save();
      }
      
      const { password, ...result } = user.toObject();
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Google authentication failed: ' + error.message);
    }
  }
} 