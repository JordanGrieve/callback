import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Two entries, and that is not an oversight. Every other route in the app
 * requires a session, so there is nothing else a crawler can legitimately
 * reach. Listing protected routes here would advertise URLs that answer with a
 * redirect, which is worse than not listing them.
 *
 * If the app ever grows public content - guides, example feedback, a blog -
 * those pages go here, and they are also the only realistic route to ranking
 * for anything competitive.
 *
 * lastModified is a fixed date, not new Date(). Under cacheComponents a
 * request-time clock read makes the route dynamic, so every crawler hit ran a
 * function (181 invocations in the month to 24 Nov 2026). Bump these when the
 * page content actually changes - that is what lastModified is meant to say.
 */
const HOME_LAST_MODIFIED = "2026-11-24";
const PRIVACY_LAST_MODIFIED = "2026-11-24";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: HOME_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: PRIVACY_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
