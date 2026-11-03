// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Only used by Vercel builds (Lovable builds for Cloudflare). Retries pending integration
  // jobs once a day, the most Vercel Hobby allows; on Pro it can run every 10 minutes.
  // Forwarded to Nitro unchanged; the wrapper's type only lists the Cloudflare options.
  nitro: {
    vercel: { config: { crons: [{ path: "/api/integrations/run", schedule: "0 13 * * *" }] } },
  } as { preset?: string },
});
