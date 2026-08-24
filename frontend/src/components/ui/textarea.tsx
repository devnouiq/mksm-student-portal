import * as React from "react";
import { cn } from "@/lib/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-900",
        "placeholder:text-ink-400 focus-visible:border-brand-400 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:bg-ink-50",
        className,
      )}
      {...props}
    />
  );
});
