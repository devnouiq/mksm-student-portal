/*
  Structured JSON logging with a per-request correlation id. Every route wraps
  its work in `withRequestContext` so all log lines and the response envelope
  carry the same `correlationId`.
*/
import { randomUUID } from "node:crypto";
import pino from "pino";
import { getConfig } from "./config";

const base = pino({
  level: (() => {
    try {
      return getConfig().LOG_LEVEL;
    } catch {
      return "info";
    }
  })(),
  formatters: { level: (label) => ({ level: label }) },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.access_token",
      "*.refresh_token",
      "SUPABASE_SERVICE_ROLE_KEY",
    ],
    censor: "[redacted]",
  },
});

export type Logger = pino.Logger;

export interface RequestContext {
  correlationId: string;
  logger: Logger;
}

export function newCorrelationId(headerValue?: string | null): string {
  const clean = headerValue?.trim();
  return clean && /^[\w-]{8,64}$/.test(clean) ? clean : randomUUID();
}

export function makeRequestContext(headerValue?: string | null): RequestContext {
  const correlationId = newCorrelationId(headerValue);
  return { correlationId, logger: base.child({ correlationId }) };
}

export const rootLogger = base;
