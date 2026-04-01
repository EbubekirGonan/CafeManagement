import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Session } from '../entities/session.entity';
import { Expense } from '../entities/expense.entity';
import { SessionStatus } from '../enums/session-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async getStats(business_id: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Open sessions (active right now)
    const openCount = await this.sessionRepository.count({
      where: { status: SessionStatus.OPEN },
    });

    // Sessions closed (paid) today
    const closedTodaySessions = await this.sessionRepository.find({
      where: {
        status: SessionStatus.PAID,
        closed_at: Between(todayStart, todayEnd),
      },
    });

    const closedTodayCount = closedTodaySessions.length;

    const dailyRevenue = closedTodaySessions.reduce(
      (sum, s) => sum + Number(s.total_price ?? 0),
      0,
    );

    // Expenses today
    const todayExpenses = await this.expenseRepository.find({
      where: {
        business_id,
        date: Between(todayStart, todayEnd),
      },
    });

    const dailyExpense = todayExpenses.reduce(
      (sum, e) => sum + Number(e.amount ?? 0) * Number(e.quantity ?? 0),
      0,
    );

    return {
      openCount,
      closedTodayCount,
      dailyRevenue,
      dailyExpense,
    };
  }
}
