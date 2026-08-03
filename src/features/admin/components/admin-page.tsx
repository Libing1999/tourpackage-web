import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** One place for the three states every list page has, so they look the same
 * everywhere instead of each page inventing its own empty text. */
export function AdminListState({
  isPending,
  isError,
  isEmpty,
  emptyMessage,
  children,
}: {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
}) {
  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
        Couldn&apos;t load this list. Please try again.
      </p>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}

/** Tables scroll inside their own container rather than pushing the page
 * sideways — a horizontally scrolling admin layout is much worse than a
 * horizontally scrolling table. */
export function AdminTable({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-background">
      <table className="w-full min-w-[42rem] text-sm">
        <thead className="border-b bg-muted/40 text-left">
          <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-medium [&>th]:text-muted-foreground [&>th]:whitespace-nowrap">
            {head}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr:last-child]:border-0 [&>tr>td]:px-4 [&>tr>td]:py-3">
          {children}
        </tbody>
      </table>
    </div>
  );
}
