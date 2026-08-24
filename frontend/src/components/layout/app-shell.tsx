import { getRepositories } from "@/data";
import type { Role } from "@/data/types";
import { HelpWidget } from "./help-widget";
import { PortalChrome } from "./portal-chrome";

/*
  Server shell for an authenticated persona. Fetches the current user through
  the repository seam (mock today, API later) and renders the interactive
  chrome plus the persistent help widget (PRD §5.0).
*/
export async function AppShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { session } = getRepositories();
  const user = await session.getCurrentUser(role);

  return (
    <>
      <PortalChrome
        role={role}
        user={{ name: user.name, mksmNo: user.mksmNo, role: user.role }}
      >
        {children}
      </PortalChrome>
      <HelpWidget />
    </>
  );
}
