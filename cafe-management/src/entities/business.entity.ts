import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Section } from './section.entity';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Product } from './product.entity';
import { Expense } from './expense.entity';
import { ExpenseCategory } from './expense-category.entity';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Section, (section) => section.business)
  sections: Section[];

  @OneToMany(() => User, (user) => user.business)
  users: User[];

  @OneToMany(() => Category, (category) => category.business)
  categories: Category[];

  @OneToMany(() => Product, (product) => product.business)
  products: Product[];

  @OneToMany(() => Expense, (expense) => expense.business)
  expenses: Expense[];

  @OneToMany(() => ExpenseCategory, (ec) => ec.business)
  expenseCategories: ExpenseCategory[];
}
