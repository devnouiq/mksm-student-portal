import type { Icon } from "@phosphor-icons/react";
import {
  MicrophoneStage,
  MusicNoteSimple,
  MusicNotes,
  PianoKeys,
} from "@phosphor-icons/react/dist/ssr";

/* Give each course a face: pick an instrument/voice icon from its name so the
   lists read as music, not as generic rows. Falls back to a plain note. */
const COURSE_ICONS: { match: RegExp; icon: Icon }[] = [
  { match: /vocal|classical|khayal|raga|voice/i, icon: MicrophoneStage },
  { match: /bhajan|light|devotional|abhang|semi/i, icon: MusicNotes },
  { match: /harmonium|keyboard|piano|sur/i, icon: PianoKeys },
];

export function courseIcon(name: string): Icon {
  return COURSE_ICONS.find((c) => c.match.test(name))?.icon ?? MusicNoteSimple;
}
