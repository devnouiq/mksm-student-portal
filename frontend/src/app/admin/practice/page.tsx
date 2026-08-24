import type { Metadata } from "next";
import { UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PracticeMaterialList } from "@/components/domain/practice-material-list";

export const metadata: Metadata = { title: "Practice Material" };

export default async function AdminPracticePage() {
  const { adminShared } = await getRepositories().admin.getPracticeLibrary();

  return (
    <>
      <PageHeader
        title="Practice Material"
        description="The master library. Upload and manage all content, then share it with teachers or directly with batches."
        actions={
          <Button size="sm">
            <UploadSimple size={16} /> Upload material
          </Button>
        }
      />
      <PracticeMaterialList items={adminShared} showShare emptyLabel="The library is empty" />
    </>
  );
}
