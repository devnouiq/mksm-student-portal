import * as React from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { SargamWatermark } from "@/components/layout/sargam-watermark";

interface EmptyStateProps {
  icon: Icon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Composed empty state — never a bare "No data". */
export function EmptyState({
  icon: IconCmp,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-lg " +
          "border border-dashed border-ink-200 bg-surface-muted px-6 py-12 text-center",
        className,
      )}
    >
      {/* Faint sargam — the empty space still hums with the scale */}
      <SargamWatermark className="-right-2 -top-3 text-right text-[4.5rem] leading-[1.04] text-brand-500/[0.14]" />
      <span className="relative mb-3 inline-flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <IconCmp size={22} weight="duotone" />
      </span>
      <p className="relative font-display text-base text-ink-800">{title}</p>
      {description ? (
        <p className="relative mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="relative mt-4">{action}</div> : null}
    </div>
  );
}
