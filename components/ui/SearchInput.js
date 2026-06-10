'use client';

import { Search, X } from 'lucide-react';

/**
 * SearchInput — Premium search bar used across notes, resources, and bookmarks pages.
 *
 * Props:
 *  placeholder       — input placeholder text
 *  value             — controlled value
 *  onChange          — change handler
 *  onFocus           — focus handler
 *  onKeyDown         — key down handler
 *  onClear           — called when clear button is clicked
 *  focusBorderClass  — Tailwind focus-border class, e.g. "focus:border-purple-500/30"
 *  widthClass        — optional width override, default "w-full md:w-[320px]"
 */
export default function SearchInput({
  placeholder = 'SEARCH...',
  value,
  onChange,
  onFocus,
  onKeyDown,
  onClear,
  focusBorderClass = 'focus:border-blue-500/30',
  widthClass = 'w-full md:w-[320px]',
}) {
  return (
    <div className={`relative ${widthClass}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        type="text"
        placeholder={placeholder}
        className={`w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-2xl py-3.5 pl-12 pr-12 text-[10px] font-black tracking-widest uppercase focus:outline-none ${focusBorderClass} transition-all shadow-xl`}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-400 hover:text-[var(--foreground)] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
