import api from './axios';
import type { User } from '../types';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  businessId: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  businessId?: string;
}

export const userApi = {
  getAll: () => api.get<User[]>('/users'),
  getOne: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserPayload) => api.post<User>('/users', data),
  update: (id: string, data: UpdateUserPayload) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
