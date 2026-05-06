import { AlertCircle } from 'lucide-react';

/**
 * dense: uses py-2 padding (compact, for edit forms inside modals)
 * default: py-2.5 (standard, for create forms)
 */
export default function FormInput({
  label,
  required = false,
  error,
  hint,
  type = 'text',
  value,
  onChange,
  placeholder,
  dense = false,
  disabled = false,
  className = '',
  min,
  max,
  step,
}) {
  const pad = dense ? 'py-2' : 'py-2.5';
  const borderCls = error
    ? 'border-amber-400 bg-amber-50/30'
    : 'border-slate-200';

  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`w-full text-sm bg-white/60 border rounded-xl px-3 ${pad} outline-none focus:border-blue-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${borderCls}`}
      />
      {error && (
        <p className="flex items-center gap-1 text-xs text-amber-500 mt-1">
          <AlertCircle size={11} className="shrink-0" /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-400 mt-1">{hint}</p>
      )}
    </div>
  );
}
