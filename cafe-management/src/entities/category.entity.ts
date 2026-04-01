import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Business, (business) => business.categories)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column()
  business_id: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
