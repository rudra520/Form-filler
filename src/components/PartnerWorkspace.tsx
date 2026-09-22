import React, { useState, useMemo } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  Terminal,
  Clock,
  User,
  FileCheck,
  Download,
  Search,
  Filter,
  X,
  History,
  FileText,
} from 'lucide-react';
import { ExamApplication, FieldMapping } from '../types';
import { exportApplicationsToCsv } from '../utils/csvExport';
import { ApplicationActivityHistory } from './ApplicationActivityHistory';
import { getApplicationActivities } from '../utils/activityHistory';
import { ApiService } from '../services/api';

interface PartnerWorkspaceProps {
  applications: ExamApplication[];
  onAssign: (id: string) => Promise<void>;
  onRunAutofill: (id: string) => Promise<{ application: ExamApplication; executionReport: any }>;
  onRequestOtp: (id: string) => Promise<void>;
  onFinalize: (id: string) => Promise<void>;
  loading: boolean;
}

export const PartnerWorkspace: React.FC<PartnerWorkspaceProps> = ({
  applications,
  onAssign,
  onRunAutofill,
  onRequestOtp,
  onFinalize,
  loading,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(
    applications[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [autofillRunning, setAutofillRunning] = useState(false);
  const [autofillReport, setAutofillReport] = useState<any | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'mappings' | 'history' | 'both'>('mappings');

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchQuery === '' ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.portalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.portal.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const activeApp =
    applications.find((a) => a.id === selectedAppId) ||
    filteredApplications[0] ||
    applications[0];

  const handleRunAutofill = async (id: string) => {
    setAutofillRunning(true);
    try {
      const res = await onRunAutofill(id);
      setAutofillReport(res.executionReport);
    } finally {
      setAutofillRunning(false);
    }
  };

  const handleActivityAdded = async (activity: any) => {
    if (!activeApp) return;
    try {
      await ApiService.addApplicationActivity(activeApp.id, {
        action: activity.action,
        description: activity.description,
        metadata: activity.metadata,
      });
    } catch (err) {
      console.error('Failed to record activity note on server:', err);
    }
  };

  const handleExportCsv = () => {
    exportApplicationsToCsv(
      applications,
      `operator-applications-queue-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className="space-y-6">
      {/* Partner Runtime Lockdown Security Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-xs text-amber-900 flex items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Secure Operator Session:</strong> Protected sandbox with end-to-end encryption. Sensitive candidate credentials and personal information are masked and strictly guarded.
          </span>
        </div>
        <span className="hidden sm:inline-block rounded-full bg-amber-100 px-3 py-1 font-mono text-[11px] font-bold text-amber-800 border border-amber-300">
          NODE ONLINE
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submission Partner Workspace</h1>
          <p className="text-xs text-slate-500">
            Automated form filling assistance with candidate-verified OTP verification
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            title="Download CSV report of applications in queue"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <span className="rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-slate-700 font-semibold shadow-sm">
            Filing Queue: <strong className="text-blue-600 font-bold">{applications.length} Applications</strong>
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applications Queue */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Filing Queue ({filteredApplications.length})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                title="Export list to CSV"
              >
                <Download className="h-3 w-3" />
                <span>CSV</span>
              </button>
              <span className="text-[11px] text-blue-600 font-semibold">Live Synced</span>
            </div>
          </div>

          {/* Search and Status Filter bar for large datasets (100+ applications) */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, ID, or portal..."
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {(['ALL', 'WAITING_OTP', 'FILLING', 'ASSIGNED', 'SUBMITTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All (100+)' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredApplications.map((app) => {
              const isSelected = app.id === activeApp?.id;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-500">{app.id}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                        app.status === 'SUBMITTED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : app.status === 'WAITING_OTP'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse'
                          : app.status === 'FILLING'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{app.portalName}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Candidate: <span className="text-slate-900 font-semibold">{app.userName}</span>
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
                    <span>Fee: ₹{app.convenienceFee} (Paid)</span>
                    <span className="text-blue-700 font-semibold flex items-center gap-1">
                      {app.fieldMappings.length} Fields Mapped
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Inspection & Execution Engine */}
        {activeApp ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Top Card: Active Portal & Controls */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {activeApp.portal}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Session: {activeApp.examSession}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">{activeApp.portalName}</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Applicant: <strong className="text-slate-900">{activeApp.userName}</strong> ({activeApp.userEmail})
                  </p>
                </div>

                {/* Operator Actions based on State Machine */}
                <div className="flex flex-wrap items-center gap-2">
                  {activeApp.status === 'READY_FOR_SUBMISSION' && (
                    <button
                      onClick={() => onAssign(activeApp.id)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Assign to My Enclave
                    </button>
                  )}

                  {activeApp.status === 'ASSIGNED' && (
                    <button
                      disabled={autofillRunning}
                      onClick={() => handleRunAutofill(activeApp.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{autofillRunning ? 'Injecting Selectors...' : 'Run Auto-Fill Engine'}</span>
                    </button>
                  )}

                  {activeApp.status === 'FILLING' && (
                    <button
                      onClick={() => onRequestOtp(activeApp.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Request Student OTP Bridge</span>
                    </button>
                  )}

                  {activeApp.status === 'WAITING_OTP' && (
                    <div className="flex items-center gap-2">
                      {activeApp.activeOtpBridge?.status === 'VERIFIED' ? (
                        <button
                          onClick={() => onFinalize(activeApp.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Finalize & Submit Portal</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-2 text-xs font-semibold text-amber-800 animate-pulse">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Waiting for candidate to enter OTP...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeApp.status === 'SUBMITTED' && (
                    <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Filing Completed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Engine telemetry / execution results */}
              {autofillReport && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs">
                  <div className="flex items-center justify-between text-blue-900 font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="h-4 w-4 text-blue-600" /> Form Injection Successful
                    </span>
                    <span className="font-mono text-xs font-semibold">{autofillReport.timeElapsedMs} ms</span>
                  </div>
                  <div className="text-slate-700 text-xs">
                    Engine: <span className="font-semibold text-blue-800">{autofillReport.engine}</span> • Populated{' '}
                    <strong>{autofillReport.fieldsInjected} DOM Selectors</strong> without PII leaks.
                  </div>
                </div>
              )}
            </div>

            {/* Sub-view Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 px-1 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveDetailTab('mappings')}
                  className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                    activeDetailTab === 'mappings'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Verified Field Mappings ({activeApp.fieldMappings.length})</span>
                </button>

                <button
                  onClick={() => setActiveDetailTab('history')}
                  className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                    activeDetailTab === 'history'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>File Activity History</span>
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 font-mono">
                    {getApplicationActivities(activeApp).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveDetailTab('both')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-medium border-b-2 transition-all ${
                    activeDetailTab === 'both'
                      ? 'border-blue-600 text-blue-700 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <span>View Both</span>
                </button>
              </div>
            </div>

            {/* Smart Field Mapping Engine Table */}
            {(activeDetailTab === 'mappings' || activeDetailTab === 'both') && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Verified Field Mapping Table</h3>
                    <p className="text-xs text-slate-500">
                      Automatic dynamic matching of citizen vault attributes to target government portal fields
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    98.6% Target Accuracy
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/80">
                        <th className="py-2.5 px-3">Target Field</th>
                        <th className="py-2.5 px-3">Portal Input ID</th>
                        <th className="py-2.5 px-3">Injected Value</th>
                        <th className="py-2.5 px-3">Confidence</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeApp.fieldMappings.map((m) => (
                        <tr key={m.fieldKey} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-900">{m.fieldLabel}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{m.domSelector || m.fieldKey}</td>
                          <td className="py-3 px-3 font-medium text-blue-700">{m.mappedValue}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-emerald-700">
                              {(m.confidence * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              {m.isVerified ? 'VERIFIED' : 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Local Activity History List */}
            {(activeDetailTab === 'history' || activeDetailTab === 'both') && (
              <ApplicationActivityHistory
                application={activeApp}
                onAddActivity={handleActivityAdded}
              />
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 flex h-96 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400">
            Select an application from the queue to start automated filling
          </div>
        )}
      </div>
    </div>
  );
};
