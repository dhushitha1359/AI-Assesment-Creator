/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        veda: {
          purple: "#7C3AED",
          "purple-light": "#8B5CF6",
          "purple-dark": "#6D28D9",
          indigo: "#4F46E5",
          bg: "#0F0A1E",
          "bg-card": "#1A1232",
          "bg-input": "#150F2A",
          border: "#2D1F5E",
          "border-light": "#3D2F7E",
          text: "#E2D9F3",
          "text-muted": "#9B8EC4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-veda":
          "linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #0F0A1E 100%)",
        "gradient-card":
          "linear-gradient(135deg, #1A1232 0%, #150F2A 100%)",
      },
      boxShadow: {
        veda: "0 0 40px rgba(124, 58, 237, 0.15)",
        "veda-lg": "0 0 60px rgba(124, 58, 237, 0.25)",
        "veda-btn": "0 4px 20px rgba(124, 58, 237, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
