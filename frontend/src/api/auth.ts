import api from './axios';
import { AuthResponse, User } from '../types';

export const authApi = {
  register: async (data: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  getMe: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
