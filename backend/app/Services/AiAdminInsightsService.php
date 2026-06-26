<?php

namespace App\Services;

use App\Models\Complaint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AiAdminInsightsService
{
    private array $closedStatuses = ['resolved', 'closed', 'rejected'];

    public function buildDashboard(): array
    {
        $overview = $this->overview();
        $statusSummary = $this->statusSummary();
        $prioritySummary = $this->prioritySummary();
        $categorySummary = $this->categorySummary();
        $departmentSummary = $this->departmentSummary();
        $zoneSummary = $this->zoneSummary();
        $hotspots = $this->hotspots();
        $locationPoints = $this->locationPoints();
        $aiSummary = $this->aiSummary();
        $slaSummary = $this->slaSummary();
        $feedbackSummary = $this->feedbackSummary();
        $recentAlerts = $this->recentAlerts($hotspots, $slaSummary, $aiSummary, $feedbackSummary);
        $recommendations = $this->recommendations(
            $overview,
            $hotspots,
            $slaSummary,
            $aiSummary,
            $feedbackSummary
        );

        return [
            'generated_at' => now()->toISOString(),
            'model_name' => 'local-admin-insights-v1',
            'overview' => $overview,
            'status_summary' => $statusSummary,
            'priority_summary' => $prioritySummary,
            'category_summary' => $categorySummary,
            'department_summary' => $departmentSummary,
            'zone_summary' => $zoneSummary,
            'hotspots' => $hotspots,
            'location_points' => $locationPoints,
            'ai_summary' => $aiSummary,
            'sla_summary' => $slaSummary,
            'feedback_summary' => $feedbackSummary,
            'recent_alerts' => $recentAlerts,
            'recommendations' => $recommendations,
        ];
    }

    private function overview(): array
    {
        $total = Complaint::count();

        $open = Complaint::query()
            ->whereNotIn('status', $this->closedStatuses)
            ->count();

        $resolved = Complaint::query()
            ->whereIn('status', ['resolved', 'closed'])
            ->count();

        $rejected = Complaint::query()
            ->where('status', 'rejected')
            ->count();

        $highRisk = Complaint::query()
            ->whereIn('priority', ['high', 'critical'])
            ->whereNotIn('status', $this->closedStatuses)
            ->count();

        $overdue = Complaint::query()
            ->whereNotIn('status', $this->closedStatuses)
            ->whereNotNull('sla_due_at')
            ->where('sla_due_at', '<', now())
            ->count();

        $today = Complaint::query()
            ->whereDate('created_at', today())
            ->count();

        $thisWeek = Complaint::query()
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $resolutionRate = $total > 0
            ? round(($resolved / $total) * 100, 2)
            : 0;

        return [
            'total_complaints' => $total,
            'open_complaints' => $open,
            'resolved_complaints' => $resolved,
            'rejected_complaints' => $rejected,
            'high_risk_open_complaints' => $highRisk,
            'overdue_complaints' => $overdue,
            'submitted_today' => $today,
            'submitted_this_week' => $thisWeek,
            'resolution_rate' => $resolutionRate,
        ];
    }

    private function statusSummary(): array
    {
        return DB::table('complaints')
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($item) => [
                'status' => $item->status,
                'total' => (int) $item->total,
            ])
            ->values()
            ->all();
    }

    private function prioritySummary(): array
    {
        return DB::table('complaints')
            ->select('priority', DB::raw('COUNT(*) as total'))
            ->groupBy('priority')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($item) => [
                'priority' => $item->priority,
                'total' => (int) $item->total,
            ])
            ->values()
            ->all();
    }

    private function categorySummary(): array
    {
        return DB::table('complaints as c')
            ->leftJoin('complaint_categories as cat', 'cat.id', '=', 'c.category_id')
            ->select(
                'cat.id',
                'cat.name',
                'cat.slug',
                DB::raw('COUNT(c.id) as total'),
                DB::raw("SUM(CASE WHEN c.status NOT IN ('resolved', 'closed', 'rejected') THEN 1 ELSE 0 END) as open_total"),
                DB::raw("SUM(CASE WHEN c.priority IN ('high', 'critical') THEN 1 ELSE 0 END) as high_risk_total")
            )
            ->groupBy('cat.id', 'cat.name', 'cat.slug')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id ? (int) $item->id : null,
                'name' => $item->name ?? 'Uncategorized',
                'slug' => $item->slug,
                'total' => (int) $item->total,
                'open_total' => (int) $item->open_total,
                'high_risk_total' => (int) $item->high_risk_total,
            ])
            ->values()
            ->all();
    }

    private function departmentSummary(): array
    {
        return DB::table('complaints as c')
            ->leftJoin('departments as d', 'd.id', '=', 'c.department_id')
            ->select(
                'd.id',
                'd.name',
                'd.slug',
                DB::raw('COUNT(c.id) as total'),
                DB::raw("SUM(CASE WHEN c.status NOT IN ('resolved', 'closed', 'rejected') THEN 1 ELSE 0 END) as open_total"),
                DB::raw("SUM(CASE WHEN c.sla_due_at IS NOT NULL AND c.sla_due_at < NOW() AND c.status NOT IN ('resolved', 'closed', 'rejected') THEN 1 ELSE 0 END) as overdue_total")
            )
            ->groupBy('d.id', 'd.name', 'd.slug')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id ? (int) $item->id : null,
                'name' => $item->name ?? 'Unassigned Department',
                'slug' => $item->slug,
                'total' => (int) $item->total,
                'open_total' => (int) $item->open_total,
                'overdue_total' => (int) $item->overdue_total,
            ])
            ->values()
            ->all();
    }

    private function zoneSummary(): array
    {
        return DB::table('complaints as c')
            ->leftJoin('zones as z', 'z.id', '=', 'c.zone_id')
            ->select(
                'z.id',
                'z.name',
                'z.city',
                'z.ward_number',
                DB::raw('COUNT(c.id) as total'),
                DB::raw("SUM(CASE WHEN c.status NOT IN ('resolved', 'closed', 'rejected') THEN 1 ELSE 0 END) as open_total"),
                DB::raw("SUM(CASE WHEN c.priority IN ('high', 'critical') THEN 1 ELSE 0 END) as high_risk_total"),
                DB::raw("SUM(CASE WHEN c.sla_due_at IS NOT NULL AND c.sla_due_at < NOW() AND c.status NOT IN ('resolved', 'closed', 'rejected') THEN 1 ELSE 0 END) as overdue_total"),
                DB::raw('AVG(c.latitude) as avg_latitude'),
                DB::raw('AVG(c.longitude) as avg_longitude')
            )
            ->groupBy('z.id', 'z.name', 'z.city', 'z.ward_number')
            ->orderByDesc('total')
            ->limit(15)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id ? (int) $item->id : null,
                'name' => $item->name ?? 'Unknown Zone',
                'city' => $item->city,
                'ward_number' => $item->ward_number,
                'total' => (int) $item->total,
                'open_total' => (int) $item->open_total,
                'high_risk_total' => (int) $item->high_risk_total,
                'overdue_total' => (int) $item->overdue_total,
                'avg_latitude' => $item->avg_latitude ? round((float) $item->avg_latitude, 7) : null,
                'avg_longitude' => $item->avg_longitude ? round((float) $item->avg_longitude, 7) : null,
            ])
            ->values()
            ->all();
    }

    private function hotspots(): array
    {
        return collect($this->zoneSummary())
            ->map(function (array $zone) {
                $score =
                    ($zone['total'] * 2) +
                    ($zone['open_total'] * 3) +
                    ($zone['high_risk_total'] * 5) +
                    ($zone['overdue_total'] * 6);

                return [
                    ...$zone,
                    'hotspot_score' => $score,
                    'risk_level' => $this->riskLevel($score),
                    'main_reason' => $this->hotspotReason($zone),
                ];
            })
            ->sortByDesc('hotspot_score')
            ->values()
            ->take(10)
            ->all();
    }

    private function locationPoints(): array
    {
        return Complaint::query()
            ->with([
                'category:id,name,slug',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
            ])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->latest()
            ->limit(150)
            ->get()
            ->map(fn (Complaint $complaint) => [
                'id' => $complaint->id,
                'complaint_no' => $complaint->complaint_no,
                'title' => $complaint->title,
                'status' => $complaint->status,
                'priority' => $complaint->priority,
                'latitude' => $complaint->latitude ? (float) $complaint->latitude : null,
                'longitude' => $complaint->longitude ? (float) $complaint->longitude : null,
                'is_overdue' => $complaint->sla_due_at
                    && !in_array($complaint->status, $this->closedStatuses, true)
                    && $complaint->sla_due_at->isPast(),
                'category' => $complaint->category ? [
                    'id' => $complaint->category->id,
                    'name' => $complaint->category->name,
                    'slug' => $complaint->category->slug,
                ] : null,
                'department' => $complaint->department ? [
                    'id' => $complaint->department->id,
                    'name' => $complaint->department->name,
                    'slug' => $complaint->department->slug,
                ] : null,
                'zone' => $complaint->zone ? [
                    'id' => $complaint->zone->id,
                    'name' => $complaint->zone->name,
                    'city' => $complaint->zone->city,
                    'ward_number' => $complaint->zone->ward_number,
                ] : null,
            ])
            ->values()
            ->all();
    }

    private function aiSummary(): array
    {
        return [
            'ai_predictions_total' => Schema::hasTable('complaint_ai_predictions')
                ? DB::table('complaint_ai_predictions')->count()
                : 0,

            'high_confidence_predictions' => Schema::hasTable('complaint_ai_predictions')
                ? DB::table('complaint_ai_predictions')->where('confidence_score', '>=', 75)->count()
                : 0,

            'duplicate_suggestions_total' => Schema::hasTable('complaint_duplicate_suggestions')
                ? DB::table('complaint_duplicate_suggestions')->count()
                : 0,

            'pending_duplicate_suggestions' => Schema::hasTable('complaint_duplicate_suggestions')
                ? DB::table('complaint_duplicate_suggestions')->where('status', 'pending')->count()
                : 0,

            'confirmed_duplicates' => Schema::hasTable('complaint_duplicate_suggestions')
                ? DB::table('complaint_duplicate_suggestions')->where('status', 'confirmed')->count()
                : 0,

            'image_analyses_total' => Schema::hasTable('complaint_media_ai_analyses')
                ? DB::table('complaint_media_ai_analyses')->count()
                : 0,

            'critical_image_findings' => Schema::hasTable('complaint_media_ai_analyses')
                ? DB::table('complaint_media_ai_analyses')->where('visual_severity', 'critical')->count()
                : 0,

            'pending_image_reviews' => Schema::hasTable('complaint_media_ai_analyses')
                ? DB::table('complaint_media_ai_analyses')->where('status', 'pending')->count()
                : 0,
        ];
    }

    private function slaSummary(): array
    {
        $openQuery = Complaint::query()
            ->whereNotIn('status', $this->closedStatuses);

        $overdue = (clone $openQuery)
            ->whereNotNull('sla_due_at')
            ->where('sla_due_at', '<', now())
            ->count();

        $dueSoon = (clone $openQuery)
            ->whereNotNull('sla_due_at')
            ->whereBetween('sla_due_at', [now(), now()->addHours(24)])
            ->count();

        $noDeadline = (clone $openQuery)
            ->whereNull('sla_due_at')
            ->count();

        $escalations = Schema::hasTable('sla_escalations')
            ? DB::table('sla_escalations')->count()
            : 0;

        $openEscalations = Schema::hasTable('sla_escalations')
            ? DB::table('sla_escalations')
                ->whereNotIn('status', ['resolved', 'closed'])
                ->count()
            : 0;

        return [
            'overdue_complaints' => $overdue,
            'due_soon_24h' => $dueSoon,
            'open_without_deadline' => $noDeadline,
            'total_escalations' => $escalations,
            'open_escalations' => $openEscalations,
        ];
    }

    private function feedbackSummary(): array
    {
        if (!Schema::hasTable('complaint_feedback')) {
            return [
                'total_feedback' => 0,
                'average_rating' => 0,
                'low_rating_total' => 0,
                'unresolved_feedback_total' => 0,
            ];
        }

        $total = DB::table('complaint_feedback')->count();

        $average = $total > 0
            ? round((float) DB::table('complaint_feedback')->avg('rating'), 2)
            : 0;

        $lowRating = DB::table('complaint_feedback')
            ->where('rating', '<=', 2)
            ->count();

        $unresolved = DB::table('complaint_feedback')
            ->where('issue_resolved', false)
            ->count();

        return [
            'total_feedback' => $total,
            'average_rating' => $average,
            'low_rating_total' => $lowRating,
            'unresolved_feedback_total' => $unresolved,
        ];
    }

    private function recentAlerts(
        array $hotspots,
        array $slaSummary,
        array $aiSummary,
        array $feedbackSummary
    ): array {
        $alerts = [];

        if (($slaSummary['overdue_complaints'] ?? 0) > 0) {
            $alerts[] = [
                'type' => 'sla_overdue',
                'severity' => 'critical',
                'title' => 'Overdue complaints require attention',
                'message' => "{$slaSummary['overdue_complaints']} complaint(s) are currently overdue.",
            ];
        }

        if (($slaSummary['due_soon_24h'] ?? 0) > 0) {
            $alerts[] = [
                'type' => 'sla_due_soon',
                'severity' => 'high',
                'title' => 'Complaints due within 24 hours',
                'message' => "{$slaSummary['due_soon_24h']} complaint(s) are approaching SLA deadline.",
            ];
        }

        if (($aiSummary['pending_duplicate_suggestions'] ?? 0) > 0) {
            $alerts[] = [
                'type' => 'pending_duplicates',
                'severity' => 'medium',
                'title' => 'Pending duplicate review',
                'message' => "{$aiSummary['pending_duplicate_suggestions']} duplicate suggestion(s) need admin review.",
            ];
        }

        if (($aiSummary['critical_image_findings'] ?? 0) > 0) {
            $alerts[] = [
                'type' => 'critical_image_findings',
                'severity' => 'critical',
                'title' => 'Critical image findings detected',
                'message' => "{$aiSummary['critical_image_findings']} image analysis result(s) are marked critical.",
            ];
        }

        if (($feedbackSummary['low_rating_total'] ?? 0) > 0) {
            $alerts[] = [
                'type' => 'low_feedback',
                'severity' => 'medium',
                'title' => 'Low citizen feedback found',
                'message' => "{$feedbackSummary['low_rating_total']} feedback record(s) have low rating.",
            ];
        }

        $topHotspot = $hotspots[0] ?? null;

        if ($topHotspot && $topHotspot['hotspot_score'] >= 10) {
            $alerts[] = [
                'type' => 'hotspot_zone',
                'severity' => $topHotspot['risk_level'],
                'title' => 'Complaint hotspot detected',
                'message' => "{$topHotspot['name']} has the highest hotspot score: {$topHotspot['hotspot_score']}.",
            ];
        }

        return $alerts;
    }

    private function recommendations(
        array $overview,
        array $hotspots,
        array $slaSummary,
        array $aiSummary,
        array $feedbackSummary
    ): array {
        $recommendations = [];

        if (($overview['overdue_complaints'] ?? 0) > 0) {
            $recommendations[] = [
                'priority' => 'critical',
                'title' => 'Resolve overdue complaints first',
                'description' => 'Assign officers or escalate complaints that have crossed SLA deadline.',
                'action' => 'Open SLA Alerts page and run SLA check.',
            ];
        }

        if (($overview['high_risk_open_complaints'] ?? 0) > 0) {
            $recommendations[] = [
                'priority' => 'high',
                'title' => 'Prioritize high-risk open complaints',
                'description' => 'High and critical priority complaints should be reviewed before normal complaints.',
                'action' => 'Filter complaints by high/critical priority.',
            ];
        }

        if (($aiSummary['pending_duplicate_suggestions'] ?? 0) > 0) {
            $recommendations[] = [
                'priority' => 'medium',
                'title' => 'Review duplicate complaint suggestions',
                'description' => 'Confirmed duplicates can reduce repeated workload and improve tracking.',
                'action' => 'Open AI Duplicate Detection page.',
            ];
        }

        if (($aiSummary['pending_image_reviews'] ?? 0) > 0) {
            $recommendations[] = [
                'priority' => 'medium',
                'title' => 'Review AI image analysis results',
                'description' => 'Pending image analysis results may reveal urgent field issues.',
                'action' => 'Open AI Image Analysis page.',
            ];
        }

        if (($feedbackSummary['unresolved_feedback_total'] ?? 0) > 0) {
            $recommendations[] = [
                'priority' => 'medium',
                'title' => 'Check unresolved citizen feedback',
                'description' => 'Unresolved feedback indicates the citizen may not be satisfied with the solution.',
                'action' => 'Open Feedback Analytics page.',
            ];
        }

        $topHotspot = $hotspots[0] ?? null;

        if ($topHotspot) {
            $recommendations[] = [
                'priority' => $topHotspot['risk_level'],
                'title' => "Deploy resources to {$topHotspot['name']}",
                'description' => $topHotspot['main_reason'],
                'action' => 'Review zone-level complaints and assign responsible department.',
            ];
        }

        if (count($recommendations) === 0) {
            $recommendations[] = [
                'priority' => 'low',
                'title' => 'System condition looks stable',
                'description' => 'No urgent hotspot, SLA, duplicate, image, or feedback risk was detected.',
                'action' => 'Continue regular monitoring.',
            ];
        }

        return $recommendations;
    }

    private function riskLevel(int|float $score): string
    {
        if ($score >= 60) {
            return 'critical';
        }

        if ($score >= 35) {
            return 'high';
        }

        if ($score >= 15) {
            return 'medium';
        }

        return 'low';
    }

    private function hotspotReason(array $zone): string
    {
        if (($zone['overdue_total'] ?? 0) > 0) {
            return "{$zone['overdue_total']} overdue complaint(s) found in this zone.";
        }

        if (($zone['high_risk_total'] ?? 0) > 0) {
            return "{$zone['high_risk_total']} high-risk complaint(s) found in this zone.";
        }

        if (($zone['open_total'] ?? 0) > 0) {
            return "{$zone['open_total']} open complaint(s) are waiting for action.";
        }

        return "This zone has {$zone['total']} complaint(s) in total.";
    }
}