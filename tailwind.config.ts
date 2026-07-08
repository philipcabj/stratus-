import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F3F5F8",
        card: "#FFFFFF",
        ink: "#0E1B2C",
        "ink-soft": "#5A6B80",
        line: "#E3E8EF",
        accent: "#0E9BB5",
        "accent-soft": "#E3F4F8",
        ok: "#1F9D6B",
        warn: "#D9822B",
        bad: "#C0392B",
        sidebar: "#0E1B2C",
        aws: "#F59E0B",
        azure: "#0078D4",
        gcp: "#34A853",
        oci: "#C74634",
      },
      fontFamily: {
        archivo: ["var(--font-archivo)", "sans-serif"],
        "plex-sans": ["var(--font-plex-sans)", "sans-serif"],
        "plex-mono": ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
