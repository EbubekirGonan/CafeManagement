import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableSeat } from '../entities/table-seat.entity';
import { TableSeatService } from '../services/table-seat.service';
import { TableSeatController } from '../controllers/table-seat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TableSeat])],
  controllers: [TableSeatController],
  providers: [TableSeatService],
  exports: [TableSeatService],
})
export class TableSeatModule {}
