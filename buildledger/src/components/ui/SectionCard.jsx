/**
 * Glass card with an optional header row (title + subtitle + actions).
 * Useful for wrapping tables, settings sections, etc.
 */
export default function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = '',
}) {
  const hasHeader = title || actions;
  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      {hasHeader && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
