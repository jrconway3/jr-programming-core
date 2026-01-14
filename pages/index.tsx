import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>JRProgramming</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <section className="w-full max-w-3xl text-center py-20">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-accent via-accentLight to-accentDark text-transparent bg-clip-text animate-gradient">
            David Conway Jr.
          </h1>
          <p className="text-xl md:text-2xl text-muted mb-8">
            Web Software Engineer &amp; Programmer
          </p>
          <a
            href="#projects"
            className="inline-block px-8 py-3 rounded-lg bg-accent hover:bg-accentDark text-white font-semibold shadow-lg transition"
          >
            View Projects
          </a>
        </section>

        <section id="projects" className="w-full max-w-5xl py-12">
          <h2 className="text-2xl font-bold mb-6 text-accentLight">Featured Projects</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Example Project Card */}
            <div className="bg-[#181e34] rounded-xl shadow-lg p-6 border border-accent/30 hover:scale-105 hover:shadow-accent transition">
              <h3 className="text-xl font-semibold text-accent mb-2">Project Name</h3>
              <p className="text-muted mb-4">
                Brief description of your project goes here. Highlight tech and your role.
              </p>
              <a
                href="#"
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