/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "var(--ivory)",
        "sage-soft": "var(--sage-soft)",
        sage: "var(--sage)",
        rose: "var(--rose)",
        blush: "var(--blush)",
        gold: "var(--gold)",
        "gold-text": "var(--gold-text)",
        olive: "var(--olive)",
        "olive-deep": "var(--olive-deep)",
      },
      fontFamily: {
        script: ["var(--font-script)"],
        display: ["var(--font-display)"],
        label: ["var(--font-label)"],
        body: ["var(--font-body)"],
        arabic: ["var(--font-arabic)"],
      },
      boxShadow: {
        card: "0 10px 30px -5px rgba(63, 74, 60, 0.08)",
        ring: "0 0 15px rgba(200, 169, 106, 0.35)",
      },
    },
  },
  plugins: [],
};
