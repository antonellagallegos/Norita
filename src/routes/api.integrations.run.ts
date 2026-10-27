import { createFileRoute } from "@tanstack/react-router";

// Scheduled retry for the integrations outbox (Vercel Cron). Requires CRON_SECRET.
export const Route = createFileRoute("/api/integrations/run")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { isAuthorizedCron, runIntegrationJobs } = await import("@/lib/integrations.server");
        if (!isAuthorizedCron(request)) return new Response("Unauthorized", { status: 401 });
        try {
          return Response.json(await runIntegrationJobs());
        } catch {
          return Response.json({ error: "integration_run_failed" }, { status: 500 });
        }
      },
    },
  },
});
