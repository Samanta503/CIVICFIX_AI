export type RoleSlug =
  | "citizen"
  | "officer"
  | "department_admin"
  | "super_admin";

export type AuthRole = {
  id: number;
  name: string;
  slug: RoleSlug;
};

export type AuthDepartment = {
  id: number;
  name: string;
  slug: string;
} | null;

export type AuthZone = {
  id: number;
  name: string;
  city: string;
  ward_number: string | null;
} | null;

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  role: AuthRole | null;
  department: AuthDepartment;
  zone: AuthZone;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  zone_id?: number | null;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    token_type: "Bearer";
    user: AuthUser;
  };
};

export type MeResponse = {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
  };
};

export type LogoutResponse = {
  success: boolean;
  message: string;
};

export type DashboardResponse = {
  success: boolean;
  message: string;
  data: {
    role: string;
    title: string;
    features: string[];
  };
};