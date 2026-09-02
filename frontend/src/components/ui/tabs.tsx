"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

/*
  Lightweight, accessible tabbed panel. State is local (no URL routing) which
  is all the M1 prototype needs. Server components pass already-rendered
  `content` per tab.
*/
export function Tabs({
  tabs,
  ariaLabel,
  className,
}: {
  tabs: TabItem[];
  ariaLabel?: string;
  className?: string;
}) {
  const [active, setActive] = React.useState(tabs[0]?.id);

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        /* An underline rail rather than a filled pill track: on the Classic
           ivory the muted surface and the page ground are barely two percent
           apart, so a fill cannot carry the control. A rule and a gold sur
           line under the active tab read on every theme. */
        className="flex flex-wrap items-end gap-6 border-b border-border"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative -mb-px px-1 pb-2.5 pt-1.5 text-sm transition duration-200",
                "focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "font-semibold text-ink-900"
                  : "font-medium text-ink-500 hover:text-ink-800",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 h-0.5 origin-left rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-transform duration-200",
                  selected ? "scale-x-100" : "scale-x-0",
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== active}
          className="mt-5"
        >
          {tab.id === active ? tab.content : null}
        </div>
      ))}
    </div>
  );
}
