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
    
    // Log the configuration for debugging
    this.logger.log(`JWT Strategy initialized with secret: ${configService.get('JWT_SECRET') ? '[SECRET CONFIGURED]' : '[SECRET MISSING]'}`);
    this.logger.log(`JWT Expiration: ${configService.get('JWT_EXPIRATION') || '1d'}`);
  }

  async validate(payload: any) {
    try {
      this.logger.debug(`Validating JWT payload: ${JSON.stringify({ sub: payload.sub, email: payload.email })}`);
      
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

      // Check if the email matches what's in the token, but case insensitive
      if (user.email.toLowerCase() !== email.toLowerCase()) {
        this.logger.warn(`Email mismatch during JWT validation for user ${sub}. Token: ${email}, DB: ${user.email}`);
        throw new UnauthorizedException('Token email mismatch');
      }

      // Return a user object with the necessary fields
      return { 
        userId: sub, 
        email: user.email, 
        username: user.username,
        role: user.role 
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`JWT validation error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid user session');
    }
  }
} 