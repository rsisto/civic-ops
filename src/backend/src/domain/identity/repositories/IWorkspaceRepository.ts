import type { Workspace } from '../Workspace';
import type { Role } from '../Role';

export type WorkspaceMembership = {
  workspace: Workspace;
  workspaceId: string;
  role: Role;
};

export interface IWorkspaceRepository {
  findBySlug(slug: string): Promise<Workspace | null>;
  createWithOwner(workspace: Workspace, ownerId: string): Promise<Workspace>;
  findPrimaryMembership(userId: string): Promise<WorkspaceMembership | null>;
  findMembership(userId: string, workspaceId: string): Promise<WorkspaceMembership | null>;
}
