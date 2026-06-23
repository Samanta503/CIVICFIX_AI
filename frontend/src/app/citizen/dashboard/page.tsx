"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { getAuthUser } from "@/lib/auth-storage";
import { ROUTES } from "@/lib/routes";

export default function CitizenDashboardPage() {
  return (
    <AuthGuard allowedRoles={["citizen"]}>
      <CitizenDashboardContent />
    </AuthGuard>
  );
}

function CitizenDashboardContent() {
  const user = getAuthUser();

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-50 py-16">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-primary/10 to-teal-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-tl from-secondary/10 to-indigo-200/20 blur-3xl [animation-delay:2s]" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 animate-pulse rounded-full bg-gradient-to-r from-primary/5 to-secondary/5 blur-3xl [animation-delay:4s]" />
      </div>

      <Container>
        <div className="relative space-y-8">
          {/* Hero Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-8 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/60">
            {/* Top accent bar */}
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-teal-400 to-secondary" />

            {/* Decorative corner blobs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-gradient-to-bl from-primary/10 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-110" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-secondary/5 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-110" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                {/* Welcome badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Welcome, {user?.name || "Citizen"}
                </div>

                <h1 className="mt-4 bg-gradient-to-r from-secondary via-secondary to-slate-700 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
                  Citizen Dashboard
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-slate-500">
                  Submit complaints, track complaint status, and view your
                  complaint history.
                </p>

                {/* CTA Buttons */}
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={ROUTES.createComplaint}
                    className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                    <svg
                      className="relative h-5 w-5 transition-transform duration-300 group-hover/btn:rotate-90"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    <span className="relative">Submit New Complaint</span>
                  </Link>

                  <Link
                    href={ROUTES.citizenComplaints}
                    className="group/btn2 relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-secondary shadow-sm transition-all duration-300 hover:border-teal-200 hover:bg-teal-50/50 hover:text-primary hover:shadow-md active:scale-[0.98]"
                  >
                    <svg
                      className="h-5 w-5 text-slate-400 transition-colors duration-300 group-hover/btn2:text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                      />
                    </svg>
                    View My Complaints
                  </Link>

                  <Link
                     href={ROUTES.notifications}
                     className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
                   >
                    My Notifications
                  </Link>
                  <Link
                     href={ROUTES.citizenFeedback}
                     className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
                 >
                    Give Feedback
                  </Link>
                </div>
              </div>

              {/* Decorative icon */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-teal-50 shadow-inner transition-transform duration-300 group-hover:scale-105">
                <svg
                  className="h-10 w-10 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              title="Submit Complaint"
              description="Report city issues with category, location, and images."
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.7}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              }
              index={0}
            />

            <FeatureCard
              title="Track Status"
              description="Check whether your complaint is submitted, assigned, or resolved."
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.7}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              }
              index={1}
            />

            <FeatureCard
              title="SLA Deadline"
              description="Every complaint gets a deadline based on priority and category."
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.7}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              }
              index={2}
            />

            <FeatureCard
              title="History"
              description="Complaint status history is stored for future tracking."
              icon={
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.7}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              }
              index={3}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <div
      className="group/card relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Hover top shine */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-secondary/0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

      {/* Decorative corner blob */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-bl from-primary/5 to-transparent blur-xl transition-transform duration-500 group-hover/card:scale-125" />

      <div className="relative">
        {/* Icon container */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-teal-50 text-primary transition-transform duration-300 group-hover/card:scale-110">
          {icon}
        </div>

        <h3 className="mt-4 font-bold text-secondary transition-colors duration-300 group-hover/card:text-primary">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>

        {/* Bottom animated line */}
        <div className="mt-4 h-0.5 w-0 rounded-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-500 group-hover/card:w-full" />
      </div>
    </div>
  );
}