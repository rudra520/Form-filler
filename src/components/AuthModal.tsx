import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, Mail, Lock, User, Phone } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (payload: {
    name: string;
    email: string;
    passwordPlain: string;
    role: UserRole;
    phone?: string;
  }) => Promise<void>;
  onQuickRoleSwitch: (role: UserRole) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onQuickRoleSwitch,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (tab === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister({
          name,
          email,
          passwordPlain: password,
          role,
          phone,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (selectedRole: UserRole) => {
    setError(null);
    setSubmitting(true);
    try {
      await onQuickRoleSwitch(selectedRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">FormFiller Authentication</h2>
              <p className="text-xs text-slate-500">RBAC Secure Identity Access</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg font-semibold">
            ✕
          </button>
        </div>

        {/* Demo 1-Click Login Quick Switchers */}
        <div className="my-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
          <div className="text-xs font-bold text-blue-900 mb-2">1-Click RBAC Demo Sign-In:</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('citizen')}
              className="rounded-xl border border-blue-200 bg-white px-2 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 text-center transition-colors shadow-sm"
            >
              Applicant
            </button>
            <button
              onClick={() => handleDemoLogin('partner')}
              className="rounded-xl border border-amber-200 bg-white px-2 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 text-center transition-colors shadow-sm"
            >
              Operator
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="rounded-xl border border-purple-200 bg-white px-2 py-2 text-xs font-semibold text-purple-800 hover:bg-purple-50 text-center transition-colors shadow-sm"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-4">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-xs font-bold transition-colors ${
              tab === 'login'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-xs font-bold transition-colors ${
              tab === 'register'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {tab === 'register' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="candidate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
              >
                <option value="citizen">Citizen / Exam Applicant</option>
                <option value="partner">Submission Partner / Operator</option>
                <option value="admin">Platform Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm mt-2"
          >
            {submitting ? 'Authenticating...' : tab === 'login' ? 'Sign In to Portal' : 'Register Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
