import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';
import { Expense } from './expense.entity';

@Entity('expense_categories')
export class ExpenseCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Business, (business) => business.expenseCategories)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column()
  business_id: string;

  @OneToMany(() => Expense, (expense) => expense.expenseCategory)
  expenses: Expense[];
}
