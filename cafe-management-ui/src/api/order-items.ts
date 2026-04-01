import api from './axios';
import type { OrderItem } from '../types';

export const orderItemApi = {
  getAll: () => api.get<OrderItem[]>('/order-items'),
  getBySession: (sessionId: string) => api.get<OrderItem[]>(`/order-items/session/${sessionId}`),
  getOne: (id: string) => api.get<OrderItem>(`/order-items/${id}`),
  create: (data: Omit<OrderItem, 'id'>) => api.post<OrderItem>('/order-items', data),
  update: (id: string, data: Partial<OrderItem>) => api.put<OrderItem>(`/order-items/${id}`, data),
  delete: (id: string) => api.delete(`/order-items/${id}`),
};
