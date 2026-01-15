import Head from "next/head";

export default function About() {
  return (
    <>
      <Head>
        <title>About | JRProgramming</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <section className="w-full max-w-2xl text-center py-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text animate-gradient">
                About Me
            </h1>
            <p className="text-lg md:text-xl text-primary-muted mb-8">
                My name is David Conway Jr. I'm a self-taught web developer who has been building websites both personally and professionally for over twenty years.
            </p>
        </section>

        <section id="projects" className="w-full max-w-5xl py-12">
            <div className="grid md:grid-cols-3 gap-6 text-left text-primary-text">
              <div className="terminal-card p-4">
                <h3 className="text-xl font-semibold text-accent mb-2">Specialties</h3>
                <p className="text-muted mb-4">PHP, Javascript, Nuxt.js, AJAX, MySQL, RESTful APIs, Laravel, Wordpres</p>
              </div>
              <div className="terminal-card p-4">
                <h3 className="text-xl font-semibold text-accent mb-2">Other Skills</h3>
                <p className="text-muted mb-4">ReactJS, Tailwind CSS, Python, Ruby, Java, C++</p>
              </div>
              <div className="terminal-card p-4">
                <h3 className="text-xl font-semibold text-accent mb-2">Interests</h3>
                <p className="text-muted mb-4">Mobile App Development, Game Development, Open Source Contribution, Writing</p>
              </div>
            </div>
        </section>
      </main>
    </>
  );
}
