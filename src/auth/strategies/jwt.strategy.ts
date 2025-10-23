import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '../../config/config.services';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractJwtFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: any) {
    const { sub } = payload;

    const user = await this.usersService.findOne(
      {
        _id: this.usersService.toObjectId(sub as string),
      },
      { password: 0 },
    );

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

export function extractJwtFromCookie(req: Request & { session?: { jwt?: string }, cookies?: { jwt?: string } }): string {
  return req?.session?.jwt || req?.cookies?.jwt || null;
}
