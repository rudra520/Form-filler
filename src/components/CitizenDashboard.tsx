import React, { useState } from 'react';
import {
  Shield,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  Download,
  Trash2,
  ChevronRight,
  Send,
  Eye,
  PlusCircle,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { VaultDocument, ExamApplication, DocumentType, ExamPortal } from '../types';
import { ApplicationActivityHistory } from './ApplicationActivityHistory';
import { getApplicationActivities } from '../utils/activityHistory';
import { ApiService } from '../services/api';

interface CitizenDashboardProps {
  documents: VaultDocument[];
  applications: ExamApplication[];
  onUploadDoc: (payload: {
    docType: DocumentType;
    title: string;
    fileName: string;
    fileSize: string;
    samplePreset?: boolean;
  }) => Promise<void>;
  onDeleteDoc: (id: string) => Promise<void>;
  onSubmitOtp: (appId: string, otp: string) => Promise<void>;
  onOpenNewAppModal: () => void;
  loading: boolean;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  documents,
  applications,
  onUploadDoc,
  onDeleteDoc,
  onSubmitOtp,
  onOpenNewAppModal,
  loading,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('marksheet_12th');
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [activeReceiptApp, setActiveReceiptApp] = useState<ExamApplication | null>(null);
  const [expandedHistoryAppId, setExpandedHistoryAppId] = useState<string | null>(null);
  const [uploadingState, setUploadingState] = useState(false);

  // Applications waiting for OTP
  const waitingOtpApps = applications.filter(
    (app) => app.status === 'WAITING_OTP' && app.activeOtpBridge?.status === 'PENDING'
  );

  const handleUploadPreset = async (docType: DocumentType, title: string) => {
    setUploadingState(true);
    try {
      await onUploadDoc({
        docType,
        title,
        fileName: `${docType}_document.pdf`,
        fileSize: '820 KB',
        samplePreset: true,
      });
      setUploadModalOpen(false);
    } finally {
      setUploadingState(false);
    }
  };

  const handleOtpSubmit = async (appId: string) => {
    const code = otpInputs[appId] || '';
    if (code.length !== 6) {
      alert('Please enter a 6-digit verification code.');
      return;
    }
    await onSubmitOtp(appId, code);
    setOtpInputs((prev) => ({ ...prev, [appId]: '' }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Filing Complete',
        };
      case 'WAITING_OTP':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300 font-bold animate-pulse',
          label: 'Action Required: OTP Verification',
        };
      case 'FILLING':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Operator Autofilling Form',
        };
      case 'ASSIGNED':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Assigned to Operator Enclave',
        };
      case 'READY_FOR_SUBMISSION':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          label: 'Ready for Enclave Injection',
        };
      case 'REQUIRES_DOCUMENTS':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Missing Required Documents',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: 'Application Created',
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* High-priority Real-Time OTP Bridge Alert (HITL) */}
      {waitingOtpApps.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-sm">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-200/70 px-2 py-0.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Immediate Action Required
                  </span>
                  <span className="text-xs text-amber-800">Candidate Authorization</span>
                </div>
                <h3 className="mt-1 text-base font-bold text-slate-900">
                  Enter 6-digit OTP to authorize filing for {waitingOtpApps[0].portalName}
                </h3>
                <p className="mt-0.5 text-xs text-slate-700 max-w-xl">
                  The official examination portal generated a one-time verification code on your registered mobile number. Enter it below to permit automated submission.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-44">
                <input
                  type="text"
                  maxLength={6}
                  value={otpInputs[waitingOtpApps[0].id] || ''}
                  onChange={(e) =>
                    setOtpInputs({ ...otpInputs, [waitingOtpApps[0].id]: e.target.value.replace(/\D/g, '') })
                  }
                  placeholder="e.g. 849201"
                  className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-center text-sm font-mono tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <button
                onClick={() => handleOtpSubmit(waitingOtpApps[0].id)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Verify & Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen Document Vault</h1>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-semibold text-emerald-700">
              <Lock className="h-3 w-3" /> AES-256-GCM Encrypted
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
            Upload your academic and identity certificates once. The system extracts verified attributes to automatically apply to competitive exams (JEE, NEET, UPSC, NDA) without manual typing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <UploadCloud className="h-4 w-4 text-blue-600" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={onOpenNewAppModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Exam Application</span>
          </button>
        </div>
      </div>

      {/* Identity & Academic Certificates Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Identity & Academic Certificates ({documents.length})</h2>
            <p className="text-xs text-slate-500">Secure zero-knowledge storage with verified attribute extraction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{doc.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500">{doc.fileSize}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[11px] text-blue-700 font-semibold">
                          {(doc.ocrConfidence * 100).toFixed(1)}% Accuracy
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      title="Inspect Extracted Attributes"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDoc(doc.id)}
                      title="Delete Document"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Extracted Attributes Preview Chips */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  {doc.extractedData.fullName && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Candidate:</span>
                      <span className="font-semibold text-slate-800">{doc.extractedData.fullName}</span>
                    </div>
                  )}
                  {doc.extractedData.rollNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Roll No:</span>
                      <span className="font-mono text-blue-700 font-semibold">{doc.extractedData.rollNumber}</span>
                    </div>
                  )}
                  {doc.extractedData.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Category:</span>
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {doc.extractedData.category}
                      </span>
                    </div>
                  )}
                  {doc.extractedData.percentage && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Score:</span>
                      <span className="font-bold text-emerald-700">{doc.extractedData.percentage}</span>
                    </div>
                  )}
                  {doc.extractedData.aadhaarMasked && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">UIDAI No:</span>
                      <span className="font-mono text-slate-700">{doc.extractedData.aadhaarMasked}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Verified PII Safe
                </span>
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                >
                  Inspect Data <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Examination Applications Status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Examination Applications ({applications.length})</h2>
            <p className="text-xs text-slate-500">Live progress from form draft to final government acknowledgement</p>
          </div>
          <button
            onClick={onOpenNewAppModal}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            + Add Another Exam
          </button>
        </div>

        <div className="space-y-4">
          {applications.map((app) => {
            const statusInfo = getStatusBadge(app.status);

            return (
              <div
                key={app.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {app.id}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-0.5 text-xs font-bold ${statusInfo.bg}`}
                      >
                        {statusInfo.label}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600 font-semibold border border-slate-200">
                        ₹{app.convenienceFee} Convenience Fee ({app.paymentStatus})
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-slate-900">{app.portalName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Session: <strong className="text-slate-700">{app.examSession}</strong> • Operator: {app.assignedPartnerName || 'Assigning...'}
                    </p>
                  </div>

                  {/* Right Status Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setExpandedHistoryAppId(expandedHistoryAppId === app.id ? null : app.id)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all shadow-xs ${
                        expandedHistoryAppId === app.id
                          ? 'border-blue-300 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                      title="View chronological record of all actions performed on this application"
                    >
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span>{expandedHistoryAppId === app.id ? 'Close History' : 'Activity History'}</span>
                      <span className="rounded-full bg-blue-100/80 text-blue-800 text-[10px] px-1.5 py-0.5 font-mono font-bold">
                        {getApplicationActivities(app).length}
                      </span>
                    </button>

                    {app.status === 'SUBMITTED' && app.submissionReceipt && (
                      <button
                        onClick={() => setActiveReceiptApp(app)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-sm"
                      >
                        <Download className="h-4 w-4 text-emerald-600" />
                        <span>View Portal Receipt</span>
                      </button>
                    )}

                    {app.status === 'WAITING_OTP' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit OTP"
                          value={otpInputs[app.id] || ''}
                          onChange={(e) =>
                            setOtpInputs({ ...otpInputs, [app.id]: e.target.value.replace(/\D/g, '') })
                          }
                          className="w-32 rounded-xl border border-amber-300 bg-white px-3 py-2 text-center text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                        <button
                          onClick={() => handleOtpSubmit(app.id)}
                          className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-colors shadow-sm"
                        >
                          Authorize
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* State machine progress indicators */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 overflow-x-auto pb-1 gap-2">
                    {[
                      'CREATED',
                      'REQUIRES_DOCUMENTS',
                      'READY_FOR_SUBMISSION',
                      'ASSIGNED',
                      'FILLING',
                      'WAITING_OTP',
                      'SUBMITTED',
                    ].map((step, idx) => {
                      const stepOrder = [
                        'CREATED',
                        'REQUIRES_DOCUMENTS',
                        'READY_FOR_SUBMISSION',
                        'ASSIGNED',
                        'FILLING',
                        'WAITING_OTP',
                        'SUBMITTED',
                      ];
                      const currentIdx = stepOrder.indexOf(app.status);
                      const isComplete = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <div key={step} className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              isCurrent
                                ? 'bg-blue-600 ring-4 ring-blue-100'
                                : isComplete
                                ? 'bg-emerald-500'
                                : 'bg-slate-300'
                            }`}
                          />
                          <span
                            className={
                              isCurrent
                                ? 'text-blue-700 font-bold'
                                : isComplete
                                ? 'text-slate-800 font-semibold'
                                : 'text-slate-400'
                            }
                          >
                            {step.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inline Local Activity History Timeline */}
                {expandedHistoryAppId === app.id && (
                  <div className="mt-5 pt-5 border-t border-slate-200">
                    <ApplicationActivityHistory
                      application={app}
                      onAddActivity={async (activity) => {
                        try {
                          await ApiService.addApplicationActivity(app.id, {
                            action: activity.action,
                            description: activity.description,
                            metadata: activity.metadata,
                          });
                        } catch (err) {
                          console.error('Failed to log activity from candidate view:', err);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">{selectedDoc.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="my-5 space-y-4 text-xs">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center justify-between font-bold text-blue-900 mb-2">
                  <span>Structured Attribute Extraction</span>
                  <span className="font-mono text-emerald-700 font-semibold">Verified</span>
                </div>
                <div className="space-y-1.5 text-slate-700">
                  {Object.entries(selectedDoc.extractedData).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-blue-100/50">
                      <span className="capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-semibold text-slate-900">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <div className="text-slate-500 font-medium">Confidence Score:</div>
                  <div className="text-emerald-700 font-bold mt-0.5">
                    {(selectedDoc.ocrConfidence * 100).toFixed(1)}% (SLA Verified)
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <div className="text-slate-500 font-medium">Encrypted Pointer:</div>
                  <div className="text-slate-700 font-mono mt-0.5 truncate">{selectedDoc.id}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedDoc(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <UploadCloud className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Upload to Identity Vault</h3>
              </div>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg font-semibold">
                ✕
              </button>
            </div>

            <div className="my-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Document Classification
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                >
                  <option value="marksheet_12th">Class XII Senior Secondary Marksheet</option>
                  <option value="category_certificate">OBC-NCL / EWS / SC / ST Category Certificate</option>
                  <option value="marksheet_10th">Class X Secondary Marksheet</option>
                  <option value="aadhaar">Aadhaar National Identity Card</option>
                  <option value="signature">Candidate Digital Signature</option>
                  <option value="passport_photo">Candidate Passport Photograph</option>
                </select>
              </div>

              {/* Instant sample presets */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>Sample Certified Documents</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Quickly add official sample documents to test automatic attribute extraction:
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    disabled={uploadingState}
                    onClick={() =>
                      handleUploadPreset('marksheet_12th', 'Class XII Senior Secondary Marksheet (CBSE 2026)')
                    }
                    className="rounded-xl border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    + Add Class XII Marksheet
                  </button>
                  <button
                    disabled={uploadingState}
                    onClick={() =>
                      handleUploadPreset('category_certificate', 'Central OBC-NCL Certificate (SDM Issued)')
                    }
                    className="rounded-xl border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    + Add Category Certificate
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={uploadingState}
                onClick={() =>
                  handleUploadPreset(selectedDocType, `${selectedDocType.toUpperCase().replace('_', ' ')} Document`)
                }
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                {uploadingState ? 'Extracting via AI...' : 'Upload & Encrypt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Filing Receipt Modal */}
      {activeReceiptApp && activeReceiptApp.submissionReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Official Portal Filing Receipt</h3>
                  <p className="text-xs text-slate-500">{activeReceiptApp.portalName}</p>
                </div>
              </div>
              <button onClick={() => setActiveReceiptApp(null)} className="text-slate-400 hover:text-slate-700 text-lg font-semibold">
                ✕
              </button>
            </div>

            <div className="my-5 space-y-3 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
                  Filing Successfully Finalized
                </div>
                <div className="mt-1 text-base font-bold text-slate-900">
                  Ack No: {activeReceiptApp.submissionReceipt.acknowledgementNumber}
                </div>
                <div className="text-slate-600 text-xs mt-0.5">
                  Application ID: {activeReceiptApp.submissionReceipt.applicationNumber}
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="text-slate-900 font-semibold">{activeReceiptApp.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Filing Node:</span>
                  <span className="text-slate-900">{activeReceiptApp.submissionReceipt.filingOperator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-900">
                    {new Date(activeReceiptApp.submissionReceipt.submittedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Hash:</span>
                  <span className="font-mono text-blue-700 truncate max-w-[200px]">
                    {activeReceiptApp.submissionReceipt.verificationHash}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
              <span className="text-[11px] text-slate-500">Official Government Gateway Validated</span>
              <button
                onClick={() => {
                  alert(
                    `Downloaded official receipt for Acknowledgement #${activeReceiptApp.submissionReceipt?.acknowledgementNumber}`
                  );
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save Receipt PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
