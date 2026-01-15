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
            <div className="flex flex-col gap-4 text-left text-primary-text">
                <div>
                    <span className="font-semibold text-accent">Location:</span> United States (Remote)
                </div>
                <div>
                    <span className="font-semibold text-accent">Specialties:</span> PHP, Javascript, Nuxt.js, AJAX, MySQL, RESTful APIs, Laravel, Wordpress
                </div>
                <div>
                    <span className="font-semibold text-accent">Other Skills:</span> ReactJS, Tailwind CSS, Python, Ruby, Java, C++
                </div>
                <div>
                    <span className="font-semibold text-accent">Interests:</span> Mobile App Development, Game Development, Open Source Contribution, Writing
                </div>
            </div>
        </section>
      </main>
    </>
  );
}
