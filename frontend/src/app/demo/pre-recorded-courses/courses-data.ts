/* ------------------------------------------------------------------ *
 * Shared course catalog for the pre-recorded-courses demo.
 * A course is a package: modules of mixed lessons — videos, readings,
 * practice exercises, pop quizzes and a submitted assignment.
 * Sample data only, no real media. Nothing is locked — every lesson opens.
 * ------------------------------------------------------------------ */

export type ItemType = "video" | "reading" | "quiz" | "exercise" | "assignment";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // index of the correct option
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  meta: string;
  done?: boolean;
  duration?: string; // videos only
  body?: string; // reading / exercise / assignment prompt
  quiz?: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  items: Item[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  hindi: string; // Devanagari cover word (the raag / theme name)
  teacher: string;
  level: "Beginner" | "Intermediate" | "Advance";
  tag: string;
  blurb: string;
  progress: number; // 0..1
  hours: string;
  modules: Module[];
}

export const COURSES: Course[] = [
  {
    id: "c-yaman",
    slug: "raag-yaman",
    title: "Raag Yaman — From First Swar to Bandish",
    hindi: "यमन",
    teacher: "Guru Deshpande",
    level: "Intermediate",
    tag: "Khayal",
    blurb:
      "A complete package on Raag Yaman: aaroh–avroh, pakad, alap, and a full bandish in madhya laya. Watch the lessons, practise with the drone, and check yourself with quizzes.",
    progress: 0.35,
    hours: "6h 20m",
    modules: [
      {
        id: "m1",
        title: "Foundations of the raag",
        items: [
          {
            id: "i1",
            type: "video",
            title: "Aaroh, Avroh & Pakad",
            meta: "Video · 18:24",
            duration: "18:24",
            done: true,
          },
          {
            id: "i2",
            type: "reading",
            title: "Notes: the grammar of Yaman",
            meta: "Reading · 5 min",
            done: true,
            body: "Raag Yaman uses the teevra Madhyam (M̄). The vadi is Gandhar (G) and the samvadi is Nishad (N). Its chalan avoids the shadja on the way up, entering the phrase from Nishad of the lower octave. Keep the teevra Madhyam bright and resist sliding to the shuddha Madhyam.",
          },
          {
            id: "i3",
            type: "quiz",
            title: "Pop quiz: swaras of Yaman",
            meta: "Quiz · 3 questions",
            quiz: [
              {
                question: "Which Madhyam does Raag Yaman use?",
                options: ["Shuddha Madhyam", "Teevra Madhyam", "Both, equally", "No Madhyam"],
                answer: 1,
              },
              {
                question: "What is the vadi (most prominent) swar of Yaman?",
                options: ["Shadja (Sa)", "Gandhar (Ga)", "Madhyam (Ma)", "Pancham (Pa)"],
                answer: 1,
              },
              {
                question: "At which time is Yaman traditionally sung?",
                options: ["Early morning", "Noon", "First prahar of the night", "Late afternoon"],
                answer: 2,
              },
            ],
          },
        ],
      },
      {
        id: "m2",
        title: "Alap & vistaar",
        items: [
          {
            id: "i4",
            type: "video",
            title: "Slow alap in mandra saptak",
            meta: "Video · 22:10",
            duration: "22:10",
          },
          {
            id: "i5",
            type: "exercise",
            title: "Practice: sing along with the tanpura",
            meta: "Exercise · 15 min",
            body: "Set the tanpura to your assigned pitch. Sing the aaroh and avroh four times slowly, holding Gandhar and Nishad. Record yourself and compare the teevra Madhyam against the lesson.",
          },
          {
            id: "i6",
            type: "video",
            title: "Building phrases (badhat)",
            meta: "Video · 19:40",
            duration: "19:40",
          },
        ],
      },
      {
        id: "m3",
        title: "Bandish & assessment",
        items: [
          {
            id: "i7",
            type: "video",
            title: "Bandish: 'Eri Aali Piya Bina'",
            meta: "Video · 27:56",
            duration: "27:56",
          },
          {
            id: "i8",
            type: "assignment",
            title: "Submit your bandish recording",
            meta: "Assignment · Upload",
            body: "Record the sthayi of the bandish at your pitch and submit the audio. Your guru will review it and leave feedback on your class log.",
          },
        ],
      },
    ],
  },
  {
    id: "c-alankaar",
    slug: "alankaar-voice-foundations",
    title: "Alankaar & Voice Foundations",
    hindi: "अलंकार",
    teacher: "Anjali Rao",
    level: "Beginner",
    tag: "Foundation",
    blurb:
      "Build a steady voice: pitch, breath and the core alankaars every student needs before taking on a raag.",
    progress: 0.7,
    hours: "4h 05m",
    modules: [
      {
        id: "am1",
        title: "Pitch & breath",
        items: [
          { id: "ai1", type: "video", title: "Finding your pitch (C#)", meta: "Video · 12:05", duration: "12:05", done: true },
          { id: "ai2", type: "reading", title: "Notes: posture & breathing", meta: "Reading · 4 min", done: true, body: "Sit upright with a relaxed spine. Breathe from the diaphragm, not the chest. A steady breath is what lets a swar stay still." },
          {
            id: "ai3",
            type: "quiz",
            title: "Pop quiz: swar sthana",
            meta: "Quiz · 4 questions",
            done: true,
            quiz: [
              { question: "How many shuddha swaras are there in the octave?", options: ["Five", "Seven", "Twelve", "Twenty-two"], answer: 1 },
              { question: "Which two swaras are achal (fixed)?", options: ["Sa & Pa", "Re & Ga", "Ma & Dha", "Ni & Sa"], answer: 0 },
              { question: "How many swaras are there in total, counting vikrit swaras?", options: ["Seven", "Ten", "Twelve", "Twenty-two"], answer: 2 },
              { question: "A komal swar is sung:", options: ["Slightly raised", "At natural pitch", "Slightly lowered", "One octave up"], answer: 2 },
            ],
          },
        ],
      },
      {
        id: "am2",
        title: "Core alankaars",
        items: [
          { id: "ai4", type: "video", title: "Alankaar set 1 — ascending", meta: "Video · 14:30", duration: "14:30", done: true },
          { id: "ai5", type: "exercise", title: "Practice: alankaars at slow tempo", meta: "Exercise · 20 min", body: "Sing alankaar set 1 with the metronome at 60 BPM. Keep each swar even in volume." },
          { id: "ai6", type: "assignment", title: "Submit alankaar recording", meta: "Assignment · Upload", body: "Record alankaar set 1 and submit for review." },
        ],
      },
    ],
  },
  {
    id: "c-bhajan",
    slug: "bhajan-bhakti-sangeet",
    title: "Bhajan & Bhakti Sangeet",
    hindi: "भजन",
    teacher: "Kedar Joshi",
    level: "Beginner",
    tag: "Bhajan",
    blurb:
      "Devotional repertoire — learn well-known bhajans with clear diction, simple ornamentation and harmonium support.",
    progress: 0,
    hours: "3h 40m",
    modules: [
      {
        id: "bm1",
        title: "First bhajan",
        items: [
          { id: "bi1", type: "video", title: "Vaishnav Jan To — sthayi", meta: "Video · 09:47", duration: "09:47" },
          { id: "bi2", type: "reading", title: "Lyrics & meaning", meta: "Reading · 6 min", body: "Vaishnav jan to tene kahiye je peed parai jaane re — one who is called a true devotee feels the pain of others as their own." },
          {
            id: "bi3",
            type: "quiz",
            title: "Pop quiz: taal",
            meta: "Quiz · 2 questions",
            quiz: [
              { question: "Which taal is commonly used for this bhajan?", options: ["Teentaal", "Keherwa", "Jhaptaal", "Ektaal"], answer: 1 },
              { question: "How many matras (beats) are in Keherwa taal?", options: ["Six", "Seven", "Eight", "Sixteen"], answer: 2 },
            ],
          },
        ],
      },
      {
        id: "bm2",
        title: "Ornamentation",
        items: [
          { id: "bi4", type: "video", title: "Adding simple murki & kan", meta: "Video · 11:20", duration: "11:20" },
          { id: "bi5", type: "exercise", title: "Practice: antara with harmonium", meta: "Exercise · 15 min", body: "Play the antara line on the harmonium and sing along until the words sit comfortably on the taal." },
        ],
      },
    ],
  },
];

// Warm gradient stand-ins for video stills (no external images — CSP-safe).
export const THUMBS = [
  "linear-gradient(135deg, #3a2a12 0%, #6b4e0f 55%, #b08637 100%)",
  "linear-gradient(135deg, #2c2118 0%, #7a5a1e 60%, #d0a24a 100%)",
  "linear-gradient(135deg, #23180d 0%, #8a5a12 55%, #e0873f 100%)",
];

export function levelTone(level: Course["level"]): "warning" | "brand" | "neutral" {
  return level === "Advance" ? "warning" : level === "Intermediate" ? "brand" : "neutral";
}

export function countType(course: Course, type: ItemType): number {
  return course.modules.reduce(
    (n, m) => n + m.items.filter((i) => i.type === type).length,
    0,
  );
}

export function lessonCount(course: Course): number {
  return course.modules.reduce((n, m) => n + m.items.length, 0);
}

export function courseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
