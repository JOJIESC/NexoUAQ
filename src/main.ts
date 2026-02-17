import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Activar validaciones globales (para los DTOs)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina campos que no estén en el DTO
    forbidNonWhitelisted: true, // Lanza error si mandan basura extra
  }));

  // 2. Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Nexo UAQ API')
    .setDescription('Documentación de la API para la plataforma colaborativa Nexo UAQ')
    .setVersion('1.0')
    .addTag('Users') // Tags para organizar endpoints
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // La documentación estará en /api

  // 3. CORS (Para que el Frontend pueda conectarse después)
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();