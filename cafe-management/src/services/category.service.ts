import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/category/create-category.dto';
import { UpdateCategoryDto } from '../dto/category/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  create(dto: CreateCategoryDto, business_id: string) {
    const category = this.categoryRepository.create({ ...dto, business_id });
    return this.categoryRepository.save(category);
  }

  findAll(business_id: string) {
    return this.categoryRepository.find({ where: { business_id } });
  }

  async findOne(id: string, business_id: string) {
    const category = await this.categoryRepository.findOneBy({ id, business_id });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, business_id: string) {
    await this.findOne(id, business_id);
    await this.categoryRepository.update(id, dto);
    return this.findOne(id, business_id);
  }

  async remove(id: string, business_id: string) {
    await this.findOne(id, business_id);
    await this.categoryRepository.delete(id);
  }
}
