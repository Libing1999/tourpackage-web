/**
 * Central switch between the real API and local mock data.
 *
 * <p>Every place the app talks to the backend — the axios client in
 * services/api-client.ts and the server-side fetches wrapped by
 * services/server-fetch.ts — reads this one flag. Flip it by setting
 * NEXT_PUBLIC_USE_API=true (once a backend is reachable from wherever the
 * app is deployed); nothing else needs to change. Defaults to false so the
 * app builds and runs as a frontend-only site with no backend available.
 */
export const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";
