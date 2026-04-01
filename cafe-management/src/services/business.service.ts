import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../entities/business.entity';
import { CreateBusinessDto } from '../dto/business/create-business.dto';
import { UpdateBusinessDto } from '../dto/business/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  create(dto: CreateBusinessDto) {
    const business = this.businessRepository.create(dto);
    return this.businessRepository.save(business);
  }

  findAll() {
    return this.businessRepository.find();
  }

  async findOne(id: string) {
    const business = await this.businessRepository.findOneBy({ id });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async update(id: string, dto: UpdateBusinessDto) {
    await this.findOne(id);
    await this.businessRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.businessRepository.delete(id);
  }
}
