"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/common/star-rating";
import { useAmenities } from "../hooks/use-hotels";

const STAR_OPTIONS = [5, 4, 3, 2, 1];

export interface HotelFiltersValue {
  minPrice?: number;
  maxPrice?: number;
  minStarRating?: number;
  amenityIds: string[];
}

interface HotelFiltersProps {
  value: HotelFiltersValue;
  onChange: (patch: Partial<HotelFiltersValue>) => void;
  onClear: () => void;
}

export function HotelFilters({ value, onChange, onClear }: HotelFiltersProps) {
  const { data: amenities, isPending: amenitiesPending } = useAmenities();

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

  const toggleAmenity = (amenityId: string, checked: boolean) => {
    const next = checked
      ? [...value.amenityIds, amenityId]
      : value.amenityIds.filter((id) => id !== amenityId);
    onChange({ amenityIds: next });
  };

  const hasActiveFilters =
    value.minPrice !== undefined ||
    value.maxPrice !== undefined ||
    value.minStarRating !== undefined ||
    value.amenityIds.length > 0;

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
        <Label className="text-xs font-medium text-muted-foreground">Price per night</Label>
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
        <Label className="text-xs font-medium text-muted-foreground">Star rating</Label>
        <div className="flex flex-col gap-2">
          {STAR_OPTIONS.map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() =>
                onChange({ minStarRating: value.minStarRating === stars ? undefined : stars })
              }
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-sm transition-colors ${
                value.minStarRating === stars
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-transparent hover:bg-muted"
              }`}
            >
              <StarRating rating={stars} />
              <span className="text-muted-foreground">& up</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Label className="text-xs font-medium text-muted-foreground">Amenities</Label>
        {amenitiesPending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {amenities?.map((amenity) => (
              <div key={amenity.id} className="group flex items-center gap-2.5">
                <Checkbox
                  id={`amenity-${amenity.id}`}
                  checked={value.amenityIds.includes(amenity.id)}
                  onCheckedChange={(checked) => toggleAmenity(amenity.id, checked === true)}
                />
                <Label htmlFor={`amenity-${amenity.id}`} className="text-sm font-normal text-foreground">
                  {amenity.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
