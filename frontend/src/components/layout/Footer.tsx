import { Container } from "@/components/common/Container";

export function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <Container className="py-6 text-center text-sm text-slate-500">
                © {new Date().getFullYear()} CivicFix AI. Smart city complaint and maintenance system.
            </Container>
        </footer>
    );
}