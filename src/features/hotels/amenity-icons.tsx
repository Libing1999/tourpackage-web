import {
  Accessibility,
  Bus,
  Car,
  Clock,
  Dumbbell,
  Martini,
  PawPrint,
  Snowflake,
  Sparkles,
  Utensils,
  Waves,
  Wifi,
  type LucideIcon,
  CheckCircle2,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  car: Car,
  clock: Clock,
  bus: Bus,
  snowflake: Snowflake,
  utensils: Utensils,
  martini: Martini,
  waves: Waves,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  "paw-print": PawPrint,
  accessibility: Accessibility,
};

export function getAmenityIcon(icon: string | null): LucideIcon {
  return (icon && ICON_MAP[icon]) || CheckCircle2;
}
