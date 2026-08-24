import * as React from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

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
        "flex flex-col items-center justify-center rounded-lg border border-dashed " +
          "border-ink-200 bg-surface-muted px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-3 inline-flex size-11 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        <IconCmp size={22} weight="duotone" />
      </span>
      <p className="font-display text-base text-ink-800">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
