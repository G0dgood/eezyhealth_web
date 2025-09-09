import { Skeleton } from "./skeleton";

export function PaymentHeaderSkeleton() {
  return (
    <div className="mb-6">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-80" />
    </div>
  );
}

export function PaymentSearchSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex-1">
        <Skeleton className="h-10 w-80" />
      </div>
      <Skeleton className="h-10 w-48" />
    </div>
  );
}

