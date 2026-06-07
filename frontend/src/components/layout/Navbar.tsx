import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
            <Container className="flex h-16 items-center justify-between">
                <Link href={ROUTES.home} className="flex items-center gap-3">
                    <Image
                        src="/logo.svg"
                        alt="CivicFix AI Logo"
                        width={40}
                        height={40}
                        priority
                        className="h-10 w-10 object-contain"
                    />
                    <span className="text-xl font-bold text-secondary">CivicFix AI</span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-primary">
                        Features
                    </Link>
                    <Link href="#roles" className="text-sm font-medium text-slate-600 hover:text-primary">
                        Roles
                    </Link>
                    <Link href="#workflow" className="text-sm font-medium text-slate-600 hover:text-primary">
                        Workflow
                    </Link>
                    <Link href={ROUTES.login} className="text-sm font-medium text-slate-600 hover:text-primary">
                        Login
                    </Link>
                    <Link
                        href={ROUTES.register}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                    >
                        Register
                    </Link>
                </nav>
            </Container>
        </header>
    );
}