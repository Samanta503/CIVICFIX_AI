"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/common/Container";
import { saveAuthData } from "@/lib/auth-storage";
import { getDashboardRoute } from "@/lib/role-redirect";
import { ROUTES } from "@/lib/routes";
import { login } from "@/services/auth.service";

const demoUsers = [
  {
    label: "Super Admin",
    email: "superadmin@civicfix.local",
    icon: "🛡️",
  },
  {
    label: "Department Admin",
    email: "department.admin@civicfix.local",
    icon: "🏛️",
  },
  {
    label: "Road Officer",
    email: "officer@civicfix.local",
    icon: "🛣️",
  },
  {
    label: "Waste Officer",
    email: "waste.officer@civicfix.local",
    icon: "♻️",
  },
  {
    label: "Citizen",
    email: "citizen@civicfix.local",
    icon: "👤",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("superadmin@civicfix.local");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<string>(
    "superadmin@civicfix.local"
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage(null);

    try {
      const response = await login({
        email,
        password,
      });

      saveAuthData(response.data.token, response.data.user);

      const dashboardRoute = getDashboardRoute(response.data.user.role?.slug);

      router.push(dashboardRoute);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while logging in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-50 py-16">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-primary/10 to-teal-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-tl from-secondary/10 to-indigo-200/20 blur-3xl [animation-delay:2s]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-primary/5 to-secondary/5 blur-3xl [animation-delay:4s]" />
      </div>

      <Container>
        <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
          {/* Left Panel */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 p-10 text-white shadow-2xl shadow-secondary/20 transition-all duration-500 hover:shadow-3xl hover:shadow-secondary/30">
            {/* Decorative gradient overlays */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-bl from-primary/20 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-110" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-white/10 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-110" />
            <div className="pointer-events-none absolute right-10 top-1/2 h-32 w-32 rounded-full bg-gradient-to-l from-teal-400/10 to-transparent blur-xl" />

            <span className="relative inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              CivicFix AI Authentication
            </span>

            <h1 className="relative mt-6 text-4xl font-extrabold leading-tight tracking-tight">
              Login to{" "}
              <span className="bg-gradient-to-r from-white via-teal-200 to-white bg-clip-text text-transparent">
                CivicFix AI
              </span>
            </h1>

            <p className="relative mt-4 max-w-2xl text-base leading-7 text-slate-200/90">
              This page tests Laravel Sanctum token authentication, role-based
              redirects, and protected dashboards.
            </p>

            <div className="relative mt-8 rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm">
              <h2 className="flex items-center gap-2 font-bold">
                <svg
                  className="h-5 w-5 text-teal-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-1.053M18 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.75 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                Demo accounts
              </h2>

              <div className="mt-4 grid gap-2">
                {demoUsers.map((user, index) => (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => {
                      setEmail(user.email);
                      setPassword("password");
                      setActiveUser(user.email);
                    }}
                    className={`group/btn relative overflow-hidden rounded-xl border px-4 py-3 text-left text-sm transition-all duration-300 ${activeUser === user.email
                      ? "border-teal-400/40 bg-white/20 shadow-lg shadow-teal-400/10"
                      : "border-transparent bg-white/[0.08] hover:border-white/20 hover:bg-white/15"
                      }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
                    <div className="relative flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg transition-transform duration-300 group-hover/btn:scale-110">
                        {user.icon}
                      </span>
                      <div>
                        <span className="font-semibold">{user.label}</span>
                        <br />
                        <span className="text-xs text-slate-300/80">
                          {user.email}
                        </span>
                      </div>
                      {activeUser === user.email && (
                        <svg
                          className="ml-auto h-5 w-5 text-teal-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-slate-300">
                <svg
                  className="h-4 w-4 shrink-0 text-amber-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                    clipRule="evenodd"
                  />
                </svg>
                Password for all demo users:{" "}
                <code className="rounded bg-white/10 px-2 py-0.5 font-mono font-bold text-white">
                  password
                </code>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/60">
            {/* Subtle gradient accent on top */}
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-teal-400 to-secondary" />

            {/* Decorative corner gradient */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-bl from-primary/5 to-transparent blur-2xl" />

            <div className="relative">
              <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-teal-50 transition-transform duration-300 group-hover:scale-105">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>

              <h2 className="mt-4 bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-2xl font-extrabold text-transparent">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Enter your credentials to continue.
              </p>
            </div>

            {message && (
              <div className="relative mt-5 overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 text-sm text-red-700">
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-400 to-rose-400" />
                <div className="flex items-start gap-3 pl-2">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {message}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative mt-6 space-y-5">
              {/* Email Field */}
              <div className="group/input">
                <label className="mb-2 block text-sm font-semibold text-secondary">
                  Email
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg
                      className="h-5 w-5 text-slate-400 transition-colors duration-200 group-focus-within/input:text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    required
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-secondary outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/5 focus:ring-2 focus:ring-primary/10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group/input">
                <label className="mb-2 block text-sm font-semibold text-secondary">
                  Password
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg
                      className="h-5 w-5 text-slate-400 transition-colors duration-200 group-focus-within/input:text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                      />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    required
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-12 text-secondary outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/5 focus:ring-2 focus:ring-primary/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors duration-200 hover:text-primary focus:outline-none"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-teal-700 px-5 py-3.5 font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-lg"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <svg
                        className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400">New here?</span>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Do not have an account?{" "}
              <Link
                href={ROUTES.register}
                className="group/link relative font-bold text-primary transition-colors duration-200 hover:text-teal-800"
              >
                Register as Citizen
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-teal-400 transition-all duration-300 group-hover/link:w-full" />
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}