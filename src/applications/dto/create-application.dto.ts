import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'Me interesa mucho colaborar porque...' })
  @IsString()
  @IsOptional() // Puede ser opcional
  message?: string;
}