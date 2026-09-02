import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, IconTile } from "@/components/ui/card";
import { courseIcon } from "@/components/domain/course-icon";

export const metadata: Metadata = { title: "Explore Courses" };

export default async function StudentExplorePage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("student");
  const catalog = await repos.student.getCatalog(user.mksmNo);

  return (
    <>
      <PageHeader
        title="Explore Other Courses"
        description="Discover more of what MKSM offers and enroll in a new course."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((course) => (
          <Card key={course.id} interactive className="flex flex-col">
            <CardContent className="flex flex-1 flex-col pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{course.level}</Badge>
                  <Badge tone="brand">{course.language}</Badge>
                </div>
                <IconTile icon={courseIcon(course.name)} className="size-10" size={20} />
              </div>
              <h3 className="mt-3 font-display text-lg text-ink-900">{course.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{course.description}</p>
              <p className="mt-3 text-sm font-medium text-ink-800">{course.priceLabel}</p>

              <div className="mt-4 flex items-center gap-2">
                {course.enrolled ? (
                  <Button variant="secondary" size="sm" disabled className="flex-1">
                    Already enrolled
                  </Button>
                ) : (
                  <>
                    <Button size="sm" className="flex-1">
                      Enroll now
                    </Button>
                    <Button variant="outline" size="sm">
                      Learn more
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
