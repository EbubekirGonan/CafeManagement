import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
