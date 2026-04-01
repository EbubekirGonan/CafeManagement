import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { TableSeat } from '../entities/table-seat.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CreateSessionDto } from '../dto/session/create-session.dto';
import { UpdateSessionDto } from '../dto/session/update-session.dto';
import { SessionStatus } from '../enums/session-status.enum';
import { TableStatus } from '../enums/table-status.enum';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(TableSeat)
    private readonly tableSeatRepository: Repository<TableSeat>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateSessionDto) {
    return this.dataSource.transaction(async (manager) => {
      const session = manager.create(Session, {
        table_id: dto.table_id,
        status: SessionStatus.OPEN,
        total_price: 0,
      });
      const saved = await manager.save(Session, session);
      await manager.update(TableSeat, dto.table_id, { status: TableStatus.OCCUPIED });
      return saved;
    });
  }

  findAll(status?: string) {
    const relations = { table: { section: true } };
    if (status) {
      return this.sessionRepository.find({
        where: { status: status as SessionStatus },
        relations,
        order: { opened_at: 'DESC' },
      });
    }
    return this.sessionRepository.find({ relations, order: { opened_at: 'DESC' } });
  }

  async findOne(id: string) {
    const session = await this.sessionRepository.findOneBy({ id });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async findActiveByTable(tableId: string) {
    return this.sessionRepository.findOne({
      where: { table_id: tableId, status: SessionStatus.OPEN },
    });
  }

  async closeSession(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const session = await manager.findOneBy(Session, { id });
      if (!session) throw new NotFoundException('Session not found');

      const items = await manager.find(OrderItem, {
        where: { session_id: id },
      });
      const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

      await manager.update(Session, id, {
        status: SessionStatus.PAID,
        total_price: total,
        closed_at: new Date(),
      });
      await manager.update(TableSeat, session.table_id, { status: TableStatus.AVAILABLE });

      return manager.findOneBy(Session, { id });
    });
  }

  async update(id: string, dto: UpdateSessionDto) {
    await this.findOne(id);
    await this.sessionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.sessionRepository.delete(id);
  }
}
