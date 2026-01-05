// tailwind.config.js
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography"
import aspectRatio from "@tailwindcss/aspect-ratio"

export default {
  plugins: [forms, typography, aspectRatio],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  }
}
