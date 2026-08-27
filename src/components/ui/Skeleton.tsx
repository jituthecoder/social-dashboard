import React from 'react';
import { clsx } from 'clsx';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={clsx('animate-pulse rounded-lg bg-slate-800/60', className)} />
  );
};
