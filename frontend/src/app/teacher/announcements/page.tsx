import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AnnouncementsPanel } from "@/components/domain/announcements-panel";

export const metadata: Metadata = { title: "Announcements" };

export default async function TeacherAnnouncementsPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("teacher");
  const announcements = await repos.teacher.getAnnouncements(user.mksmNo);

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Announcements shared with you by the school."
      />
      <div className="max-w-2xl">
        <Card>
          <CardContent className="pt-5">
            <AnnouncementsPanel announcements={announcements} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
