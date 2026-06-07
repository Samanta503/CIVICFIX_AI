import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/lib/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#0F766E",
                secondary: "#0F172A",
                accent: "#F59E0B",
                danger: "#DC2626",
                success: "#16A34A",
                muted: "#64748B",
            },
        },
    },
    plugins: [],
};

export default config;