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

type ProjectResponse = ApiEnvelope<{
  project?: ReturnType<typeof serializeAdminProject>;
  success?: boolean;
}>;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProjectResponse>) {
  if (!requireAdminApi(req, res)) {
    return;
  }

  const rawId = req.query.id;

  if (typeof rawId !== 'string' || !/^\d+$/.test(rawId)) {
    return sendApiError(res, 400, 'Invalid project id.');
  }

  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id)) {
    return sendApiError(res, 400, 'Invalid project id.');
  }

  if (req.method === 'PUT') {
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
        await tx.project.update({
          where: { id },
          data: {
            name: data.name,
            shortcode: data.shortcode,
            short: data.short,
            role: data.role,
            position: data.position,
            extended: data.extended,
            start_date: data.start_date,
            end_date: data.end_date,
            updated_at: new Date(),
          },
        });

        await tx.projectGallery.deleteMany({
          where: { project_id: id },
        });

        await tx.projectCategory.deleteMany({
          where: { project_id: id },
        });

        await tx.projectLink.deleteMany({
          where: { project_id: id },
        });

        await tx.jobProjectRelation.deleteMany({
          where: { project_id: id },
        });

        const resolvedJobId = await resolveJobIdForAssignment(tx, data.job_assignment);

        if (resolvedJobId != null && data.job_assignment) {
          await tx.jobProjectRelation.create({
            data: {
              job_id: resolvedJobId,
              project_id: id,
              relation_type: data.job_assignment.relation_type,
              priority: data.job_assignment.relation_priority,
            },
          });
        }

        return tx.project.update({
          where: { id },
          data: {
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
            updated_at: new Date(),
          },
          include: adminProjectInclude,
        });
      });

      return sendApiSuccess(res, 200, { project: serializeAdminProject(project) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return sendApiError(res, 404, 'Project not found.');
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return sendApiError(res, 400, 'Unable to update project with the submitted data.');
      }

      console.error('PUT /api/admin/projects/[id] failed', error);
      return sendApiError(res, 500, 'Failed to update project.');
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.projectGallery.deleteMany({
          where: { project_id: id },
        });

        await tx.projectCategory.deleteMany({
          where: { project_id: id },
        });

        await tx.projectSkill.deleteMany({
          where: { project_id: id },
        });

        await tx.projectLink.deleteMany({
          where: { project_id: id },
        });

        await tx.project.delete({
          where: { id },
        });
      });

      return sendApiSuccess(res, 200, { success: true });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return sendApiError(res, 404, 'Project not found.');
      }

      console.error('DELETE /api/admin/projects/[id] failed', error);
      return sendApiError(res, 500, 'Failed to delete project.');
    }
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return sendApiError(res, 405, 'Method not allowed');
}
