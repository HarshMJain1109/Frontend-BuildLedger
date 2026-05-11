import { ClipboardList, ChevronRight } from 'lucide-react';
import { ProgressBar } from '../../components/ui';
import { statusMeta, formatINR, TERMINAL_STATUSES } from './contractConstants';

/**
 * ContractCard — displays a single contract summary.
 * Clicking opens ContractDetailModal via the onClick prop.
 */
export default function ContractCard({ contract: c, canManage, onClick }) {
  const meta = statusMeta(c.status);

  return (
    <div className="glass-card p-5 cursor-pointer hover:shadow-md transition-all" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {c.vendorName || `Vendor #${c.vendorId}`}
          </h3>
          <p className="text-xs text-slate-400 truncate">
            {c.projectName || `Project #${c.projectId}`}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
          style={{ background: meta.bg, color: meta.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
          {meta.label}
        </span>
      </div>

      <div className="space-y-1.5 mb-4">
        {c.value && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Contract Value</span>
            <span className="text-slate-700 dark:text-slate-200 font-semibold">{formatINR(c.value)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Duration</span>
          <span className="text-slate-500 dark:text-slate-400">{c.startDate || '—'} → {c.endDate || '—'}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Progress</span>
          <span className="text-slate-600 dark:text-slate-300 font-semibold">{meta.progress}%</span>
        </div>
        <ProgressBar value={meta.progress} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <ClipboardList size={10} /><span>Click to view details & terms</span>
        </div>
        {canManage && !TERMINAL_STATUSES.includes(c.status) && (
          <span className="text-[10px] text-blue-500 font-medium flex items-center gap-0.5">
            Manage <ChevronRight size={10} />
          </span>
        )}
      </div>
    </div>
  );
}