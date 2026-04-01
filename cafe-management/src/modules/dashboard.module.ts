import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../entities/session.entity';
import { Expense } from '../entities/expense.entity';
import { DashboardService } from '../services/dashboard.service';
import { DashboardController } from '../controllers/dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Session, Expense])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
