/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "sky-blue": "#15a9e3",
        "accent-orange": "rgb(237, 86, 33)",
        "sunset-orange": "#F2971F",
        "deep-sea-blue": "#184363",
        "fresh-green": "#39CB74",
        "light-mist": "#EDF4F6",
        "soft-lavender": "#F6F5FA",
        "neutral-gray": "#9a9a9a",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        customSize: "15px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
