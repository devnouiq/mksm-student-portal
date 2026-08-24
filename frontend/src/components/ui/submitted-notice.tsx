import * as React from "react";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

/** Success confirmation shown after a prototype form submit. */
export function SubmittedNotice({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-success-200 bg-success-100 p-4">
      <p className="flex items-center gap-2 font-medium text-success-500">
        <CheckCircle size={18} weight="fill" /> {title}
      </p>
      {children ? <div className="mt-1 text-sm text-ink-700">{children}</div> : null}
    </div>
  );
}
