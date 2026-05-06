export default function EmptyState({ icon: Icon, message, description, className = '' }) {
  return (
    <div className={`glass-card p-10 flex flex-col items-center text-center text-slate-400 ${className}`}>
      {Icon && <Icon size={36} className="mb-3 opacity-30" />}
      <p className="text-sm font-medium">{message}</p>
      {description && <p className="text-xs mt-1">{description}</p>}
    </div>
  );
}
