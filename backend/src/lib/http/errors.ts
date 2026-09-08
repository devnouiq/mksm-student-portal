/*
  Typed error taxonomy. Services and repositories throw `AppError`; the route
  wrapper turns it into the standard failure envelope. Nothing else leaks.
*/
import type { ErrorCode } from "@mksm/contracts";

const STATUS: Record<ErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  validation_failed: 422,
  rate_limited: 429,
  internal: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS[code];
    this.details = details;
  }

  static badRequest(m = "Bad request", d?: unknown) { return new AppError("bad_request", m, d); }
  static unauthorized(m = "Authentication required") { return new AppError("unauthorized", m); }
  static forbidden(m = "You do not have access to this resource") { return new AppError("forbidden", m); }
  static notFound(m = "Not found") { return new AppError("not_found", m); }
  static conflict(m = "Conflict", d?: unknown) { return new AppError("conflict", m, d); }
  static validation(m = "Validation failed", d?: unknown) { return new AppError("validation_failed", m, d); }
  static internal(m = "Internal error") { return new AppError("internal", m); }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}
