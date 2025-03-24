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
    
    // Hardcode the callback URL to ensure it's correct
    const callbackURL = 'https://tez-social-production.up.railway.app/api/auth/google/callback';
    
    if (!clientID || !clientSecret) {
      console.warn('Google OAuth credentials not configured properly.');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
    
    this.logger.log(`Initialized Google Strategy with callback URL: ${callbackURL}`);
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

      done(null, { access_token: accessToken, user });
    } catch (error) {
      this.logger.error(`Google auth error: ${error.message}`);
      done(error, false);
    }
  }
} 