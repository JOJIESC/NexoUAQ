import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'pedro.chavez@uaq.mx' })
  @IsEmail()
  @Matches(/@uaq\.mx$/, { message: 'El correo debe ser dominio @uaq.mx' })
  email: string;

  @ApiProperty({ example: 'PasswordSuperSeguro123!' })
  @IsString()
  @MinLength(6)
  password: string; // Recibimos 'password', en el servicio lo convertiremos a 'passwordHash'

  @ApiProperty({ example: 'Pedro' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Chávez Hernández' })
  @IsString()
  lastname: string;

  @ApiProperty({ example: 'Me gusta programar en NestJS', required: false })
  @IsString()
  @IsOptional()
  bio?: string;
}