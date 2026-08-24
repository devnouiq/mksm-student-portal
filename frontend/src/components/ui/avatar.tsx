import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

interface AvatarProps {
  name: string;
  className?: string;
}

/** Monogram avatar — no external image needed for the prototype. */
export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full " +
          "bg-brand-100 text-sm font-semibold text-brand-700",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
