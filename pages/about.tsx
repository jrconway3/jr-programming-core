import Head from "next/head";

const BADGE: Record<string, string> = {
  ACTIVE: "border-emerald-400/50 bg-emerald-500/10 text-emerald-300",
  "IN PROGRESS": "border-amber-400/50 bg-amber-500/10 text-amber-300",
  PLANNED: "border-primary-accent/40 bg-primary-accent/10 text-primary-accentLight",
};

const TAG_PURPLE = "border-primary-accent/30 text-primary-accentLight";
const TAG_TEAL = "border-teal-400/30 text-teal-300";
const TAG_GREEN = "border-emerald-400/30 text-emerald-300";

function Tag({ label, color = TAG_PURPLE }: { label: string; color?: string }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${color}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-widest whitespace-nowrap flex-shrink-0 ${BADGE[status] ?? BADGE["PLANNED"]}`}>
      {status}
    </span>
  );
}

export default function About() {
  return (
    <>
      <Head>
        <title>About | JRProgramming</title>
      </Head>
      <main className="min-h-screen px-4 py-12 md:px-6">
        <section className="w-full mx-auto space-y-6">

          {/* Main terminal card */}
          <div className="terminal-card px-6 pb-0 pt-14 md:px-8">

            {/* Terminal shell block */}
            <div className="mb-6 rounded-lg border border-primary-accent/20 bg-slate-950/60 overflow-hidden">
              <div className="flex justify-between items-center px-4 py-2 border-b border-primary-accent/15">
                <span className="text-[10px] uppercase tracking-widest text-primary-accentLight/60">TERMINAL</span>
                <span className="text-[10px] uppercase tracking-widest text-primary-text/35">jrconway@portfolio:~</span>
              </div>
              <div className="p-4 font-mono text-sm leading-relaxed">
                <p>
                  <span className="text-primary-accentLight/60">jrconway@portfolio:~$</span>{" "}
                  <span className="text-primary-text/80">cat profile.json</span>
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="text-emerald-400">PROFILE</span>
                    {"  "}
                    <span className="text-primary-text/35">//</span>
                    {"  "}
                    <span className="text-primary-text/80">David Conway Jr.</span>
                  </p>
                  <p>
                    <span className="text-emerald-400">ALIAS</span>
                    {"    "}
                    <span className="text-primary-text/35">//</span>
                    {"  "}
                    <span className="text-primary-text/80">jrconway / jrconway3</span>
                  </p>
                  <p>
                    <span className="text-emerald-400">LOCATION</span>
                    {" "}
                    <span className="text-primary-text/35">//</span>
                    {"  "}
                    <span className="text-primary-text/80">Park Falls, WI</span>
                  </p>
                  <p>
                    <span className="text-emerald-400">STATUS</span>
                    {"   "}
                    <span className="text-primary-text/35">//</span>
                    {"  "}
                    <span className="text-emerald-400">●</span>
                    {" "}
                    <span className="text-emerald-300">AVAILABLE FOR WORK</span>
                  </p>
                </div>
                <p className="mt-2">
                  <span className="text-primary-accentLight/60">jrconway@portfolio:~$</span>{" "}
                  <span className="cursor-blink text-primary-text/60">_</span>
                </p>
              </div>
            </div>

            {/* About Me heading */}
            <h1 className="mb-6 text-4xl font-extrabold gradient-text animate-gradient md:text-5xl">
              About Me
            </h1>

            {/* Two-column: bio left, photo right */}
            <div className="flex flex-col gap-8 md:grid md:grid-cols-[1fr_220px] md:items-start mb-0">
              <div className="space-y-4 text-sm leading-7 text-primary-text/85">
                <p>
                  {"I'm a self-taught web developer with over 20 years of hands-on experience — starting with personal projects and eventually building production systems for real businesses. For nearly a decade I was the lead developer at TrailerCentral, where I owned and rebuilt core CRM infrastructure, automation pipelines, Twilio-based call tracking, and Chrome extension tooling from the ground up."}
                </p>
                <p>
                  {"I specialize in backend systems, API integrations, and workflow automation — the kind of work where reliability matters more than novelty. I'm now actively looking for my next role while expanding into Spring Boot and React."}
                </p>
              </div>

              {/* Photo placeholder — drop /images/headshot.jpg to replace */}
              <div className="relative overflow-hidden rounded-lg bg-slate-900/60 border border-primary-accent/20 aspect-square flex-shrink-0">
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{ backgroundImage: 'repeating-linear-gradient(rgba(168,85,247,0.08) 0px, rgba(168,85,247,0.08) 1px, transparent 1px, transparent 3px)' }}
                  aria-hidden="true"
                />
                <div className="flex flex-col items-center justify-center h-full gap-2 text-primary-text/20 z-0 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 opacity-25">
                    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[9px] uppercase tracking-widest">PROFILE_PHOTO.JPG</p>
                </div>
              </div>
            </div>

            {/* Full-width status bar */}
            <div className="-mx-6 md:-mx-8 mt-6 px-6 py-3 border-t border-primary-accent/30 bg-slate-950/40 flex items-center gap-3">
              <span className="status-led status-led--available" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">AVAILABLE</span>
              <span className="text-primary-text/30">|</span>
              <span className="text-xs text-primary-text/70">Open to backend, fullstack, and API-focused roles</span>
            </div>
          </div>

          {/* Three lower cards */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {/* Skills card */}
            <div className="terminal-card px-6 pb-8 pt-14 md:px-8">
              <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight mb-3">Primary Stack</p>
              <div className="flex flex-wrap gap-2">
                {['PHP', 'Laravel', 'JavaScript', 'MySQL', 'REST APIs', 'Next.js', 'Tailwind', 'Nuxt.js', 'WordPress'].map((t) => (
                  <Tag key={t} label={t} color={TAG_PURPLE} />
                ))}
              </div>

              <p className="mt-6 text-xs uppercase tracking-[0.35em] text-teal-400/80 mb-3">Also Worked With</p>
              <div className="flex flex-wrap gap-2">
                {['Python', 'Java (Android)', 'Ruby / Rails', 'C++', 'Zend', 'CodeIgniter', 'Prisma', 'React'].map((t) => (
                  <Tag key={t} label={t} color={TAG_TEAL} />
                ))}
              </div>

              <p className="mt-6 text-xs uppercase tracking-[0.35em] text-emerald-400/80 mb-3">Currently Learning</p>
              <div className="flex flex-wrap gap-2">
                {['Spring Boot', 'React', 'JPA / Hibernate'].map((t) => (
                  <Tag key={t} label={t} color={TAG_GREEN} />
                ))}
              </div>
            </div>

            {/* Currently Working On card */}
            <div className="terminal-card px-6 pb-8 pt-14 md:px-8">
              <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight mb-3">Currently Working On</p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "jrconway.net — portfolio redesign (this site)", status: "ACTIVE" },
                  { label: "jaidynreiman.net — sprite/game asset portfolio in Next.js", status: "ACTIVE" },
                  { label: "jrplays.net — standalone WordPress gaming blog (migrating from multisite)", status: "IN PROGRESS" },
                  { label: "JR Admin Dashboard — Spring Boot learning project with JWT auth & RBAC", status: "PLANNED" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start justify-between gap-3 leading-snug text-primary-text/80">
                    <div className="flex items-start gap-1 min-w-0">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">&gt;</span>
                      <span>{item.label}</span>
                    </div>
                    <StatusBadge status={item.status} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Find Me + Interests card */}
            <div className="terminal-card px-6 pb-8 pt-14 md:px-8">
              <p className="text-xs uppercase tracking-[0.35em] text-primary-accentLight mb-3">Find Me</p>
              <ul className="space-y-2 text-sm font-mono">
                {[
                  { href: "https://github.com/jrconway3", label: "github.com/jrconway3", note: "open source & personal work" },
                  { href: "https://linkedin.com/in/jrconway", label: "linkedin.com/in/jrconway", note: "professional history" },
                ].map((link) => (
                  <li key={link.href} className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-emerald-400">&gt;</span>
                    <a href={link.href} className="text-primary-accentLight hover:underline" target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                    <span className="text-primary-text/40 text-xs">— {link.note}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-xs uppercase tracking-[0.35em] text-primary-accentLight mb-3">Interests</p>
              <div className="flex flex-wrap gap-2">
                {['Game development', 'Open source', 'Pixel art', 'Writing', 'Mobile dev'].map((t) => (
                  <Tag key={t} label={t} color={TAG_PURPLE} />
                ))}
              </div>
            </div>
          </div>

        </section>
      </main>
    </>
  );
}
