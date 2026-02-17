import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum PostType {
  PROJECT = 'PROJECT',
  WORKSHOP = 'WORKSHOP',
}

export enum PostStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'posts' })
export class Post {
  @ApiProperty({ example: 'uuid-v4...', description: 'ID único del post' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Sistema de Riego IoT', description: 'Título del proyecto' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Busco colaborador para programar en Arduino...', description: 'Descripción detallada' })
  @Column('text')
  description: string;

  @ApiProperty({ enum: PostType, example: PostType.PROJECT })
  @Column({ type: 'enum', enum: PostType })
  type: PostType;

  @ApiProperty({ enum: PostStatus, example: PostStatus.OPEN })
  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.OPEN })
  status: PostStatus;

  // RELACIÓN: Un Post pertenece a un User (Autor)
  @ManyToOne(() => User, (user) => user.posts, { eager: true }) // eager: true trae los datos del autor automáticamente
  @JoinColumn({ name: 'author_id' }) // Mapea a la columna 'author_id' en SQL
  author: User;

  @Column({ name: 'author_id' }) // Columna auxiliar para guardar el ID directamente si es necesario
  authorId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}