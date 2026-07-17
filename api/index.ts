// @ts-nocheck — this file imports from ../dist/ which only exists after nest build
// It is compiled separately by Vercel using api/tsconfig.json, not by nest build
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import express from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (app) return app;

  const { AppModule } = await import('../dist/src/app.module.js');
  const { AllExceptionsFilter } = await import('../dist/src/common/filters/http-exception.filter.js');
  const { TransformInterceptor } = await import('../dist/src/common/interceptors/transform.interceptor.js');

  const adapter = new ExpressAdapter(server);
  app = await NestFactory.create(AppModule, adapter);

  app.setGlobalPrefix('api');

  const corsOriginValue = process.env.CORS_ORIGIN || 'https://dhakawholesale.com,http://localhost:3000';
  const corsOrigins = corsOriginValue.split(',').map((o: string) => o.trim()).filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false,
  }));
  app.use(compression());

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  if (process.env.ENABLE_SWAGGER === 'true') {
    const swagger = await import('@nestjs/swagger');
    const config = new swagger.DocumentBuilder()
      .setTitle('Dhaka Wholesale E-Commerce API')
      .setDescription('E-commerce backend for Dhaka Wholesale store')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = swagger.SwaggerModule.createDocument(app, config);
    swagger.SwaggerModule.setup('api/docs', app, document);
  }

  await app.init();
  return app;
}

export default async function handler(req: any, res: any) {
  await bootstrap();
  server(req, res);
}
