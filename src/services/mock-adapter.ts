import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { resolveMock } from "@/mocks/registry";

function parseRequestBody(data: unknown): unknown {
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

/**
 * Drop-in replacement for axios's real adapter, wired in by api-client.ts
 * whenever config/feature-flags.ts' USE_API is false. Every request made
 * through `apiClient` — reads and writes alike — is answered from
 * mocks/registry.ts instead of leaving the browser, so every feature's
 * api.ts and hooks work completely unchanged with no backend reachable.
 *
 * <p>`config.data` arrives here already run through axios's default
 * transformRequest, which JSON.stringifies a plain object body — it has to be
 * parsed back before handing it to the mock registry.
 */
export const mockAdapter: AxiosAdapter = (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  const result = resolveMock(config.method ?? "get", config.url ?? "", {
    params: config.params as Record<string, unknown> | undefined,
    body: parseRequestBody(config.data),
  });

  const response: AxiosResponse = {
    data: { success: true, data: result.data, message: undefined },
    status: result.status,
    statusText: "OK",
    headers: {},
    config,
  };

  return Promise.resolve(response);
};
