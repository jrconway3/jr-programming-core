import { NextApiRequest, NextApiResponse } from 'next';
import { sendApiError, sendApiSuccess } from 'app/helpers/response';
import { ProjectResponse } from 'app/transformers';
import { getProjectById } from 'app/repositories/projects';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProjectResponse>) {
  if (req.method === 'GET') {
    const id = parseInt(req.query.id as string, 10);
    if (isNaN(id)) {
      return sendApiError(res, 400, 'Invalid project id');
    }
    try {
      const project = await getProjectById(id);
      if (!project) return sendApiError(res, 404, 'Project not found');
      return sendApiSuccess(res, 200, project);
    } catch (error) {
      console.error('GET /api/projects/[id] failed', error);
      return sendApiError(res, 500, 'Failed to fetch project');
    }
  } else {
    return sendApiError(res, 405, 'Method not allowed');
  }
}
