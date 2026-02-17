import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity({ name: 'applications' })
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @ApiProperty({ example: 'Hola, soy bueno en React y me interesa tu proyecto.' })
  @Column('text', { nullable: true })
  message: string;

  // RELACIÓN: Muchas aplicaciones pertenecen a un Proyecto
  @ManyToOne(() => Post, { onDelete: 'CASCADE' }) // Si se borra el post, se borran las solicitudes
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ name: 'post_id' })
  postId: string;

  // RELACIÓN: Muchas aplicaciones son hechas por un Usuario (Candidato)
  @ManyToOne(() => User, { eager: true }) // eager: true para ver quién aplicó
  @JoinColumn({ name: 'applicant_id' })
  applicant: User;

  @Column({ name: 'applicant_id' })
  applicantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}