import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Req() req) {
    return this.dashboardService.getStats(req.user.business_id);
  }
}
