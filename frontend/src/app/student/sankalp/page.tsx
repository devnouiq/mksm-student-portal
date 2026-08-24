import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { SankalpLeaderboard } from "@/components/domain/sankalp-leaderboard";

export const metadata: Metadata = { title: "Sankalp Leaderboard" };

export default async function StudentSankalpPage() {
  const data = await getRepositories().leaderboard.getLeaderboard();

  return (
    <>
      <PageHeader
        title="Sankalp Leaderboard"
        description="Cumulative practice-hour rankings across students and batches, plus the 600 Hours Club."
      />
      <SankalpLeaderboard data={data} />
    </>
  );
}
