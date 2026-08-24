import { redirect } from "next/navigation";

// Shared entry point → login, which routes each role to its own overview.
export default function Home() {
  redirect("/login");
}
