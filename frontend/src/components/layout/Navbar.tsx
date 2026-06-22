"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  AUTH_CHANGED_EVENT,
  clearAuthData,
  getAuthToken,
  getAuthUser,
} from "@/lib/auth-storage";
import { ROUTES } from "@/lib/routes";

type NavbarUser = {
  id?: number;
  name?: string;
  email?: string;
  role?: {
    id?: number;
    name?: string;
    slug?: string;
  } | null;
};

export function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<NavbarUser | null>(null);

  function loadAuthState() {
    const token = getAuthToken();
    const authUser = getAuthUser() as NavbarUser | null;

    setLoggedIn(Boolean(token));
    setUser(authUser);
  }

  useEffect(() => {
    loadAuthState();

    window.addEventListener(AUTH_CHANGED_EVENT, loadAuthState);
    window.addEventListener("storage", loadAuthState);
    window.addEventListener("focus", loadAuthState);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, loadAuthState);
      window.removeEventListener("storage", loadAuthState);
      window.removeEventListener("focus", loadAuthState);
    };
  }, []);

  function handleLogout() {
    clearAuthData();
    window.location.href = ROUTES.login;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href={ROUTES.home} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <span className="text-lg font-black">✓</span>
          </div>

          <span className="text-xl font-extrabold text-secondary">
            CivicFix AI
          </span>
        </Link>

        <div className="flex items-center gap-5">
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

          {loggedIn ? (
            <>
              <NotificationBell />

              <Link
                href={getDashboardRoute(user)}
                className="text-sm font-medium text-slate-600 hover:text-primary"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
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
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function getDashboardRoute(user: NavbarUser | null): string {
  const role = user?.role?.slug;

  if (role === "super_admin") {
    return ROUTES.adminDashboard;
  }

  if (role === "department_admin") {
    return ROUTES.departmentDashboard;
  }

  if (role === "officer") {
    return ROUTES.officerDashboard;
  }

  return ROUTES.citizenDashboard;
}