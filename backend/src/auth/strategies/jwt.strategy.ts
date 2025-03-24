import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      const { sub, email } = payload;
      
      // Verify payload has required fields
      if (!sub || !email) {
        this.logger.warn('JWT payload missing required fields');
        throw new UnauthorizedException('Invalid token format');
      }

      // Find user by ID
      const user = await this.userModel.findById(sub);

      if (!user) {
        this.logger.warn(`User with ID ${sub} not found during JWT validation`);
        throw new UnauthorizedException('User not found');
      }

      // Check if the email matches what's in the token
      if (user.email !== email) {
        this.logger.warn(`Email mismatch during JWT validation for user ${sub}`);
        throw new UnauthorizedException('Token validation failed');
      }

      // Return the user payload for the request
      return { sub, email, role: user.role };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`JWT validation error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Authentication failed');
    }
  }
} 