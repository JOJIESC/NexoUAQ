import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  // Recibimos userId como segundo argumento
  async create(createPostDto: CreatePostDto, userId: string) {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId: userId, // <--- Asignamos el autor automáticamente desde el token
    });
    return await this.postRepository.save(post);
  }

  async findAll() {
    return await this.postRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['author'], // Traemos datos del autor
    });
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({ 
      where: { id },
      relations: ['author'] 
    });
    if (!post) throw new NotFoundException(`Proyecto ${id} no encontrado`);
    return post;
  }

  // Buscar proyectos creados por un usuario específico
  async findMyPosts(userId: string) {
    return await this.postRepository.find({
      where: { authorId: userId },
      order: { createdAt: 'DESC' },
      relations: ['author'], // Opcional: trae los datos del autor si los necesitas en el frontend
    });
  }
  
}