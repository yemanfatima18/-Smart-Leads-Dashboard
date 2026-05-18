import React, { useState, useCallback } from 'react';
import { Plus, Download } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useLeads } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';

import { LeadFilters, LeadFormData } from '../types';

import { Navbar } from '../components/ui/Navbar';

import { StatsCards } from '../components/leads/StatsCards';
import { FiltersBar } from '../components/leads/FiltersBar';
import { LeadsTable } from '../components/leads/LeadsTable';
import { Pagination } from '../components/leads/Pagination';
import { LeadForm } from '../components/leads/LeadForm';

import { Button, Modal, Spinner } from '../components/ui';

import { leadsApi } from '../api/leads';

import toast from 'react-hot-toast';
const DEFAULT_FILTERS: LeadFilters = { sort: 'latest', page: 1, limit: 10 };

export const DashboardPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  const activeFilters: LeadFilters = { ...filters, search: debouncedSearch || undefined };
  const { leads, meta, isLoading, refetch } = useLeads(activeFilters);

  const updateFilter = useCallback((updated: Partial<LeadFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
  }, []);

  const handleCreate = async (data: LeadFormData) => {
    setIsCreating(true);
    try {
      await leadsApi.createLead(data);
      toast.success('Lead created successfully!');
      setShowCreateModal(false);
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create lead';
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await leadsApi.exportCSV();
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage and track your sales pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport} isLoading={isExporting} className="gap-1.5">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              New Lead
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Filters */}
        <FiltersBar
          filters={filters}
          onFilterChange={updateFilter}
          onReset={resetFilters}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
        />

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <LeadsTable leads={leads} userRole={user?.role || 'sales'} onRefetch={refetch} />
              {meta && meta.totalPages > 1 && (
                <div className="px-4 pb-4">
                  <Pagination meta={meta} onPageChange={(p) => updateFilter({ page: p })} />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Lead">
        <LeadForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} isLoading={isCreating} />
      </Modal>
    </div>
  );
};
