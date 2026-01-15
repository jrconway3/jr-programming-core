import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>JRProgramming</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <section className="w-full max-w-3xl text-center py-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text animate-gradient">
              David Conway Jr.
            </h1>
            <p className="text-xl md:text-2xl text-muted mb-8">
              Web Software Engineer &amp; Programmer
            </p>
            <a
              href="#projects"
              className="hidden inline-block px-8 py-3 rounded-lg bg-primary-accent hover:bg-primary-accentDark text-white font-semibold shadow-lg transition glass border border-accent/30"
            >
              View Projects
            </a>
        </section>

        <section id="projects" className="w-full max-w-5xl py-12">
          <h2 className="hidden text-2xl font-bold mb-6 text-accentLight">Featured Projects</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Example Project Card */}
            <div className="rounded-xl shadow-lg p-6 border border-accent/30 hover:scale-105 hover:shadow-accent transition glass">
              <h3 className="text-xl font-semibold text-accent mb-2">JRProgramming Website</h3>
              <p className="text-muted mb-4">
                  I created this website as a proof of concept to showcase I could create a ReactJS using modern frameworks. I have worked with Nuxt.js before but never had the opportunity to work with React until now.
              </p>
              <a
                href="https://github.com/jrconway3/jr-programming-core"
                className="text-accentLight hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub &rarr;
              </a>
            </div>
            {/* Add more project cards as needed */}
          </div>
        </section>
      </main>
    </>
  );
}