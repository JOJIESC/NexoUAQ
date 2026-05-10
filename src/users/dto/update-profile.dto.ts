import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Permite editar los campos de perfil del usuario autenticado.
 * Email y password tienen sus propios endpoints (no editables aquí).
 */
export class UpdateProfileDto {
  @ApiProperty({ example: 'Pedro', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ example: 'Chávez Hernández', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  lastname?: string;

  @ApiProperty({ example: 'Estudiante de ingeniería en sistemas...', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
