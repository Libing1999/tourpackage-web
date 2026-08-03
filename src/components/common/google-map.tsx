import { cn } from "@/lib/utils";
import { env } from "@/utils/env";

interface GoogleMapProps {
  /** Free-text address; geocoded by Google from the query string. */
  address: string;
  className?: string;
  /** Falls back to the address when the business has no distinct display name. */
  title?: string;
}

/**
 * An iframe embed rather than the JS Maps SDK: the contact page only needs to
 * *show* a location, and the SDK would mean shipping a map library and an
 * exposed API key for something a static embed does.
 *
 * <p>With `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` set this uses the supported Maps
 * Embed API. Without one it falls back to the keyless `output=embed` endpoint,
 * which needs no Google account — that's what makes this work out of the box
 * here, but a real deployment should set a key: the keyless endpoint is
 * undocumented and Google can change it without notice.
 */
export function GoogleMap({ address, className, title }: GoogleMapProps) {
  const query = encodeURIComponent(address);

  const src = env.googleMapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${env.googleMapsApiKey}&q=${query}`
    : `https://maps.google.com/maps?q=${query}&output=embed`;

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-muted", className)}>
      <iframe
        src={src}
        title={title ? `Map showing ${title}` : `Map showing ${address}`}
        className="size-full border-0"
        loading="lazy"
        // no-referrer-when-downgrade is what Google's own embed snippet uses.
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
