import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../common/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(createUserDto: any) {
    const { email, password, ...rest } = createUserDto;
    
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      ...rest,
    });

    const savedUser = await newUser.save();
    const { password: _, ...result } = savedUser.toObject();
    
    return this.login(result);
  }

  async validateGoogleUser(profile: any) {
    let user = await this.userModel.findOne({ email: profile.email });
    
    if (!user) {
      const newUser = new this.userModel({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        googleId: profile.googleId,
        isEmailVerified: true,
      });
      user = await newUser.save();
    } else if (!user.googleId) {
      user.googleId = profile.googleId;
      user.isEmailVerified = true;
      await user.save();
    }

    const { password, ...result } = user.toObject();
    return result;
  }
} 