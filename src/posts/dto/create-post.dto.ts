import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, MinLength } from 'class-validator';
import { PostType } from '../entities/post.entity';

export class CreatePostDto {
  @ApiProperty({ example: 'Desarrollo de App Móvil para Cafetería' })
  @IsString()
  @MinLength(5)
  title: string;

  @ApiProperty({ example: 'Busco un diseñador UI/UX y un dev frontend...' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ enum: PostType, example: PostType.PROJECT })
  @IsEnum(PostType)
  type: PostType;

  // YA NO PEDIMOS authorId, LO SACAMOS DEL TOKEN
}