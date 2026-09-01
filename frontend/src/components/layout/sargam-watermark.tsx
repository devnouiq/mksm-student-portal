import { cn } from "@/lib/cn";

/** The aroha — the ascending scale, sung Sa Re Ga Ma Pa Dha Ni Sa. */
const AROHA = ["सा", "रे", "ग", "म", "प", "ध", "नि", "सां"];

/**
 * Sargam watermark — the ascending scale set large and faint as an ambient
 * backdrop: the school's own "notes" (swaras), not generic music symbols.
 * Purely decorative; the caller positions, sizes and fades it via `className`.
 */
export function SargamWatermark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute select-none font-semibold leading-[1.02] tracking-tight",
        className,
      )}
      aria-hidden
    >
      {AROHA.map((swara, i) => (
        <span key={i} className="block">
          {swara}
        </span>
      ))}
    </div>
  );
}
