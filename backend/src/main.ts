import * as dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- TEMPORARY REQUEST LOGGING MIDDLEWARE ---
  app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.originalUrl}`);
    res.on('finish', () => {
      console.log(`[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
    });
    next();
  });
  // ---------------------------------------------

  // Security and Compression
  app.use(helmet());
  app.use(compression());

  // Enable CORS
  // NOTE: Cannot use origin:'*' with credentials:true — browser rejects this combination.
  // We use an explicit allowlist of origins instead.
  const allowedOrigins = [
    'https://test.axcrivo.in',
    'https://axcrivo.in',
    'http://localhost:5173',
    'http://localhost:3000',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
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

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Gaming Platform API')
    .setDescription('The game catalog and provider sync API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  // Log public IP to console logs on startup to make whitelisting easy
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    console.log('\n=========================================');
    console.log(`SERVER OUTBOUND PUBLIC IP: ${data.ip}`);
    console.log('=========================================\n');
  } catch (err: any) {
    console.warn('Could not fetch outbound IP on startup:', err.message);
  }
}
bootstrap();
