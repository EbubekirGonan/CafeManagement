import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../entities/section.entity';
import { CreateSectionDto } from '../dto/section/create-section.dto';
import { UpdateSectionDto } from '../dto/section/update-section.dto';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  create(dto: CreateSectionDto, business_id: string) {
    const section = this.sectionRepository.create({ ...dto, business_id });
    return this.sectionRepository.save(section);
  }

  findAll(business_id: string) {
    return this.sectionRepository.find({ where: { business_id } });
  }

  async findOne(id: string, business_id: string) {
    const section = await this.sectionRepository.findOneBy({ id, business_id });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async update(id: string, dto: UpdateSectionDto, business_id: string) {
    await this.findOne(id, business_id);
    await this.sectionRepository.update(id, dto);
    return this.findOne(id, business_id);
  }

  async remove(id: string, business_id: string) {
    await this.findOne(id, business_id);
    await this.sectionRepository.delete(id);
  }
}
