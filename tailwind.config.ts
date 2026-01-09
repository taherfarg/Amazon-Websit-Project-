import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "gradient-mesh": "radial-gradient(at 40% 20%, hsla(228, 100%, 50%, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(310, 100%, 50%, 0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(189, 100%, 56%, 0.2) 0px, transparent 50%)",
            },
            colors: {
                primary: "#6366f1",
                secondary: "#ec4899",
                accent: "#22d3ee",
                dark: "#0f172a",
                "dark-lighter": "#1e293b",
            },
            animation: {
                'shimmer': 'shimmer 2s infinite',
                'float': 'float 3s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'gradient-shift': 'gradient-shift 5s ease infinite',
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
                'spin-slow': 'spin-slow 20s linear infinite',
                'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.05)' },
                },
                'gradient-shift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'spin-slow': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                'bounce-gentle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
            boxShadow: {
                'glow-primary': '0 0 20px rgba(99, 102, 241, 0.3)',
                'glow-secondary': '0 0 20px rgba(236, 72, 153, 0.3)',
                'glow-accent': '0 0 20px rgba(34, 211, 238, 0.3)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
