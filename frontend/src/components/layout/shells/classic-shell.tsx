"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, SignOut, X } from "@phosphor-icons/react";
import { navForRole, roleLabels } from "@/config/nav";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Brand } from "../brand";
import { LayoutSwitcher } from "../layout-switcher";
import { SargamWatermark } from "../sargam-watermark";
import { TanpuraArt } from "../tanpura-art";
import type { ShellProps } from "./types";

/**
 * Classic shell — a persistent left sidebar with a topbar. The reference MKSM
 * layout: dense navigation always visible, content in a single wide column.
 */
export function ClassicShell({ role, user, children }: ShellProps) {
  const items = navForRole(role);
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const IconCmp = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
            )}
          >
            <IconCmp
              size={19}
              weight={active ? "fill" : "regular"}
              className={active ? "text-brand-600" : "text-ink-400"}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarInner = (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Ambient tanpura — the drone standing in the background of the rail */}
      <TanpuraArt
        aria-hidden
        className="pointer-events-none absolute bottom-20 left-1/2 h-[18rem] w-auto -translate-x-1/2 text-brand-600/[0.30]"
      />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Brand subtitle={`${roleLabels[role]} Portal`} />
        </div>
        {nav}
        <div className="relative border-t border-border bg-surface p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              MKSM #{user.mksmNo}
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-500 hover:bg-ink-100 hover:text-ink-800"
        >
          <SignOut size={18} />
          Switch role / Log out
        </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="mksm-sidebar sticky top-0 hidden h-screen border-r border-border bg-surface lg:block">
        {sidebarInner}
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-surface shadow-pop">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 grid size-8 place-items-center rounded-md text-ink-500 hover:bg-ink-100"
            >
              <X size={18} />
            </button>
            {sidebarInner}
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-col">
        <header className="mksm-topbar sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-md text-ink-600 hover:bg-ink-100 lg:hidden"
          >
            <List size={20} />
          </button>
          <div className="lg:hidden">
            <Brand subtitle={`${roleLabels[role]} Portal`} />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <LayoutSwitcher />
            <Badge tone="brand">{roleLabels[role]}</Badge>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              MKSM #{user.mksmNo}
            </span>
          </div>
        </header>

        <main className="relative flex-1 overflow-hidden px-4 py-6 lg:px-8 lg:py-8">
          {/* Ambient sargam — the ascending scale, faint behind the content */}
          <SargamWatermark className="-top-4 right-0 pr-3 text-right text-[6rem] text-brand-500/[0.16] lg:text-[7.5rem]" />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
