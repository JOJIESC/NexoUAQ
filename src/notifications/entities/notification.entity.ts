import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  /** Alguien aplicó a uno de mis posts */
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  /** El dueño de un post aceptó mi aplicación */
  APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED',
  /** El dueño de un post rechazó mi aplicación */
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
}

@Entity({ name: 'notifications' })
export class Notification {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // El usuario que recibe la notificación
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ enum: NotificationType })
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  /** Título corto para mostrar en UI */
  @ApiProperty({ example: 'Nueva postulación' })
  @Column()
  title: string;

  /** Mensaje legible */
  @ApiProperty({ example: 'Pedro Chávez se postuló a tu proyecto "Web App de hábitos"' })
  @Column({ type: 'text' })
  message: string;

  /** ID del post relacionado (para enlazar) */
  @ApiProperty({ required: false })
  @Column({ name: 'post_id', nullable: true })
  postId?: string;

  /** ID de la application relacionada (para enlazar / mostrar contexto) */
  @ApiProperty({ required: false })
  @Column({ name: 'application_id', nullable: true })
  applicationId?: string;

  /** Cuando el usuario marcó la notificación como leída. Null = no leída. */
  @ApiProperty({ required: false })
  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
