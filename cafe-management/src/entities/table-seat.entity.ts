import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Section } from './section.entity';
import { Session } from './session.entity';
import { TableStatus } from '../enums';

@Entity('table_seats')
export class TableSeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: TableStatus })
  status: TableStatus;

  @ManyToOne(() => Section, (section) => section.tableSeats)
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column()
  section_id: string;

  @OneToMany(() => Session, (session) => session.table)
  sessions: Session[];
}
