import * as dns from 'dns';
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

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
  const allowedOrigins = [
    'https://test.axcrivo.in',
    'https://axcrivo.in',
    'http://localhost:5173',
    'http://127.0.0.1:4173',
    'http://localhost:4173',
    'http://127.0.0.1:4174',
    'http://localhost:4174',
    'http://127.0.0.1:4175',
    'http://localhost:4175',
    'http://localhost:3000',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ];

  app.enableCors({
    origin: (origin, callback) => {
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

  // Force listening on port 3000 because Railway Target Port is set to 3000.
  // If we use process.env.PORT, Railway might assign a random internal port (e.g., 6543)
  // while the proxy still routes traffic to 3000, causing a 502 Bad Gateway.
  const targetPort = 3000;
  await app.listen(targetPort, '0.0.0.0');
  console.log(`Listening strictly on port ${targetPort} for Railway proxy compatibility`);

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
