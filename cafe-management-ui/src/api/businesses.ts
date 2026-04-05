import api from './axios';
import type { Business } from '../types';

export const businessApi = {
  getAll: () => api.get<Business[]>('/businesses'),
  getOne: (id: string) => api.get<Business>(`/businesses/${id}`),
  create: (data: Omit<Business, 'id'>) => api.post<Business>('/businesses', data),
  update: (id: string, data: Partial<Business>) => api.put<Business>(`/businesses/${id}`, data),
  delete: (id: string) => api.delete(`/businesses/${id}`),
};
