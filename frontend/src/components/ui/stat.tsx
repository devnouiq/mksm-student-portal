import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

/** Compact metric tile used across the three Overview screens. */
export function Stat({
  label,
  value,
  suffix,
  tone = "brand",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  tone?: "brand" | "saffron" | "neutral";
  hint?: string;
}) {
  const suffixColor =
    tone === "saffron"
      ? "text-saffron-700"
      : tone === "neutral"
        ? "text-ink-500"
        : "text-brand-600";
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-3xl text-ink-900">
          {value}
          {suffix ? <span className={`ml-1 text-base ${suffixColor}`}>{suffix}</span> : null}
        </p>
        {hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
