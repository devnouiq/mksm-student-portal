import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const resolveActor = vi.fn();
vi.mock("@/lib/supabase/auth", () => ({
  resolveActor: (...args: unknown[]) => resolveActor(...args),
  bearerToken: (req: Request) => req.headers.get("authorization")?.split(" ")[1] ?? null,
}));

const { route, publicRoute } = await import("@/lib/http/with-auth");
const { ok } = await import("@/lib/http/response");
const { AppError } = await import("@/lib/http/errors");

function req(
  path = "http://localhost:3001/api/v1/x",
  init?: { method?: string; headers?: Record<string, string> },
) {
  return new NextRequest(path, init);
}
const noParams = { params: Promise.resolve({}) };

beforeEach(() => resolveActor.mockReset());

describe("publicRoute", () => {
  it("runs the handler and echoes a generated correlation id", async () => {
    const handler = publicRoute(async ({ ctx }) => ok({ hi: true }, ctx));
    const res = await handler(req(), noParams);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-correlation-id")).toMatch(/[0-9a-f-]{36}/);
    expect(await res.json()).toMatchObject({ data: { hi: true } });
  });

  it("answers an OPTIONS preflight with 204", async () => {
    const handler = publicRoute(async ({ ctx }) => ok({}, ctx));
    const res = await handler(req("http://localhost:3001/api/v1/x", { method: "OPTIONS" }), noParams);
    expect(res.status).toBe(204);
  });
});

describe("route (authenticated)", () => {
  it("returns 401 when no bearer token is present", async () => {
    resolveActor.mockRejectedValueOnce(AppError.unauthorized());
    const handler = route({}, async ({ ctx }) => ok({}, ctx));
    const res = await handler(req(), noParams);
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: { code: "unauthorized" } });
  });

  it("returns 403 when the actor's role is not allowed", async () => {
    resolveActor.mockResolvedValueOnce({ role: "student", profileId: "p1", mksmNo: "100428" });
    const handler = route({ roles: ["admin"] }, async ({ ctx }) => ok({}, ctx));
    const res = await handler(req("http://localhost:3001/api/v1/x", { headers: { authorization: "Bearer t" } }), noParams);
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: { code: "forbidden" } });
  });

  it("runs the handler for an allowed role and propagates an incoming correlation id", async () => {
    resolveActor.mockResolvedValueOnce({ role: "admin", profileId: "p1", mksmNo: "900001" });
    const handler = route({ roles: ["admin"] }, async ({ ctx, actor }) => ok({ role: actor.role }, ctx));
    const res = await handler(
      req("http://localhost:3001/api/v1/x", { headers: { authorization: "Bearer t", "x-correlation-id": "trace-abc-123" } }),
      noParams,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("x-correlation-id")).toBe("trace-abc-123");
    expect(await res.json()).toMatchObject({ data: { role: "admin" }, correlationId: "trace-abc-123" });
  });
});
