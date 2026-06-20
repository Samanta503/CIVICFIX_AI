"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import {
  createAdminDepartment,
  getAdminDepartments,
} from "@/services/admin.service";
import type { AdminDepartment } from "@/types/admin.types";

export default function AdminDepartmentsPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminDepartmentsContent />
    </AuthGuard>
  );
}

function AdminDepartmentsContent() {
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadDepartments() {
    try {
      setLoading(true);
      const response = await getAdminDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load departments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setMessage(null);

      await createAdminDepartment({
        name: form.name,
        slug: form.slug || undefined,
      });

      setForm({ name: "", slug: "" });
      await loadDepartments();
      setMessage("Department created successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create department."
      );
    }
  }

  if (loading) {
    return <LoadingState message="Loading departments..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <PageHeader
          title="Manage Departments"
          description="Create and monitor city departments."
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
          <h2 className="text-2xl font-bold text-secondary">
            Create Department
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input
              label="Department Name"
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
          </div>

          <button
            type="submit"
            className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            Create Department
          </button>
        </form>

        <div className="mt-8 grid gap-4">
          {departments.map((department) => (
            <div
              key={department.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-bold text-secondary">
                {department.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{department.slug}</p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Stat label="Users" value={department.users_count || 0} />
                <Stat
                  label="Categories"
                  value={department.categories_count || 0}
                />
                <Stat
                  label="Complaints"
                  value={department.complaints_count || 0}
                />
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
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-secondary">{label}</span>
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-secondary">{value}</p>
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