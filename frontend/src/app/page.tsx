import {
    AlertTriangle,
    Brain,
    Building2,
    CheckCircle2,
    ClipboardList,
    MapPinned,
    ShieldCheck,
    Users,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import {
    COMPLAINT_CATEGORIES,
    COMPLAINT_STATUSES,
    USER_ROLES,
} from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

export default function HomePage() {
    return (
        <>
            <section className="bg-gradient-to-br from-teal-50 via-white to-amber-50 py-20">
                <Container className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <span className="mb-4 inline-flex rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
                            AI-Powered Smart City Complaint System
                        </span>

                        <h1 className="text-4xl font-extrabold tracking-tight text-secondary sm:text-5xl lg:text-6xl">
                            Citizens report. City fixes. AI helps prioritize.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                            CivicFix AI helps citizens report city problems with photos,
                            location, and descriptions. The system uses AI to classify,
                            prioritize, detect duplicates, suggest departments, and track
                            maintenance progress.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Button href={ROUTES.register}>Get Started</Button>
                            <Button href={ROUTES.publicComplaints} variant="outline">
                                View Public Complaints
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                        <div className="rounded-2xl bg-secondary p-6 text-white">
                            <div className="mb-6 flex items-center gap-3">
                                <MapPinned className="h-8 w-8 text-accent" />
                                <div>
                                    <h2 className="text-xl font-bold">Live Complaint Overview</h2>
                                    <p className="text-sm text-slate-300">
                                        Smart tracking for city maintenance
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <StatCard label="Submitted" value="128" />
                                <StatCard label="In Progress" value="42" />
                                <StatCard label="Resolved" value="89" />
                                <StatCard label="Critical" value="11" />
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section id="features" className="py-20">
                <Container>
                    <SectionHeader
                        title="Core Features"
                        description="The main features planned for the CivicFix AI platform."
                    />

                    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <FeatureCard
                            icon={<ClipboardList />}
                            title="Complaint Submission"
                            description="Citizens can submit complaints with title, description, media, and location."
                        />
                        <FeatureCard
                            icon={<Brain />}
                            title="AI Analysis"
                            description="AI can suggest category, priority, department, summary, and duplicate risk."
                        />
                        <FeatureCard
                            icon={<MapPinned />}
                            title="Map Tracking"
                            description="Complaints can be displayed on a city map with location-based filtering."
                        />
                        <FeatureCard
                            icon={<ShieldCheck />}
                            title="Role-Based Access"
                            description="Citizen, officer, department admin, and super admin dashboards."
                        />
                    </div>
                </Container>
            </section>

            <section id="roles" className="bg-white py-20">
                <Container>
                    <SectionHeader
                        title="User Roles"
                        description="The system is divided into clear user roles."
                    />

                    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {USER_ROLES.map((role) => (
                            <div
                                key={role}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                            >
                                <Users className="mb-4 h-8 w-8 text-primary" />
                                <h3 className="text-lg font-bold text-secondary">{role}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Dedicated dashboard and permissions for {role.toLowerCase()}.
                                </p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            <section id="workflow" className="py-20">
                <Container>
                    <SectionHeader
                        title="Complaint Workflow"
                        description="A simple overview of how a complaint moves through the system."
                    />

                    <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {COMPLAINT_STATUSES.slice(0, 9).map((status, index) => (
                            <div
                                key={status}
                                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-bold text-primary">
                                    {index + 1}
                                </div>
                                <span className="font-semibold text-secondary">{status}</span>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            <section className="bg-secondary py-20 text-white">
                <Container>
                    <SectionHeader
                        title="Supported Complaint Categories"
                        description="Initial complaint categories for the first version."
                        light
                    />

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        {COMPLAINT_CATEGORIES.map((category) => (
                            <span
                                key={category}
                                className="rounded-full bg-white/10 px-4 py-2 text-sm text-white"
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                </Container>
            </section>
        </>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-sm text-slate-300">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 inline-flex rounded-xl bg-teal-100 p-3 text-primary">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-secondary">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
    );
}

function SectionHeader({
    title,
    description,
    light = false,
}: {
    title: string;
    description: string;
    light?: boolean;
}) {
    return (
        <div className="mx-auto max-w-3xl text-center">
            <h2 className={`text-3xl font-bold ${light ? "text-white" : "text-secondary"}`}>
                {title}
            </h2>
            <p className={`mt-3 text-base ${light ? "text-slate-300" : "text-slate-600"}`}>
                {description}
            </p>
        </div>
    );
}