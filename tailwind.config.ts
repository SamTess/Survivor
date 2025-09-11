import type { Config } from "tailwindcss"
import typography from "@tailwindcss/typography"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        heading: ['var(--font-heading)', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [typography],
}

export default config;
