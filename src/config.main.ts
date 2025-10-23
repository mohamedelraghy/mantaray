import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import * as session from 'express-session';
import helmet from 'helmet';
import * as passport from 'passport';
import { join } from 'path';

import { ConfigService } from './config/config.services';
import { initSwagger } from './swagger';

export function configure(
  app: NestExpressApplication,
  config: ConfigService,
): void {
  app.useStaticAssets(join(__dirname, '..', 'upload'));

  app.set('trust proxy', 1); // trust first proxy
  app.use(
    // Set security-related HTTP headers
    helmet(),
    // Compress response bodies for most requests
    compression(),
    // Parse Cookie header and populate req.cookies with an object keyed by the cookie names
    cookieParser(),
    // Simple cookie-based session middleware
    session({
      secret: 'your-secret-key', // Replace with your secret key
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.isProd, // Only use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),

    passport.initialize(),

    passport.session(),

    // Basic rate-limiting middleware for Express
    rateLimit({
      windowMs: 10 * 60 * 1000, // 1 Hour
      max: config.rateLimit,
      message: 'Too many requests, please try again later.',
    }),
  );

  // Registers pipes as global pipes (will be used within every HTTP route handler)
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

  // Registers a prefix for every HTTP route path.
  app.setGlobalPrefix(config.globalPrefix, { exclude: ['/', '/health'] });

  // Initialize swagger documentation
  initSwagger(app, config);
}