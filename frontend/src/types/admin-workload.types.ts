export type AdminWorkloadDepartment = {
  id: number;
  name: string;
  slug: string;
  total_complaints: number;
  submitted: number;
  assigned: number;
  in_progress: number;
  resolved: number;
  overdue: number;
};

export type AdminWorkloadOfficer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  department: {
    id: number;
    name: string;
    slug: string;
  } | null;
  zone: {
    id: number;
    name: string;
    city: string;
    ward_number: string | null;
  } | null;
  total_assigned: number;
  assigned: number;
  in_progress: number;
  resolved: number;
  overdue: number;
};

export type AdminWorkloadResponse = {
  success: boolean;
  message: string;
  data: {
    summary: {
      total_complaints: number;
      active_complaints: number;
      resolved_complaints: number;
      overdue_complaints: number;
      due_today: number;
      unassigned_complaints: number;
    };
    department_workload: AdminWorkloadDepartment[];
    officer_workload: AdminWorkloadOfficer[];
  };
};