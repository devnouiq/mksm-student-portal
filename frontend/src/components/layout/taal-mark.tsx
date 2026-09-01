import { cn } from "@/lib/cn";

/**
 * Taal mark — one āvartan (rhythm cycle) drawn on the laya (time) line. The sam
 * (the emphatic first beat, notated ×) opens it as a bold gold diamond; beats
 * follow as dots; a hollow khali (○, the empty beat) marks the vibhag. A small,
 * authentic rhythm signature under each page title. Token-tinted per theme.
 */
export function TaalMark({ className }: { className?: string }) {
  return (
    <span className={cn("mksm-taal", className)} aria-hidden>
      <span className="mksm-taal-sam" />
      <span className="mksm-taal-beat" />
      <span className="mksm-taal-beat" />
      <span className="mksm-taal-beat" />
      <span className="mksm-taal-khali" />
      <span className="mksm-taal-beat" />
      <span className="mksm-taal-beat" />
      <span className="mksm-taal-beat" />
    </span>
  );
}
