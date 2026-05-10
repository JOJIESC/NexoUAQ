import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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

  // 4. BUSCAR POR EMAIL
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'name', 'role', 'lastname'],
    });
  }

  // 5. ACTUALIZAR PERFIL
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findOne(userId);

    Object.assign(user, dto);
    await this.userRepository.save(user);

    return user;
  }

  // 6. CAMBIAR CONTRASEÑA
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ success: boolean }> {
    // Necesitamos el passwordHash, que está marcado como select: false
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (!user.passwordHash) {
      throw new InternalServerErrorException('El usuario no tiene contraseña configurada');
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);

    return { success: true };
  }

  // 7. ELIMINAR CUENTA (Soft delete)
  // El usuario queda marcado con deleted_at; las consultas normales lo ignoran.
  // Sus posts y aplicaciones permanecen para no romper datos históricos.
  async deleteAccount(userId: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.userRepository.softDelete(userId);

    return { success: true };
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException('El correo electrónico ya está registrado en Nexo UAQ.');
    }
    console.error(error);
    throw new InternalServerErrorException('Error inesperado, revise los logs.');
  }
}
