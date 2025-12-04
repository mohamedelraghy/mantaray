import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtModuleConfig implements JwtOptionsFactory {
  constructor(private configService: ConfigService) {}
  createJwtOptions(): Promise<JwtModuleOptions> | JwtModuleOptions {
    return {
      secret: this.configService.get<string>('JWT_SECRET')!,
      signOptions: { expiresIn: this.configService.get<string>('JWT_EXPIRY') || '1d' },
      global: true,
    };
  }
}