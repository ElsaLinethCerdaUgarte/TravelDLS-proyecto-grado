import type { UserRole } from "@/features/auth/types/auth";

const roleDestinations: Record<UserRole, string> = {
  platform_admin: "/admin/dashboard",
  client: "/client/dashboard",
  driver: "/driver/dashboard",
  company: "/company/dashboard",
};

const roleLabels: Record<UserRole, string> = {
  platform_admin: "superadmin",
  client: "cliente",
  driver: "conductor",
  company: "empresa",
};

export function getRoleLabel(role: UserRole): string {
  return roleLabels[role];
}

export function getRoleDestination(role: UserRole): string | null {
  const dashboardBaseUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL?.trim();
  if (!dashboardBaseUrl) return null;

  try {
    const baseUrl = dashboardBaseUrl.endsWith("/")
      ? dashboardBaseUrl
      : `${dashboardBaseUrl}/`;
    return new URL(roleDestinations[role].replace(/^\//, ""), baseUrl).toString();
  } catch {
    return null;
  }
}
