import type { Metadata } from "next";
import { getRepositories } from "@/data";
import type { MaterialKind } from "@/data/types";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs } from "@/components/ui/tabs";
import { PracticeMaterialList } from "@/components/domain/practice-material-list";

export const metadata: Metadata = { title: "Practice Material" };

export default async function StudentPracticePage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("student");
  const { adminShared } = await repos.student.getPracticeMaterial(user.mksmNo);

  const byKind = (kind: MaterialKind) => adminShared.filter((m) => m.kind === kind);

  return (
    <>
      <PageHeader
        title="Practice Material"
        description="Audio, video and PDF material shared with your batches. Audio is grouped by pitch (C# / G# / B#)."
      />

      <Tabs
        ariaLabel="Practice material by type"
        tabs={[
          { id: "all", label: "All", content: <PracticeMaterialList items={adminShared} /> },
          { id: "audio", label: "Audio", content: <PracticeMaterialList items={byKind("audio")} /> },
          { id: "video", label: "Video", content: <PracticeMaterialList items={byKind("video")} /> },
          { id: "pdf", label: "PDF", content: <PracticeMaterialList items={byKind("pdf")} /> },
        ]}
      />
    </>
  );
}
