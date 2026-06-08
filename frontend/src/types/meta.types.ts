export type MetaCounts = {
  roles: number;
  departments: number;
  zones: number;
  complaint_categories: number;
  sla_rules: number;
};

export type Department = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  contact_email: string | null;
  phone: string | null;
};

export type Zone = {
  id: number;
  name: string;
  ward_number: string | null;
  city: string;
};

export type ComplaintCategory = {
  id: number;
  department_id: number | null;
  name: string;
  slug: string;
  default_priority: "low" | "medium" | "high" | "critical";
  default_sla_hours: number;
  department?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

export type PublicMetaData = {
  counts: MetaCounts;
  departments: Department[];
  zones: Zone[];
  complaint_categories: ComplaintCategory[];
};

export type PublicMetaResponse = {
  success: boolean;
  message: string;
  data: PublicMetaData;
};