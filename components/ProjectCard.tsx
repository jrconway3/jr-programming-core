import Link from "next/link";
import { Project } from "models/projects";

interface Props {
  project: Project;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Present";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default function ProjectCategoryPage({ project }: Props) {
  return (
    <>
        <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="terminal-card p-6 hover:scale-105 hover:shadow-accent transition block"
        >
            <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="text-xl font-semibold text-accent">{project.name}</h3>
            {(project.start_date || project.end_date !== undefined) && (
                <span className="text-xs text-muted whitespace-nowrap pt-1">
                {formatDate(project.start_date)}
                {" – "}
                {formatDate(project.end_date)}
                </span>
            )}
            </div>
            {project.role && (
            <p className="text-sm text-primary-accentLight mb-2">{project.role}</p>
            )}
            <p className="text-muted text-sm">{project.short}</p>
        </Link>
    </>
  );
}