import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { Session } from '../entities/session.entity';
import { CreateOrderItemDto } from '../dto/order-item/create-order-item.dto';
import { UpdateOrderItemDto } from '../dto/order-item/update-order-item.dto';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  private async recalcSessionTotal(sessionId: string) {
    const items = await this.orderItemRepository.find({ where: { session_id: sessionId } });
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    await this.sessionRepository.update(sessionId, { total_price: total });
  }

  async create(dto: CreateOrderItemDto) {
    const orderItem = this.orderItemRepository.create(dto);
    const saved = await this.orderItemRepository.save(orderItem);
    await this.recalcSessionTotal(dto.session_id);
    return saved;
  }

  findAll() {
    return this.orderItemRepository.find();
  }

  findBySession(sessionId: string) {
    return this.orderItemRepository.find({
      where: { session_id: sessionId },
      relations: ['product'],
    });
  }

  async findOne(id: string) {
    const orderItem = await this.orderItemRepository.findOneBy({ id });
    if (!orderItem) throw new NotFoundException('OrderItem not found');
    return orderItem;
  }

  async update(id: string, dto: UpdateOrderItemDto) {
    await this.findOne(id);
    await this.orderItemRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    const sessionId = item.session_id;
    await this.orderItemRepository.delete(id);
    await this.recalcSessionTotal(sessionId);
  }
}
