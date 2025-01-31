import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressIndicator({ current, total, className }: ProgressIndicatorProps) {
  const progress = (current / total) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm text-[#C0C0C0]">
        <span>Card {current} of {total}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="h-1 bg-[#404040] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#00A6B2] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}