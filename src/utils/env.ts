export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  // Optional. With a key the contact page uses Google's official Maps Embed
  // API; without one it falls back to the keyless embed, which needs no
  // account but is the older, unsupported endpoint. See GoogleMap.
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
} as const;
