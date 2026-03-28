/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF6E13",
        "primary-hover": "#E65C0A",
        "primary-muted": "#FFF0E6",
        "text-main": "#2D241E",
        "text-muted": "#7A6F69",
        border: "#EBE5DB",
        surface: "#FFFFFF",
        "surface-2": "#F5F2EB",
        bg: "#FDFBF7",
        success: "#2E7D32",
        warning: "#B34700",
        danger: "#C62828",
      },
      fontFamily: {
        cabinet: ["Cabinet Grotesk", "sans-serif"],
        sans: ["Work Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
