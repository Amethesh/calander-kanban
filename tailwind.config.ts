// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "background-gradient":
          "linear-gradient(135deg, #f6f8ff 0%, #eef1f9 100%)",
        "header-gradient": "linear-gradient(to right, #3b82f6, #8b5cf6)",
        "active-gradient": "linear-gradient(135deg, #4f46e5, #7c3aed)",
      },
      colors: {
        // Optional: Define named colors if you prefer using them directly
        "brand-start": "#3b82f6",
        "brand-end": "#8b5cf6",
        "active-start": "#4f46e5",
        "active-end": "#7c3aed",
      },
    },
  },
  plugins: [],
};
export default config;
