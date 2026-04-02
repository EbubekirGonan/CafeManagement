import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';
import { ExpenseCategory } from './expense-category.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => ExpenseCategory, (ec) => ec.expenses, { eager: false, nullable: true })
  @JoinColumn({ name: 'expense_category_id' })
  expenseCategory: ExpenseCategory;

  @Column({ nullable: true })
  expense_category_id: string;

  @Column()
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @ManyToOne(() => Business, (business) => business.expenses)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column()
  business_id: string;
}
