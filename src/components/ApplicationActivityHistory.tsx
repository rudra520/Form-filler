import { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Shield,
  Send,
  Sparkles,
  ArrowUpDown,
  Download,
  PlusCircle,
  Cpu,
  Smartphone,
  Lock,
  MessageSquare,
  Filter,
} from 'lucide-react';
import { ExamApplication, ApplicationActivityItem } from '../types';
import { getApplicationActivities, formatActivityDateTime } from '../utils/activityHistory';

interface ApplicationActivityHistoryProps {
  application: ExamApplication;
  onAddActivity?: (activity: ApplicationActivityItem) => void;
  compact?: boolean;
}

export const ApplicationActivityHistory: React.FC<ApplicationActivityHistoryProps> = ({
  application,
  onAddActivity,
  compact = false,
}) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // default newest first
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'partner' | 'citizen' | 'system'>('ALL');
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedState, setCopiedState] = useState(false);

  // Local state for dynamically added activities during session
  const [localActivities, setLocalActivities] = useState<ApplicationActivityItem[]>([]);

  // Base activities merged with local additions
  const allActivities = useMemo(() => {
    const base = getApplicationActivities(application);
    const combined = [...base, ...localActivities];
    
    // Deduplicate by ID
    const seen = new Set<string>();
    const unique = combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    // Apply role filter
    const filtered = roleFilter === 'ALL'
      ? unique
      : unique.filter((item) => item.actorRole === roleFilter);

    // Apply sort order
    return filtered.sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? tB - tA : tA - tB;
    });
  }, [application, localActivities, roleFilter, sortOrder]);

  const handleAddCustomNote = (text?: string) => {
    const content = (text || noteText).trim();
    if (!content) return;

    setSubmittingNote(true);

    const newActivity: ApplicationActivityItem = {
      id: `act-note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action: 'File Action Note Logged',
      description: content,
      actor: 'Operator (Current User)',
      actorRole: 'partner',
      timestamp: new Date().toISOString(),
      metadata: {
        manualEntry: true,
      },
    };

    // Update local state immediately
    setLocalActivities((prev) => [...prev, newActivity]);
    if (onAddActivity) {
      onAddActivity(newActivity);
    }

    setNoteText('');
    setSubmittingNote(false);
    setShowAddForm(false);
  };

  const handleExportText = () => {
    const lines = [
      `ACTIVITY HISTORY REPORT: ${application.portalName}`,
      `Application ID: ${application.id}`,
      `Candidate: ${application.userName} (${application.userEmail})`,
      `Status: ${application.status}`,
      `Exported: ${new Date().toLocaleString()}`,
      '------------------------------------------------------------',
    ];

    allActivities.forEach((act, idx) => {
      const { date, time } = formatActivityDateTime(act.timestamp);
      lines.push(`[${idx + 1}] ${date} ${time} | ${act.actor} (${act.actorRole.toUpperCase()})`);
      lines.push(`    Action: ${act.action}`);
      lines.push(`    Details: ${act.description}`);
      if (act.statusAfter) {
        lines.push(`    Status Result: ${act.statusAfter}`);
      }
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-history-${application.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2500);
  };

  const getActionIcon = (act: ApplicationActivityItem) => {
    const actionLower = act.action.toLowerCase();
    if (actionLower.includes('initiated') || actionLower.includes('created')) {
      return <PlusCircle className="h-4 w-4 text-blue-600" />;
    }
    if (actionLower.includes('mapped') || actionLower.includes('extract') || actionLower.includes('attribute')) {
      return <Cpu className="h-4 w-4 text-indigo-600" />;
    }
    if (actionLower.includes('assigned') || actionLower.includes('operator')) {
      return <User className="h-4 w-4 text-sky-600" />;
    }
    if (actionLower.includes('autofill') || actionLower.includes('filling')) {
      return <Sparkles className="h-4 w-4 text-blue-600" />;
    }
    if (actionLower.includes('otp bridge') || actionLower.includes('dispatched')) {
      return <Smartphone className="h-4 w-4 text-amber-600" />;
    }
    if (actionLower.includes('authorization') || actionLower.includes('otp verified')) {
      return <Shield className="h-4 w-4 text-emerald-600" />;
    }
    if (actionLower.includes('finalized') || actionLower.includes('submitted')) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }
    if (actionLower.includes('note') || act.metadata?.manualEntry) {
      return <MessageSquare className="h-4 w-4 text-violet-600" />;
    }
    return <Clock className="h-4 w-4 text-slate-500" />;
  };

  const getNodeBg = (act: ApplicationActivityItem) => {
    const actionLower = act.action.toLowerCase();
    if (actionLower.includes('finalized') || actionLower.includes('otp verified')) {
      return 'bg-emerald-50 border-emerald-300 text-emerald-700';
    }
    if (actionLower.includes('otp bridge') || actionLower.includes('dispatched')) {
      return 'bg-amber-50 border-amber-300 text-amber-700';
    }
    if (actionLower.includes('note') || act.metadata?.manualEntry) {
      return 'bg-violet-50 border-violet-300 text-violet-700';
    }
    return 'bg-blue-50 border-blue-200 text-blue-700';
  };

  const getActorBadge = (role: string) => {
    switch (role) {
      case 'citizen':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'partner':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'admin':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${compact ? 'p-4' : 'p-6'} shadow-sm`}>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>File Activity History</span>
            </h3>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 font-mono">
              {allActivities.length} {allActivities.length === 1 ? 'Action' : 'Actions'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological record of state transitions, automated operations, and verified authorizations on {application.id}
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title={sortOrder === 'desc' ? 'Showing Newest First (Click to reverse)' : 'Showing Oldest First (Click to reverse)'}
          >
            <ArrowUpDown className="h-3 w-3 text-slate-500" />
            <span className="text-[11px]">{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>

          {/* Add note toggle */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 rounded-xl bg-blue-50 border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="text-[11px]">Log Note</span>
          </button>

          {/* Export Report */}
          <button
            onClick={handleExportText}
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Export full file history as text"
          >
            <Download className="h-3 w-3 text-slate-500" />
            <span className="text-[11px]">{copiedState ? 'Saved!' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Role Filter Pills */}
      <div className="flex items-center gap-1.5 py-3 border-b border-slate-100 overflow-x-auto text-[11px]">
        <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium mr-1">
          <Filter className="h-3 w-3" /> Filter:
        </span>
        {[
          { id: 'ALL', label: 'All Events' },
          { id: 'partner', label: 'Operator Actions' },
          { id: 'citizen', label: 'Candidate Actions' },
          { id: 'system', label: 'System & Engine' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setRoleFilter(item.id as any)}
            className={`px-2.5 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              roleFilter === item.id
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Inline Add Action Note Form */}
      {showAddForm && (
        <div className="my-4 rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-blue-600" /> Record Action Note on File
            </span>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>

          <textarea
            rows={2}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type verification notes, phone conversation details, or operational updates for this file..."
            className="w-full rounded-xl border border-blue-200 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Quick preset suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className="text-slate-500 font-medium">Quick Presets:</span>
            {[
              'Candidate confirmed exam center choice via phone',
              'Class XII marksheet verified with CBSE DigiLocker',
              'OBC-NCL certificate issued within current financial year',
              'Candidate requested Session 2 reminder SMS',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setNoteText(preset)}
                className="rounded-md border border-blue-200 bg-white px-2 py-0.5 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                + {preset.slice(0, 32)}...
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              disabled={!noteText.trim() || submittingNote}
              onClick={() => handleAddCustomNote()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Send className="h-3 w-3" />
              <span>Log Action to History</span>
            </button>
          </div>
        </div>
      )}

      {/* Chronological Timeline */}
      <div className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {allActivities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
            No activity records found matching the current filter.
          </div>
        ) : (
          <div className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {allActivities.map((act, idx) => {
              const { date, time, relative } = formatActivityDateTime(act.timestamp);
              const nodeBg = getNodeBg(act);
              const actorBadge = getActorBadge(act.actorRole);

              return (
                <div key={act.id} className="relative mb-5 last:mb-0 group">
                  {/* Timeline icon node */}
                  <div
                    className={`absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full border shadow-xs transition-transform group-hover:scale-110 ${nodeBg}`}
                  >
                    {getActionIcon(act)}
                  </div>

                  {/* Activity content card */}
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{act.action}</span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${actorBadge}`}
                        >
                          {act.actor}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">{relative}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-slate-500" title={`${date} ${time}`}>
                          {time}
                        </span>
                      </div>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      {act.description}
                    </p>

                    {/* Metadata & Status tags */}
                    {(act.statusAfter || act.metadata) && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2 text-[10px]">
                        {act.statusAfter && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <span>Status:</span>
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {act.statusAfter}
                            </span>
                          </div>
                        )}

                        {act.metadata?.acknowledgementNumber && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <span>Ack No:</span>
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {act.metadata.acknowledgementNumber}
                            </span>
                          </div>
                        )}

                        {act.metadata?.manualEntry && (
                          <span className="text-violet-700 font-semibold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                            Manual Note
                          </span>
                        )}

                        <span className="text-slate-400 font-mono text-[9px] ml-auto">
                          {act.id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer quick note prompt if not open */}
      {!showAddForm && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] text-slate-400">
            Immutable audit record maintained with local state sync
          </span>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            + Add Activity Note
          </button>
        </div>
      )}
    </div>
  );
};
