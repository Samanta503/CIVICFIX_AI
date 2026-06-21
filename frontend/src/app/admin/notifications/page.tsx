"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getAdminUsers } from "@/services/admin.service";
import {
  getAdminNotifications,
  sendAdminNotification,
} from "@/services/notification.service";
import type { AdminUser } from "@/types/admin.types";
import type { NotificationLog } from "@/types/notification.types";

export default function AdminNotificationsPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminNotificationsContent />
    </AuthGuard>
  );
}

function AdminNotificationsContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  const [form, setForm] = useState({
    user_id: "",
    title: "",
    message: "",
    action_url: "",
    send_email: true,
  });

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setMessage(null);

      const [usersResponse, notificationsResponse] = await Promise.all([
        getAdminUsers(),
        getAdminNotifications(),
      ]);

      setUsers(usersResponse.data.users);
      setNotifications(notificationsResponse.data.notifications);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load notification management."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSending(true);
      setMessage(null);

      await sendAdminNotification({
        user_id: Number(form.user_id),
        type: "manual_admin_message",
        title: form.title,
        message: form.message,
        action_url: form.action_url || undefined,
        send_email: form.send_email,
      });

      setForm({
        user_id: "",
        title: "",
        message: "",
        action_url: "",
        send_email: true,
      });

      await loadData();

      setMessage("Notification sent successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not send notification."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading admin notifications..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
                Super Admin Notifications
              </span>

              <h1 className="mt-5 text-4xl font-extrabold text-secondary">
                Notification Management
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                Send manual database/email notifications and review all
                notification logs.
              </p>
            </div>

            <Link
              href={ROUTES.adminDashboard}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-secondary">
            Send Notification
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-secondary">
                Recipient *
              </span>

              <select
                required
                value={form.user_id}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    user_id: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Select user</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} — {user.email} — {user.role?.name || "N/A"}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-secondary">
                Action URL
              </span>

              <input
                value={form.action_url}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    action_url: event.target.value,
                  }))
                }
                placeholder="Optional: http://localhost:3000/..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-secondary">
                Title *
              </span>

              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
                placeholder="Example: Important complaint update"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-secondary">
                Message *
              </span>

              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    message: event.target.value,
                  }))
                }
                placeholder="Write notification message..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.send_email}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    send_email: event.target.checked,
                  }))
                }
                className="h-4 w-4"
              />

              <span className="text-sm font-semibold text-secondary">
                Send email also
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
          >
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </form>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-secondary">
            Notification Logs
          </h2>

          <div className="mt-5 grid gap-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-600">No notifications found.</p>
            ) : (
              notifications.map((notification) => (
                <NotificationLogCard
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function NotificationLogCard({
  notification,
}: {
  notification: NotificationLog;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-primary">
              {notification.type}
            </span>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
              Email: {notification.email_status}
            </span>

            {notification.read_at ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                Read
              </span>
            ) : (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                Unread
              </span>
            )}
          </div>

          <h3 className="mt-3 text-lg font-bold text-secondary">
            {notification.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {notification.message}
          </p>

          <p className="mt-3 text-sm text-slate-500">
            To: {notification.recipient?.name || "N/A"} —{" "}
            {notification.email_to || "No email"}
          </p>

          {notification.complaint && (
            <p className="mt-2 text-sm text-slate-500">
              Complaint: {notification.complaint.complaint_no} —{" "}
              {notification.complaint.title}
            </p>
          )}

          {notification.failure_reason && (
            <p className="mt-2 text-sm text-red-600">
              Failure: {notification.failure_reason}
            </p>
          )}

          {notification.action_url && (
            <a
              href={notification.action_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              Open Action URL
            </a>
          )}
        </div>

        <div className="rounded-xl bg-white px-4 py-3 text-sm">
          <p className="font-bold text-secondary">
            Email: {notification.email_status}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Created:{" "}
            {notification.created_at
              ? new Date(notification.created_at).toLocaleString()
              : "N/A"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Sent:{" "}
            {notification.sent_at
              ? new Date(notification.sent_at).toLocaleString()
              : "N/A"}
          </p>
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