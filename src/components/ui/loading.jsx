import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LoadingSpinner = ({ size = 'default', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size],
        className,
      )}
    />
  );
};

export const LoadingOverlay = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 bg-background/80',
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-20 rounded-lg',
      )}
    >
      <LoadingSpinner />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

export const LoadingCard = ({ message = 'Loading data...', className }) => {
  return (
    <div
      className={cn(
        'flex h-40 flex-col items-center justify-center gap-2 rounded-lg border bg-card p-6 text-card-foreground shadow-sm',
        className,
      )}
    >
      <LoadingSpinner />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export const LoadingSection = ({ message = 'Loading...', className }) => {
  return (
    <div className={cn('py-8 text-center', className)}>
      <LoadingSpinner className="mx-auto" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export const GridLoadingPlaceholder = ({ count = 3 }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-lg border bg-card/30 shadow-sm animate-pulse"
          />
        ))}
    </div>
  );
};
