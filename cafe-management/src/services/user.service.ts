import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(dto: CreateUserDto, business_id: string) {
    const user = this.userRepository.create({ ...dto, business_id });
    return this.userRepository.save(user);
  }

  findAll(business_id: string) {
    return this.userRepository.find({ where: { business_id } });
  }

  async findOne(id: string, business_id: string) {
    const user = await this.userRepository.findOneBy({ id, business_id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, business_id: string) {
    await this.findOne(id, business_id);
    await this.userRepository.update(id, dto);
    return this.findOne(id, business_id);
  }

  async remove(id: string, business_id: string) {
    await this.findOne(id, business_id);
    await this.userRepository.delete(id);
  }

  // --- Superadmin methods (no business_id filter) ---

  async createAsAdmin(dto: CreateUserDto) {
    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password_hash,
      role: dto.role,
      business_id: dto.businessId,
    });
    return this.userRepository.save(user);
  }

  findAllGlobal() {
    return this.userRepository.find({ relations: ['business'] });
  }

  async findOneGlobal(id: string) {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['business'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateAsAdmin(id: string, dto: UpdateUserDto) {
    await this.findOneGlobal(id);
    const { password, ...rest } = dto as any;
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      await this.userRepository.update(id, { ...rest, password_hash });
    } else {
      await this.userRepository.update(id, rest);
    }
    return this.findOneGlobal(id);
  }

  async removeAsAdmin(id: string) {
    await this.findOneGlobal(id);
    await this.userRepository.delete(id);
  }
}
