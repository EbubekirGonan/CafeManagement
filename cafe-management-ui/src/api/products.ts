import api from './axios';
import type { Product } from '../types';

export const productApi = {
  getAll: () => api.get<Product[]>('/products'),
  getOne: (id: string) => api.get<Product>(`/products/${id}`),
  create: (data: Omit<Product, 'id'>) => api.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};
