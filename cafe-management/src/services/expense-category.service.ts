import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseCategory } from '../entities/expense-category.entity';
import { CreateExpenseCategoryDto } from '../dto/expense-category/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from '../dto/expense-category/update-expense-category.dto';

@Injectable()
export class ExpenseCategoryService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private readonly repo: Repository<ExpenseCategory>,
  ) {}

  create(dto: CreateExpenseCategoryDto, business_id: string) {
    const category = this.repo.create({ ...dto, business_id });
    return this.repo.save(category);
  }

  findAll(business_id: string) {
    return this.repo.find({ where: { business_id }, order: { name: 'ASC' } });
  }

  async findOne(id: string, business_id: string) {
    const category = await this.repo.findOneBy({ id, business_id });
    if (!category) throw new NotFoundException('Expense category not found');
    return category;
  }

  async update(id: string, dto: UpdateExpenseCategoryDto, business_id: string) {
    await this.findOne(id, business_id);
    await this.repo.update(id, dto);
    return this.findOne(id, business_id);
  }

  async remove(id: string, business_id: string) {
    await this.findOne(id, business_id);
    await this.repo.delete(id);
  }
}
