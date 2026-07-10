import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security and Compression
  app.use(helmet());
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
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
