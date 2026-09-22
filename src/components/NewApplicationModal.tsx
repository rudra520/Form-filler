import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  CheckCircle,
  FileText,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { ExamPortal, VaultDocument } from '../types';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (portal: ExamPortal, session: string) => Promise<void>;
  documents: VaultDocument[];
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  documents,
}) => {
  const [selectedPortal, setSelectedPortal] = useState<ExamPortal>('JEE_MAIN');
  const [session, setSession] = useState('2026 Examination Cycle');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const exams: Array<{
    id: ExamPortal;
    name: string;
    authority: string;
    session: string;
    deadline: string;
    fee: number;
    requiredDocs: string[];
  }> = [
    {
      id: 'JEE_MAIN',
      name: 'Joint Entrance Examination (JEE Main) 2026',
      authority: 'National Testing Agency (NTA)',
      session: 'Session 2 (April 2026)',
      deadline: 'March 28, 2026',
      fee: 150,
      requiredDocs: ['Aadhaar Card', '10th Marksheet', 'Category Cert (if applicable)'],
    },
    {
      id: 'NEET_UG',
      name: 'National Eligibility cum Entrance Test (NEET UG) 2026',
      authority: 'National Testing Agency (NTA)',
      session: 'Undergraduate Cycle 2026',
      deadline: 'April 10, 2026',
      fee: 150,
      requiredDocs: ['Aadhaar Card', '10th Marksheet', '12th Marksheet', 'Category Cert'],
    },
    {
      id: 'UPSC_CSE',
      name: 'Civil Services (Preliminary) Examination 2026',
      authority: 'Union Public Service Commission (UPSC)',
      session: 'CSE Prelims 2026',
      deadline: 'March 15, 2026',
      fee: 150,
      requiredDocs: ['Aadhaar Card', '10th Marksheet (DOB proof)', 'Degree / 12th Cert'],
    },
    {
      id: 'NDA_NA',
      name: 'National Defence Academy & Naval Academy (NDA-I) 2026',
      authority: 'UPSC Examination Board',
      session: 'Cycle I - 2026',
      deadline: 'April 04, 2026',
      fee: 150,
      requiredDocs: ['Aadhaar Card', '10th Marksheet', '12th Marksheet'],
    },
    {
      id: 'CUET_UG',
      name: 'Common University Entrance Test (CUET UG) 2026',
      authority: 'National Testing Agency (NTA)',
      session: '2026-27 Academic Year',
      deadline: 'April 15, 2026',
      fee: 150,
      requiredDocs: ['Aadhaar Card', '10th Marksheet', '12th Marksheet'],
    },
  ];

  const selectedExam = exams.find((e) => e.id === selectedPortal) || exams[0];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(selectedPortal, session);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">New Exam Application Filing</h2>
              <p className="text-xs text-slate-500">
                Select central portal to initiate automated submission pipeline
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg font-semibold">
            ✕
          </button>
        </div>

        {/* Portal selection */}
        <div className="my-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Central or State Portal
            </label>
            <div className="space-y-2">
              {exams.map((exam) => {
                const isSelected = exam.id === selectedPortal;
                return (
                  <div
                    key={exam.id}
                    onClick={() => {
                      setSelectedPortal(exam.id);
                      setSession(exam.session);
                    }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{exam.name}</h4>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                            {exam.authority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Cycle: <strong className="text-slate-800">{exam.session}</strong> • Deadline:{' '}
                          <span className="text-rose-600 font-semibold">{exam.deadline}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">₹{exam.fee}</span>
                        <div className="text-[10px] text-slate-500">Service Fee</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification check */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Identity Vault Auto-Matching</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Your encrypted vault contains <strong>{documents.length} verified documents</strong>. FormFiller will auto-populate candidate identity, roll numbers, categories, and marksheet scores without human error.
            </p>
          </div>

          {/* Convenience Fee summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Automated Filing Convenience Fee:</span>
              <span className="font-bold text-slate-900">₹{selectedExam.fee}.00</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 mt-1.5">
              <span>Zero-Error & OTP Bridge Guarantee:</span>
              <span className="font-semibold text-emerald-700">Included</span>
            </div>
            <div className="flex items-center justify-between text-slate-900 font-bold border-t border-slate-200 mt-2.5 pt-2 text-sm">
              <span>Total Payable:</span>
              <span className="text-blue-700">₹{selectedExam.fee}.00</span>
            </div>
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>{submitting ? 'Initiating Pipeline...' : 'Confirm & Initiate Filing'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
