import * as React from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 pr-9 text-sm text-ink-900",
          "focus-visible:border-brand-400 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:bg-ink-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <CaretDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
        aria-hidden
      />
    </div>
  );
});
