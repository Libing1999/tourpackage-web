"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { HotelSortOption } from "../types";

const SORT_LABELS: Record<HotelSortOption, string> = {
  recommended: "Recommended",
  priceAsc: "Price: Low to High",
  priceDesc: "Price: High to Low",
  ratingDesc: "Top Rated",
  nameAsc: "Name: A to Z",
};

interface HotelSortSelectProps {
  value: HotelSortOption;
  onChange: (value: HotelSortOption) => void;
}

export function HotelSortSelect({ value, onChange }: HotelSortSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as HotelSortOption)}>
      <SelectTrigger className="w-[190px]" aria-label="Sort hotels">
        {/* base-ui's Select.Value renders the raw value unless given a
            formatter — without this it shows "priceAsc", not "Price: Low to High". */}
        <SelectValue placeholder="Sort by">
          {(value: HotelSortOption | null) => (value ? SORT_LABELS[value] : "Sort by")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(SORT_LABELS) as HotelSortOption[]).map((option) => (
          <SelectItem key={option} value={option}>
            {SORT_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
