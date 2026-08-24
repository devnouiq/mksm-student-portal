import { cn } from "@/lib/cn";

/** Shape-matching loading placeholder (see .mksm-skeleton in globals.css). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("mksm-skeleton rounded-md", className)} />;
}
