"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, getAuthUser } from "@/lib/auth-storage";
import { ROUTES } from "@/lib/routes";
import type { AuthUser, RoleSlug } from "@/types/auth.types";

type AuthGuardProps = {
  allowedRoles: RoleSlug[];
  children: React.ReactNode;
};

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getAuthUser();

    if (!token || !storedUser) {
      router.replace(ROUTES.login);
      return;
    }

    const roleSlug = storedUser.role?.slug as RoleSlug | undefined;

    if (!roleSlug || !allowedRoles.includes(roleSlug as RoleSlug)) {
      router.replace(ROUTES.unauthorized);
      return;
    }

    setUser(storedUser);
    setChecking(false);
  }, [allowedRoles, router]);

  if (checking) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-primary" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Checking authentication...
          </p>
        </div>
      </section>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}