import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';
import { NotificationsModule } from './notifications/notifications.module';

// Entities listadas explícitamente (en lugar de glob `__dirname + '/**/*.entity{.ts,.js}'`)
// para que el bundler de @vercel/node las resuelva en serverless sin scanear filesystem
// en runtime (lo cual fallaba al encontrar archivos .ts crudos en /var/task).
import { User } from './users/entities/user.entity';
import { Post } from './posts/entities/post.entity';
import { Application } from './applications/entities/application.entity';
import { Notification } from './notifications/entities/notification.entity';

@Module({
  imports: [
    // 1. Configuración Global (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Conexión a Base de Datos (Async para asegurar que lea el .env primero)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Post, Application, Notification],
        // ⚠️ IMPORTANTE: 'synchronize: false' porque tú creaste la DB con SQL manual.
        // Si lo pones en true, TypeORM intentará cambiar tus tablas y puede borrar datos.
        synchronize: false,
        ssl: { rejectUnauthorized: false }, // Necesario para AWS RDS
      }),
    }),

    UsersModule,
    PostsModule,
    AuthModule,
    ApplicationsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
