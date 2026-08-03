"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";

/**
 * Hand-rolled SVG rather than a charting library. The dashboard needs two
 * chart shapes over a dozen data points each; pulling in a charting runtime
 * for that would cost more bundle than the whole admin section. Same reasoning
 * as `Reveal` using IntersectionObserver instead of an animation library.
 *
 * Both charts scale to their container via viewBox + preserveAspectRatio, so
 * they stay readable at any width without measuring the DOM.
 */

const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;
const PADDING = { top: 12, right: 8, bottom: 24, left: 8 };

function monthLabel(iso: string) {
  // "2026-08" -> "Aug". Parsed as UTC so the label can't slip a month for
  // anyone west of Greenwich.
  const [year, month] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number; bookings: number }>;
  currencyCode: string;
}

export function RevenueBarChart({ data, currencyCode }: RevenueChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const gradientId = useId();

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const slot = innerWidth / Math.max(data.length, 1);
  const barWidth = Math.max(slot * 0.55, 4);

  const active = hovered === null ? null : data[hovered];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-52 w-full"
        role="img"
        aria-label={`Revenue for the last ${data.length} months`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Baseline */}
        <line
          x1={PADDING.left}
          y1={PADDING.top + innerHeight}
          x2={CHART_WIDTH - PADDING.right}
          y2={PADDING.top + innerHeight}
          className="stroke-border"
          strokeWidth={1}
        />

        {data.map((point, i) => {
          const height = point.revenue > 0 ? (point.revenue / max) * innerHeight : 0;
          const x = PADDING.left + i * slot + (slot - barWidth) / 2;
          const y = PADDING.top + innerHeight - height;

          return (
            <g key={point.month}>
              {/* Full-height hit area so hovering a short bar's column works */}
              <rect
                x={PADDING.left + i * slot}
                y={PADDING.top}
                width={slot}
                height={innerHeight}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                rx={2}
                fill={`url(#${gradientId})`}
                className={cn(
                  "text-primary transition-opacity",
                  hovered !== null && hovered !== i && "opacity-40"
                )}
                pointerEvents="none"
              />
              <text
                x={PADDING.left + i * slot + slot / 2}
                y={CHART_HEIGHT - 6}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
                pointerEvents="none"
              >
                {monthLabel(point.month)}
              </text>
            </g>
          );
        })}
      </svg>

      {active ? (
        <div className="pointer-events-none absolute top-0 right-0 rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
          <p className="font-medium text-foreground">{monthLabel(active.month)}</p>
          <p className="text-muted-foreground">
            {formatCurrency(active.revenue, currencyCode)} · {active.bookings} booking
            {active.bookings !== 1 ? "s" : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-500",
  CONFIRMED: "text-emerald-500",
  COMPLETED: "text-sky-500",
  CANCELLED: "text-destructive",
};

interface StatusChartProps {
  data: Array<{ status: string; count: number }>;
}

/** A donut, drawn with stroke-dasharray on concentric circles — no path maths,
 * and it degrades to a clean ring when every slice is zero. */
export function BookingStatusDonut({ data }: StatusChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.count, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
      <svg viewBox="0 0 160 160" className="size-40 shrink-0 -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" className="stroke-muted" strokeWidth={18} />
        {total > 0 &&
          data.map((slice) => {
            const fraction = slice.count / total;
            const dash = fraction * circumference;
            const element = (
              <circle
                key={slice.status}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                strokeWidth={18}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                className={cn("stroke-current", STATUS_COLORS[slice.status] ?? "text-muted-foreground")}
              />
            );
            offset += dash;
            return element;
          })}
      </svg>

      <ul className="flex w-full flex-col gap-2">
        {data.map((slice) => (
          <li key={slice.status} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2.5 rounded-full bg-current",
                  STATUS_COLORS[slice.status] ?? "text-muted-foreground"
                )}
              />
              <span className="text-muted-foreground capitalize">{slice.status.toLowerCase()}</span>
            </span>
            <span className="font-medium text-foreground">{slice.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
