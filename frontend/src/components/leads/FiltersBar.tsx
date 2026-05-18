import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { LeadFilters, LeadSource, LeadStatus, SortOrder } from '../../types';
import { Input, Select, Button } from '../ui';

interface FiltersBarProps {
  filters: LeadFilters;
  onFilterChange: (updated: Partial<LeadFilters>) => void;
  onReset: () => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
}

export const FiltersBar = ({ filters, onFilterChange, onReset, searchValue, onSearchChange }: FiltersBarProps) => {
  const hasActiveFilters = filters.status || filters.source || filters.search || filters.sort !== 'latest';

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name or email..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <Select
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ status: (e.target.value as LeadStatus) || undefined, page: 1 })}
          className="w-36"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </Select>

        <Select
          value={filters.source || ''}
          onChange={(e) => onFilterChange({ source: (e.target.value as LeadSource) || undefined, page: 1 })}
          className="w-36"
        >
          <option value="">All Sources</option>
          <option value="Website">Website</option>
          <option value="Instagram">Instagram</option>
          <option value="Referral">Referral</option>
        </Select>

        <Select
          value={filters.sort || 'latest'}
          onChange={(e) => onFilterChange({ sort: e.target.value as SortOrder, page: 1 })}
          className="w-32"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};
