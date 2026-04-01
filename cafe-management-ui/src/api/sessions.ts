import api from './axios';
import type { Session } from '../types';

export const sessionApi = {
  getAll: (status?: string) => api.get<Session[]>('/sessions', { params: status ? { status } : {} }),
  getOne: (id: string) => api.get<Session>(`/sessions/${id}`),
  getActiveByTable: (tableId: string) => api.get<Session>(`/sessions/table/${tableId}/active`),
  create: (data: { table_id: string }) => api.post<Session>('/sessions', data),
  close: (id: string) => api.patch<Session>(`/sessions/${id}/close`),
  update: (id: string, data: Partial<Session>) => api.put<Session>(`/sessions/${id}`, data),
  delete: (id: string) => api.delete(`/sessions/${id}`),
};
