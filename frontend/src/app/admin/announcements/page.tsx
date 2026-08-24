import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { AnnouncementForm } from "./announcement-form";
import { ManageAnnouncementsList } from "./manage-list";

export const metadata: Metadata = { title: "Announcements" };

export default async function AdminAnnouncementsPage() {
  const repos = getRepositories();
  const [{ batches }, announcements] = await Promise.all([
    repos.admin.getFormOptions(),
    repos.admin.getAnnouncements(),
  ]);

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Create announcements and share them with all students, a batch, or a single student — then manage what's live."
      />

      <Tabs
        ariaLabel="Announcements"
        tabs={[
          {
            id: "create",
            label: "Add Announcement",
            content: (
              <div className="max-w-2xl">
                <Card>
                  <CardHeader>
                    <CardTitle>New announcement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnnouncementForm batches={batches} />
                  </CardContent>
                </Card>
              </div>
            ),
          },
          {
            id: "manage",
            label: "Manage",
            content: (
              <div className="max-w-2xl">
                <ManageAnnouncementsList announcements={announcements} />
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
