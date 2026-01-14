// tailwind.config.js
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography"
import aspectRatio from "@tailwindcss/aspect-ratio"
import lineClamp from "@tailwindcss/line-clamp"

export default {
  plugins: [forms, typography, aspectRatio, lineClamp],
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          background: "#0f172a",
          accent: "#a855f7",
          accentDark: "#6d28d9",
          accentLight: "#c084fc",
          text: "#f1f5f9",
          muted: "#64748b"
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  }
}
