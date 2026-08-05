import { defineConfig } from "vitest/config";

/**
 * Node environment, not jsdom.
 *
 * <p>What is worth testing here is pure logic that runs on the server — URL
 * construction, escaping, truncation, schema shape — and none of it touches the
 * DOM. (jsdom is also unavailable on this Node version: its `whatwg-url`
 * dependency requires Node 22+.) Component behaviour is covered by the
 * end-to-end Playwright passes instead, which drive a real browser rather than
 * a simulated one.
 */
export default defineConfig({
  resolve: {
    // Honours the `@/*` aliases from tsconfig without an extra plugin.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
