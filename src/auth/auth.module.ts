import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule } from '../config/config.module';
import { JwtModuleConfig } from '../config/options/jwt.conifg';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionSerializer } from './serializer/session.serializer';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule.Deferred],
      useClass: JwtModuleConfig,
    }),
    ConfigModule.Deferred,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, SessionSerializer],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
