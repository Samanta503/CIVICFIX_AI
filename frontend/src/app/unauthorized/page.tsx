import Link from "next/link";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";

export default function UnauthorizedPage() {
  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl">
            !
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-secondary">
            Unauthorized Access
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your account role does not have permission to access this page.
          </p>

          <Link
            href={ROUTES.login}
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-white hover:bg-teal-800"
          >
            Back to Login
          </Link>
        </div>
      </Container>
    </section>
  );
}