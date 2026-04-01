import api from './axios';
import type { Section } from '../types';

export const sectionApi = {
  getAll: () => api.get<Section[]>('/sections'),
  getOne: (id: string) => api.get<Section>(`/sections/${id}`),
  create: (data: Omit<Section, 'id'>) => api.post<Section>('/sections', data),
  update: (id: string, data: Partial<Section>) => api.put<Section>(`/sections/${id}`, data),
  delete: (id: string) => api.delete(`/sections/${id}`),
};
