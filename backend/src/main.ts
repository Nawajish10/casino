import * as dns from 'dns';
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';

import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // --- REQUEST LOGGING MIDDLEWARE (Development only) ---
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      logger.log(`[REQ] ${req.method} ${req.originalUrl}`);
      res.on('finish', () => {
        logger.log(`[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
      });
      next();
    });
  }

  // Serve static uploaded files (QR codes, payment screenshots)
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Security and Compression
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(compression());

  // Enable CORS with flexible production matching
  const configuredOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
    : [];

  const defaultAllowedOrigins = [
    'https://test.axcrivo.in',
    'https://axcrivo.in',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:3000',
  ];

  const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultAllowedOrigins]));

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      // Exact origin match
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel deployments (*.vercel.app)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // In non-production, allow all localhost origins
      if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Swagger Documentation Setup (Only enabled if explicitly enabled or not in production)
  if (process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Gaming Platform API')
      .setDescription('The game catalog and provider sync API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Dynamic Port Binding for Render/Railway/Heroku/Vercel compatibility
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Server running on port ${port} [Environment: ${process.env.NODE_ENV || 'development'}]`);

  // Log outbound IP on startup for provider whitelisting
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data: any = await res.json();
    logger.log(`Server outbound public IP: ${data.ip}`);
  } catch (err: any) {
    logger.warn(`Could not fetch outbound IP on startup: ${err.message}`);
  }
}
bootstrap();
