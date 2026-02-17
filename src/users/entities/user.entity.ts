import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../../posts/entities/post.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  MODERATOR = 'MODERATOR',
}

@Entity({ name: 'users' }) // 'users' es el nombre exacto de la tabla en SQL
export class User {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID único (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'pedro.chavez@uaq.mx', description: 'Correo institucional' })
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', select: false }) // select: false para no devolver el password por error al frontend
  passwordHash?: string;

  @ApiProperty({ example: 'Pedro', description: 'Nombre(s)' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Chávez Hernández', description: 'Apellidos' })
  @Column()
  lastname: string;

  @ApiProperty({ example: 'STUDENT', enum: UserRole })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @ApiProperty({ example: 'Soy desarrollador backend...', description: 'Biografía' })
  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}