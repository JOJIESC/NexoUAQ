import { 
  Injectable, 
  BadRequestException, 
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 1. CREAR USUARIO
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;
      const passwordHash = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        ...userData,
        passwordHash,
      });

      await this.userRepository.save(user);

      // Ahora TypeScript te dejará borrarlo porque pusimos el '?' en la entidad
      delete user.passwordHash;
      
      return user;

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  // 2. LISTAR TODOS
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 3. BUSCAR POR ID
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return user;
  }

  // 4. BUSCAR POR EMAIL (Corrección aquí)
  // Cambiamos Promise<User> a Promise<User | null>
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'name', 'role', 'lastname'],
    });
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException('El correo electrónico ya está registrado en Nexo UAQ.');
    }
    console.error(error);
    throw new InternalServerErrorException('Error inesperado, revise los logs.');
  }
}