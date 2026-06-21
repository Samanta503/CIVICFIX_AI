<?php

namespace App\Services;

use App\Mail\CivicFixNotificationMail;
use App\Models\Complaint;
use App\Models\NotificationLog;
use App\Models\SlaEscalation;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;
use Throwable;

class NotificationService
{
    public function notifyUser(
        ?User $recipient,
        string $type,
        string $title,
        string $message,
        ?Complaint $complaint = null,
        ?User $sender = null,
        ?string $actionUrl = null,
        bool $sendEmail = true,
        array $meta = []
    ): NotificationLog {
        $notification = NotificationLog::create([
            'user_id' => $recipient?->id,
            'sender_id' => $sender?->id,
            'complaint_id' => $complaint?->id,
            'type' => $type,
            'channel' => $sendEmail ? 'database,email' : 'database',
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl,
            'email_to' => $recipient?->email,
            'email_status' => $sendEmail ? 'pending' : 'skipped',
            'meta' => $meta,
        ]);

        if (!$sendEmail || !$recipient?->email) {
            $notification->update([
                'email_status' => 'skipped',
            ]);

            return $notification;
        }

        try {
            Mail::to($recipient->email)->send(
                new CivicFixNotificationMail(
                    title: $title,
                    bodyMessage: $message,
                    actionUrl: $actionUrl,
                    actionText: 'Open CivicFix AI'
                )
            );

            $notification->update([
                'email_status' => 'sent',
                'sent_at' => now(),
            ]);
        } catch (Throwable $exception) {
            $notification->update([
                'email_status' => 'failed',
                'failed_at' => now(),
                'failure_reason' => $exception->getMessage(),
            ]);
        }

        return $notification;
    }

    public function notifyUsers(
        Collection $recipients,
        string $type,
        string $title,
        string $message,
        ?Complaint $complaint = null,
        ?User $sender = null,
        ?string $actionUrl = null,
        bool $sendEmail = true,
        array $meta = []
    ): void {
        $recipients
            ->filter(fn ($user) => $user instanceof User)
            ->unique('id')
            ->values()
            ->each(function (User $recipient) use (
                $type,
                $title,
                $message,
                $complaint,
                $sender,
                $actionUrl,
                $sendEmail,
                $meta
            ) {
                $this->notifyUser(
                    recipient: $recipient,
                    type: $type,
                    title: $title,
                    message: $message,
                    complaint: $complaint,
                    sender: $sender,
                    actionUrl: $actionUrl,
                    sendEmail: $sendEmail,
                    meta: $meta
                );
            });
    }

    public function notifySlaEscalated(
        Complaint $complaint,
        SlaEscalation $escalation,
        ?User $actor = null
    ): void {
        $complaint->loadMissing([
            'department:id,name,slug',
            'assignedOfficer:id,name,email,phone',
        ]);

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        $title = "SLA Escalation: {$complaint->complaint_no}";

        $message = "Complaint '{$complaint->title}' has been escalated to Level {$escalation->level}. Department: "
            . ($complaint->department?->name ?? 'N/A')
            . ". Current status: {$complaint->status}.";

        $recipients = collect();

        if ($complaint->assignedOfficer) {
            $recipients->push($complaint->assignedOfficer);
        }

        $departmentAdmins = User::query()
            ->where('status', 'active')
            ->where('department_id', $complaint->department_id)
            ->whereHas('role', fn ($query) => $query->where('slug', 'department_admin'))
            ->get();

        $superAdmins = User::query()
            ->where('status', 'active')
            ->whereHas('role', fn ($query) => $query->where('slug', 'super_admin'))
            ->get();

        $recipients = $recipients
            ->merge($departmentAdmins)
            ->merge($superAdmins)
            ->unique('id')
            ->values();

        $this->notifyUsers(
            recipients: $recipients,
            type: 'sla_escalation',
            title: $title,
            message: $message,
            complaint: $complaint,
            sender: $actor,
            actionUrl: "{$frontendUrl}/admin/sla-alerts",
            sendEmail: true,
            meta: [
                'escalation_id' => $escalation->id,
                'escalation_level' => $escalation->level,
                'reason' => $escalation->reason,
            ]
        );
    }

    public function notifyComplaintAssigned(
        Complaint $complaint,
        User $officer,
        ?User $actor = null
    ): void {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        $this->notifyUser(
            recipient: $officer,
            type: 'complaint_assigned',
            title: "New Complaint Assigned: {$complaint->complaint_no}",
            message: "You have been assigned a complaint: {$complaint->title}.",
            complaint: $complaint,
            sender: $actor,
            actionUrl: "{$frontendUrl}/officer/assigned/{$complaint->id}",
            sendEmail: true
        );
    }

    public function notifyCitizenStatusChanged(
        Complaint $complaint,
        ?User $actor = null
    ): void {
        $complaint->loadMissing('citizen:id,name,email');

        if (!$complaint->citizen) {
            return;
        }

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        $this->notifyUser(
            recipient: $complaint->citizen,
            type: 'complaint_status_update',
            title: "Complaint Status Updated: {$complaint->complaint_no}",
            message: "Your complaint '{$complaint->title}' is now marked as {$complaint->status}.",
            complaint: $complaint,
            sender: $actor,
            actionUrl: "{$frontendUrl}/citizen/complaints/{$complaint->complaint_no}",
            sendEmail: true
        );
    }
}