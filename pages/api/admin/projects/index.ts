import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { requireAdminApi } from 'app/services/admin/auth';
import { sendApiError, sendApiSuccess, type ApiEnvelope } from 'app/helpers/response';
import {
  adminProjectInclude,
  normalizeProjectPayload,
  serializeAdminProject,
} from 'app/services/admin/projects';
import { resolveJobIdForAssignment } from 'app/repositories/projects';
import { prisma } from 'prisma/adapter';

type ProjectResponse = ApiEnvelope<{ project: ReturnType<typeof serializeAdminProject> }>;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProjectResponse>) {
  if (!requireAdminApi(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendApiError(res, 405, 'Method not allowed');
  }

  const normalized = normalizeProjectPayload(req.body);

  if (!normalized.ok) {
    return sendApiError(res, 400, normalized.error);
  }

  const { data } = normalized;
  const categoryIds = data.categories.map((category) => category.category_id);

  if (categoryIds.length > 0) {
    const existingCategories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: { id: true },
    });

    if (existingCategories.length !== categoryIds.length) {
      return sendApiError(res, 400, 'One or more selected categories no longer exist.');
    }
  }

  try {
    const project = await prisma.$transaction(async (tx) => {
      const createdProject = await tx.project.create({
        data: {
          name: data.name,
          shortcode: data.shortcode,
          short: data.short,
          role: data.role,
          position: data.position,
          extended: data.extended,
          start_date: data.start_date,
          end_date: data.end_date,
          links: {
            create: data.links,
          },
          gallery: {
            create: data.gallery.map((item) => ({
              ...item,
              link_id: null,
            })),
          },
          categories: {
            create: data.categories,
          },
        },
        include: adminProjectInclude,
      });

      const resolvedJobId = await resolveJobIdForAssignment(tx, data.job_assignment);

      if (resolvedJobId != null && data.job_assignment) {
        await tx.jobProjectRelation.create({
          data: {
            job_id: resolvedJobId,
            project_id: createdProject.id,
            relation_type: data.job_assignment.relation_type,
            priority: data.job_assignment.relation_priority,
          },
        });
      }

      const projectWithRelations = await tx.project.findUnique({
        where: { id: createdProject.id },
        include: adminProjectInclude,
      });

      if (!projectWithRelations) {
        throw new Error('Created project could not be reloaded.');
      }

      return projectWithRelations;
    });

    return sendApiSuccess(res, 201, { project: serializeAdminProject(project) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return sendApiError(res, 400, 'Unable to create project with the submitted data.');
    }

    console.error('POST /api/admin/projects failed', error);
    return sendApiError(res, 500, 'Failed to create project.');
  }
}
