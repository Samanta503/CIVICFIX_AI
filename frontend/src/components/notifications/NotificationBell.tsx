"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ROUTES } from "@/lib/routes";
import { getNotificationUnreadCount } from "@/services/notification.service";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadCount() {
      try {
        const response = await getNotificationUnreadCount();
        setCount(response.data.unread_count);
      } catch {
        setCount(0);
      }
    }

    loadCount();
  }, []);

  return (
    <Link
      href={ROUTES.notifications}
      className="relative rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-secondary hover:bg-slate-100"
    >
      Notifications

      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}