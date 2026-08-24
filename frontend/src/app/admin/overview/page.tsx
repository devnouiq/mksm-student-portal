import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { formatHours, formatNumber, toPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Stat } from "@/components/ui/stat";
import { AnnouncementsPanel } from "@/components/domain/announcements-panel";

export const metadata: Metadata = { title: "Overview" };

const providerName: Record<string, string> = {
  razorpay: "Razorpay",
  paypal: "PayPal",
  "one-time": "One-time",
};

export default async function AdminOverviewPage() {
  const repos = getRepositories();
  const user = await repos.session.getCurrentUser("admin");
  const data = await repos.admin.getOverview(user.mksmNo);
  const sankalpPct = data.sankalpAchievedHours / data.sankalpTargetHours;

  return (
    <>
      <PageHeader
        title="Namaste, Admin"
        description="School-wide subscriptions, batches, Sankalp and announcements."
        actions={
          <ButtonLink href="/admin/manage-batches" size="sm">
            <Plus size={16} /> Create batch
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active batches" value={String(data.activeBatches)} />
        <Stat
          label="India / Intl batches"
          value={`${data.indiaBatches} / ${data.intlBatches}`}
          tone="neutral"
        />
        <Stat
          label="Pending fees"
          value={String(data.pendingFeesCount)}
          tone="neutral"
          hint="Students with dues"
        />
        <Stat
          label="Sankalp achieved"
          value={formatNumber(data.sankalpAchievedHours)}
          suffix="hrs"
          tone="saffron"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Subscription management by provider (PRD §5.3) */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription management</CardTitle>
              <Link
                href="/admin/subscriptions"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
              >
                Track all <ArrowRight size={15} />
              </Link>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {data.providers.map((p) => (
                <div key={p.provider} className="rounded-md border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-ink-900">{providerName[p.provider]}</p>
                    <Badge tone="neutral">{p.total} total</Badge>
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <dt className="text-xs text-muted-foreground">Active</dt>
                      <dd className="font-display text-xl text-success-500">{p.active}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Cancelled</dt>
                      <dd className="font-display text-xl text-danger-500">{p.cancelled}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">{p.inactiveLabel}</dt>
                      <dd className="font-display text-xl text-warning-500">{p.inactive}</dd>
                    </div>
                  </dl>
                </div>
              ))}
              <p className="text-xs text-ink-400 sm:col-span-2">
                Read-only status synced from Razorpay (India) &amp; PayPal
                (international). No payments are processed in-portal.
              </p>
            </CardContent>
          </Card>

          {/* Batch management */}
          <Card>
            <CardHeader>
              <CardTitle>Batch management</CardTitle>
              <Link
                href="/admin/batches"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
              >
                Manage batches <ArrowRight size={15} />
              </Link>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge tone="info">India: {data.indiaBatches}</Badge>
              <Badge tone="info">International: {data.intlBatches}</Badge>
              <Badge tone="neutral">Beginner: {data.beginnerBatches}</Badge>
              <Badge tone="neutral">Intermediate: {data.intermediateBatches}</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sankalp — school goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl text-ink-900">
                {formatNumber(data.sankalpAchievedHours)}
                <span className="text-lg text-muted-foreground">
                  {" "}
                  / {formatNumber(data.sankalpTargetHours)} hrs
                </span>
              </p>
              <Progress value={sankalpPct} tone="saffron" className="mt-3" label="School Sankalp" />
              <p className="mt-2 text-sm text-muted-foreground">
                {toPercent(sankalpPct)}% of the {formatHours(data.sankalpTargetHours)}-hour pledge.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <Link
                href="/admin/announcements"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                Manage
              </Link>
            </CardHeader>
            <CardContent>
              <AnnouncementsPanel announcements={data.announcements} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
