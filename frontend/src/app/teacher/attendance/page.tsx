import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Select } from "@/components/ui/select";
import { AttendanceTable } from "./attendance-table";

export const metadata: Metadata = { title: "Attendance" };

export default async function TeacherAttendancePage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("teacher");
  const data = await repos.teacher.getAttendance(user.mksmNo);

  return (
    <>
      <PageHeader
        title="Attendance"
        description={`Class on ${formatDate(data.classDate)}. Online students are auto-marked when they join via Zoom — review and adjust below.`}
        actions={
          <div className="w-52">
            <Select defaultValue={data.batches[0]} aria-label="Select batch">
              {data.batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </div>
        }
      />
      <AttendanceTable data={data} />
    </>
  );
}
