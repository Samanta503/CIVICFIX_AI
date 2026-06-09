import { ROUTES } from "@/lib/routes";
import type { RoleSlug } from "@/types/auth.types";

export function getDashboardRoute(role?: RoleSlug | null): string {
  switch (role) {
    case "citizen":
      return ROUTES.citizenDashboard;

    case "officer":
      return ROUTES.officerDashboard;

    case "department_admin":
      return ROUTES.departmentDashboard;

    case "super_admin":
      return ROUTES.adminDashboard;

    default:
      return ROUTES.login;
  }
}