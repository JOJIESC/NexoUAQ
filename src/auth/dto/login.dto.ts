import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'pedro.chavez@uaq.mx' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'PasswordSeguro123' })
  @IsString()
  @MinLength(6)
  password: string;
}