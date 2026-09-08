/*
  Uniform HTTP response envelope used by every backend route.
  Success: { data, correlationId }
  Failure: { error: { code, message, details? }, correlationId }
*/

import { z } from "zod";

export const ErrorCodeSchema = z.enum([
  "bad_request",
  "unauthorized",
  "forbidden",
  "not_found",
  "conflict",
  "validation_failed",
  "rate_limited",
  "internal",
]);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ApiErrorSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export function successEnvelope<T extends z.ZodTypeAny>(data: T) {
  return z.object({ data, correlationId: z.string() });
}

export const failureEnvelopeSchema = z.object({
  error: ApiErrorSchema,
  correlationId: z.string(),
});
export type FailureEnvelope = z.infer<typeof failureEnvelopeSchema>;

export interface SuccessEnvelope<T> {
  data: T;
  correlationId: string;
}

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().optional(),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
