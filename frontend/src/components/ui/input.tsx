import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink-900",
        "placeholder:text-ink-400 focus-visible:border-brand-400 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:bg-ink-50",
        className,
      )}
      {...props}
    />
  );
});
