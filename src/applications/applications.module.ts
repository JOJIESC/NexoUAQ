import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Necesario para bases de datos
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './entities/application.entity'; // <--- ESTO ES LO QUE FALTABA
import { Post } from '../posts/entities/post.entity'; // <--- También importamos Post

@Module({
  imports: [
    // Registramos ambas entidades para poder usarlas en el servicio
    TypeOrmModule.forFeature([Application, Post]), 
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}