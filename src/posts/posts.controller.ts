import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  ParseUUIDPipe, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport'; // <--- El Guardián JWT

@ApiTags('Posts (Proyectos)')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt')) // 1. Protegemos la ruta
  @ApiBearerAuth()             // 2. Habilitamos botón de candado en Swagger
  @ApiOperation({ summary: 'Crear un proyecto (Requiere Login)' })
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    // 3. Pasamos el DTO y el ID del usuario logueado (req.user.userId)
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los proyectos' })
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de un proyecto' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }
}