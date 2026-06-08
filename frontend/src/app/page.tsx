"use client";

import { useEffect, useRef, useState } from "react";
import {
    AlertTriangle,
    ArrowRight,
    Brain,
    Building2,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    MapPinned,
    ShieldCheck,
    Sparkles,
    Users,
    Zap,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import {
    COMPLAINT_CATEGORIES,
    COMPLAINT_STATUSES,
    USER_ROLES,
} from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
    width: number;
    height: number;
    left: number;
    top: number;
    duration: number;
    delay: number;
}

// ─── Intersection Observer Hook ───────────────────────────────────────────────
function useInView(options?: IntersectionObserverInit) {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.unobserve(element);
            }
        }, options);

        observer.observe(element);
        return () => observer.disconnect();
    }, [options]);

    return { ref, isInView };
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({
    target,
    duration = 2000,
}: {
    target: number;
    duration?: number;
}) {
    const [count, setCount] = useState(0);
    const { ref, isInView } = useInView({ threshold: 0.5 });

    useEffect(() => {
        if (!isInView) return;

        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [isInView, target, duration]);

    return <span ref={ref}>{count}</span>;
}

// ─── Floating Particles ───────────────────────────────────────────────────────
// Rendered only on client to avoid SSR/client Math.random() mismatch
function FloatingParticles() {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        // Generate particles exclusively on the client after hydration
        const generated: Particle[] = Array.from({ length: 20 }, () => ({
            width: Math.random() * 12 + 4,
            height: Math.random() * 12 + 4,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: Math.random() * 8 + 6,
            delay: Math.random() * 5,
        }));
        setParticles(generated);
    }, []);

    // Render nothing on the server / before hydration
    if (particles.length === 0) return null;

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((p, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-teal-400/10"
                    style={{
                        width: `${p.width}px`,
                        height: `${p.height}px`,
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        animation: `float-particle ${p.duration}s ease-in-out infinite`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            {/* Global Keyframes */}
            <style jsx global>{`
                @keyframes float-particle {
                    0%,
                    100% {
                        transform: translateY(0px) translateX(0px);
                        opacity: 0.3;
                    }
                    25% {
                        transform: translateY(-20px) translateX(10px);
                        opacity: 0.6;
                    }
                    50% {
                        transform: translateY(-10px) translateX(-10px);
                        opacity: 0.4;
                    }
                    75% {
                        transform: translateY(-30px) translateX(5px);
                        opacity: 0.7;
                    }
                }

                @keyframes gradient-shift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes pulse-ring {
                    0% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                    50% {
                        transform: scale(1);
                        opacity: 0.3;
                    }
                    100% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                }

                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }

                @keyframes slide-up-fade {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

            {/* ── Hero Section ─────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50 py-24 lg:py-32">
                {/* Client-only particles — zero hydration mismatch */}
                <FloatingParticles />

                {/* Decorative gradient orbs */}
                <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-teal-200/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-200/20 blur-3xl" />

                <Container className="relative z-10 grid items-center gap-16 lg:grid-cols-2">
                    {/* Left column */}
                    <div
                        className={`transition-all duration-1000 ease-out ${
                            mounted
                                ? "translate-y-0 opacity-100"
                                : "translate-y-10 opacity-0"
                        }`}
                    >
                        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                            <Sparkles className="h-4 w-4" />
                            AI-Powered Smart City Complaint System
                        </span>

                        <h1 className="text-4xl font-extrabold tracking-tight text-secondary sm:text-5xl lg:text-6xl">
                            Citizens report.{" "}
                            <span className="relative inline-block">
                                <span
                                    className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent"
                                    style={{
                                        backgroundSize: "200% 200%",
                                        animation: "gradient-shift 4s ease infinite",
                                    }}
                                >
                                    City fixes.
                                </span>
                            </span>{" "}
                            AI helps prioritize.
                        </h1>

                        <p
                            className={`mt-6 max-w-2xl text-lg leading-8 text-slate-600 transition-all delay-300 duration-1000 ease-out ${
                                mounted
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-6 opacity-0"
                            }`}
                        >
                            CivicFix AI helps citizens report city problems with photos,
                            location, and descriptions. The system uses AI to classify,
                            prioritize, detect duplicates, suggest departments, and track
                            maintenance progress.
                        </p>

                        <div
                            className={`mt-10 flex flex-wrap gap-4 transition-all delay-500 duration-1000 ease-out ${
                                mounted
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-6 opacity-0"
                            }`}
                        >
                            <Button
                                href={ROUTES.register}
                                className="group relative overflow-hidden shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Get Started
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </Button>
                            <Button
                                href={ROUTES.publicComplaints}
                                variant="outline"
                                className="group transition-all duration-300 hover:border-primary hover:bg-teal-50"
                            >
                                <span className="flex items-center gap-2">
                                    View Public Complaints
                                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </Button>
                        </div>

                        {/* Trust badges */}
                        <div
                            className={`mt-10 flex items-center gap-6 transition-all delay-700 duration-1000 ease-out ${
                                mounted
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-6 opacity-0"
                            }`}
                        >
                            <div className="flex -space-x-2">
                                {[
                                    "bg-teal-400",
                                    "bg-amber-400",
                                    "bg-blue-400",
                                    "bg-rose-400",
                                ].map((color, i) => (
                                    <div
                                        key={i}
                                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${color}`}
                                    >
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-slate-500">
                                <span className="font-semibold text-secondary">500+</span>{" "}
                                citizens already reporting
                            </p>
                        </div>
                    </div>

                    {/* Right column — Dashboard card */}
                    <div
                        className={`transition-all delay-200 duration-1000 ease-out ${
                            mounted
                                ? "translate-y-0 opacity-100"
                                : "translate-y-10 opacity-0"
                        }`}
                    >
                        <div className="group relative rounded-3xl border border-slate-200/80 bg-white p-2 shadow-2xl shadow-slate-200/50 transition-all duration-500 hover:shadow-3xl">
                            {/* Shimmer */}
                            <div className="absolute inset-0 overflow-hidden rounded-3xl">
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                    style={{ animation: "shimmer 3s ease-in-out infinite" }}
                                />
                            </div>

                            <div className="relative rounded-2xl bg-gradient-to-br from-secondary via-slate-800 to-secondary p-8 text-white">
                                {/* Subtle grid */}
                                <div
                                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-5"
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(circle, white 1px, transparent 1px)",
                                        backgroundSize: "24px 24px",
                                    }}
                                />

                                <div className="relative mb-8 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <MapPinned className="h-8 w-8 text-accent" />
                                            <div
                                                className="absolute -inset-1 rounded-full bg-accent/20"
                                                style={{
                                                    animation:
                                                        "pulse-ring 3s ease-in-out infinite",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">
                                                Live Complaint Overview
                                            </h2>
                                            <p className="text-sm text-slate-400">
                                                Smart tracking for city maintenance
                                            </p>
                                        </div>
                                    </div>

                                    {/* Live indicator */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                                        </span>
                                        <span className="text-xs text-green-400">Live</span>
                                    </div>
                                </div>

                                <div className="relative grid gap-4 sm:grid-cols-2">
                                    <StatCard
                                        label="Submitted"
                                        value={128}
                                        icon={<ClipboardList className="h-4 w-4" />}
                                        color="text-blue-400"
                                        barColor="bg-blue-400"
                                        delay={0}
                                    />
                                    <StatCard
                                        label="In Progress"
                                        value={42}
                                        icon={<Zap className="h-4 w-4" />}
                                        color="text-amber-400"
                                        barColor="bg-amber-400"
                                        delay={100}
                                    />
                                    <StatCard
                                        label="Resolved"
                                        value={89}
                                        icon={<CheckCircle2 className="h-4 w-4" />}
                                        color="text-green-400"
                                        barColor="bg-green-400"
                                        delay={200}
                                    />
                                    <StatCard
                                        label="Critical"
                                        value={11}
                                        icon={<AlertTriangle className="h-4 w-4" />}
                                        color="text-red-400"
                                        barColor="bg-red-400"
                                        delay={300}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ── Features Section ─────────────────────────────────────── */}
            <section id="features" className="relative overflow-hidden py-24">
                <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <Container>
                    <AnimatedSectionHeader
                        title="Core Features"
                        description="The main features planned for the CivicFix AI platform."
                    />
                    <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <FeatureCard
                            icon={<ClipboardList className="h-6 w-6" />}
                            title="Complaint Submission"
                            description="Citizens can submit complaints with title, description, media, and location."
                            index={0}
                        />
                        <FeatureCard
                            icon={<Brain className="h-6 w-6" />}
                            title="AI Analysis"
                            description="AI can suggest category, priority, department, summary, and duplicate risk."
                            index={1}
                        />
                        <FeatureCard
                            icon={<MapPinned className="h-6 w-6" />}
                            title="Map Tracking"
                            description="Complaints can be displayed on a city map with location-based filtering."
                            index={2}
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-6 w-6" />}
                            title="Role-Based Access"
                            description="Citizen, officer, department admin, and super admin dashboards."
                            index={3}
                        />
                    </div>
                </Container>
            </section>

            {/* ── User Roles Section ───────────────────────────────────── */}
            <section id="roles" className="relative bg-white py-24">
                <Container>
                    <AnimatedSectionHeader
                        title="User Roles"
                        description="The system is divided into clear user roles with dedicated permissions."
                    />
                    <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {USER_ROLES.map((role, index) => (
                            <RoleCard key={role} role={role} index={index} />
                        ))}
                    </div>
                </Container>
            </section>

            {/* ── Workflow Section ─────────────────────────────────────── */}
            <section id="workflow" className="relative overflow-hidden py-24">
                <div className="pointer-events-none absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-teal-50 blur-3xl" />
                <Container className="relative z-10">
                    <AnimatedSectionHeader
                        title="Complaint Workflow"
                        description="A simple overview of how a complaint moves through the system."
                    />
                    <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {COMPLAINT_STATUSES.slice(0, 9).map((status, index) => (
                            <WorkflowStep key={status} status={status} index={index} />
                        ))}
                    </div>
                </Container>
            </section>

            {/* ── Categories Section ───────────────────────────────────── */}
            <section className="relative overflow-hidden bg-secondary py-24 text-white">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle, white 1px, transparent 1px)",
                            backgroundSize: "32px 32px",
                        }}
                    />
                </div>
                <Container className="relative z-10">
                    <AnimatedSectionHeader
                        title="Supported Complaint Categories"
                        description="Initial complaint categories for the first version of the platform."
                        light
                    />
                    <CategoryCloud categories={COMPLAINT_CATEGORIES} />
                </Container>
            </section>

            {/* ── CTA Section ──────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50 py-24">
                <Container>
                    <CTASection />
                </Container>
            </section>
        </>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    icon,
    color,
    barColor,
    delay,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    barColor: string;
    delay: number;
}) {
    return (
        <div
            className="group rounded-2xl bg-white/[0.07] p-5 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.12]"
            style={{
                animation: `slide-up-fade 0.6s ease-out ${delay}ms both`,
            }}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{label}</p>
                <span
                    className={`${color} transition-transform duration-300 group-hover:scale-110`}
                >
                    {icon}
                </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">
                <AnimatedCounter target={value} />
            </p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                    className={`h-full rounded-full ${barColor} transition-all duration-1000`}
                    style={{ width: `${(value / 128) * 100}%` }}
                />
            </div>
        </div>
    );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
    icon,
    title,
    description,
    index,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    index: number;
}) {
    const { ref, isInView } = useInView({ threshold: 0.2 });

    return (
        <div
            ref={ref}
            className={`group relative rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-teal-100/50 ${
                isInView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 120}ms` }}
        >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-50/0 to-teal-50/0 transition-all duration-500 group-hover:from-teal-50/50 group-hover:to-transparent" />
            <div className="relative">
                <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 p-3.5 text-primary shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-teal-200/50">
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-secondary">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                    {description}
                </p>
                <div className="mt-5 h-0.5 w-0 rounded-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-500 group-hover:w-full" />
            </div>
        </div>
    );
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({ role, index }: { role: string; index: number }) {
    const { ref, isInView } = useInView({ threshold: 0.2 });

    const roleIcons: Record<string, React.ReactNode> = {
        Citizen: <Users className="h-6 w-6" />,
        Officer: <ShieldCheck className="h-6 w-6" />,
        "Department Admin": <Building2 className="h-6 w-6" />,
        "Super Admin": <Zap className="h-6 w-6" />,
    };

    const roleColors: Record<string, string> = {
        Citizen: "from-blue-500 to-blue-600",
        Officer: "from-teal-500 to-teal-600",
        "Department Admin": "from-amber-500 to-amber-600",
        "Super Admin": "from-rose-500 to-rose-600",
    };

    const gradient = roleColors[role] ?? "from-teal-500 to-teal-600";

    return (
        <div
            ref={ref}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-xl ${
                isInView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 120}ms` }}
        >
            <div
                className={`absolute left-0 top-0 h-1 w-0 bg-gradient-to-r ${gradient} transition-all duration-500 group-hover:w-full`}
            />
            <div
                className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${gradient} p-3.5 text-white shadow-lg transition-all duration-300 group-hover:scale-110`}
            >
                {roleIcons[role] ?? <Users className="h-6 w-6" />}
            </div>
            <h3 className="text-lg font-bold text-secondary">{role}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
                Dedicated dashboard and permissions for {role.toLowerCase()} users.
            </p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                Learn more
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
        </div>
    );
}

// ─── Workflow Step ────────────────────────────────────────────────────────────
function WorkflowStep({ status, index }: { status: string; index: number }) {
    const { ref, isInView } = useInView({ threshold: 0.2 });

    return (
        <div
            ref={ref}
            className={`group flex items-center gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-700 ease-out hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 ${
                isInView
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-8 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 80}ms` }}
        >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-teal-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-200" />
                <span className="relative z-10 text-lg font-bold text-primary">
                    {index + 1}
                </span>
            </div>
            <div className="flex-1">
                <span className="font-semibold text-secondary">{status}</span>
                <div className="mt-2 h-0.5 w-0 rounded-full bg-gradient-to-r from-teal-300 to-transparent transition-all duration-500 group-hover:w-3/4" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
        </div>
    );
}

// ─── Category Cloud ───────────────────────────────────────────────────────────
function CategoryCloud({
    categories,
}: {
    categories: readonly string[];
}) {
    const { ref, isInView } = useInView({ threshold: 0.2 });

    return (
        <div ref={ref} className="mt-14 flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
                <span
                    key={category}
                    className={`cursor-default rounded-full border border-white/10 bg-white/[0.07] px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-700 ease-out hover:scale-105 hover:border-white/20 hover:bg-white/[0.14] ${
                        isInView
                            ? "translate-y-0 opacity-100"
                            : "translate-y-6 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 60}ms` }}
                >
                    {category}
                </span>
            ))}
        </div>
    );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection() {
    const { ref, isInView } = useInView({ threshold: 0.3 });

    return (
        <div
            ref={ref}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-slate-800 to-secondary p-12 text-center text-white shadow-2xl transition-all duration-1000 ease-out lg:p-20 ${
                isInView
                    ? "scale-100 translate-y-0 opacity-100"
                    : "scale-95 translate-y-12 opacity-0"
            }`}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-amber-500/20 blur-3xl" />

            <div className="relative z-10">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-accent" />
                    Join the Movement
                </span>

                <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                    Ready to make your city{" "}
                    <span className="bg-gradient-to-r from-accent to-amber-300 bg-clip-text text-transparent">
                        smarter
                    </span>
                    ?
                </h2>

                <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
                    Start reporting issues in your neighborhood and help build a more
                    responsive, transparent city government.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-4">
                    <Button
                        href={ROUTES.register}
                        className="group bg-white text-secondary shadow-lg transition-all duration-300 hover:bg-teal-50 hover:shadow-xl"
                    >
                        <span className="flex items-center gap-2">
                            Get Started Free
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                    </Button>
                    <Button
                        href={ROUTES.publicComplaints}
                        variant="outline"
                        className="border-white/30 text-white transition-all duration-300 hover:border-white/60 hover:bg-white/10"
                    >
                        Explore Complaints
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Animated Section Header ──────────────────────────────────────────────────
function AnimatedSectionHeader({
    title,
    description,
    light = false,
}: {
    title: string;
    description: string;
    light?: boolean;
}) {
    const { ref, isInView } = useInView({ threshold: 0.5 });

    return (
        <div ref={ref} className="mx-auto max-w-3xl text-center">
            <h2
                className={`text-3xl font-extrabold tracking-tight transition-all duration-700 ease-out sm:text-4xl ${
                    light ? "text-white" : "text-secondary"
                } ${
                    isInView
                        ? "translate-y-0 opacity-100"
                        : "translate-y-6 opacity-0"
                }`}
            >
                {title}
            </h2>
            <p
                className={`mt-4 text-base leading-7 transition-all delay-200 duration-700 ease-out sm:text-lg ${
                    light ? "text-slate-300" : "text-slate-600"
                } ${
                    isInView
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                }`}
            >
                {description}
            </p>
            <div
                className={`mx-auto mt-6 h-1 rounded-full bg-gradient-to-r transition-all delay-300 duration-1000 ease-out ${
                    light
                        ? "from-transparent via-teal-400 to-transparent"
                        : "from-transparent via-primary to-transparent"
                } ${isInView ? "w-24 opacity-100" : "w-0 opacity-0"}`}
            />
        </div>
    );
}