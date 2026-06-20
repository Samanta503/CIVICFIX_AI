"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { createCitizenComplaint } from "@/services/complaint.service";

type Category = {
  id: number;
  name: string;
  default_priority: "low" | "medium" | "high" | "critical";
  default_sla_hours: number;
  department?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

type Zone = {
  id: number;
  name: string;
  ward_number: string | null;
  city: string;
};

export default function CreateComplaintPage() {
  return (
    <AuthGuard allowedRoles={["citizen"]}>
      <CreateComplaintContent />
    </AuthGuard>
  );
}

function CreateComplaintContent() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    zone_id: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

        const response = await fetch(`${apiBaseUrl}/public/meta`, {
          headers: {
            Accept: "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load form data.");
        }

        setCategories(result.data.complaint_categories || []);
        setZones(result.data.zones || []);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load complaint form data."
        );
      } finally {
        setLoadingMeta(false);
      }
    }

    loadMeta();
  }, []);

  function updateField(field: keyof typeof form, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category_id", form.category_id);
      formData.append("address", form.address);

      if (form.zone_id) {
        formData.append("zone_id", form.zone_id);
      }

      if (form.latitude) {
        formData.append("latitude", form.latitude);
      }

      if (form.longitude) {
        formData.append("longitude", form.longitude);
      }

      files.forEach((file) => {
        formData.append("media[]", file);
      });

      await createCitizenComplaint(formData);

      router.push(ROUTES.citizenComplaints);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting complaint."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingMeta) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-primary" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading complaint form...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
              Citizen Complaint
            </span>

            <h1 className="mt-5 text-4xl font-extrabold text-secondary">
              Submit a New Complaint
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Report city problems with category, location, description, and
              optional images.
            </p>
          </div>

          <Link
            href={ROUTES.citizenComplaints}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
          >
            View My Complaints
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {message && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-6">
            <div>
              <label className="text-sm font-semibold text-secondary">
                Complaint Title *
              </label>

              <input
                type="text"
                required
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                placeholder="Example: Large pothole on main road"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-secondary">
                Description *
              </label>

              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                placeholder="Describe the problem clearly..."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-secondary">
                  Category *
                </label>

                <select
                  required
                  value={form.category_id}
                  onChange={(event) =>
                    updateField("category_id", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} — {category.department?.name || "N/A"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-secondary">
                  Zone
                </label>

                <select
                  value={form.zone_id}
                  onChange={(event) =>
                    updateField("zone_id", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="">Select zone</option>

                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — Ward {zone.ward_number || "N/A"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-secondary">
                Address *
              </label>

              <input
                type="text"
                required
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                placeholder="Example: Road 10, Mirpur, Dhaka"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-secondary">
                  Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(event) =>
                    updateField("latitude", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                  placeholder="23.8103"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-secondary">
                  Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(event) =>
                    updateField("longitude", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                  placeholder="90.4125"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-secondary">
                Upload Images
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={(event) =>
                  setFiles(Array.from(event.target.files || []).slice(0, 3))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
              />

              <p className="mt-2 text-xs text-slate-500">
                Maximum 3 images. Each image must be less than 5MB.
              </p>

              {files.length > 0 && (
                <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-secondary">
                    Selected files:
                  </p>

                  <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                    {files.map((file) => (
                      <li key={file.name}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </div>
      </Container>
    </section>
  );
}