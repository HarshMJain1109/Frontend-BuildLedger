import { Loader2 } from 'lucide-react';

/**
 * variant: 'primary' | 'secondary' | 'danger' | 'ghost'
 * size:    'xs' | 'sm' | 'md'
 */
export default function Button({
  variant = 'primary',
  size = 'xs',
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
  type = 'button',
  className = '',
  style,
}) {
  const isDisabled = disabled || loading;
  const loaderSize = size === 'xs' ? 12 : size === 'sm' ? 14 : 16;

  const content = (
    <>
      {loading ? <Loader2 size={loaderSize} className="animate-spin" /> : icon}
      {children}
    </>
  );

  if (variant === 'primary') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        className={`btn-primary disabled:opacity-50 ${size === 'xs' ? 'text-xs' : size === 'md' ? 'text-base' : ''} ${className}`}
        style={style}
      >
        {content}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        className={`btn-secondary disabled:opacity-50 ${size === 'xs' ? 'text-xs' : size === 'md' ? 'text-base' : ''} ${className}`}
        style={style}
      >
        {content}
      </button>
    );
  }

  if (variant === 'danger') {
    const pad = size === 'xs' ? 'px-3 py-1.5 text-xs' : size === 'sm' ? 'px-4 py-2 text-sm' : 'px-5 py-2.5 text-base';
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        className={`flex items-center gap-1.5 ${pad} rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 ${className}`}
        style={style}
      >
        {content}
      </button>
    );
  }

  // ghost
  const pad = size === 'xs' ? 'px-2 py-1 text-xs' : size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`flex items-center gap-1.5 ${pad} rounded-xl font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all disabled:opacity-50 ${className}`}
      style={style}
    >
      {content}
    </button>
  );
}
