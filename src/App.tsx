import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { CitizenDashboard } from './components/CitizenDashboard';
import { PartnerWorkspace } from './components/PartnerWorkspace';
import { AdminConsole } from './components/AdminConsole';
import { AuthModal } from './components/AuthModal';
import { VercelDeployGuide } from './components/VercelDeployGuide';
import { NewApplicationModal } from './components/NewApplicationModal';
import { ApiService } from './services/api';
import {
  User,
  UserRole,
  VaultDocument,
  ExamApplication,
  SystemMetrics,
  DocumentType,
  ExamPortal,
} from './types';
import {
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Database,
  CloudUpload,
  AlertCircle,
  ExternalLink,
  X,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import { ApplicationActivityHistory } from './components/ApplicationActivityHistory';
import { getApplicationActivities } from './utils/activityHistory';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [applications, setApplications] = useState<ExamApplication[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [vercelGuideOpen, setVercelGuideOpen] = useState(false);
  const [newAppModalOpen, setNewAppModalOpen] = useState(false);
  const [historyModalApp, setHistoryModalApp] = useState<ExamApplication | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  // Pipeline Applications Filter & Search
  const [pipelineSearchQuery, setPipelineSearchQuery] = useState('');
  const [pipelineStatusFilter, setPipelineStatusFilter] = useState('ALL');

  const statusLabels: Record<string, string> = {
    ALL: 'All Statuses',
    CREATED: 'Created (Draft)',
    REQUIRES_DOCUMENTS: 'Requires Documents',
    READY_FOR_SUBMISSION: 'Ready for Submission',
    ASSIGNED: 'Assigned to Desk',
    FILLING: 'Headless Filling',
    WAITING_OTP: 'Waiting for Citizen OTP',
    SUBMITTED: 'Submitted to Portal',
  };

  const availableStatuses = useMemo(() => {
    const list: string[] = ['ALL', 'CREATED', 'REQUIRES_DOCUMENTS', 'READY_FOR_SUBMISSION', 'ASSIGNED', 'FILLING', 'WAITING_OTP', 'SUBMITTED'];
    applications.forEach((a) => {
      if (a.status && !list.includes(a.status)) {
        list.push(a.status);
      }
    });
    return list;
  }, [applications]);

  const filteredPipelineApps = useMemo(() => {
    const query = pipelineSearchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesStatus = pipelineStatusFilter === 'ALL' || app.status === pipelineStatusFilter;
      if (!matchesStatus) return false;

      if (!query) return true;

      const matchesId = app.id.toLowerCase().includes(query);
      const matchesName = app.userName.toLowerCase().includes(query);
      const matchesPortal = app.portalName.toLowerCase().includes(query);
      const matchesEmail = app.userEmail?.toLowerCase().includes(query) || false;

      return matchesId || matchesName || matchesPortal || matchesEmail;
    });
  }, [applications, pipelineSearchQuery, pipelineStatusFilter]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'READY_FOR_SUBMISSION':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'WAITING_OTP':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FILLING':
      case 'ASSIGNED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'REQUIRES_DOCUMENTS':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load user session & data
  const refreshData = useCallback(async () => {
    try {
      const metricsData = await ApiService.getMetrics().catch(() => null);
      if (metricsData) setMetrics(metricsData);

      const apps = await ApiService.getApplications().catch(() => []);
      setApplications(apps);

      const docs = await ApiService.getVaultDocuments().catch(() => []);
      setDocuments(docs);

      if (currentUser?.role === 'admin' || currentUser?.role === 'partner') {
        const logs = await ApiService.getAuditLogs().catch(() => []);
        setAuditLogs(logs);
      }
    } catch (e) {
      console.error('Data refresh error:', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.role]);

  // Initial authentication check or auto-login with default demo user
  useEffect(() => {
    async function initAuth() {
      const stored = ApiService.getStoredUser();
      if (stored) {
        setCurrentUser(stored);
      } else {
        // Automatically start with default student profile for effortless evaluation
        try {
          const res = await ApiService.switchDemoRole('citizen');
          setCurrentUser(res.user);
        } catch {
          // fallback
        }
      }
    }
    initAuth();
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 6000); // live polling
    return () => clearInterval(interval);
  }, [refreshData]);

  // Role quick switch handler
  const handleRoleSwitch = async (role: UserRole) => {
    try {
      const res = await ApiService.switchDemoRole(role);
      setCurrentUser(res.user);
      showToast(`Switched active view to ${role.toUpperCase()}`, 'info');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to switch role', 'error');
    }
  };

  // Login handler
  const handleLogin = async (email: string, pass: string) => {
    try {
      const res = await ApiService.login(email, pass);
      setCurrentUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  // Register handler
  const handleRegister = async (payload: {
    name: string;
    email: string;
    passwordPlain: string;
    role: UserRole;
    phone?: string;
  }) => {
    try {
      const res = await ApiService.register(payload);
      setCurrentUser(res.user);
      showToast(`Account successfully created for ${res.user.name}!`, 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  // Logout handler
  const handleLogout = () => {
    ApiService.logout();
    setCurrentUser(null);
    showToast('Logged out successfully', 'info');
  };

  // Citizen: Upload document
  const handleUploadDoc = async (payload: {
    docType: DocumentType;
    title: string;
    fileName: string;
    fileSize: string;
    samplePreset?: boolean;
  }) => {
    try {
      const doc = await ApiService.uploadVaultDocument(payload);
      showToast(`Verified & encrypted: ${doc.title}`, 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Document upload failed', 'error');
      throw err;
    }
  };

  // Citizen: Delete document
  const handleDeleteDoc = async (id: string) => {
    try {
      await ApiService.deleteVaultDocument(id);
      showToast('Document securely deleted', 'info');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  // Citizen: Submit OTP for waiting application
  const handleSubmitOtp = async (appId: string, otp: string) => {
    try {
      const res = await ApiService.submitCandidateOtp(appId, otp);
      showToast('OTP authorized! Filing operator can now finalize submission.', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'OTP authorization failed', 'error');
      throw err;
    }
  };

  // Partner: Assign application
  const handleAssign = async (id: string) => {
    try {
      await ApiService.assignApplication(id);
      showToast('Application routed to your secure operator sandbox', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Assignment failed', 'error');
    }
  };

  // Partner: Run Autofill
  const handleRunAutofill = async (id: string) => {
    try {
      const res = await ApiService.runAutofill(id);
      showToast(
        `Autofill completed in ${res.executionReport.timeElapsedMs}ms with zero PII leaks!`,
        'success'
      );
      await refreshData();
      return res;
    } catch (err: any) {
      showToast(err.message || 'Autofill pass failed', 'error');
      throw err;
    }
  };

  // Partner: Request OTP
  const handleRequestOtp = async (id: string) => {
    try {
      const res = await ApiService.requestOtpBridge(id);
      showToast(res.message, 'info');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'OTP request failed', 'error');
    }
  };

  // Partner: Finalize
  const handleFinalize = async (id: string) => {
    try {
      const res = await ApiService.finalizeSubmission(id);
      showToast(`Application successfully filed! Ack #${res.receipt.acknowledgementNumber}`, 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Finalize failed', 'error');
    }
  };

  // New Application create
  const handleCreateApplication = async (portal: ExamPortal, session: string) => {
    try {
      const res = await ApiService.createApplication(portal, session);
      showToast(`Initiated filing for ${res.portalName}`, 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create application', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-900 shadow-xl shadow-slate-900/10 animate-in fade-in slide-in-from-bottom-2">
          {notification.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          {notification.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-600" />}
          {notification.type === 'info' && <ShieldCheck className="h-4 w-4 text-blue-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        user={currentUser}
        onRoleSwitch={handleRoleSwitch}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenVercelGuide={() => setVercelGuideOpen(true)}
        metrics={metrics}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* State Machine Tab */}
        {activeTab === 'applications' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Application Lifecycle Pipeline
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Live tracking across the 7 stages of student application filing and verification
                </p>
              </div>
              <button
                onClick={() => setNewAppModalOpen(true)}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                + New Exam Filing
              </button>
            </div>

            {/* Pipeline Stage visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              {[
                { stage: 'CREATED', desc: 'Draft initiated by citizen' },
                { stage: 'REQUIRES_DOCUMENTS', desc: 'Missing required OCR' },
                { stage: 'READY_FOR_SUBMISSION', desc: 'Data complete & paid' },
                { stage: 'ASSIGNED', desc: 'Routed to partner enclave' },
                { stage: 'FILLING', desc: 'Active browser data entry' },
                { stage: 'WAITING_OTP', desc: 'Candidate OTP approval' },
                { stage: 'SUBMITTED', desc: 'Filing completed & receipt' },
              ].map((item, idx) => {
                const count = applications.filter((a) => a.status === item.stage).length;
                return (
                  <div
                    key={item.stage}
                    className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-400">0{idx + 1}</span>
                        <span className="font-bold text-blue-700 font-mono text-sm">{count}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mt-2 leading-tight">{item.stage}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* All Applications List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">All Active Application Instances</h3>
                  <p className="text-xs text-slate-500">
                    Click any application file to inspect its chronological activity history and audit trail
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    {pipelineSearchQuery || pipelineStatusFilter !== 'ALL'
                      ? `${filteredPipelineApps.length} of ${applications.length} Files`
                      : `${applications.length} Files`}
                  </span>
                </div>
              </div>

              {/* Search Bar & Status-Based Filtering Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={pipelineSearchQuery}
                    onChange={(e) => setPipelineSearchQuery(e.target.value)}
                    placeholder="Search by candidate name, portal, or file ID..."
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                  {pipelineSearchQuery && (
                    <button
                      onClick={() => setPipelineSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                      title="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Dropdown & Reset */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:flex-initial">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Filter className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <select
                      value={pipelineStatusFilter}
                      onChange={(e) => setPipelineStatusFilter(e.target.value)}
                      className="w-full sm:w-auto appearance-none pl-8 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 transition-all cursor-pointer shadow-xs"
                      aria-label="Filter by application status"
                    >
                      {availableStatuses.map((st) => {
                        const count = st === 'ALL'
                          ? applications.length
                          : applications.filter((a) => a.status === st).length;
                        return (
                          <option key={st} value={st}>
                            {statusLabels[st] || st.replace(/_/g, ' ')} ({count})
                          </option>
                        );
                      })}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                      <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {(pipelineSearchQuery || pipelineStatusFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setPipelineSearchQuery('');
                        setPipelineStatusFilter('ALL');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1.5 whitespace-nowrap"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {filteredPipelineApps.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">No applications found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No active application instances matched your search keyword or selected status filter.
                  </p>
                  {(pipelineSearchQuery || pipelineStatusFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setPipelineSearchQuery('');
                        setPipelineStatusFilter('ALL');
                      }}
                      className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200 shadow-xs"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Clear Search & Filters</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredPipelineApps.map((app) => (
                    <div key={app.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/70 px-2.5 rounded-xl transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{app.portalName}</span>
                          <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {app.id}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Candidate: <span className="font-semibold text-slate-800">{app.userName}</span> • Session: {app.examSession} • Fee: ₹{app.convenienceFee}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => setHistoryModalApp(app)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition-colors shadow-xs"
                        >
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          <span>Activity History</span>
                          <span className="rounded-full bg-slate-100 text-slate-600 text-[10px] px-1.5 font-bold font-mono">
                            {getApplicationActivities(app).length}
                          </span>
                        </button>

                        <span className={`px-3 py-1.5 rounded-full font-bold text-[10px] border ${getStatusBadgeStyle(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'metrics' ? (
          <AdminConsole
            metrics={metrics}
            auditLogs={auditLogs}
            applications={applications}
            onRefresh={refreshData}
            currentUser={currentUser}
          />
        ) : (
          /* Role-based view based on logged-in RBAC Role */
          <>
            {currentUser?.role === 'partner' ? (
              <PartnerWorkspace
                applications={applications}
                onAssign={handleAssign}
                onRunAutofill={handleRunAutofill}
                onRequestOtp={handleRequestOtp}
                onFinalize={handleFinalize}
                loading={loading}
              />
            ) : currentUser?.role === 'admin' ? (
              <AdminConsole
                metrics={metrics}
                auditLogs={auditLogs}
                applications={applications}
                onRefresh={refreshData}
                currentUser={currentUser}
              />
            ) : (
              <CitizenDashboard
                documents={documents}
                applications={applications}
                onUploadDoc={handleUploadDoc}
                onDeleteDoc={handleDeleteDoc}
                onSubmitOtp={handleSubmitOtp}
                onOpenNewAppModal={() => setNewAppModalOpen(true)}
                loading={loading}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onQuickRoleSwitch={handleRoleSwitch}
      />

      <VercelDeployGuide
        isOpen={vercelGuideOpen}
        onClose={() => setVercelGuideOpen(false)}
        mongoConnected={metrics?.dbStatus?.type === 'mongodb_atlas'}
      />

      <NewApplicationModal
        isOpen={newAppModalOpen}
        onClose={() => setNewAppModalOpen(false)}
        onSubmit={handleCreateApplication}
        documents={documents}
      />

      {/* Application Activity History Modal */}
      {historyModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {historyModalApp.portalName}
                </h3>
                <p className="text-xs text-slate-500">
                  Candidate: <strong className="text-slate-700">{historyModalApp.userName}</strong> • File ID:{' '}
                  <span className="font-mono font-semibold text-blue-700">{historyModalApp.id}</span>
                </p>
              </div>
              <button
                onClick={() => setHistoryModalApp(null)}
                className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                aria-label="Close activity history"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <ApplicationActivityHistory
                application={historyModalApp}
                onAddActivity={async (activity) => {
                  try {
                    await ApiService.addApplicationActivity(historyModalApp.id, {
                      action: activity.action,
                      description: activity.description,
                      metadata: activity.metadata,
                    });
                    await refreshData();
                  } catch (err) {
                    console.error('Failed to log activity:', err);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FormFiller.in</span>
            <span>• Universal Identity Vault & Exam Automation Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-blue-700 font-semibold">Rudra Pratap Singh (Co-Founder)</span>
            <button onClick={() => setVercelGuideOpen(true)} className="hover:text-blue-800 transition-colors font-medium">
              Vercel Deployment
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">AES-256-GCM Zero-Knowledge</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
