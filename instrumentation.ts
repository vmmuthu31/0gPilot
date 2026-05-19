/**
 * instrumentation.ts — Next.js server lifecycle hook.
 *
 * `register()` is called exactly once when the Next.js server process starts.
 * We use it to boot the BullMQ worker inside the same process so a separate
 * `npm run worker` is never needed. Works on any Node.js host (Railway,
 * Render, Fly.io, VPS, etc.).
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register() {
  // Only run in the Node.js runtime — not in the Edge runtime.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamic import keeps this out of the Edge bundle entirely.
    const { workflowWorker } = await import("./src/server/queue/worker");

    console.log(
      "[Instrumentation] BullMQ workflow worker started inside Next.js process",
    );

    workflowWorker.on("ready", () => {
      console.log("[Instrumentation] Worker ready — listening for jobs");
    });

    workflowWorker.on("error", (err) => {
      console.error("[Instrumentation] Worker error:", err);
    });
  }
}
