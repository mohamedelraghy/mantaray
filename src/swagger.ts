import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ConfigService } from './config/config.services';

export function initSwagger(
  app: INestApplication,
  config: ConfigService,
): void {
  const options = new DocumentBuilder()
    .setTitle('Mantaray task')
    .setDescription('Mantaray task Api documentation')
    .setExternalDoc('Postman Collection', config.apiUrl + '-json')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
}