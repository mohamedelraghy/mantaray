import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config.services';

@Injectable()
export class JwtModuleConfig implements JwtOptionsFactory {
  constructor(private configService: ConfigService) {}
  createJwtOptions(): Promise<JwtModuleOptions> | JwtModuleOptions {
    return {
      secret: this.configService.jwtSecret,
      signOptions: { expiresIn: this.configService.jwtExpiry },
      global: true,
    };
  }
}