/*
  Route wrappers. Use `route(...)` for authenticated endpoints and
  `publicRoute(...)` for open ones (login, health, forgot-password).

    export const GET = route({ roles: ["admin"] }, async ({ ctx, actor, params }) => {
      return ok(await service.list(), ctx);
    });

  Both: build the correlation-scoped context, answer CORS preflight, run the
  handler, and turn any thrown AppError / ZodError / unknown into the standard
  failure envelope. `route` additionally resolves + authorises the caller.
*/
import type { NextRequest } from "next/server";
import type { Role } from "@mksm/contracts";
import { makeRequestContext, type RequestContext } from "../logger";
import { resolveActor, type Actor } from "../supabase/auth";
import { AppError } from "./errors";
import { fail, preflight } from "./response";

interface BaseArgs {
  req: NextRequest;
  ctx: RequestContext;
  params: Record<string, string>;
  url: URL;
  origin: string | null;
}
export interface RouteHandlerArgs extends BaseArgs {
  actor: Actor;
}
export interface PublicRouteHandlerArgs extends BaseArgs {
  actor: null;
}

type NextCtx = { params: Promise<Record<string, string>> };
type NextRoute = (req: NextRequest, ctx: NextCtx) => Promise<Response>;

function runner(
  needsAuth: boolean,
  roles: Role[] | undefined,
  handler: (args: BaseArgs & { actor: Actor | null }) => Promise<Response>,
): NextRoute {
  return async (req, nextCtx) => {
    const origin = req.headers.get("origin");
    if (req.method === "OPTIONS") return preflight(origin);

    const ctx = makeRequestContext(req.headers.get("x-correlation-id"));
    const url = new URL(req.url);
    const started = Date.now();

    try {
      const params = (await nextCtx?.params) ?? {};
      let actor: Actor | null = null;

      if (needsAuth) {
        actor = await resolveActor(req);
        if (roles && roles.length > 0 && !roles.includes(actor.role)) {
          throw AppError.forbidden(`This endpoint is restricted to: ${roles.join(", ")}`);
        }
      }

      ctx.logger.info({ method: req.method, path: url.pathname, role: actor?.role }, "request");
      const res = await handler({ req, ctx, params, url, origin, actor });
      ctx.logger.info({ status: res.status, ms: Date.now() - started }, "response");
      return res;
    } catch (err) {
      return fail(err, ctx, origin);
    }
  };
}

export function route(
  opts: { roles?: Role[] },
  handler: (args: RouteHandlerArgs) => Promise<Response>,
): NextRoute {
  return runner(true, opts.roles, handler as never);
}

export function publicRoute(handler: (args: PublicRouteHandlerArgs) => Promise<Response>): NextRoute {
  return runner(false, undefined, handler as never);
}
