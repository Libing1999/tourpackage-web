import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "../types";

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

// Not using Badge's `variant` for these — the semantic states here (awaiting
// review vs. confirmed vs. cancelled) don't map onto the design system's
// default/secondary/destructive set cleanly enough to be worth forcing.
const STATUS_CLASSES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300",
  CONFIRMED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300",
  CANCELLED: "bg-destructive/10 text-destructive",
  COMPLETED: "bg-muted text-muted-foreground",
};

export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return <Badge className={cn(STATUS_CLASSES[status], className)}>{STATUS_LABELS[status]}</Badge>;
}
