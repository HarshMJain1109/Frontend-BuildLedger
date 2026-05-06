export default function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`flex items-center justify-between flex-wrap gap-3 ${className}`}>
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
