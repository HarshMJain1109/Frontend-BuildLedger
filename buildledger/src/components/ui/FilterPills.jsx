/**
 * Simple pill-shaped filter buttons — used on pages like Vendors, Deliveries, Admin.
 *
 * options: [{ key: string, label: string }]
 * value:   currently selected key
 * onChange: (key) => void
 */
export default function FilterPills({ options, value, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {options.map(o => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
            value === o.key
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
              : 'bg-white/60 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-white/80 dark:border-slate-700/40 hover:bg-white dark:hover:bg-slate-700/60'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
