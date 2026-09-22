import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Layers,
  Terminal,
  LogOut,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  CloudUpload,
} from 'lucide-react';
import { User, UserRole, SystemMetrics } from '../types';

interface NavbarProps {
  user: User | null;
  onRoleSwitch: (role: UserRole) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenVercelGuide: () => void;
  metrics: SystemMetrics | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onRoleSwitch,
  onOpenAuth,
  onLogout,
  onOpenVercelGuide,
  metrics,
  activeTab,
  setActiveTab,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'partner':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'citizen':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'partner':
        return 'Partner';
      case 'citizen':
      default:
        return 'Applicant';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm text-white font-bold">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">FormFiller</span>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/60">
                Official Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Exam Application & Document Vault Platform
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {user?.role === 'partner' ? 'Operator Workspace' : user?.role === 'admin' ? 'Admin Console' : 'My Document Vault'}
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'applications'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Applications Status
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'metrics'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Operations & Telemetry
            </button>
          )}

          <button
            onClick={onOpenVercelGuide}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <CloudUpload className="h-3.5 w-3.5 text-blue-600" />
            <span>MongoDB Guide</span>
          </button>
        </nav>

        {/* Right actions: DB badge, RBAC Role switcher & User profile */}
        <div className="hidden lg:flex items-center gap-3">
          {/* MongoDB Status badge */}
          <div
            title={metrics?.dbStatus?.clusterName || 'MongoDB Status'}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
          >
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <Database className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-[11px] font-medium text-slate-700">
              {metrics?.dbStatus?.type === 'mongodb_atlas' ? 'MongoDB Atlas Live' : 'Database Ready'}
            </span>
          </div>

          {/* Quick RBAC Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${getRoleBadgeColor(
                user?.role
              )}`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Role: {getRoleLabel(user?.role)}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Active User Role
                </div>

                <button
                  onClick={() => {
                    onRoleSwitch('citizen');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                    user?.role === 'citizen'
                      ? 'bg-blue-50 text-blue-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold">Applicant / Citizen</div>
                    <div className="text-[11px] text-slate-500">Manage Vault & Apply</div>
                  </div>
                  {user?.role === 'citizen' && <span className="h-2 w-2 rounded-full bg-blue-600"></span>}
                </button>

                <button
                  onClick={() => {
                    onRoleSwitch('partner');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                    user?.role === 'partner'
                      ? 'bg-amber-50 text-amber-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold">Submission Partner</div>
                    <div className="text-[11px] text-slate-500">Form Filling & OTP Bridge</div>
                  </div>
                  {user?.role === 'partner' && <span className="h-2 w-2 rounded-full bg-amber-600"></span>}
                </button>

                <button
                  onClick={() => {
                    onRoleSwitch('admin');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                    user?.role === 'admin'
                      ? 'bg-purple-50 text-purple-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold">Platform Administrator</div>
                    <div className="text-[11px] text-slate-500">Governance & SLAs</div>
                  </div>
                  {user?.role === 'admin' && <span className="h-2 w-2 rounded-full bg-purple-600"></span>}
                </button>
              </div>
            )}
          </div>

          {/* User info or Sign in */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                <div className="text-[10px] text-slate-500">{user.email}</div>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => onRoleSwitch(user?.role === 'citizen' ? 'partner' : user?.role === 'partner' ? 'admin' : 'citizen')}
            className={`px-2.5 py-1 text-xs rounded-lg border font-semibold ${getRoleBadgeColor(user?.role)}`}
          >
            {user?.role?.toUpperCase()}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-4 md:hidden space-y-3 shadow-lg">
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsMenuOpen(false);
              }}
              className={`text-left rounded-lg px-3 py-2 text-xs font-semibold ${
                activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
              }`}
            >
              {user?.role === 'partner' ? 'Operator Workspace' : user?.role === 'admin' ? 'Admin Console' : 'My Document Vault'}
            </button>
            <button
              onClick={() => {
                setActiveTab('applications');
                setIsMenuOpen(false);
              }}
              className={`text-left rounded-lg px-3 py-2 text-xs font-semibold ${
                activeTab === 'applications' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
              }`}
            >
              Applications Status
            </button>
            <button
              onClick={() => {
                onOpenVercelGuide();
                setIsMenuOpen(false);
              }}
              className="text-left rounded-lg px-3 py-2 text-xs font-semibold text-blue-700"
            >
              MongoDB Atlas Guide
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
