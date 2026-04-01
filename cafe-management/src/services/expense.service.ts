import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { CreateExpenseDto } from '../dto/expense/create-expense.dto';
import { UpdateExpenseDto } from '../dto/expense/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  create(dto: CreateExpenseDto, business_id: string) {
    const expense = this.expenseRepository.create({ ...dto, business_id });
    return this.expenseRepository.save(expense);
  }

  findAll(business_id: string) {
    return this.expenseRepository.find({ where: { business_id } });
  }

  async findOne(id: string, business_id: string) {
    const expense = await this.expenseRepository.findOneBy({ id, business_id });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto, business_id: string) {
    await this.findOne(id, business_id);
    await this.expenseRepository.update(id, dto);
    return this.findOne(id, business_id);
  }

  async remove(id: string, business_id: string) {
    await this.findOne(id, business_id);
    await this.expenseRepository.delete(id);
  }
}
