import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          50: "#fdf8f6",
          100: "#f2e8e5",
          200: "#eaddd7",
          300: "#d6c4b8",
          400: "#b8a089",
          500: "#8b7355",
          600: "#6b5344",
          700: "#5c4535",
          800: "#4a3728",
          900: "#3d2e22",
        },
        red: {
          DEFAULT: "#c41e3a",
          accent: "#c41e3a",
          hover: "#a31830",
          light: "#d44a5e",
        },
        white: "#ffffff",
        black: "#000000",
      },
    },
  },
  plugins: [],
};

export default config;
