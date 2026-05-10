import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../../posts/entities/post.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  MODERATOR = 'MODERATOR',
}

/**
 * Mapea la tabla `users`. La DB tiene además columnas que no exponemos
 * desde este backend (student_id, facultad_id, career_id, avatar_url,
 * linkedin_url, is_verified, last_login). Las dejamos sin mapear para
 * no interferir con su gestión externa.
 */
@Entity({ name: 'users' })
export class User {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'pedro.chavez@uaq.mx' })
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash?: string;

  @ApiProperty({ example: 'Pedro' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Chávez Hernández' })
  @Column()
  lastname: string;

  @ApiProperty({ enum: UserRole })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @ApiProperty({ example: 'Soy desarrollador backend...' })
  @Column({ type: 'text', nullable: true })
  bio: string;

  /**
   * `is_active = false` se usa como "cuenta eliminada / desactivada".
   * No usamos @DeleteDateColumn porque la DB ya tenía esta columna
   * desde antes y conviene unificar.
   */
  @ApiProperty({ default: true })
  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
