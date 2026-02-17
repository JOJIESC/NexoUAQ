import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- No olvides esto
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';   // <--- Importar Entidad

@Module({
  imports: [TypeOrmModule.forFeature([Post])], // <--- Registra la tabla
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}