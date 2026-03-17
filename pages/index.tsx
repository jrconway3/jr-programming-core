import Head from "next/head";
import { useProjects } from "../models/projects";
import { useSettings } from "../components/SettingsContext";

const { projects, loading, error } = useProjects();
const { settings, isLoaded } = useSettings();
export default function Home() {
  return (
    <>
      <Head>
        <title>JRProgramming</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <section className="w-full max-w-3xl text-center py-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text animate-gradient">
            {isLoaded ? (settings["/home/banner/title"] || "David Conway Jr.") : "..."}
          </h1>
          <p className="text-xl md:text-2xl text-muted mb-8 neon-text">
            {isLoaded ? (settings["/home/banner/subtitle"] || "Web Software Engineer & Programmer") : "..."}
          </p>
          <a
            href="#projects"
            className="hidden inline-block px-8 py-3 rounded-lg bg-primary-accent hover:bg-primary-accentDark text-white font-semibold shadow-lg transition glass border border-accent/30"
          >
            View Projects
          </a>
        </section>

        <section id="projects" className="w-full max-w-5xl py-12">
          <h2 className="hidden text-2xl font-bold mb-6 text-primary-accentLight">Featured Projects</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {loading && <div>Loading projects...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && projects.length === 0 && (
              <div>No projects found.</div>
            )}
            {!loading && !error && projects.map((project) => (
              <div key={project.id} className="terminal-card p-6 hover:scale-105 hover:shadow-accent transition">
                <h3 className="text-xl font-semibold text-accent mb-2">{project.name}</h3>
                <p className="text-muted mb-4">{project.short}</p>
                {/* Add more fields as needed */}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}