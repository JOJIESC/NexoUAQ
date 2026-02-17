import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Importaremos el módulo de usuarios más adelante
// import { UsersModule } from './users/users.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';

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
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
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
    
    // UsersModule, (Lo crearemos en el paso 5)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}