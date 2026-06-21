<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SendNotificationRequest;
use App\Models\NotificationLog;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $notifications = NotificationLog::query()
            ->with([
                'recipient:id,name,email',
                'sender:id,name,email',
                'complaint:id,complaint_no,title,status,priority',
            ])
            ->when($request->filled('type'), function ($query) use ($request) {
                $query->where('type', $request->string('type'));
            })
            ->when($request->filled('email_status'), function ($query) use ($request) {
                $query->where('email_status', $request->string('email_status'));
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Admin notification logs loaded successfully.',
            'data' => [
                'notifications' => $notifications,
            ],
        ]);
    }

    public function sendToUser(SendNotificationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $recipient = User::findOrFail($validated['user_id']);

        $notification = $this->notificationService->notifyUser(
            recipient: $recipient,
            type: $validated['type'] ?? 'manual_admin_message',
            title: $validated['title'],
            message: $validated['message'],
            complaint: null,
            sender: $request->user(),
            actionUrl: $validated['action_url'] ?? null,
            sendEmail: (bool) ($validated['send_email'] ?? true)
        );

        return response()->json([
            'success' => true,
            'message' => 'Notification sent successfully.',
            'data' => [
                'notification' => $notification,
            ],
        ], 201);
    }
}