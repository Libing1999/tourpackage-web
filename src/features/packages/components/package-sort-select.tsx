"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PackageSortOption } from "../types";

const SORT_LABELS: Record<PackageSortOption, string> = {
  recommended: "Recommended",
  priceAsc: "Price: Low to High",
  priceDesc: "Price: High to Low",
  ratingDesc: "Top Rated",
  durationAsc: "Duration: Shortest",
  durationDesc: "Duration: Longest",
};

interface PackageSortSelectProps {
  value: PackageSortOption;
  onChange: (value: PackageSortOption) => void;
}

export function PackageSortSelect({ value, onChange }: PackageSortSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PackageSortOption)}>
      <SelectTrigger className="w-[190px]" aria-label="Sort packages">
        {/* base-ui's Select.Value renders the raw value unless given a
            formatter — without this it shows "priceAsc", not "Price: Low to High". */}
        <SelectValue placeholder="Sort by">
          {(value: PackageSortOption | null) => (value ? SORT_LABELS[value] : "Sort by")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(SORT_LABELS) as PackageSortOption[]).map((option) => (
          <SelectItem key={option} value={option}>
            {SORT_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
