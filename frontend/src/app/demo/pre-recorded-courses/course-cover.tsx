import { VideoCamera } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { lessonCount, levelTone, type Course } from "./courses-data";

/* Refined, distinct cover palettes — one warm jewel gradient per course,
   with a soft top-left light. No external images (CSP-safe). */
const PALETTES = [
  "radial-gradient(120% 90% at 15% 12%, rgba(255,255,255,0.22), transparent 55%), linear-gradient(145deg, #5c3410 0%, #8a5417 55%, #c8892f 100%)",
  "radial-gradient(120% 90% at 15% 12%, rgba(255,255,255,0.20), transparent 55%), linear-gradient(145deg, #123f39 0%, #1c6b5c 55%, #3fa088 100%)",
  "radial-gradient(120% 90% at 15% 12%, rgba(255,255,255,0.20), transparent 55%), linear-gradient(145deg, #3f1630 0%, #7a2f4e 55%, #b7648a 100%)",
];

const SARGAM = ["सा", "रे", "ग", "म", "प"];

/**
 * Course cover — a branded, per-course card face: the raag/theme name in
 * Devanagari over a jewel gradient, the ascending sargam set faint behind it,
 * with level and lesson-count chips. Purely presentational.
 */
export function CourseCover({ course, index }: { course: Course; index: number }) {
  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden"
      style={{ backgroundImage: PALETTES[index % PALETTES.length] }}
    >
      {/* Ascending sargam, faint, top-right */}
      <div className="pointer-events-none absolute right-4 top-3 select-none text-right font-semibold leading-tight text-white/15">
        {SARGAM.map((s, i) => (
          <span key={i} className="block text-lg">
            {s}
          </span>
        ))}
      </div>

      {/* Level + lesson count */}
      <div className="absolute left-3 top-3">
        <Badge tone={levelTone(course.level)}>{course.level}</Badge>
      </div>
      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm">
        <VideoCamera size={13} /> {lessonCount(course)}
      </span>

      {/* The raag / theme name */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-4 pb-3 pt-10">
        <p className="font-display text-4xl leading-none text-white/95 drop-shadow-sm">
          {course.hindi}
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/70">
          {course.tag}
        </p>
      </div>
    </div>
  );
}
