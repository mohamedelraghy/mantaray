import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import * as session from 'express-session';
import helmet from 'helmet';
import * as passport from 'passport';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { initSwagger } from './swagger';

export function configure(
  app: NestExpressApplication,
  configService: ConfigService,
): void {
  app.useStaticAssets(join(__dirname, '..', 'upload'));

  app.set('trust proxy', 1);
  const isProd = configService.get<string>('NODE_ENV') === 'production';
  
  app.use(
    helmet(),
    compression(),
    cookieParser(),
    session({
      secret: configService.get<string>('JWT_SECRET') || 'your-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProd,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),

    passport.initialize(),

    passport.session(),

    rateLimit({
      windowMs: 10 * 60 * 1000,
      max: configService.get<number>('RATE_LIMIT') || 100,
      message: 'Too many requests, please try again later.',
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const allowedOrigins = [
    'http://localhost:3000',
  ];

  app.enableCors({
    credentials: true,
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.setGlobalPrefix(configService.get<string>('GLOBAL_PREFIX') || 'api', { exclude: ['/', '/health'] });

  initSwagger(app, configService);
}