import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverEffect = false, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-5 shadow-xl transition-all duration-200',
        hoverEffect && 'hover:border-slate-700 hover:shadow-2xl hover:translate-y-[-2px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
