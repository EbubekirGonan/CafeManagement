import api from './axios';
import type { Expense } from '../types';

export const expenseApi = {
  getAll: () => api.get<Expense[]>('/expenses'),
  getOne: (id: string) => api.get<Expense>(`/expenses/${id}`),
  create: (data: Omit<Expense, 'id'>) => api.post<Expense>('/expenses', data),
  update: (id: string, data: Partial<Expense>) => api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};
