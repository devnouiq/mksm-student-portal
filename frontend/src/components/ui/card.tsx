import * as React from "react";
import { cn } from "@/lib/cn";

type Tone = "brand" | "saffron";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Cards that stand for one item in a list — a course, a material, a payment.
   * They lift on hover and draw a sur line along the bottom edge. Container
   * cards that merely group content stay still.
   */
  interactive?: boolean;
  /** Which accent the sur line and hover border use. */
  tone?: Tone;
}

export function Card({
  className,
  interactive,
  tone = "brand",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface shadow-card",
        interactive &&
          "group relative overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-pop " +
            (tone === "saffron"
              ? "hover:border-saffron-300"
              : "hover:border-brand-200"),
        className,
      )}
      {...props}
    >
      {children}
      {interactive ? <SurLine tone={tone} /> : null}
    </div>
  );
}

/**
 * The gold line that draws itself left to right across the foot of a card on
 * hover — the same gesture the overview stat tiles use, so every list row in
 * the portal answers the pointer the same way.
 */
export function SurLine({ tone = "brand" }: { tone?: Tone }) {
  return (
    <span
      className={cn(
        "absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100",
        tone === "saffron"
          ? "bg-gradient-to-r from-saffron-500 to-saffron-700"
          : "bg-gradient-to-r from-brand-400 to-brand-600",
      )}
      aria-hidden
    />
  );
}

/**
 * The rounded badge an item's icon sits in. Tilts and grows a touch when its
 * card is hovered, which is why it expects a `group` ancestor.
 */
export function IconTile({
  icon: Icon,
  tone = "brand",
  size = 22,
  className,
}: {
  icon: React.ComponentType<{ size?: number; weight?: "duotone" }>;
  tone?: Tone;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-lg ring-1 ring-inset transition duration-200 group-hover:-rotate-6 group-hover:scale-105",
        tone === "saffron"
          ? "bg-saffron-100 text-saffron-700 ring-saffron-300/50"
          : "bg-brand-50 text-brand-600 ring-brand-100 group-hover:bg-brand-100",
        className,
      )}
      aria-hidden
    >
      <Icon size={size} weight="duotone" />
    </span>
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 px-5 pt-5 pb-3",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-lg leading-tight text-ink-900",
        className,
      )}
      {...props}
    />
  );
}

/** The small count or period that sits opposite a card title in its header. */
export function CardMeta({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-100",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}
