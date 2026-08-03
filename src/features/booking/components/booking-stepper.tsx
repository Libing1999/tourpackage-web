import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/** Step 1 is named by the flow that owns it — a hotel books a stay, a package
 * books a trip — so the label is passed in rather than hardcoded here. */
export const HOTEL_BOOKING_STEPS = ["Your stay", "Guest details", "Travellers", "Review & pay"];
export const PACKAGE_BOOKING_STEPS = ["Your trip", "Guest details", "Travellers", "Review & pay"];

export function BookingStepper({
  currentStep,
  steps = HOTEL_BOOKING_STEPS,
}: {
  currentStep: number;
  steps?: string[];
}) {
  return (
    // Labels are hidden on narrow screens except for the current step —
    // four of them side by side overflow a phone viewport, and a stepper
    // that runs off the edge reads as broken rather than scrollable.
    <ol className="flex items-center gap-2">
      {steps.map((label, i) => {
        const isDone = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <li key={label} className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                isDone && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                !isDone && !isCurrent && "bg-muted text-muted-foreground"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isDone ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-sm whitespace-nowrap",
                isCurrent ? "font-medium text-foreground" : "hidden text-muted-foreground sm:inline"
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 ? (
              <span className={cn("mx-1 h-px w-4 sm:w-10", isDone ? "bg-primary" : "bg-border")} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
