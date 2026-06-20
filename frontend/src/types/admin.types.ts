export type AdminRole = {
  id: number;
  name: string;
  slug: string;
};

export type AdminDepartment = {
  id: number;
  name: string;
  slug: string;
  users_count?: number;
  categories_count?: number;
  complaints_count?: number;
  created_at?: string | null;
};

export type AdminZone = {
  id: number;
  name: string;
  city: string;
  ward_number: string | null;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: "active" | "inactive";
  role: AdminRole | null;
  department: AdminDepartment | null;
  zone: AdminZone | null;
  created_at: string | null;
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  default_priority: "low" | "medium" | "high" | "critical";
  default_sla_hours: number;
  complaints_count?: number;
  department: AdminDepartment | null;
  created_at?: string | null;
};

export type AdminDashboardResponse = {
  success: boolean;
  message: string;
  data: {
    stats: {
      users: number;
      citizens: number;
      officers: number;
      departments: number;
      categories: number;
      complaints: number;
      submitted: number;
      assigned: number;
      in_progress: number;
      resolved: number;
    };
    recent_complaints: {
      id: number;
      complaint_no: string;
      title: string;
      status: string;
      priority: string;
      citizen: string | null;
      category: string | null;
      department: string | null;
      assigned_officer: string | null;
      created_at: string | null;
    }[];
  };
};

export type AdminMetaResponse = {
  success: boolean;
  message: string;
  data: {
    roles: AdminRole[];
    departments: AdminDepartment[];
    zones: AdminZone[];
  };
};

export type AdminUsersResponse = {
  success: boolean;
  message: string;
  data: {
    users: AdminUser[];
  };
};

export type AdminDepartmentsResponse = {
  success: boolean;
  message: string;
  data: {
    departments: AdminDepartment[];
  };
};

export type AdminCategoriesResponse = {
  success: boolean;
  message: string;
  data: {
    categories: AdminCategory[];
  };
};

export type AdminUserPayload = {
  name: string;
  email: string;
  phone?: string | null;
  password?: string;
  role_id: number;
  department_id?: number | null;
  zone_id?: number | null;
  status: "active" | "inactive";
};

export type AdminDepartmentPayload = {
  name: string;
  slug?: string;
};

export type AdminCategoryPayload = {
  department_id: number;
  name: string;
  slug?: string;
  default_priority: "low" | "medium" | "high" | "critical";
  default_sla_hours: number;
};