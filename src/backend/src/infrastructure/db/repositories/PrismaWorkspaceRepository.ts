import type { PrismaClient } from '@prisma/client';
import { Role as PrismaRole } from '@prisma/client';
import { Workspace } from '../../../domain/identity/Workspace';
import { Role } from '../../../domain/identity/Role';
import type { IWorkspaceRepository, WorkspaceMembership } from '../../../domain/identity/repositories/IWorkspaceRepository';

function toDomainRole(prismaRole: PrismaRole): Role {
  return prismaRole as unknown as Role;
}

export class PrismaWorkspaceRepository implements IWorkspaceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySlug(slug: string): Promise<Workspace | null> {
    const record = await this.prisma.workspace.findUnique({ where: { slug } });
    if (!record) return null;
    return new Workspace({ id: record.id, name: record.name, slug: record.slug });
  }

  async createWithOwner(workspace: Workspace, ownerId: string): Promise<Workspace> {
    const record = await this.prisma.workspace.create({
      data: {
        name: workspace.name,
        slug: workspace.slug,
        members: {
          create: { userId: ownerId, role: PrismaRole.ADMIN },
        },
      },
    });
    return new Workspace({ id: record.id, name: record.name, slug: record.slug });
  }

  async findPrimaryMembership(userId: string): Promise<WorkspaceMembership | null> {
    const record = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      include: { workspace: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!record) return null;
    return {
      workspace: new Workspace({ id: record.workspace.id, name: record.workspace.name, slug: record.workspace.slug }),
      workspaceId: record.workspaceId,
      role: toDomainRole(record.role),
    };
  }

  async findMembership(userId: string, workspaceId: string): Promise<WorkspaceMembership | null> {
    const record = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      include: { workspace: true },
    });
    if (!record) return null;
    return {
      workspace: new Workspace({ id: record.workspace.id, name: record.workspace.name, slug: record.workspace.slug }),
      workspaceId: record.workspaceId,
      role: toDomainRole(record.role),
    };
  }
}
