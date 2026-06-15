import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID', 'not-configured'),
      clientSecret: config.get('GOOGLE_CLIENT_SECRET', 'not-configured'),
      callbackURL: config.get('GOOGLE_CALLBACK_URL', 'http://localhost:3001/v1/auth/google/callback'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      name: name.givenName + ' ' + name.familyName,
      avatarUrl: photos[0]?.value,
      provider: 'google',
      providerId: profile.id,
      accessToken,
    };
    done(null, user);
  }
}
