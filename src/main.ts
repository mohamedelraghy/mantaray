import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { configure } from './config.main';
import { ConfigService } from './config/config.services';
import { SuperAdminInitService } from './core/services/super-admin-init.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose', 'log'],
  });

  const config = app.get(ConfigService);
  const superAdminInitService = app.get(SuperAdminInitService);
  const port = process.env.PORT || config.port || 3000;
  
  configure(app, config);

  // Initialize super admin user
  await superAdminInitService.initializeSuperAdmin();

  // Get super admin credentials for logging
  const superAdminCredentials = superAdminInitService.getSuperAdminCredentials();

  await app.listen(port, () => {
    Logger.verbose(
      `🚀 Server listening on PORT:${port} | ${config.nodeEnv} | ${config.apiUrl} | Super Admin: ${superAdminCredentials.email}:${superAdminCredentials.password}`,
    );
  });
}
bootstrap();
