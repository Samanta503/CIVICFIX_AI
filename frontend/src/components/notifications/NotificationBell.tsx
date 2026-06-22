"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getAuthToken } from "@/lib/auth-storage";
import { ROUTES } from "@/lib/routes";
import {
  getLatestNotifications,
  markNotificationAsRead,
} from "@/services/notification.service";
import type { NotificationLog } from "@/types/notification.types";

export function NotificationBell() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  async function loadNotifications() {
    const token = getAuthToken();

    if (!token) {
      setIsLoggedIn(false);
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    try {
      setIsLoggedIn(true);
      setLoading(true);

      const response = await getLatestNotifications(5);

      setUnreadCount(response.data.unread_count);
      setNotifications(response.data.notifications);
    } catch {
      setUnreadCount(0);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 15000);

    const handleFocus = () => {
      loadNotifications();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleMarkRead(notification: NotificationLog) {
    try {
      await markNotificationAsRead(notification.id);
      await loadNotifications();
    } catch {
      // Silent fail for navbar preview.
    }
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((previous) => !previous);
          loadNotifications();
        }}
        className="relative rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-secondary hover:bg-slate-100"
      >
        Notifications

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-extrabold text-secondary">
                Notifications
              </h3>
              <p className="text-xs text-slate-500">
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
              </p>
            </div>

            <Link
              href={ROUTES.notifications}
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                No notifications found.
              </div>
            ) : (
              notifications.map((notification) => {
                const unread = !notification.read_at;

                return (
                  <div
                    key={notification.id}
                    className={`border-b border-slate-100 px-5 py-4 last:border-b-0 ${
                      unread ? "bg-teal-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-primary">
                          {notification.type.replaceAll("_", " ")}
                        </p>

                        <h4 className="mt-1 text-sm font-extrabold text-secondary">
                          {notification.title}
                        </h4>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[11px] text-slate-400">
                          {notification.created_at
                            ? new Date(notification.created_at).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>

                      {unread && (
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-600" />
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          onClick={() => {
                            setOpen(false);
                            if (unread) {
                              handleMarkRead(notification);
                            }
                          }}
                          className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-teal-800"
                        >
                          Open
                        </a>
                      )}

                      {unread && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(notification)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-secondary hover:bg-slate-100"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <Link
              href={ROUTES.notifications}
              onClick={() => setOpen(false)}
              className="block rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white hover:bg-teal-800"
            >
              Open Notification Center
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 