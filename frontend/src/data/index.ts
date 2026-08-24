/*
  Data-source swap point.

  This is the ONE file that decides where data comes from. Today it returns the
  in-memory mock. In a later milestone, add an HTTP-backed implementation of the
  same `Repositories` interface and switch it here (e.g. gated on an env flag):

      return process.env.MKSM_DATA_SOURCE === "api"
        ? httpRepositories(process.env.MKSM_API_URL!)
        : mockRepositories;

  No screen imports the mock directly — they call `getRepositories()`, so the
  swap is invisible to the rest of the app.
*/

import type { Repositories } from "./repositories";
import { mockRepositories } from "./mock";

export function getRepositories(): Repositories {
  return mockRepositories;
}

export type { Repositories } from "./repositories";
export * from "./types";
