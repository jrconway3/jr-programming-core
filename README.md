# JRProgramming — Next.js Starter

[![License: MIT](https://img.shields.io/github/license/jrconway3/jr-programming-core)](./LICENSE)

A minimal Next.js starter scaffold.

Getting started (PowerShell):

```powershell
cd e:\code\websites\jrprogramming
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

Next steps:
- Add TypeScript (`npx create-next-app@latest --ts`) or convert files.
- Add Tailwind if you want utility-first CSS.

Tailwind is included in this scaffold. After `npm install` the Tailwind CLI runs via PostCSS automatically when you run the Next.js dev server.

Tailwind plugins included in this scaffold:

- `@tailwindcss/forms` — better default form control styles.
- `@tailwindcss/typography` — the `prose` class for readable article content.
- `@tailwindcss/aspect-ratio` — utilities for maintaining media aspect ratios.
- `@tailwindcss/line-clamp` — utilities like `line-clamp-3` to truncate text.

Examples are included on the homepage (`pages/index.js`) showing `prose`, `line-clamp`, and a simple form.

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
