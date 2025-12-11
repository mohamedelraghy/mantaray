import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function initSwagger(
  app: INestApplication,
  configService: ConfigService
): void {
  const options = new DocumentBuilder()
    .setTitle('Profolio task')
    .setDescription('Profolio task Api documentation')
    .setExternalDoc('Postman Collection', configService.get<string>('API_URL') + '-json')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
}