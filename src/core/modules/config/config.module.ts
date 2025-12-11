import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { validateEnvironmentVariables } from './validation/env.validation';

const validate = (configuration: Record<string, any>) => {

  validateEnvironmentVariables(configuration);

  return configuration;
};

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validate
    })
  ]
})

export class ConfigModule { }
