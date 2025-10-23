import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModuleConfig } from './config/options/database.config';
import { ConfigModule } from './config/config.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModuleConfig } from './config/options/config.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './classes/classes.module';
import { MembershipsModule } from './memberships/memberships.module';
import { BookingsModule } from './bookings/bookings.module';
import { CoreModule } from './core/core.module';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
@Module({
  imports: [
    ConfigModule.forRootAsync(ConfigModule, { useClass: ConfigModuleConfig }),
    MongooseModule.forRootAsync({
      useClass: MongooseModuleConfig,
      imports: [ConfigModule.Deferred],
    }),
    CoreModule,
    AuthModule,
    UsersModule,
    ClassesModule,
    MembershipsModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
