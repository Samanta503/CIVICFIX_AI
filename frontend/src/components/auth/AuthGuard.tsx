"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, getAuthUser } from "@/lib/auth-storage";
import { ROUTES } from "@/lib/routes";

export type RoleSlug =
  | "citizen"
  | "officer"
  | "department_admin"
  | "super_admin";

type AuthGuardProps = {
  children: ReactNode;
  allowedRoles: RoleSlug[];
};

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getAuthUser();

    if (!token || !storedUser) {
      router.replace(ROUTES.login);
      return;
    }

    const roleSlug = storedUser.role?.slug as RoleSlug | undefined;

    if (!roleSlug || !allowedRoles.includes(roleSlug)) {
      router.replace(ROUTES.unauthorized);
      return;
    }

    setChecking(false);
  }, [allowedRoles, router]);

  if (checking) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-primary" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Checking access...
          </p>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}