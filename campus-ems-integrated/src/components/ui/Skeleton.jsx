import { cn } from '@/lib/helpers';

export default function Skeleton({ className, ...props }) {
  return <div className={cn('shimmer rounded-xl', className)} {...props} />;
}

export function SkeletonCard() {
  return (
    <div className="card space-y-4 p-0 overflow-hidden">
      <Skeleton className="h-48 w-full rounded-t-2xl rounded-b-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}
