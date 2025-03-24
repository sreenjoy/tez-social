import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/api/auth/google/callback';

    if (!clientID || !clientSecret) {
      // Log warning but don't throw error for development flexibility
      console.warn('Google OAuth credentials not configured. Google login will not work.');
    }

    super({
      clientID: clientID || 'dummy-client-id-for-dev',
      clientSecret: clientSecret || 'dummy-client-secret-for-dev',
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      this.logger.log(`Google auth for user: ${profile.emails[0].value}`);
      
      const { name, emails, photos } = profile;
      const user = await this.authService.validateGoogleUser({
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos?.[0]?.value,
        googleId: profile.id,
      });

      done(null, user);
    } catch (error) {
      this.logger.error(`Google auth error: ${error.message}`, error.stack);
      done(error, false);
    }
  }
} 