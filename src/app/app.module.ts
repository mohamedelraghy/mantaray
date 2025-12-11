import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { CoreModule } from '@core/core.module';
import { HttpExceptionFilter } from '@core/filters/http-exception.filter';
import { MongooseModuleConfig } from '@core/modules/config/options/database.config';


import * as Core from '@core';
import * as Features from '@features';

@Module({
  imports: [
    Core.Modules.ConfigModule,
    MongooseModule.forRootAsync({
      useClass: MongooseModuleConfig
    }),
    CoreModule,
    Features.AuthModule,
    Features.UsersModule
  ],
  providers: [
    { 
      provide: APP_FILTER, 
      useClass: HttpExceptionFilter 
    },
    // { 
    //   provide: APP_INTERCEPTOR, 
    //   useClass: Core.Interceptors.LoggingInterceptor
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: Core.Interceptors.ResponseWrapperInterceptor
    }
  ]
})
export class AppModule {}
