import { z } from "zod";
import { AppError } from "./errors";

/** Parse a request JSON body against a schema; 422 with field details on failure. */
export async function parseBody<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw AppError.badRequest("Request body must be valid JSON");
  }
  const result = schema.safeParse(raw);
  if (!result.success) throw AppError.validation("Request body failed validation", result.error.flatten());
  return result.data;
}

/** Parse URL search params against a schema. */
export function parseQuery<T extends z.ZodTypeAny>(url: URL, schema: T): z.infer<T> {
  const obj = Object.fromEntries(url.searchParams.entries());
  const result = schema.safeParse(obj);
  if (!result.success) throw AppError.validation("Query parameters failed validation", result.error.flatten());
  return result.data;
}

export { z };
