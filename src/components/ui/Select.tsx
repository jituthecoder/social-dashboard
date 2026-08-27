import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  className,
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={clsx(
          'block w-full rounded-lg bg-slate-900 border text-sm text-slate-100 px-3.5 py-2 focus:outline-none focus:ring-2 transition-colors cursor-pointer',
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
