"use client";

import { useState } from "react";
import { ChatCircleDots, X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

/*
  Persistent help widget (PRD §5.0). In production this is where the support
  chatbot (Intercom / Crisp — TBD, PRD §8.9) mounts. For M1 it's a static
  panel so the placement and affordance can be reviewed.
*/
export function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open ? (
        <div className="w-72 overflow-hidden rounded-lg border border-border bg-surface shadow-pop">
          <div className="bg-brand-600 px-4 py-3 text-white">
            <p className="font-display text-sm font-semibold">
              Hi there! How can we help?
            </p>
            <p className="text-xs text-brand-100">
              Support chat arrives in a later milestone.
            </p>
          </div>
          <div className="space-y-2 px-4 py-3 text-sm text-muted-foreground">
            <p>Meanwhile, visit the Help section for tutorials and FAQs.</p>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close help" : "Open help"}
        className={cn(
          "grid size-12 place-items-center rounded-full bg-brand-600 text-white shadow-pop transition",
          "hover:bg-brand-700 active:translate-y-px",
        )}
      >
        {open ? <X size={20} weight="bold" /> : <ChatCircleDots size={22} weight="fill" />}
      </button>
    </div>
  );
}
