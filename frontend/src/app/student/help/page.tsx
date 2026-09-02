import type { Metadata } from "next";
import { CaretDown, ChatCircleDots, PlayCircle } from "@phosphor-icons/react/dist/ssr";
import { getRepositories } from "@/data";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Help" };

export default async function StudentHelpPage() {
  const { tutorials, faqs } = await getRepositories().student.getHelp();

  const tutorialsTab = (
    <div className="grid gap-4 sm:grid-cols-2">
      {tutorials.map((t) => (
        <Card key={t.id} interactive>
          <CardContent className="flex gap-3 pt-5">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-700 transition duration-200 group-hover:-rotate-6 group-hover:scale-105">
              <PlayCircle size={24} weight="duotone" />
            </span>
            <div>
              <p className="font-medium text-ink-900">{t.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
              <p className="mt-1 text-xs text-ink-400">{t.durationLabel}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const faqTab = (
    <div className="space-y-2">
      {faqs.map((f) => (
        <details
          key={f.id}
          className="group rounded-md border border-border bg-surface px-4 py-3 transition duration-200 hover:border-brand-200 open:border-brand-200"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-ink-900">
            {f.question}
            <CaretDown
              size={16}
              className="shrink-0 text-ink-400 transition group-open:rotate-180"
            />
          </summary>
          <p className="mt-2 text-sm text-muted-foreground">{f.answer}</p>
        </details>
      ))}
    </div>
  );

  const supportTab = (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-success-100 text-success-500">
            <ChatCircleDots size={24} weight="duotone" />
          </span>
          <div>
            <p className="font-medium text-ink-900">Need a hand?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the chat widget at the bottom-right of any screen to reach our
              support team, or email{" "}
              <a href="mailto:support@mksm.example" className="font-medium text-brand-700 hover:underline">
                support@mksm.example
              </a>
              . Typical response time is within one business day.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <PageHeader
        title="Help Section"
        description="Tutorials, frequently asked questions and support."
      />
      <Tabs
        ariaLabel="Help topics"
        tabs={[
          { id: "tutorials", label: "Tutorials", content: tutorialsTab },
          { id: "faqs", label: "FAQs", content: faqTab },
          { id: "support", label: "Support", content: supportTab },
        ]}
      />
    </>
  );
}
