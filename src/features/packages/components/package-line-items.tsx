import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PackageLineItem } from "../types";

interface PackageLineItemsProps {
  items: PackageLineItem[];
  variant: "include" | "exclude";
}

export function PackageLineItems({ items, variant }: PackageLineItemsProps) {
  if (items.length === 0) {
    return null;
  }

  const Icon = variant === "include" ? Check : X;

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-2.5 text-sm text-foreground">
          <Icon
            className={cn(
              "mt-0.5 size-4 shrink-0",
              variant === "include" ? "text-emerald-600 dark:text-emerald-500" : "text-destructive"
            )}
          />
          {item.description}
        </li>
      ))}
    </ul>
  );
}
