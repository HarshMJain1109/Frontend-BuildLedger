import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`flex items-center gap-2 bg-white/60 dark:bg-slate-800/50 border border-white/80 dark:border-slate-700/40 rounded-xl px-3 py-2 ${className}`}>
      <Search size={14} className="text-slate-400 shrink-0" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-transparent text-sm outline-none w-full text-slate-600 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
      />
    </div>
  );
}
