import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TableSeat } from './table-seat.entity';
import { OrderItem } from './order-item.entity';
import { SessionStatus } from '../enums';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_price: number;

  @Column({ type: 'enum', enum: SessionStatus })
  status: SessionStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  opened_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  @ManyToOne(() => TableSeat, (table) => table.sessions)
  @JoinColumn({ name: 'table_id' })
  table: TableSeat;

  @Column()
  table_id: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.session)
  orderItems: OrderItem[];
}
