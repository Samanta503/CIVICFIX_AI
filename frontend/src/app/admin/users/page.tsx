"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import {
  createAdminUser,
  getAdminMeta,
  getAdminUsers,
  updateAdminUser,
} from "@/services/admin.service";
import type { AdminMetaResponse, AdminUser } from "@/types/admin.types";

export default function AdminUsersPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminUsersContent />
    </AuthGuard>
  );
}

function AdminUsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<AdminMetaResponse["data"] | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role_id: "",
    department_id: "",
    zone_id: "",
    status: "active",
  });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setMessage(null);

      const [usersResponse, metaResponse] = await Promise.all([
        getAdminUsers(),
        getAdminMeta(),
      ]);

      setUsers(usersResponse.data.users);
      setMeta(metaResponse.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load users.");
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

      await createAdminUser({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        password: form.password,
        role_id: Number(form.role_id),
        department_id: form.department_id ? Number(form.department_id) : null,
        zone_id: form.zone_id ? Number(form.zone_id) : null,
        status: form.status as "active" | "inactive",
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role_id: "",
        department_id: "",
        zone_id: "",
        status: "active",
      });

      await loadData();
      setMessage("User created successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create user.");
    }
  }

  async function toggleStatus(user: AdminUser) {
    try {
      setSavingId(user.id);
      setMessage(null);

      await updateAdminUser(user.id, {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_id: user.role?.id || 1,
        department_id: user.department?.id || null,
        zone_id: user.zone?.id || null,
        status: user.status === "active" ? "inactive" : "active",
      });

      await loadData();
      setMessage("User status updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update user status."
      );
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <LoadingState message="Loading users..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <PageHeader
          title="Manage Users"
          description="Create users and control user status for CivicFix AI."
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
          <h2 className="text-2xl font-bold text-secondary">Create New User</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input
              label="Name"
              value={form.name}
              onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
              required
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
              required
            />

            <Input
              label="Phone"
              value={form.phone}
              onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, password: value }))
              }
              required
            />

            <Select
              label="Role"
              value={form.role_id}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, role_id: value }))
              }
              required
            >
              <option value="">Select role</option>
              {meta?.roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>

            <Select
              label="Department"
              value={form.department_id}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, department_id: value }))
              }
            >
              <option value="">No department</option>
              {meta?.departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>

            <Select
              label="Zone"
              value={form.zone_id}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, zone_id: value }))
              }
            >
              <option value="">No zone</option>
              {meta?.zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} — Ward {zone.ward_number || "N/A"}
                </option>
              ))}
            </Select>

            <Select
              label="Status"
              value={form.status}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, status: value }))
              }
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>

          <button
            type="submit"
            className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            Create User
          </button>
        </form>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-secondary">All Users</h2>

          <div className="mt-5 grid gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-secondary">
                      {user.name}
                    </h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Role:{" "}
                      <span className="font-semibold">
                        {user.role?.name || "N/A"}
                      </span>{" "}
                      • Department:{" "}
                      <span className="font-semibold">
                        {user.department?.name || "N/A"}
                      </span>{" "}
                      • Status:{" "}
                      <span className="font-semibold capitalize">
                        {user.status}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={savingId === user.id}
                    onClick={() => toggleStatus(user)}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100 disabled:opacity-70"
                  >
                    {savingId === user.id
                      ? "Updating..."
                      : user.status === "active"
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-secondary">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
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