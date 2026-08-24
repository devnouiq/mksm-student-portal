import { describe, expect, it } from "vitest";
import type { Role } from "@/data/types";
import { navForRole, roleLabels } from "./nav";

/*
  Role-based access is a cross-cutting constraint (PRD §7): one login, three
  distinct navigations. These tests pin the isolation guarantee — a role's
  sidebar must never surface another role's routes.
*/
const roles: Role[] = ["student", "teacher", "admin"];

describe("navForRole", () => {
  it("lands each role on its own Overview first", () => {
    expect(navForRole("student")[0].href).toBe("/student/overview");
    expect(navForRole("teacher")[0].href).toBe("/teacher/overview");
    expect(navForRole("admin")[0].href).toBe("/admin/overview");
  });

  it.each(roles)("scopes every %s route under its own role prefix", (role) => {
    const items = navForRole(role);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.href.startsWith(`/${role}/`)).toBe(true);
    }
  });

  it("never leaks another role's routes into a role's nav", () => {
    for (const role of roles) {
      const others = roles.filter((r) => r !== role);
      const hrefs = navForRole(role).map((i) => i.href);
      for (const other of others) {
        expect(hrefs.some((h) => h.startsWith(`/${other}/`))).toBe(false);
      }
    }
  });

  it("gives every nav item a label and a unique href", () => {
    for (const role of roles) {
      const items = navForRole(role);
      expect(items.every((i) => i.label.length > 0)).toBe(true);
      const hrefs = items.map((i) => i.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    }
  });

  it("has a human label for every role", () => {
    expect(roleLabels).toEqual({ student: "Student", teacher: "Teacher", admin: "Admin" });
  });
});
