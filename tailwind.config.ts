import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        foreground: "#ffffff",
        card: {
          DEFAULT: "#181818",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#181818",
          foreground: "#ffffff",
        },
        primary: {
          DEFAULT: "#ffdd33",
          foreground: "#0f0f0f",
        },
        secondary: {
          DEFAULT: "#242424",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1e1e1e",
          foreground: "#b3b3b3",
        },
        accent: {
          DEFAULT: "#ffdd33",
          foreground: "#0f0f0f",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#2a2a2a",
        input: "#242424",
        ring: "rgba(255,221,51,0.35)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "calc(0.75rem - 2px)",
        sm: "calc(0.75rem - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
