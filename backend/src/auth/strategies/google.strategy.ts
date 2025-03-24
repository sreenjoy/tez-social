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
    
    // Updated callback URL to match what's used in the Google redirect
    const callbackURL = 'https://tez-social-production.up.railway.app/api/auth/google/callback';
    
    // First call super before using this
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
    
    if (!clientID || !clientSecret) {
      this.logger.error('Google OAuth credentials not configured properly. Check your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env variables.');
    }

    this.logger.log(`Configuring Google Strategy with clientID: ${clientID ? '***' + clientID.substring(clientID.length - 5) : 'missing'}`);
    this.logger.log(`Configuring Google Strategy with callback URL: ${callbackURL}`);
    this.logger.log(`Google Strategy initialized successfully`);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      this.logger.log(`Google auth validation started for profile ID: ${profile.id}`);
      
      if (!profile || !profile.emails || !profile.emails.length) {
        this.logger.error('Invalid profile data received from Google');
        return done(new Error('Invalid profile data'), false);
      }
      
      this.logger.log(`Processing Google auth for user email: ${profile.emails[0].value}`);
      
      const { name, emails, photos } = profile;
      const user = await this.authService.validateGoogleUser({
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos?.[0]?.value,
        googleId: profile.id,
      });

      this.logger.log(`Google auth successful`);
      done(null, { access_token: accessToken, user });
    } catch (error) {
      this.logger.error(`Google auth error: ${error.message}`);
      this.logger.error(error.stack);
      done(error, false);
    }
  }
} 