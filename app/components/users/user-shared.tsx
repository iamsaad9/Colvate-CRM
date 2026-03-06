// user-shared.tsx
// Shared types, constants, helpers used across user pages

export type UserRole = "ADMIN" | "MANAGER" | "SALES" | "SUPPORT";

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  reportsToId?: string | null;
  createdAt: string;
  updatedAt: string;
  leadsCount?: number;
  dealsCount?: number;
  tasksCount?: number;
  customersCount?: number;
}

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  isActive: boolean;
  reportsToId: string | null;
}

export const EMPTY_USER_FORM: UserFormData = {
  name: "",
  email: "",
  role: "SALES",
  avatarUrl: "",
  isActive: true,
  reportsToId: null,
};

// ─── Visibility Logic ─────────────────────────────────────────────────────────

/**
 * Returns the default visible user set based on the viewer's role.
 * - ADMIN: sees everyone
 * - MANAGER: sees themselves + their direct reports
 * - SALES/SUPPORT: sees themselves + their manager + peers (same reportsToId)
 */
export function getDefaultVisibleUsers(
  allUsers: User[],
  currentUser: User,
): User[] {
  if (currentUser.role === "ADMIN") return allUsers;

  if (currentUser.role === "MANAGER") {
    return allUsers.filter(
      (u) => u.id === currentUser.id || u.reportsToId === currentUser.id,
    );
  }

  // SALES / SUPPORT
  const myManagerId = currentUser.reportsToId;
  return allUsers.filter(
    (u) =>
      u.id === currentUser.id ||
      (myManagerId && u.id === myManagerId) ||
      (myManagerId && u.reportsToId === myManagerId && u.id !== currentUser.id),
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

import { Crown, ShieldCheck, Briefcase, Headphones } from "lucide-react";

export const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case "ADMIN":
      return <Crown size={16} />;
    case "MANAGER":
      return <ShieldCheck size={16} />;
    case "SALES":
      return <Briefcase size={16} />;
    case "SUPPORT":
      return <Headphones size={16} />;
  }
};

export const getRoleColor = (
  role: UserRole,
): "danger" | "warning" | "primary" | "secondary" => {
  const map = {
    ADMIN: "danger",
    MANAGER: "warning",
    SALES: "primary",
    SUPPORT: "secondary",
  } as const;
  return map[role];
};
