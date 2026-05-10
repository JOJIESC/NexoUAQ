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

/**
 * Tipos de notificación. Coincide con el código que se inserta en la columna
 * `type` (string libre en la DB, pero usamos este enum como source of truth
 * desde el código).
 */
export enum NotificationType {
  /** Alguien aplicó a uno de mis posts */
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  /** El dueño de un post aceptó mi aplicación */
  APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED',
  /** El dueño de un post rechazó mi aplicación */
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
}

/**
 * Mapea la tabla `notifications` que ya existe en la base.
 *
 * Schema real:
 *   id              uuid PK
 *   user_id         uuid → users(id)
 *   title           varchar
 *   body            text
 *   reference_id    uuid (genérico — por ahora apunta al post)
 *   type            varchar (usamos NotificationType como valores)
 *   is_read         boolean
 *   created_at      timestamp
 */
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
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ApiProperty({ example: 'Nueva postulación' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @ApiProperty({ example: 'Pedro Chávez se postuló a tu proyecto "Web App"' })
  @Column({ type: 'text', nullable: true })
  body: string;

  /** ID del recurso relacionado (típicamente el post). */
  @ApiProperty({ required: false })
  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId?: string;

  @ApiProperty({ enum: NotificationType })
  @Column({ type: 'varchar', length: 50, nullable: true })
  type: NotificationType;

  /** True cuando el usuario ya marcó la notificación como leída. */
  @ApiProperty({ default: false })
  @Column({ name: 'is_read', type: 'boolean', default: false, nullable: true })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
