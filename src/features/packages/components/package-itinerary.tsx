import { MapPin, UtensilsCrossed, BedDouble } from "lucide-react";

import type { PackageItineraryDay } from "../types";

export function PackageItinerary({ days }: { days: PackageItineraryDay[] }) {
  if (days.length === 0) {
    return <p className="text-sm text-muted-foreground">A day-by-day itinerary isn&apos;t available yet.</p>;
  }

  return (
    <ol className="flex flex-col">
      {days.map((day, i) => (
        <li key={day.id} className="flex gap-4">
          {/* Timeline rail: a numbered node per day, with a connecting line
              that stops at the last one. */}
          <div className="flex flex-col items-center">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {day.dayNumber}
            </span>
            {i < days.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
          </div>

          <div className="flex-1 pb-8">
            <h3 className="font-semibold text-foreground">{day.title}</h3>
            {day.description ? (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{day.description}</p>
            ) : null}

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {day.cityName ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {day.cityName}
                </span>
              ) : null}
              {day.meals ? (
                <span className="flex items-center gap-1.5">
                  <UtensilsCrossed className="size-3.5" />
                  {day.meals}
                </span>
              ) : null}
              {day.accommodation ? (
                <span className="flex items-center gap-1.5">
                  <BedDouble className="size-3.5" />
                  {day.accommodation}
                </span>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
