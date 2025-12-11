import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app/app.module';
import { configure } from './app/app.setup';
import { SuperAdminInitService } from './core/services/super-admin-init.service';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const superAdminInitService = app.get(SuperAdminInitService);

  configure(app, configService);

  await superAdminInitService.initializeSuperAdmin();

  const superAdminCredentials =
    superAdminInitService.getSuperAdminCredentials();

  await app.listen(port);

  Logger.verbose(
    '\n 🚀 Server started' +
    `\n 🔌 Port: ${port}` +
    `\n 🌀 Environment: ${process.env.NODE_ENV}` +
    `\n 📒 API Docs: ${configService.get('API_URL')}` +
    `\n 🙎‍♂️ Super Admin: ${superAdminCredentials.email}:${superAdminCredentials.password}`
  );
}
void bootstrap();
