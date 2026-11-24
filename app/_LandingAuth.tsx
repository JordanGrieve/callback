"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

/*
 * The landing page's signed-in/out swaps, resolved in the BROWSER.
 *
 * These used to be server <Show> components inside Suspense. Reading auth on
 * the server made "/" a partial prerender: every hit invoked the page function
 * to stream the auth holes, and the proxy had to run so auth() had something
 * to read. "/" is the most-hit route by far (crawlers, uptime checks, link
 * previews), and on a low-traffic deployment nearly every one of those was a
 * cold start - together ~16 of the ~24 minutes of monthly Fluid Active CPU.
 *
 * Resolved client-side, "/" prerenders fully static and is served from the CDN
 * with no function and no proxy (see the matcher in proxy.ts).
 *
 * Until Clerk loads, and for anyone signed out, the SIGNED-OUT variant renders
 * - the same default the old Suspense fallbacks used, so the prerendered HTML
 * is right for the common case and only signed-in visitors see a swap.
 *
 * SignInButton wraps a single child - it does NOT go inside <Button asChild>.
 * Inverting them throws "You've passed multiple children components to
 * <SignInButton/>" at render. /onboarding waits for the Clerk webhook to
 * create the users row before forwarding to /app.
 */
function useSignedIn() {
  const { isLoaded, isSignedIn } = useAuth();
  return isLoaded && isSignedIn === true;
}

export function HeaderAuth() {
  if (useSignedIn()) {
    return (
      <>
        <Button asChild>
          <Link href="/app">Go to dashboard</Link>
        </Button>
        <UserButton />
      </>
    );
  }

  return (
    <SignInButton forceRedirectUrl="/onboarding">
      <Button>Sign in</Button>
    </SignInButton>
  );
}

export function HeroAuth() {
  if (useSignedIn()) {
    return (
      <Button size="lg" asChild>
        <Link href="/app">Go to your dashboard</Link>
      </Button>
    );
  }

  return (
    <SignInButton forceRedirectUrl="/onboarding">
      <Button size="lg">Start practising free</Button>
    </SignInButton>
  );
}

export function FooterAuth() {
  if (useSignedIn()) {
    return (
      <Link href="/app" className="hover:text-foreground transition-colors">
        Dashboard
      </Link>
    );
  }

  return (
    <SignInButton forceRedirectUrl="/onboarding">
      <button className="hover:text-foreground transition-colors">
        Sign in
      </button>
    </SignInButton>
  );
}
