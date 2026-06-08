import { Container } from "@/components/common/Container";
import {
  AlertCircle,
  Building2,
  Clock,
  Database,
  Layers,
  MapPinned,
  Shield,
  Tags,
} from "lucide-react";

type MetaCounts = {
  roles: number;
  departments: number;
  zones: number;
  complaint_categories: number;
  sla_rules: number;
};

type Department = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  contact_email: string | null;
  phone: string | null;
};

type Zone = {
  id: number;
  name: string;
  ward_number: string | null;
  city: string;
};

type ComplaintCategory = {
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

type PublicMetaData = {
  counts: MetaCounts;
  departments: Department[];
  zones: Zone[];
  complaint_categories: ComplaintCategory[];
};

type PublicMetaResponse = {
  success: boolean;
  message: string;
  data: PublicMetaData;
};

async function getPublicMeta(): Promise<{
  data: PublicMetaData | null;
  error: string | null;
}> {
  try {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

    const response = await fetch(`${apiBaseUrl}/public/meta`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        data: null,
        error: `Backend returned HTTP ${response.status}. Make sure Laravel backend is running.`,
      };
    }

    const result = (await response.json()) as PublicMetaResponse;

    if (!result.success || !result.data) {
      return {
        data: null,
        error: result.message || "Backend returned invalid response.",
      };
    }

    return {
      data: result.data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while loading system data.",
    };
  }
}

export default async function SystemDataPage() {
  const { data, error } = await getPublicMeta();

  if (error || !data) {
    return (
      <section className="min-h-screen bg-slate-50 py-16">
        <Container>
          <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertCircle className="h-8 w-8" />
            </div>

            <h1 className="mt-6 text-3xl font-extrabold text-secondary">
              Could not load system data
            </h1>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {error || "No data was returned from the backend."}
            </p>

            <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-left text-sm text-slate-700">
              <p className="font-semibold">Check these:</p>
              <p className="mt-2">1. Laravel backend is running.</p>
              <p>2. Backend URL works: http://127.0.0.1:8000/api/public/meta</p>
              <p>3. Frontend .env.local has correct API URL.</p>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
            <Database className="h-4 w-4" />
            Chunk 3 Database Preview
          </span>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-secondary">
            CivicFix AI System Data
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            This page confirms that your MySQL database, Laravel backend API,
            and Next.js frontend are connected successfully.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Roles"
            value={data.counts.roles}
            icon={<Shield className="h-5 w-5" />}
          />

          <StatCard
            label="Departments"
            value={data.counts.departments}
            icon={<Building2 className="h-5 w-5" />}
          />

          <StatCard
            label="Zones"
            value={data.counts.zones}
            icon={<MapPinned className="h-5 w-5" />}
          />

          <StatCard
            label="Categories"
            value={data.counts.complaint_categories}
            icon={<Tags className="h-5 w-5" />}
          />

          <StatCard
            label="SLA Rules"
            value={data.counts.sla_rules}
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <DataSection
            title="Departments"
            description="Departments are responsible for solving specific complaint types."
            icon={<Building2 className="h-6 w-6" />}
          >
            {data.departments.map((department) => (
              <div
                key={department.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-secondary">
                  {department.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {department.description || "No description available."}
                </p>

                <div className="mt-4 space-y-1 text-xs text-slate-500">
                  <p>Slug: {department.slug}</p>
                  <p>Email: {department.contact_email || "N/A"}</p>
                  <p>Phone: {department.phone || "N/A"}</p>
                </div>
              </div>
            ))}
          </DataSection>

          <DataSection
            title="Zones"
            description="Zones represent city areas or wards for complaint routing."
            icon={<MapPinned className="h-6 w-6" />}
          >
            {data.zones.map((zone) => (
              <div
                key={zone.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-secondary">
                  {zone.name}
                </h3>

                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p>City: {zone.city}</p>
                  <p>Ward: {zone.ward_number || "N/A"}</p>
                </div>
              </div>
            ))}
          </DataSection>
        </div>

        <div className="mt-12">
          <DataSection
            title="Complaint Categories"
            description="Complaint categories are mapped to departments with default priority and SLA."
            icon={<Layers className="h-6 w-6" />}
          >
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {data.complaint_categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-secondary">
                      {category.name}
                    </h3>

                    <PriorityBadge priority={category.default_priority} />
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      Department:{" "}
                      <span className="font-semibold text-secondary">
                        {category.department?.name || "N/A"}
                      </span>
                    </p>

                    <p>
                      Default SLA:{" "}
                      <span className="font-semibold text-secondary">
                        {category.default_sla_hours} hours
                      </span>
                    </p>

                    <p className="text-xs text-slate-500">
                      Slug: {category.slug}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DataSection>
        </div>
      </Container>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-primary">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-4xl font-extrabold text-secondary">{value}</p>
    </div>
  );
}

function DataSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-primary">
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-secondary">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-5">{children}</div>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: "low" | "medium" | "high" | "critical";
}) {
  const styles = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-amber-100 text-amber-700",
    critical: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}