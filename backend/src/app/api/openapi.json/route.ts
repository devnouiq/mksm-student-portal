import { NextResponse } from "next/server";
import { buildOpenApi } from "@/lib/openapi";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(buildOpenApi(), {
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
  });
}
