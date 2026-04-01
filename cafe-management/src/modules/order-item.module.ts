import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { Session } from '../entities/session.entity';
import { OrderItemService } from '../services/order-item.service';
import { OrderItemController } from '../controllers/order-item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, Session])],
  controllers: [OrderItemController],
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}
