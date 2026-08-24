import { FileAudio, FilePdf, FileVideo } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { MaterialKind } from "@/data/types";

const MAP: Record<
  MaterialKind,
  { icon: Icon; label: string; action: string; className: string }
> = {
  audio: { icon: FileAudio, label: "Audio", action: "Play Now", className: "text-brand-600" },
  video: { icon: FileVideo, label: "Video", action: "Watch Now", className: "text-info-500" },
  pdf: { icon: FilePdf, label: "PDF", action: "Open Now", className: "text-danger-500" },
};

export function materialMeta(kind: MaterialKind) {
  return MAP[kind];
}

export function MaterialIcon({ kind, size = 20 }: { kind: MaterialKind; size?: number }) {
  const { icon: IconCmp, className } = MAP[kind];
  return <IconCmp size={size} weight="duotone" className={className} aria-hidden />;
}
