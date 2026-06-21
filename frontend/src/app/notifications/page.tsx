"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notification.service";
import type { NotificationLog } from "@/types/notification.types";

export default function NotificationsPage() {
  return (
    <AuthGuard
      allowedRoles={["citizen", "officer", "department_admin", "super_admin"]}
    >
      <NotificationsContent />
    </AuthGuard>
  );
}

function NotificationsContent() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadNotifications(customFilter = filter) {
    try {
      setLoading(true);
      setMessage(null);

      const response = await getMyNotifications(
        customFilter === "unread" ? "unread" : undefined
      );

      setNotifications(response.data.notifications);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMarkRead(notification: NotificationLog) {
    try {
      setWorking(true);
      await markNotificationAsRead(notification.id);
      await loadNotifications(filter);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not mark as read."
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      setWorking(true);
      await markAllNotificationsAsRead();
      await loadNotifications(filter);
      setMessage("All notifications marked as read.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not mark all as read."
      );
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading notifications..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
                Notification Center
              </span>

              <h1 className="mt-5 text-4xl font-extrabold text-secondary">
                My Notifications
              </h1>

              <p className="mt-3 text-slate-600">
                View complaint updates, SLA alerts, assignments, and system
                messages.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={working}
                onClick={handleMarkAllRead}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
              >
                Mark All Read
              </button>

              <Link
                href={ROUTES.home}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
              >
                Back Home
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                loadNotifications("all");
              }}
              className={`rounded-xl px-5 py-3 text-sm font-bold ${
                filter === "all"
                  ? "bg-primary text-white"
                  : "border border-slate-200 bg-white text-secondary"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => {
                setFilter("unread");
                loadNotifications("unread");
              }}
              className={`rounded-xl px-5 py-3 text-sm font-bold ${
                filter === "unread"
                  ? "bg-primary text-white"
                  : "border border-slate-200 bg-white text-secondary"
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-5">
          {notifications.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                No notifications found
              </h2>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                working={working}
                onMarkRead={() => handleMarkRead(notification)}
              />
            ))
          )}
        </div>
      </Container>
    </section>
  );
}

function NotificationCard({
  notification,
  working,
  onMarkRead,
}: {
  notification: NotificationLog;
  working: boolean;
  onMarkRead: () => void;
}) {
  const isUnread = !notification.read_at;

  return (
    <div
      className={`rounded-3xl border p-6 shadow-sm ${
        isUnread
          ? "border-teal-200 bg-teal-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {notification.type}
          </span>

          {isUnread && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              Unread
            </span>
          )}

          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
            Email: {notification.email_status}
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold text-secondary">
          {notification.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {notification.message}
        </p>

        <p className="mt-3 text-xs text-slate-500">
          {notification.created_at
            ? new Date(notification.created_at).toLocaleString()
            : "N/A"}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {notification.action_url && (
            <a
              href={notification.action_url}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              Open
            </a>
          )}

          {isUnread && (
            <button
              type="button"
              disabled={working}
              onClick={onMarkRead}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100 disabled:opacity-70"
            >
              Mark Read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-primary" />
        <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
      </div>
    </section>
  );
}