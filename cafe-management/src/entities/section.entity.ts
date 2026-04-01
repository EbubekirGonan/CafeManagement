import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';
import { TableSeat } from './table-seat.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Business, (business) => business.sections)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column()
  business_id: string;

  @OneToMany(() => TableSeat, (tableSeat) => tableSeat.section)
  tableSeats: TableSeat[];
}
