import { describe, expect, it, vi } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";

// proxy.ts builds its Arcjet client and Clerk handler at module scope; only
// `config` is under test here.
vi.mock("./app/data/env/server", () => ({
  env: { ARCJET_KEY: "test", ARCJET_MODE: "DRY_RUN" },
}));
vi.mock("@arcjet/next", () => ({
  default: () => ({ protect: vi.fn() }),
  detectBot: vi.fn(),
  shield: vi.fn(),
  slidingWindow: vi.fn(),
}));
vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: (handler: unknown) => handler,
  createRouteMatcher: () => () => false,
}));

import { config } from "./proxy";

const runsOn = (url: string) => unstable_doesMiddlewareMatch({ config, url });

describe("proxy matcher", () => {
  // Every one of these was a billed cold start for no benefit. See the
  // comment on `config` in proxy.ts.
  it.each([
    "/",
    "/privacy",
    "/robots.txt",
    "/sitemap.xml",
    "/opengraph-image",
    "/opengraph-image-abc123",
    "/wp-admin/install.php",
    "/wp-login.php",
    "/wp-content/plugins/x",
    "/xmlrpc.php",
    "/.git/config",
    "/.git/HEAD",
    "/.env",
    "/.env.production",
    "/index.php",
    "/_next/static/chunk.js",
    "/favicon.ico",
  ])("skips %s", (url) => {
    expect(runsOn(url)).toBe(false);
  });

  // The ones that MUST still run it: anything behind auth.protect(), the
  // Clerk auth pages, server actions and API routes. A matcher that silently
  // dropped one of these would leave it unauthenticated.
  it.each([
    "/app",
    "/app/job-infos/123",
    "/app/upgrade",
    "/onboarding",
    "/sign-in",
    "/sign-up/verify",
    "/api/webhooks/clerk",
    "/privacy-extra",
    "/robots.txt.bak",
    "/some-unknown-page",
  ])("runs on %s", (url) => {
    expect(runsOn(url)).toBe(true);
  });
});
