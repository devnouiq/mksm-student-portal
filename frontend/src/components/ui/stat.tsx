import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

/** Swaras of the scale; each stat wears one, picked stably from its label. */
const SWARAS = ["सा", "रे", "ग", "म", "प", "ध", "नि"];
function swaraFor(label: string): string {
  let sum = 0;
  for (let i = 0; i < label.length; i++) sum += label.charCodeAt(i);
  return SWARAS[sum % SWARAS.length];
}

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
      <CardContent className="relative overflow-hidden pt-5">
        {/* the stat's swara — a faint note in the corner */}
        <span
          className="pointer-events-none absolute -top-1 right-3 select-none font-display text-[3.5rem] font-semibold leading-none text-brand-600/[0.28]"
          aria-hidden
        >
          {swaraFor(label)}
        </span>
        <p className="relative text-sm text-muted-foreground">{label}</p>
        <p className="relative mt-1 font-display text-3xl text-ink-900">
          {value}
          {suffix ? <span className={`ml-1 text-base ${suffixColor}`}>{suffix}</span> : null}
        </p>
        {hint ? <p className="relative mt-1 text-xs text-ink-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
