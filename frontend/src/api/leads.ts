import api from './axios';
import { Lead, LeadFilters, LeadFormData, LeadsResponse, LeadStats } from '../types';

export const leadsApi = {
  getLeads: async (filters: LeadFilters): Promise<LeadsResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.append(k, String(v)); });
    const res = await api.get<LeadsResponse>(`/leads?${params.toString()}`);
    return res.data;
  },

  getLeadById: async (id: string): Promise<{ success: boolean; data: Lead }> => {
    const res = await api.get(`/leads/${id}`);
    return res.data;
  },

  createLead: async (data: LeadFormData): Promise<{ success: boolean; data: Lead; message: string }> => {
    const res = await api.post('/leads', data);
    return res.data;
  },

  updateLead: async (id: string, data: LeadFormData): Promise<{ success: boolean; data: Lead; message: string }> => {
    const res = await api.put(`/leads/${id}`, data);
    return res.data;
  },

  deleteLead: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/leads/${id}`);
    return res.data;
  },

  exportCSV: async (): Promise<void> => {
    const res = await api.get('/leads/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  getStats: async (): Promise<{ success: boolean; data: LeadStats }> => {
    const res = await api.get('/leads/stats');
    return res.data;
  },
};
