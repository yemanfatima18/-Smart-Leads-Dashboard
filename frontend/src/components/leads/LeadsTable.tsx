import React, { useState } from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Lead, LeadFormData, UserRole } from '../../types';
import { StatusBadge, SourceBadge, Button, Modal, ConfirmDialog, EmptyState } from '../ui';
import { LeadForm } from './LeadForm';
import { leadsApi } from '../../api/leads';
import toast from 'react-hot-toast';

interface LeadsTableProps {
  leads: Lead[];
  userRole: UserRole;
  onRefetch: () => void;
}

export const LeadsTable = ({ leads, userRole, onRefetch }: LeadsTableProps) => {
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async (data: LeadFormData) => {
    if (!editingLead) return;
    setIsSubmitting(true);
    try {
      await leadsApi.updateLead(editingLead._id, data);
      toast.success('Lead updated successfully');
      setEditingLead(null);
      onRefetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await leadsApi.deleteLead(deletingId);
      toast.success('Lead deleted');
      setDeletingId(null);
      onRefetch();
    } catch {
      toast.error('Delete failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!leads.length) {
    return (
      <EmptyState
        title="No leads found"
        description="No leads match your current filters. Try adjusting your search."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              {['Name', 'Email', 'Status', 'Source', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {leads.map((lead) => (
              <tr key={lead._id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{lead.name}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{lead.email}</td>
                <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                <td className="px-4 py-3"><SourceBadge source={lead.source} /></td>
                <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">
                  {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setViewingLead(lead)} className="p-1.5">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingLead(lead)} className="p-1.5">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {userRole === 'admin' && (
                      <Button variant="ghost" size="sm" onClick={() => setDeletingId(lead._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editingLead} onClose={() => setEditingLead(null)} title="Edit Lead">
        {editingLead && (
          <LeadForm
            initialData={editingLead}
            onSubmit={handleUpdate}
            onCancel={() => setEditingLead(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewingLead} onClose={() => setViewingLead(null)} title="Lead Details">
        {viewingLead && (
          <div className="space-y-4">
            {[
              { label: 'Name', value: viewingLead.name },
              { label: 'Email', value: viewingLead.email },
              { label: 'Status', value: <StatusBadge status={viewingLead.status} /> },
              { label: 'Source', value: <SourceBadge source={viewingLead.source} /> },
              { label: 'Created By', value: viewingLead.createdBy?.name || 'N/A' },
              { label: 'Created At', value: new Date(viewingLead.createdAt).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-sm text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        isLoading={isSubmitting}
      />
    </>
  );
};
