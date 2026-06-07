export type UserRole = "citizen" | "officer" | "department_admin" | "super_admin";

export type ComplaintPriority = "Low" | "Medium" | "High" | "Critical";

export type ComplaintStatus =
    | "Submitted"
    | "AI Reviewing"
    | "AI Reviewed"
    | "Needs More Information"
    | "Assigned"
    | "Accepted By Officer"
    | "In Progress"
    | "Escalated"
    | "Resolved"
    | "Rejected"
    | "Reopened"
    | "Closed";

export type ComplaintCategory = {
    id: number;
    name: string;
    slug: string;
    department_id: number;
};

export type Complaint = {
    id: number;
    tracking_number: string;
    title: string;
    description: string;
    category?: ComplaintCategory;
    priority: ComplaintPriority;
    status: ComplaintStatus;
    latitude: number;
    longitude: number;
    location_address?: string;
    created_at: string;
};