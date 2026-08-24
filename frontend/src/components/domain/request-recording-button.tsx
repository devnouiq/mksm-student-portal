"use client";

import { useState } from "react";
import { CheckCircle, VideoCamera } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/format";

/*
  Recording requests are raised from My Courses only and fulfilled MANUALLY by
  admin/teacher (PRD §8.4) — there is no automated delivery. In the prototype
  the button records the request locally to demonstrate the flow.
*/
export function RequestRecordingButton({
  requestedOn,
}: {
  requestedOn: string | null;
}) {
  const [state, setState] = useState<string | null>(requestedOn);

  if (state) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-success-500">
        <CheckCircle size={16} weight="fill" />
        Recording requested · {formatDateShort(state)}
      </span>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setState(new Date().toISOString())}
    >
      <VideoCamera size={16} /> Request recording
    </Button>
  );
}
