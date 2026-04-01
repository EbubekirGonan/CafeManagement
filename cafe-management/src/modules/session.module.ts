import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../entities/session.entity';
import { TableSeat } from '../entities/table-seat.entity';
import { OrderItem } from '../entities/order-item.entity';
import { SessionService } from '../services/session.service';
import { SessionController } from '../controllers/session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Session, TableSeat, OrderItem])],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
