"use client";

import { useEffect } from "react";
import { X } from "@phosphor-icons/react";

/**
 * Lightweight accessible dialog: dimmed backdrop, Escape/backdrop-click to
 * close, labelled `role="dialog"`. Renders nothing when closed.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-pop"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="font-display text-lg text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-md text-ink-500 transition hover:bg-ink-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
