"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/common/Container";
import { clearAuth, getAuthUser } from "@/lib/auth-storage";
import { getDashboardRoute } from "@/lib/role-redirect";
import { ROUTES } from "@/lib/routes";
import { logout } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth.types";

export function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Ignore backend logout error and clear local session anyway.
    } finally {
      clearAuth();
      setUser(null);
      window.location.href = ROUTES.login;
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href={ROUTES.home} className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="CivicFix AI Logo"
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-bold text-secondary">CivicFix AI</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/#features"
            className="text-sm font-medium text-slate-600 hover:text-primary"
          >
            Features
          </Link>

          <Link
            href="/#roles"
            className="text-sm font-medium text-slate-600 hover:text-primary"
          >
            Roles
          </Link>

          <Link
            href="/#workflow"
            className="text-sm font-medium text-slate-600 hover:text-primary"
          >
            Workflow
          </Link>

          <Link
            href={ROUTES.systemData}
            className="text-sm font-medium text-slate-600 hover:text-primary"
          >
            System Data
          </Link>

          {user ? (
            <>
              <Link
                href={getDashboardRoute(user.role?.slug)}
                className="text-sm font-medium text-slate-600 hover:text-primary"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href={ROUTES.login}
                className="text-sm font-medium text-slate-600 hover:text-primary"
              >
                Login
              </Link>

              <Link
                href={ROUTES.register}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </Container>
    </header>
  );
}