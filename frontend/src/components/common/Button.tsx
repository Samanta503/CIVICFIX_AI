import Link from "next/link";

type ButtonProps = {
    children: React.ReactNode;
    href?: string;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "outline";
    className?: string;
};

export function Button({
    children,
    href,
    type = "button",
    variant = "primary",
    className = "",
}: ButtonProps) {
    const baseClasses =
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition";

    const variants = {
        primary: "bg-primary text-white hover:bg-teal-800",
        secondary: "bg-secondary text-white hover:bg-slate-800",
        outline: "border border-primary text-primary hover:bg-primary hover:text-white",
    };

    const classes = `${baseClasses} ${variants[variant]} ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} className={classes}>
            {children}
        </button>
    );
}