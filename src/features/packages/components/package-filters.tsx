"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDestinations } from "../hooks/use-packages";
import type { DifficultyLevel } from "../types";

const ANY_DESTINATION = "__any__";

const DURATION_OPTIONS: { label: string; min?: number; max?: number }[] = [
  { label: "1 – 3 days", min: 1, max: 3 },
  { label: "4 – 6 days", min: 4, max: 6 },
  { label: "7 – 9 days", min: 7, max: 9 },
  { label: "10+ days", min: 10 },
];

const DIFFICULTY_OPTIONS: DifficultyLevel[] = ["EASY", "MODERATE", "CHALLENGING", "EXTREME"];

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  EASY: "Easy",
  MODERATE: "Moderate",
  CHALLENGING: "Challenging",
  EXTREME: "Extreme",
};

export interface PackageFiltersValue {
  cityId?: string;
  minPrice?: number;
  maxPrice?: number;
  minDurationDays?: number;
  maxDurationDays?: number;
  difficultyLevel?: DifficultyLevel;
  discountedOnly?: boolean;
}

interface PackageFiltersProps {
  value: PackageFiltersValue;
  onChange: (patch: Partial<PackageFiltersValue>) => void;
  onClear: () => void;
}

export function PackageFilters({ value, onChange, onClear }: PackageFiltersProps) {
  const { data: destinations } = useDestinations();
  const [minPriceInput, setMinPriceInput] = useState(value.minPrice?.toString() ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(value.maxPrice?.toString() ?? "");

  useEffect(() => {
    setMinPriceInput(value.minPrice?.toString() ?? "");
    setMaxPriceInput(value.maxPrice?.toString() ?? "");
  }, [value.minPrice, value.maxPrice]);

  const commitPriceRange = () => {
    const min = minPriceInput ? Number(minPriceInput) : undefined;
    const max = maxPriceInput ? Number(maxPriceInput) : undefined;
    onChange({
      minPrice: min !== undefined && !Number.isNaN(min) ? min : undefined,
      maxPrice: max !== undefined && !Number.isNaN(max) ? max : undefined,
    });
  };

  const isDurationActive = (min?: number, max?: number) =>
    value.minDurationDays === min && value.maxDurationDays === max;

  const hasActiveFilters =
    value.cityId !== undefined ||
    value.minPrice !== undefined ||
    value.maxPrice !== undefined ||
    value.minDurationDays !== undefined ||
    value.maxDurationDays !== undefined ||
    value.difficultyLevel !== undefined ||
    value.discountedOnly === true;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {hasActiveFilters ? (
          <Button variant="ghost" size="xs" onClick={onClear}>
            Clear all
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-xs font-medium text-muted-foreground">Destination</Label>
        <Select
          value={value.cityId ?? ANY_DESTINATION}
          onValueChange={(v) => onChange({ cityId: v === ANY_DESTINATION ? undefined : (v as string) })}
        >
          <SelectTrigger className="w-full" aria-label="Filter by destination">
            <SelectValue placeholder="Any destination">
              {(cityId: string | null) => {
                const selected = destinations?.find((d) => d.id === cityId);
                return selected ? `${selected.name}, ${selected.countryName}` : "Any destination";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_DESTINATION}>Any destination</SelectItem>
            {destinations?.map((destination) => (
              <SelectItem key={destination.id} value={destination.id}>
                {destination.name}, {destination.countryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Label className="text-xs font-medium text-muted-foreground">Price per person</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            onBlur={commitPriceRange}
            onKeyDown={(e) => e.key === "Enter" && commitPriceRange()}
            aria-label="Minimum price"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            onBlur={commitPriceRange}
            onKeyDown={(e) => e.key === "Enter" && commitPriceRange()}
            aria-label="Maximum price"
          />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Label className="text-xs font-medium text-muted-foreground">Duration</Label>
        <div className="flex flex-col gap-1.5">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() =>
                onChange(
                  isDurationActive(option.min, option.max)
                    ? { minDurationDays: undefined, maxDurationDays: undefined }
                    : { minDurationDays: option.min, maxDurationDays: option.max }
                )
              }
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-left text-sm transition-colors",
                isDurationActive(option.min, option.max)
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Label className="text-xs font-medium text-muted-foreground">Difficulty</Label>
        <div className="flex flex-col gap-1.5">
          {DIFFICULTY_OPTIONS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() =>
                onChange({ difficultyLevel: value.difficultyLevel === level ? undefined : level })
              }
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-left text-sm transition-colors",
                value.difficultyLevel === level
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted"
              )}
            >
              {DIFFICULTY_LABELS[level]}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="discounted-only"
          checked={value.discountedOnly === true}
          onCheckedChange={(checked) => onChange({ discountedOnly: checked === true ? true : undefined })}
        />
        <Label htmlFor="discounted-only" className="text-sm font-normal text-foreground">
          On offer only
        </Label>
      </div>
    </div>
  );
}
