import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3001);
  const env = config.get<string>('NODE_ENV', 'development');

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: config.get<string>('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
  });

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('v1', { exclude: ['health', 'metrics'] });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  if (env !== 'production') {
    const doc = new DocumentBuilder()
      .setTitle('Retail Arbitrage Intelligence API')
      .setDescription('Enterprise SaaS for retail arbitrage')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'API-KEY')
      .addTag('auth').addTag('users').addTag('products')
      .addTag('opportunities').addTag('deals').addTag('marketplace')
      .addTag('profitability').addTag('freight').addTag('demand')
      .addTag('alerts').addTag('analytics').addTag('health')
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc), {
      swaggerOptions: { persistAuthorization: true, docExpansion: 'none' },
    });
  }

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 RAI API: http://localhost:${port}/v1`);
  console.log(`📚 Swagger: http://localhost:${port}/docs`);
}

bootstrap().catch(console.error);
