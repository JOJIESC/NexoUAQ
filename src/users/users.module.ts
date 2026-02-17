import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- IMPORTANTE
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';   // <--- IMPORTANTE

@Module({
  imports: [
    // Esto le dice a NestJS: "Este módulo usa la tabla/entidad User"
    // Sin esto, el repositorio no existe y falla la inyección de dependencias.
    TypeOrmModule.forFeature([User]), 
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Buena práctica por si otro módulo necesita buscar usuarios
})
export class UsersModule {}