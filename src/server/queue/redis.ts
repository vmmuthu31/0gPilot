import Redis from "ioredis";
import { EventEmitter } from "events";
import { env } from "@/server/config/env";

// ─── Singleton guards ────────────────────────────────────────────────────────
// Next.js hot-reload re-evaluates modules on every file save, which would
// create a fresh Redis connection each time. Storing instances on `globalThis`
// ensures we reuse the same connection across reloads in dev mode.
declare global {
  // eslint-disable-next-line no-var
  var __ogpilot_redis: Redis | undefined;
  // eslint-disable-next-line no-var
  var __ogpilot_redis_sub: Redis | undefined;
  // eslint-disable-next-line no-var
  var __ogpilot_sse_bus: EventEmitter | undefined;
}

function newClient(): Redis {
  return new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
}

// ─── In-memory event bus ─────────────────────────────────────────────────────
/**
 * SSE handlers listen on this bus instead of opening their own Redis
 * connections.  The single globalSub writes here, so connection count
 * stays fixed no matter how many browser tabs are open.
 */
export const sseEventBus: EventEmitter =
  globalThis.__ogpilot_sse_bus ??
  (() => {
    const bus = new EventEmitter();
    // Allow up to 1 000 simultaneous SSE listeners before Node warns
    bus.setMaxListeners(1000);
    globalThis.__ogpilot_sse_bus = bus;
    return bus;
  })();

// ─── General-purpose connection ───────────────────────────────────────────────
/**
 * Shared client for BullMQ Queue / Worker, emitter publish + pipeline,
 * and SSE replay lrange.  BullMQ calls .duplicate() internally, so
 * passing this object to Queue/Worker is safe.
 */
export const connection: Redis =
  globalThis.__ogpilot_redis ??
  (() => {
    const c = newClient();
    c.on("error", (err) => console.error("[Redis] error:", err));
    globalThis.__ogpilot_redis = c;
    return c;
  })();

// ─── Global pub/sub subscriber ────────────────────────────────────────────────
/**
 * Exactly ONE subscriber for the entire process.
 * Pattern-subscribes to every workflow channel and routes messages into
 * sseEventBus.  SSE handlers attach in-memory listeners — never Redis ones.
 */
export const globalSub: Redis =
  globalThis.__ogpilot_redis_sub ??
  (() => {
    const s = newClient();
    s.on("error", (err) => console.error("[Redis Sub] error:", err));

    // Subscribe to all workflow channels with a single pattern
    s.psubscribe("workflow:*:events").catch((err) =>
      console.error("[Redis Sub] psubscribe failed:", err),
    );

    // Fan-out to in-memory listeners
    s.on("pmessage", (_pattern: string, channel: string, message: string) => {
      sseEventBus.emit(channel, message);
    });

    globalThis.__ogpilot_redis_sub = s;
    return s;
  })();
