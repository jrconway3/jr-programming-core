import type { GetServerSideProps } from 'next';
import { getExperienceProjectByShortcodes } from 'app/repositories/projects';
import type { ProjectDetail } from 'app/models/projects';
import { ProjectDetailView } from 'components/projects/ProjectDetailView';

type Params = {
  jobShortcode: string;
  projectShortcode: string;
};

type Props = {
  project: ProjectDetail;
};

export default function ExperienceProjectPage({ project }: Props) {
  return <ProjectDetailView project={project} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const params = context.params as Params | undefined;
  const jobShortcode = params?.jobShortcode?.trim();
  const projectShortcode = params?.projectShortcode?.trim();

  if (!jobShortcode || !projectShortcode) {
    return { notFound: true };
  }

  // Validate that the nested shortcodes represent a real job-project relation.
  const validated = await getExperienceProjectByShortcodes(jobShortcode, projectShortcode);

  if (!validated) {
    return { notFound: true };
  }

  return {
    props: {
      project: validated,
    },
  };
};
