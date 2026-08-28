import type { ReactNode } from "react";
import type { Role } from "@/data/types";

export interface ChromeUser {
  name: string;
  mksmNo: string;
  role: Role;
}

/**
 * Contract every layout shell honours. A shell owns the navigation and chrome
 * for an authenticated persona; the page content arrives as `children`. The
 * active shell is chosen by the layout variant on <html data-theme>, so all
 * shells render the same content under a different information architecture.
 */
export interface ShellProps {
  role: Role;
  user: ChromeUser;
  children: ReactNode;
}
