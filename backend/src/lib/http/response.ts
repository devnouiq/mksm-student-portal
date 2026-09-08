/*
  Standard JSON envelope + CORS. Every route returns through `ok()` / `fail()`
  so success and failure shapes are uniform and carry the correlation id.
*/
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ApiError } from "@mksm/contracts";
import { getConfig } from "../config";
import { AppError, isAppError } from "./errors";
import type { RequestContext } from "../logger";

const CORRELATION_HEADER = "x-correlation-id";

function corsHeaders(origin: string | null): Record<string, string> {
  let allowed: string[] = [];
  try {
    allowed = getConfig().CORS_ALLOWED_ORIGINS;
  } catch {
    allowed = [];
  }
  const allow = origin && allowed.includes(origin) ? origin : allowed[0] ?? "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type,x-correlation-id",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

export function ok<T>(data: T, ctx: RequestContext, init?: { status?: number; origin?: string | null }): NextResponse {
  return NextResponse.json(
    { data, correlationId: ctx.correlationId },
    {
      status: init?.status ?? 200,
      headers: { [CORRELATION_HEADER]: ctx.correlationId, ...corsHeaders(init?.origin ?? null) },
    },
  );
}

export function fail(err: unknown, ctx: RequestContext, origin?: string | null): NextResponse {
  let apiError: ApiError;
  let status: number;

  if (isAppError(err)) {
    apiError = { code: err.code, message: err.message, details: err.details };
    status = err.status;
  } else if (err instanceof z.ZodError) {
    apiError = { code: "validation_failed", message: "Validation failed", details: err.flatten() };
    status = 422;
  } else {
    ctx.logger.error({ err }, "unhandled route error");
    apiError = { code: "internal", message: "Internal error" };
    status = 500;
  }

  if (status >= 500) ctx.logger.error({ apiError }, "request failed");
  else ctx.logger.warn({ apiError, status }, "request rejected");

  return NextResponse.json(
    { error: apiError, correlationId: ctx.correlationId },
    { status, headers: { [CORRELATION_HEADER]: ctx.correlationId, ...corsHeaders(origin ?? null) } },
  );
}

export function preflight(origin: string | null): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export { AppError };
