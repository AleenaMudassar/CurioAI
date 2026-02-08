import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      colors: {
        primary: { 50: "#eef9ff", 100: "#d9f1ff", 200: "#bce7ff", 300: "#8ed9ff", 400: "#59c2ff", 500: "#33a6ff", 600: "#1a87f5", 700: "#146ee1", 800: "#1758b6", 900: "#194b8f", 950: "#142f57" },
        accent: { 50: "#fdf4f3", 100: "#fce7e4", 200: "#fad4ce", 300: "#f5b4aa", 400: "#ed8a7a", 500: "#e16450", 600: "#cd4834", 700: "#ac3928", 800: "#8e3325", 900: "#762f24", 950: "#40150f" },
      },
    },
  },
  plugins: [],
};
export default config;
