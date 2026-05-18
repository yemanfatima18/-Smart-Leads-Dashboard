import React, { useState, useEffect } from 'react';
import { Lead, LeadFormData, LeadStatus, LeadSource } from '../../types';
import { Button, Input, Select } from '../ui';

interface LeadFormProps {
  initialData?: Lead;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
const SOURCES: LeadSource[] = ['Website', 'Instagram', 'Referral'];

const defaultForm: LeadFormData = { name: '', email: '', status: 'New', source: 'Website' };

export const LeadForm = ({ initialData, onSubmit, onCancel, isLoading }: LeadFormProps) => {
  const [form, setForm] = useState<LeadFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name, email: initialData.email, status: initialData.status, source: initialData.source });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const errs: Partial<LeadFormData> = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.source) errs.source = 'Source is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="e.g. Rahul Sharma"
        value={form.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
      />
      <Input
        label="Email Address"
        type="email"
        placeholder="e.g. rahul@example.com"
        value={form.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value)}
          error={errors.status}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select
          label="Source"
          value={form.source}
          onChange={(e) => handleChange('source', e.target.value)}
          error={errors.source}
        >
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {initialData ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
};
