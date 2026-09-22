import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  Server,
  Database,
  Users,
  CheckCircle,
  FileSpreadsheet,
  Clock,
  Lock,
  Download,
  Eye,
} from 'lucide-react';
import { SystemMetrics, ExamApplication, User } from '../types';
import { exportApplicationsToCsv, exportAuditLogsToCsv } from '../utils/csvExport';
import { OperatorSubmissionsChart } from './OperatorSubmissionsChart';

interface AdminConsoleProps {
  metrics: SystemMetrics | null;
  auditLogs: any[];
  applications?: ExamApplication[];
  onRefresh: () => void;
  currentUser?: User | null;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  metrics,
  auditLogs,
  applications = [],
  onRefresh,
  currentUser,
}) => {
  const isActualOperator = currentUser?.role === 'partner' || (currentUser as any)?.role === 'operator';
  const [previewAsOperator, setPreviewAsOperator] = useState<boolean>(false);
  const isOperator = isActualOperator || previewAsOperator;

  const handleExportApplications = () => {
    exportApplicationsToCsv(applications);
  };

  const handleExportAuditLogs = () => {
    exportAuditLogsToCsv(auditLogs);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Operations & Governance</h1>
            <span className="rounded-full bg-blue-100 border border-blue-200 px-3 py-0.5 text-xs font-semibold text-blue-800">
              Live Monitoring
            </span>
            {isOperator && (
              <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                Operator Enclave Active
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Real-time platform overview tracking processing speeds, data accuracy, verified filings, and system security.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportApplications}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            title="Download formatted CSV report of all applications"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>Export Applications CSV</span>
          </button>
          <button
            onClick={handleExportAuditLogs}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            title="Download formatted CSV report of security audit logs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Audit Logs CSV</span>
          </button>
          <button
            onClick={onRefresh}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Operator Submissions Trend Line (Only for Operator) */}
      {isOperator ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Operator Telemetry View
              </span>
              {previewAsOperator && !isActualOperator && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  (Simulated Operator Session)
                </span>
              )}
            </div>
            {previewAsOperator && !isActualOperator && (
              <button
                onClick={() => setPreviewAsOperator(false)}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Exit Operator Preview
              </button>
            )}
          </div>
          <OperatorSubmissionsChart
            applications={applications}
            currentOperatorName={currentUser?.name}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold">Operator Telemetry Restricted:</span>
              <span className="text-amber-800 ml-1">
                The 30-day submissions trend line is reserved for CyberDesk operators and submission partners.
              </span>
            </div>
          </div>
          <button
            onClick={() => setPreviewAsOperator(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shadow-xs text-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View Operator Trend Line</span>
          </button>
        </div>
      )}

      {/* Market Opportunity & Economic Overview */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Market Potential & Economics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Total Addressable Market (TAM)</span>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{metrics?.tam || '₹18,000 Cr / yr'}</div>
            <p className="mt-1.5 text-xs text-slate-500">
              Estimated 120M annual applicants across Indian competitive, recruitment & higher education exams.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Serviceable Market (SAM)</span>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{metrics?.sam || '₹1,500 Cr / yr'}</div>
            <p className="mt-1.5 text-xs text-slate-500">
              10M unique applicants annually across central-level STEM & entrance exams (JEE, NEET, UPSC, NDA).
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
            <div className="flex items-center justify-between text-xs text-blue-800 font-bold">
              <span>Year 1 Target Market (SOM)</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-800 font-bold">Goal</span>
            </div>
            <div className="mt-2 text-2xl font-black text-blue-700">{metrics?.som || '₹15 Cr / yr'}</div>
            <p className="mt-1.5 text-xs text-slate-600">
              Target of 100,000 active students at <strong className="text-slate-900">₹150</strong> platform convenience fee.
            </p>
          </div>
        </div>
      </div>

      {/* System Performance & SLAs */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          System Performance & Benchmarks
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>OCR Parse Speed</span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {metrics?.ocrLatencyMs || 1240} <span className="text-xs font-semibold text-slate-500">ms</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">Benchmark: &lt; 2,000 ms (Fast)</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>Form Injection Speed</span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {metrics?.formFillLatencyMs || 240} <span className="text-xs font-semibold text-slate-500">ms</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">Benchmark: &lt; 500 ms (Instant)</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Field Accuracy</span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {metrics?.targetMappingAccuracy || 98.6}%
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">High-Precision Verified</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <Users className="h-4 w-4 text-indigo-600" />
              <span>Active Concurrent</span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {metrics?.systemConcurrency || 142} <span className="text-xs font-semibold text-slate-500">nodes</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Operator Enclave Mesh</p>
          </div>
        </div>
      </div>

      {/* Database & Infrastructure Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Database Engine Status</h3>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                metrics?.dbStatus?.connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {metrics?.dbStatus?.connected ? 'Online & Persistent' : 'Standby'}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Cluster Target:</span>
              <span className="font-semibold text-slate-900">{metrics?.dbStatus?.clusterName || 'MongoDB Atlas'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Active Document Collections:</span>
              <span className="font-semibold text-slate-900">
                {metrics?.dbStatus?.activeCollections?.join(', ') || 'users, applications, vault'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>Encryption Layer:</span>
              <span className="font-semibold text-emerald-700">AES-256-GCM Zero-Knowledge</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Automated Pipeline Throughput</h3>
            </div>
            <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold">
              Real-Time
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Total Initiated Applications:</span>
              <span className="font-bold text-slate-900">{metrics?.totalApplications || applications.length || 3}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Finalized Government Receipts:</span>
              <span className="font-bold text-emerald-700">{metrics?.submittedCount || 1}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Human-In-The-Loop Pending OTPs:</span>
              <span className="font-bold text-amber-700">{metrics?.pendingOtps || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 100 Applications Registry Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Citizen Applications Registry ({applications.length} Records)
              </h3>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                100+ Live Dataset
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive applicant roster spanning JEE Main, NEET UG, UPSC Civil Services, NDA, and CUET
            </p>
          </div>
          <button
            onClick={handleExportApplications}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>Export Full Registry CSV ({applications.length})</span>
          </button>
        </div>

        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Application ID</th>
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3">Exam Portal</th>
                <th className="py-2.5 px-3">Session</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Ack / Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.slice(0, 100).map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-600 font-semibold">{app.id}</td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900">{app.userName}</div>
                    <div className="text-[10px] text-slate-500">{app.userEmail}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-medium">{app.portal}</td>
                  <td className="py-2 px-3 text-slate-500 text-[11px]">{app.examSession}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                        app.status === 'SUBMITTED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : app.status === 'WAITING_OTP'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : app.status === 'FILLING'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                    {app.submissionReceipt?.acknowledgementNumber || (
                      <span className="text-slate-400 italic">In Queue</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Security & Operational Audit Trail</h3>
            <p className="text-xs text-slate-500">
              Tamper-evident records tracking authentication, vault access, document uploads, and automated submissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold">{auditLogs.length} Logged Events</span>
            <button
              onClick={handleExportAuditLogs}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Download className="h-3 w-3 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Actor Role</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 15).map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{log.action}</td>
                  <td className="py-2.5 px-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase border border-slate-200">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-blue-700">{log.targetEntity}</td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
