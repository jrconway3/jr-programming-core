import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../prisma/adapter';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';
import { transformProject } from 'app/transformers/projects';

type ProjectResponse = ApiEnvelope<ReturnType<typeof transformProject>>;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProjectResponse>) {
  if (req.method === 'GET') {
    const id = parseInt(req.query.id as string, 10);
    if (isNaN(id)) {
      return sendApiError(res, 400, 'Invalid project id');
    }
    try {
      const project = await prisma.project.findUnique({
        where: { id },
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
          links: { orderBy: { priority: 'asc' } },
          gallery: { orderBy: { priority: 'asc' } },
          skills: {
            include: { skill: true },
            orderBy: { priority: 'asc' },
          },
          categories: {
            include: { category: true },
            orderBy: { priority: 'asc' },
          },
        },
      });
      if (!project) return sendApiError(res, 404, 'Project not found');
      return sendApiSuccess(res, 200, transformProject(project));
    } catch (error) {
      console.error('GET /api/projects/[id] failed', error);
      return sendApiError(res, 500, 'Failed to fetch project');
    }
  } else {
    return sendApiError(res, 405, 'Method not allowed');
  }
}
