import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName?: string;
  picture?: string;
  googleId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(userData: any) {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await newUser.save();

    return this.generateAuthResponse(newUser);
  }

  async login(email: string, password: string) {
    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password if user has a password (might not have if they registered via OAuth)
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else {
      // If no password, they must login with OAuth
      throw new UnauthorizedException('Please use Google Sign In for this account');
    }

    return this.generateAuthResponse(user);
  }

  async validateGoogleUser(googleUser: GoogleUser) {
    this.logger.log(`Validating Google user: ${googleUser.email}`);
    
    const { email, firstName, lastName, picture, googleId } = googleUser;

    // Try to find existing user
    let user = await this.userModel.findOne({ email });

    if (user) {
      // Update Google ID if not already set
      if (!user.googleId) {
        user.googleId = googleId;
      }
      
      // Update picture if provided
      if (picture) {
        user.picture = picture;
      }
      
      await user.save();
    } else {
      // Create new user if not exists
      user = new this.userModel({
        email,
        firstName,
        lastName,
        picture,
        googleId,
      });
      
      await user.save();
    }

    return this.generateAuthResponse(user);
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
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        picture: user.picture,
      },
    };
  }
} 