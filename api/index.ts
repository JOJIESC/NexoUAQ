/**
 * Vercel Serverless Function entry point.
 *
 * Wraps la app de NestJS en un handler de Express que Vercel puede invocar
 * como serverless function. La inicialización se cachea entre invocaciones
 * (warm starts) para no levantar Nest en cada request.
 *
 * Para desarrollo local sigues usando `npm run start:dev` que arranca
 * `src/main.ts` como servidor tradicional.
 */
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { type Express, type Request, type Response } from 'express';
import { AppModule } from '../src/app.module';

const expressApp: Express = express();

let bootstrapPromise: Promise<Express> | null = null;

async function bootstrap(): Promise<Express> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
        logger: ['error', 'warn', 'log'],
      });

      // Validaciones globales (consistente con src/main.ts)
      nestApp.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      // Swagger en /docs (no en /api porque /api es la propia función)
      const config = new DocumentBuilder()
        .setTitle('Nexo UAQ API')
        .setDescription('Documentación de la API para la plataforma colaborativa Nexo UAQ')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(nestApp, config);
      SwaggerModule.setup('docs', nestApp, document);

      nestApp.enableCors();

      await nestApp.init();
      return expressApp;
    })();
  }
  return bootstrapPromise;
}

export default async function handler(req: Request, res: Response) {
  const app = await bootstrap();
  return app(req, res);
}
