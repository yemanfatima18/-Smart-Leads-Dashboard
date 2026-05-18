import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import { Button, Input, Select } from '../components/ui';

import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.name || form.name.length < 2) errs.name = 'Minimum 2 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 6) errs.password = 'Minimum 6 characters';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed';
      toast.error(msg);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-brand-600 rounded-2xl items-center justify-center mb-4"><Zap className="w-6 h-6 text-white" /></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join Smart Leads Dashboard</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="Rahul Sharma" value={form.name} onChange={(e) => setForm(p => ({...p, name: e.target.value}))} error={errors.name} />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm(p => ({...p, email: e.target.value}))} error={errors.email} />
            <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm(p => ({...p, password: e.target.value}))} error={errors.password} />
            <Select label="Role" value={form.role} onChange={(e) => setForm(p => ({...p, role: e.target.value}))}>
              <option value="sales">Sales User</option>
              <option value="admin">Admin</option>
            </Select>
            <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="lg">Create Account</Button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">Already have an account?{' '}<Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};
