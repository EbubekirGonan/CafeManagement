import api from './axios';
import type { Category } from '../types';

export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories'),
  getOne: (id: string) => api.get<Category>(`/categories/${id}`),
  create: (data: Omit<Category, 'id'>) => api.post<Category>('/categories', data),
  update: (id: string, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};
