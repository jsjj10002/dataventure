import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2',
        {
          'border-transparent bg-primary-600 text-white': variant === 'default',
          'border-transparent bg-gray-100 text-gray-900': variant === 'secondary',
          'text-gray-900': variant === 'outline',
          'border-transparent bg-green-100 text-green-800': variant === 'success',
          'border-transparent bg-yellow-100 text-yellow-800': variant === 'warning',
          'border-transparent bg-red-100 text-red-800': variant === 'danger',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };

