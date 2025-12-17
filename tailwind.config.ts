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
        // Primary teal: #309898
        teal: {
          50: "#e6f5f5",
          100: "#ccebeb",
          200: "#99d7d7",
          300: "#66c3c3",
          400: "#309898",
          500: "#2a8585",
          600: "#247272",
          700: "#1e5f5f",
          800: "#184c4c",
          900: "#123939",
        },
        // Accent orange: #FF9F00
        amber: {
          50: "#fff8e6",
          100: "#ffefcc",
          200: "#ffdf99",
          300: "#ffcf66",
          400: "#FF9F00",
          500: "#e68f00",
          600: "#cc7f00",
          700: "#b36f00",
          800: "#995f00",
          900: "#804f00",
        },
        // Warning/CTA orange: #F4631E
        orange: {
          50: "#fef0e9",
          100: "#fde1d3",
          200: "#fbc3a7",
          300: "#f9a57b",
          400: "#F4631E",
          500: "#dc591b",
          600: "#c44f18",
          700: "#ac4515",
          800: "#943b12",
          900: "#7c310f",
        },
        // Danger red: #CB0404
        red: {
          50: "#fce8e8",
          100: "#f9d1d1",
          200: "#f3a3a3",
          300: "#ed7575",
          400: "#CB0404",
          500: "#b60404",
          600: "#a10303",
          700: "#8c0303",
          800: "#770202",
          900: "#620202",
        },
      },
    },
  },
  plugins: [],
};

export default config;
