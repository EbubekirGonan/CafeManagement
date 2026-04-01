import api from './axios';

export interface DashboardStats {
  openCount: number;
  closedTodayCount: number;
  dailyRevenue: number;
  dailyExpense: number;
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
};
