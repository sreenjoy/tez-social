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
    
    // Use the exact callback URL that was registered in Google Cloud Console
    const callbackURL = configService.get('GOOGLE_CALLBACK_URL') || 'https://tez-social-production.up.railway.app/auth/google/callback';
    
    console.log(`[GoogleStrategy] Configuring with callbackURL: ${callbackURL}`);
    console.log(`[GoogleStrategy] Client ID present: ${!!clientID}`);
    
    super({
      clientID,
      clientSecret,
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
      if (!profile || !profile.emails || !profile.emails.length) {
        return done(new Error('Invalid profile data'), false);
      }
      
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
      done(error, false);
    }
  }
} 