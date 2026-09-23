// Treats an empty/blank variable as unset (Vercel keeps variables that were
// saved with no value as ""), adds a missing scheme so `new URL()` accepts
// values like "example.com", and drops a trailing slash so `${url}/path`
// joins cleanly.
function urlFromEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withScheme.replace(/\/+$/, "");
}

export const env = {
  apiUrl: urlFromEnv(process.env.NEXT_PUBLIC_API_URL, "http://localhost:8080/api"),
  appUrl: urlFromEnv(process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"),
  // Optional. With a key the contact page uses Google's official Maps Embed
  // API; without one it falls back to the keyless embed, which needs no
  // account but is the older, unsupported endpoint. See GoogleMap.
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
} as const;
