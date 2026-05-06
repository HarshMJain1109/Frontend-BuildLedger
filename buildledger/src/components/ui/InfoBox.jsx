import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const VARIANTS = {
  info: {
    bg: 'rgba(37,99,235,0.06)',
    border: '1px solid rgba(37,99,235,0.12)',
    iconCls: 'text-blue-400',
    textCls: 'text-slate-500 dark:text-slate-400',
    Icon: Info,
  },
  warning: {
    bg: 'rgba(245,158,11,0.06)',
    border: '1px solid rgba(245,158,11,0.2)',
    iconCls: 'text-amber-400',
    textCls: 'text-slate-600 dark:text-slate-400',
    Icon: AlertTriangle,
  },
  success: {
    bg: 'rgba(34,197,94,0.06)',
    border: '1px solid rgba(34,197,94,0.2)',
    iconCls: 'text-green-500',
    textCls: 'text-slate-600 dark:text-slate-400',
    Icon: CheckCircle2,
  },
  error: {
    bg: 'rgba(239,68,68,0.06)',
    border: '1px solid rgba(239,68,68,0.2)',
    iconCls: 'text-red-400',
    textCls: 'text-slate-600 dark:text-slate-400',
    Icon: XCircle,
  },
};

export default function InfoBox({ variant = 'info', children, icon: CustomIcon, className = '' }) {
  const v = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = CustomIcon ?? v.Icon;
  return (
    <div
      className={`p-3 rounded-xl text-xs flex items-start gap-2 ${v.textCls} ${className}`}
      style={{ background: v.bg, border: v.border }}
    >
      <Icon size={13} className={`${v.iconCls} shrink-0 mt-0.5`} />
      <span>{children}</span>
    </div>
  );
}
