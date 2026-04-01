import api from './axios';
import type { TableSeat } from '../types';

export const tableSeatApi = {
  getAll: () => api.get<TableSeat[]>('/table-seats'),
  getOne: (id: string) => api.get<TableSeat>(`/table-seats/${id}`),
  create: (data: Omit<TableSeat, 'id'>) => api.post<TableSeat>('/table-seats', data),
  update: (id: string, data: Partial<TableSeat>) => api.put<TableSeat>(`/table-seats/${id}`, data),
  delete: (id: string) => api.delete(`/table-seats/${id}`),
};
