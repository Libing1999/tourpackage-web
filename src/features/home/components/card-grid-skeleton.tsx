import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CardGridSkeletonProps {
  count: number;
  className?: string;
  cardClassName?: string;
}

export function CardGridSkeleton({ count, className, cardClassName }: CardGridSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn("aspect-[4/5] w-full rounded-2xl", cardClassName)} />
      ))}
    </div>
  );
}
