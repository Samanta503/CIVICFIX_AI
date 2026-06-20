"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import {
  createAdminCategory,
  getAdminCategories,
  getAdminMeta,
} from "@/services/admin.service";
import type {
  AdminCategory,
  AdminMetaResponse,
} from "@/types/admin.types";

export default function AdminCategoriesPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminCategoriesContent />
    </AuthGuard>
  );
}

function AdminCategoriesContent() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [meta, setMeta] = useState<AdminMetaResponse["data"] | null>(null);
  const [form, setForm] = useState({
    department_id: "",
    name: "",
    slug: "",
    default_priority: "medium",
    default_sla_hours: "48",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);

      const [categoryResponse, metaResponse] = await Promise.all([
        getAdminCategories(),
        getAdminMeta(),
      ]);

      setCategories(categoryResponse.data.categories);
      setMeta(metaResponse.data);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setMessage(null);

      await createAdminCategory({
        department_id: Number(form.department_id),
        name: form.name,
        slug: form.slug || undefined,
        default_priority: form.default_priority as
          | "low"
          | "medium"
          | "high"
          | "critical",
        default_sla_hours: Number(form.default_sla_hours),
      });

      setForm({
        department_id: "",
        name: "",
        slug: "",
        default_priority: "medium",
        default_sla_hours: "48",
      });

      await loadData();
      setMessage("Category created successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create category."
      );
    }
  }

  if (loading) {
    return <LoadingState message="Loading categories..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <PageHeader
          title="Manage Complaint Categories"
          description="Create categories and connect them with departments and SLA rules."
          backHref={ROUTES.adminDashboard}
        />

        {message && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-secondary">Create Category</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Select
              label="Department"
              value={form.department_id}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, department_id: value }))
              }
              required
            >
              <option value="">Select department</option>
              {meta?.departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>

            <Input
              label="Category Name"
              value={form.name}
              onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
              required
            />

            <Input
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm((prev) => ({ ...prev, slug: value }))}
              placeholder="auto-generated if empty"
            />

            <Select
              label="Default Priority"
              value={form.default_priority}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, default_priority: value }))
              }
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>

            <Input
              label="Default SLA Hours"
              type="number"
              value={form.default_sla_hours}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, default_sla_hours: value }))
              }
              required
            />
          </div>

          <button
            type="submit"
            className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            Create Category
          </button>
        </form>

        <div className="mt-8 grid gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-secondary">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{category.slug}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Department:{" "}
                    <span className="font-semibold">
                      {category.department?.name || "N/A"}
                    </span>
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <Stat label="Priority" value={category.default_priority} />
                  <Stat
                    label="SLA Hours"
                    value={String(category.default_sla_hours)}
                  />
                  <Stat
                    label="Complaints"
                    value={String(category.complaints_count || 0)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PageHeader({
  title,
  description,
  backHref,
}: {
  title: string;
  description: string;
  backHref: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
          Super Admin
        </span>
        <h1 className="mt-5 text-4xl font-extrabold text-secondary">{title}</h1>
        <p className="mt-3 text-slate-600">{description}</p>
      </div>

      <Link
        href={backHref}
        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-secondary">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-secondary">{label}</span>
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
      >
        {children}
      </select>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold capitalize text-secondary">
        {value}
      </p>
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-primary" />
        <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
      </div>
    </section>
  );
}