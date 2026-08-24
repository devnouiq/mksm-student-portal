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
        className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface-muted p-1"
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
                "rounded-md px-3 py-1.5 text-sm font-medium transition",
                selected
                  ? "bg-surface text-ink-900 shadow-card"
                  : "text-ink-600 hover:text-ink-900",
              )}
            >
              {tab.label}
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
