import { Trophy } from "@phosphor-icons/react/dist/ssr";
import type { LeaderboardView } from "@/data/types";
import { formatDateShort, formatHours } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Table, TableWrap, TBodyRows } from "./leaderboard-tables";

/*
  Sankalp leaderboard, shared by the student & teacher views (PRD §5.1).
  Month filter is presentational for M1; tab switching is interactive.
*/
export function SankalpLeaderboard({ data }: { data: LeaderboardView }) {
  const medal = (pos: number) =>
    pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : `#${pos}`;

  const studentTable = (rows: LeaderboardView["studentRanking"]) => (
    <TableWrap>
      <Table
        head={[
          "Pos",
          "Student",
          "Batch",
          "Cumulative Hrs",
          "Last Submitted",
          "Submissions",
        ]}
      >
        <TBodyRows
          rows={rows.map((r) => ({
            key: r.mksmNo,
            cells: [
              <span key="p" className="font-medium">{medal(r.position)}</span>,
              <span key="n" className="font-medium text-ink-900">{r.studentName}</span>,
              r.batchName,
              <span key="h" className="font-semibold text-saffron-700">
                {formatHours(r.cumulativeHours)}
              </span>,
              `${r.lastSubmittedMins} min · ${formatDateShort(r.lastSubmittedDate)}`,
              String(r.submissionCount),
            ],
          }))}
        />
      </Table>
    </TableWrap>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy size={18} weight="duotone" className="text-saffron-600" />
          Self-reported Sankalp hours, keyed to MKSM number.
        </div>
        <div className="w-44">
          <Select defaultValue={data.month} aria-label="Filter by month">
            {data.months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="p-4">
        <Tabs
          ariaLabel="Sankalp rankings"
          tabs={[
            {
              id: "students",
              label: "Top Students",
              content: studentTable(data.studentRanking),
            },
            {
              id: "batches",
              label: "Top Batches",
              content: (
                <TableWrap>
                  <Table
                    head={["Pos", "Batch", "Students", "Cumulative Hrs", "Avg / Student"]}
                  >
                    <TBodyRows
                      rows={data.batchRanking.map((r) => ({
                        key: r.batchName,
                        cells: [
                          <span key="p" className="font-medium">{medal(r.position)}</span>,
                          <span key="n" className="font-medium text-ink-900">{r.batchName}</span>,
                          String(r.studentCount),
                          <span key="h" className="font-semibold text-saffron-700">
                            {formatHours(r.cumulativeHours)}
                          </span>,
                          `${formatHours(r.avgHoursPerStudent)} hrs`,
                        ],
                      }))}
                    />
                  </Table>
                </TableWrap>
              ),
            },
            {
              id: "club",
              label: "600 Hours Club",
              content: studentTable(data.club600),
            },
          ]}
        />
      </Card>
    </div>
  );
}
