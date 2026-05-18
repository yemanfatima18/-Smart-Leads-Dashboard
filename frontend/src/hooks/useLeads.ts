import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadFilters, PaginationMeta } from '../types';
import { leadsApi } from '../api/leads';
import toast from 'react-hot-toast';

export const useLeads = (filters: LeadFilters) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await leadsApi.getLeads(filters);
      setLeads(res.data);
      setMeta(res.meta);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  return { leads, meta, isLoading, error, refetch: fetchLeads };
};
