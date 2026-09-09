import { cn } from "@/lib/utils";

/**
 * Brand mark: a mountain range under a sun, matching the supplied logo.
 * The peaks are drawn with `currentColor` so they pick up the theme's
 * foreground — dark on a light background, light on a dark one — while the
 * sun keeps its warm amber in both themes. Swap this SVG (or point the mark
 * at your own file in /public) to use the exact supplied asset.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      <circle cx="33" cy="8.5" r="5" fill="#F59E0B" />
      {/* Back ridge */}
      <path d="M1 30 L14 8 L23 22 L27 16 L43 30 Z" fill="currentColor" opacity="0.55" />
      {/* Front peak with a snow cap notch */}
      <path
        d="M9 30 L20 12 L24.5 19 L22 21 L24 24 L31 30 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  // The mark inherits the wrapper's text colour (currentColor), so passing a
  // text-* class here recolours both the peaks and the wordmark — e.g. white
  // when the navbar floats over the hero image.
  return (
    <div className={cn("flex items-center gap-2 font-semibold tracking-tight text-foreground", className)}>
      <LogoMark className="size-7" />
      <span>Tour Leh Ladakh</span>
    </div>
  );
}
