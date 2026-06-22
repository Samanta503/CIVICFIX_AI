<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = NotificationLog::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'sender:id,name,email',
                'complaint:id,complaint_no,title,status,priority',
            ])
            ->when($request->input('status') === 'unread', function ($query) {
                $query->whereNull('read_at');
            })
            ->latest()
            ->get()
            ->map(fn (NotificationLog $notification) => $this->formatNotification($notification));

        return response()->json([
            'success' => true,
            'message' => 'Notifications loaded successfully.',
            'data' => [
                'notifications' => $notifications,
            ],
        ]);
    }

    public function latest(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 5);

        if ($limit < 1) {
            $limit = 5;
        }

        if ($limit > 10) {
            $limit = 10;
        }

        $notifications = NotificationLog::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'sender:id,name,email',
                'complaint:id,complaint_no,title,status,priority',
            ])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (NotificationLog $notification) => $this->formatNotification($notification));

        $unreadCount = NotificationLog::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Latest notifications loaded successfully.',
            'data' => [
                'unread_count' => $unreadCount,
                'notifications' => $notifications,
            ],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = NotificationLog::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Unread notification count loaded successfully.',
            'data' => [
                'unread_count' => $count,
            ],
        ]);
    }

    public function markAsRead(Request $request, NotificationLog $notification): JsonResponse
    {
        if ((int) $notification->user_id !== (int) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot update this notification.',
            ], 403);
        }

        $notification->update([
            'read_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
            'data' => [
                'notification' => $this->formatNotification($notification->fresh()),
            ],
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        NotificationLog::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }

    private function formatNotification(NotificationLog $notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'channel' => $notification->channel,
            'title' => $notification->title,
            'message' => $notification->message,
            'action_url' => $notification->action_url,
            'email_to' => $notification->email_to,
            'email_status' => $notification->email_status,
            'failure_reason' => $notification->failure_reason,
            'meta' => $notification->meta,
            'read_at' => $notification->read_at?->toISOString(),
            'sent_at' => $notification->sent_at?->toISOString(),
            'failed_at' => $notification->failed_at?->toISOString(),
            'created_at' => $notification->created_at?->toISOString(),

            'sender' => $notification->sender ? [
                'id' => $notification->sender->id,
                'name' => $notification->sender->name,
                'email' => $notification->sender->email,
            ] : null,

            'complaint' => $notification->complaint ? [
                'id' => $notification->complaint->id,
                'complaint_no' => $notification->complaint->complaint_no,
                'title' => $notification->complaint->title,
                'status' => $notification->complaint->status,
                'priority' => $notification->complaint->priority,
            ] : null,
        ];
    }
}