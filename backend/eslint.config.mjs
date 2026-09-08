import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["drizzle/**", ".next/**", "node_modules/**"],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default config;
