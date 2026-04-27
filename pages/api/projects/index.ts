import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'prisma/adapter';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';
import { transformProjects } from 'app/transformers/projects';

type ProjectsResponse = ApiEnvelope<ReturnType<typeof transformProjects>>;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProjectsResponse>) {
  if (req.method === 'GET') {
    try {
      const shortcode = typeof req.query.shortcode === 'string' ? req.query.shortcode : undefined;
      const sortByDate = req.query.sort === 'date';
      const projects = await prisma.project.findMany({
        where: shortcode
          ? { categories: { some: { category: { shortcode } } } }
          : undefined,
        include: {
          job: {
            take: 1,
            orderBy: { priority: 'asc' },
            include: {
              job: {
                include: {
                  company: true,
                  roles: {
                    orderBy: [
                      { priority: 'asc' },
                      { start_date: 'asc' },
                    ],
                  },
                  impacts: {
                    orderBy: { priority: 'asc' },
                  },
                },
              },
            },
          },
          skills: {
            include: {
              skill: true,
            },
            orderBy: { priority: 'asc' },
          },
          categories: {
            include: {
              category: true,
            },
            orderBy: { priority: 'asc' },
          },
        },
        orderBy: sortByDate
          ? [
              { end_date: { sort: 'desc', nulls: 'first' } },
              { start_date: 'asc' },
            ]
          : undefined,
      });
      return sendApiSuccess(res, 200, transformProjects(projects));
    } catch (error) {
      console.error('GET /api/projects failed', error);
      return sendApiError(res, 500, 'Failed to fetch projects');
    }
  } else {
    return sendApiError(res, 405, 'Method not allowed');
  }
}
