import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Public routes — no auth required.
 * Everything NOT listed here will require a valid Clerk session.
 *
 * Rules:
 * - Marketing pages: /, /privacy, /terms
 * - Auth pages: /sign-in, /sign-up (Clerk needs these reachable while logged out)
 * - Stripe/Twilio webhooks: must accept POSTs without a session cookie
 * - Form submission + config: called by embed.js from external sites
 * - Cron endpoint: called by Vercel/cron-job.org with CRON_SECRET header, not a session
 * - Test form: used during development/demo without logging in
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/api/forms/(.*)",
  "/api/webhooks/(.*)",
  "/api/cron/(.*)",
  "/test-form",
  "/test-form/(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (Next.js static assets)
     * - _next/image   (Next.js image optimization)
     * - favicon.ico
     * - Static file extensions (images, fonts, etc.)
     *
     * The second pattern ensures /api routes are always matched even if they
     * contain a dot (e.g. /api/forms/abc-123 would still be caught).
     */
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
