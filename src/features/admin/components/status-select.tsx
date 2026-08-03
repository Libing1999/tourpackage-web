"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusSelectProps<T extends string> {
  value: T | undefined;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T | undefined) => void;
  /** Label for the "no filter" option; omit to make the select a value picker
   * rather than a filter. */
  anyLabel?: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

const ANY = "__any__";

export function StatusSelect<T extends string>({
  value,
  options,
  labels,
  onChange,
  anyLabel,
  ariaLabel,
  disabled,
  className,
}: StatusSelectProps<T>) {
  return (
    <Select
      value={value ?? ANY}
      onValueChange={(v) => onChange(v === ANY ? undefined : (v as T))}
      disabled={disabled}
    >
      <SelectTrigger className={className ?? "w-[170px]"} aria-label={ariaLabel}>
        {/* base-ui renders the raw value unless given a formatter — without
            this the trigger would show "IN_PROGRESS", not "In progress". */}
        <SelectValue placeholder={anyLabel ?? "Select"}>
          {(v: string | null) =>
            v && v !== ANY ? labels[v as T] : (anyLabel ?? "Select")
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {anyLabel ? <SelectItem value={ANY}>{anyLabel}</SelectItem> : null}
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labels[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
