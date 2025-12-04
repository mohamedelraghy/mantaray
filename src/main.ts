import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { configure } from './config.main';
import { ConfigService } from '@nestjs/config';
import { SuperAdminInitService } from './core/services/super-admin-init.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose', 'log'],
  });

  const configService = app.get(ConfigService);
  const superAdminInitService = app.get(SuperAdminInitService);
  const port = configService.get<number>('PORT') || 3000;
  
  configure(app, configService);

  await superAdminInitService.initializeSuperAdmin();

  const superAdminCredentials = superAdminInitService.getSuperAdminCredentials();

  await app.listen(port, () => {
    Logger.verbose(
      `🚀 Server listening on PORT:${port} | ${configService.get('NODE_ENV')} | ${configService.get('API_URL')} | Super Admin: ${superAdminCredentials.email}:${superAdminCredentials.password}`,
    );
  });
}
bootstrap();
