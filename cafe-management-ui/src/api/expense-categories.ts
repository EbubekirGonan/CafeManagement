import api from './axios';
import type { ExpenseCategory } from '../types';

export const expenseCategoryApi = {
  getAll: () => api.get<ExpenseCategory[]>('/expense-categories'),
  create: (data: { name: string }) => api.post<ExpenseCategory>('/expense-categories', data),
  update: (id: string, data: { name: string }) => api.put<ExpenseCategory>(`/expense-categories/${id}`, data),
  delete: (id: string) => api.delete(`/expense-categories/${id}`),
};
