import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';
import { UserRole } from '../enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password_hash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @ManyToOne(() => Business, (business) => business.users)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column()
  business_id: string;
}
