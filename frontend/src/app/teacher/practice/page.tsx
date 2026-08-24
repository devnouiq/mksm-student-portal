import type { Metadata } from "next";
import { UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { PracticeMaterialList } from "@/components/domain/practice-material-list";

export const metadata: Metadata = { title: "Practice Material" };

export default async function TeacherPracticePage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("teacher");
  const { adminShared, own } = await repos.teacher.getPracticeMaterial(user.mksmNo);

  return (
    <>
      <PageHeader
        title="Practice Material"
        description="Re-share the admin library to your batches, or upload your own content and notes for your batches only."
        actions={
          <Button size="sm">
            <UploadSimple size={16} /> Upload material
          </Button>
        }
      />

      <Tabs
        ariaLabel="Practice material sources"
        tabs={[
          {
            id: "admin",
            label: "Admin Library",
            content: (
              <PracticeMaterialList
                items={adminShared}
                showShare
                emptyLabel="No admin-shared material yet"
              />
            ),
          },
          {
            id: "own",
            label: "My Uploads",
            content: (
              <PracticeMaterialList
                items={own}
                showShare
                emptyLabel="You haven't uploaded any material yet"
              />
            ),
          },
        ]}
      />
    </>
  );
}
