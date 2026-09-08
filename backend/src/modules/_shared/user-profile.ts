import type { UserProfile } from "@mksm/contracts";
import { roleToApi } from "@/domain/mappers";

export interface ProfileRow {
  id: string;
  role: string;
  mksmNo: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export function toUserProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    role: roleToApi[row.role] ?? "student",
    mksmNo: row.mksmNo,
    name: row.fullName,
    email: row.email,
    ...(row.avatarUrl ? { avatarUrl: row.avatarUrl } : {}),
  };
}
