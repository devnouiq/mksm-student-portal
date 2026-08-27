import { UserSound, CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import type { MkMessage } from "@/data/types";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

/*
  Message from MK — a video, audio, or text note from Mahesh Kale Sir,
  targeted to students by level or geography (audienceLabel). Rendered on the
  student overview; sourced from announcements posted "as Mahesh Kale Sir".
*/
export function MessageFromMk({ message }: { message: MkMessage }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-ink-900">{message.title}</p>
        <Badge tone="info">{message.audienceLabel}</Badge>
      </div>

      {message.kind === "video" && message.mediaUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-md border border-border bg-ink-900">
          <iframe
            src={message.mediaUrl}
            title={message.title}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : null}

      {message.kind === "audio" && message.mediaUrl ? (
        <audio controls preload="none" className="w-full">
          <source src={message.mediaUrl} />
          Your browser does not support the audio element.
        </audio>
      ) : null}

      {message.body ? (
        <p className="text-sm text-muted-foreground">{message.body}</p>
      ) : null}

      <p className="flex items-center gap-1.5 text-xs text-ink-400">
        <UserSound size={13} /> Mahesh Kale Sir
        <span aria-hidden>·</span>
        <CalendarBlank size={12} /> {formatDate(message.postedAt)}
      </p>
    </div>
  );
}
