export type AdminOfficerDepartment = {
  id: number;
  name: string;
  slug: string;
};

export type AdminOfficerZone = {
  id: number;
  name: string;
  city: string;
  ward_number: string | null;
};

export type AdminOfficer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  department: AdminOfficerDepartment | null;
  zone: AdminOfficerZone | null;
  workload: {
    total_assigned: number;
    active_assigned: number;
    resolved: number;
    overdue: number;
  };
};

export type AdminOfficerListResponse = {
  success: boolean;
  message: string;
  data: {
    officers: AdminOfficer[];
  };
};