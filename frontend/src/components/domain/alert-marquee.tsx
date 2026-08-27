import { Megaphone } from "@phosphor-icons/react/dist/ssr";

/*
  Scrolling right-to-left banner of important alerts on the student overview.
  Pure CSS animation (see globals.css); pauses on hover and honours
  prefers-reduced-motion. The track is duplicated so the loop is seamless.
*/
export function AlertMarquee({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;

  const items = [...alerts, ...alerts];

  return (
    <section
      aria-label="Important alerts"
      className="mksm-marquee mb-4 flex items-center gap-3 overflow-hidden rounded-md border border-brand-200 bg-brand-50 px-3 py-2"
    >
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
        <Megaphone size={15} weight="fill" /> Alerts
      </span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="mksm-marquee-track">
          {items.map((text, i) => (
            <span
              key={i}
              className="mx-6 text-sm text-ink-800"
              aria-hidden={i >= alerts.length}
            >
              {text}
              <span className="mx-6 text-brand-300" aria-hidden>
                •
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
