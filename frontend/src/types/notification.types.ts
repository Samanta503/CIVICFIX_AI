export type NotificationUser = {
  id: number;
  name: string;
  email: string;
};

export type NotificationComplaint = {
  id: number;
  complaint_no: string;
  title: string;
  status: string;
  priority: string;
};

export type NotificationLog = {
  id: number;
  type: string;
  channel: string;
  title: string;
  message: string;
  action_url: string | null;
  email_to: string | null;
  email_status: "pending" | "sent" | "failed" | "skipped";
  failure_reason: string | null;
  meta?: Record<string, unknown> | null;
  read_at: string | null;
  sent_at: string | null;
  failed_at: string | null;
  created_at: string | null;

  recipient?: NotificationUser | null;
  sender?: NotificationUser | null;
  complaint?: NotificationComplaint | null;
};

export type NotificationListResponse = {
  success: boolean;
  message: string;
  data: {
    notifications: NotificationLog[];
  };
};

export type LatestNotificationResponse = {
  success: boolean;
  message: string;
  data: {
    unread_count: number;
    notifications: NotificationLog[];
  };
};

export type NotificationUnreadCountResponse = {
  success: boolean;
  message: string;
  data: {
    unread_count: number;
  };
};

export type SendAdminNotificationPayload = {
  user_id: number;
  type?: string;
  title: string;
  message: string;
  action_url?: string;
  send_email?: boolean;
};