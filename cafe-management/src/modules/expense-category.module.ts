import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategory } from '../entities/expense-category.entity';
import { ExpenseCategoryService } from '../services/expense-category.service';
import { ExpenseCategoryController } from '../controllers/expense-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseCategory])],
  controllers: [ExpenseCategoryController],
  providers: [ExpenseCategoryService],
  exports: [ExpenseCategoryService],
})
export class ExpenseCategoryModule {}
