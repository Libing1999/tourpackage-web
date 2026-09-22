import { USE_API } from "@/config/feature-flags";
import { resolveMock } from "@/mocks/registry";
import { env } from "@/utils/env";

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * Drop-in replacement for the global `fetch`, used by the handful of
 * server-side data fetchers that talk to the API directly instead of through
 * services/api-client.ts — that axios instance is browser-only (it reads
 * tokens from localStorage), so features/seo/api.ts, features/cms/api.ts, and
 * the package/hotel detail & booking pages use plain `fetch` for their
 * server-rendered metadata and content.
 *
 * <p>When config/feature-flags.ts' USE_API is false, this answers from the
 * same mocks/registry.ts the axios client uses, instead of making a real
 * request — call sites just swap `fetch(...)` for `mockableFetch(...)` and
 * keep every other line (their try/catch, their `.ok`/`.json()` handling)
 * unchanged.
 */
export async function mockableFetch(url: string, init?: RequestInit): Promise<Response> {
  if (USE_API) {
    return fetch(url, init);
  }

  const path = url.startsWith(env.apiUrl) ? url.slice(env.apiUrl.length) : url;
  const method = init?.method ?? "GET";
  const body = typeof init?.body === "string" ? safeJsonParse(init.body) : init?.body;

  const result = resolveMock(method, path, { body });

  return new Response(JSON.stringify({ success: true, data: result.data, message: undefined }), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
}
