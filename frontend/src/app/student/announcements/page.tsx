import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AnnouncementsPanel } from "@/components/domain/announcements-panel";

export const metadata: Metadata = { title: "Announcements" };

export default async function StudentAnnouncementsPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("student");
  const announcements = await repos.student.getAnnouncements(user.mksmNo);

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Notices from the MKSM office and community, newest first."
      />
      <Card>
        <CardContent className="pt-5">
          <AnnouncementsPanel announcements={announcements} />
        </CardContent>
      </Card>
    </>
  );
}
