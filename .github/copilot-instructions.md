# Copilot Instructions for JRProgramming Next.js Project

## Project Overview
- **Framework:** Next.js (TypeScript, React)
- **Styling:** Tailwind CSS (with plugins: forms, typography, aspect-ratio, line-clamp)
- **Database:** Prisma ORM (MySQL/MariaDB)
- **API:** Next.js API routes (see `pages/api/`)
- **Component Directory:** `components/`
- **Prisma Schema:** `prisma/schema.prisma`

## Developer Workflows
- **Install dependencies:**
  ```powershell
  npm install
  ```
- **Start development server:**
  ```powershell
  npm run dev
  ```
- **Build for production:**
  ```powershell
  npm run build
  ```
- **Lint code:**
  ```powershell
  npm run lint
  npm run lint:fix
  ```
- **Prisma migrations:**
  After editing `prisma/schema.prisma`, run:
  ```powershell
  npx prisma migrate dev --name <migration-name>
  ```

## Key Patterns & Conventions
- **Pages:** All routes are in `pages/`. API endpoints are in `pages/api/`.
- **Components:** Shared React components live in `components/`.
- **Layouts:** Use `components/layouts.tsx` for page layouts.
- **Styling:** Use Tailwind utility classes. Global styles in `styles/globals.css`.
- **Prisma Client:** Import and use Prisma Client in API routes for DB access.
- **TypeScript:** All new files should use `.ts`/`.tsx` extensions.
- **Environment Variables:** Use `.env` for secrets/config (not committed).

## Integration Points
- **Prisma:**
  - Schema: `prisma/schema.prisma`
  - Client: `@prisma/client` (import in API routes)
- **Tailwind:**
  - Config: `tailwind.config.js`, `postcss.config.js`
  - Plugins: See `package.json` devDependencies
- **Next.js:**
  - Custom App: `pages/_app.tsx`
  - Static assets: `public/`

## Examples
- See `pages/index.tsx` for Tailwind usage and component examples.
- See `pages/api/posts.ts` for API route and Prisma usage.

---

**For AI agents:**
- Follow the above conventions for new code.
- Reference existing files for patterns before introducing new ones.
- Use Prisma Client for all DB access; do not use raw SQL.
- Prefer functional React components.
- Keep styles in Tailwind, not separate CSS files.
- Ask for clarification if project-specific patterns are unclear.
