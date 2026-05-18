import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../../types';
import { Button } from '../ui';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ meta, onPageChange }: PaginationProps) => {
  const { page, totalPages, total, limit, hasNextPage, hasPrevPage } = meta;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium text-gray-900 dark:text-white">{start}–{end}</span> of{' '}
        <span className="font-medium text-gray-900 dark:text-white">{total}</span> leads
      </p>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" disabled={!hasPrevPage} onClick={() => onPageChange(page - 1)} className="p-1.5">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {pages.map((p, idx) => {
          const prev = pages[idx - 1];
          return (
            <React.Fragment key={p}>
              {prev && p - prev > 1 && <span className="text-gray-400 px-1">…</span>}
              <button
                onClick={() => onPageChange(p)}
                className={`min-w-[2rem] h-8 rounded-lg text-sm font-medium transition-all ${
                  p === page
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            </React.Fragment>
          );
        })}
        <Button variant="ghost" size="sm" disabled={!hasNextPage} onClick={() => onPageChange(page + 1)} className="p-1.5">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
