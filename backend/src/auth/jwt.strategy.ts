import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'trustrate-super-secret-key-2026-xyz',
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid JWT payload');
    }
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
