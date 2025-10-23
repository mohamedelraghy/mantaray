import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Module } from '@nestjs/common';

import { CONFIG_MODULE_OPTIONS } from './config.constants';
import { ConfigService } from './config.services';
import { ConfigModuleOptions } from './interfaces/configOptions.interface';

@Module({})
export class ConfigModule extends createConfigurableDynamicRootModule<
  ConfigModule,
  ConfigModuleOptions
>(CONFIG_MODULE_OPTIONS, {
  providers: [ConfigService],
  exports: [ConfigService],
}) {
  /**
   * To prevent calling externallyConfigured every time, we create a static property to use instead.
   */
  static Deferred = ConfigModule.externallyConfigured(ConfigModule, 0);
}