import { User } from '../../domain/identity/User';
import { Workspace } from '../../domain/identity/Workspace';
import { Role } from '../../domain/identity/Role';
import { EmailAlreadyExistsError, InvalidCredentialsError, InvalidTokenError } from '../../domain/identity/errors';
import type { IUserRepository } from '../../domain/identity/repositories/IUserRepository';
import type { IWorkspaceRepository } from '../../domain/identity/repositories/IWorkspaceRepository';
import type { JwtService } from '../../infrastructure/auth/JwtService';
import type { PasswordService } from '../../infrastructure/auth/PasswordService';
import type { SignupInput, LoginInput, AuthResult, MeResult } from './dto';

function shortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export class AuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly workspaceRepo: IWorkspaceRepository,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async signup(input: SignupInput): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new EmailAlreadyExistsError();

    const passwordHash = await this.passwordService.hash(input.password);
    const user = new User({ email: input.email, name: input.name, passwordHash });
    const savedUser = await this.userRepo.save(user);
    if (!savedUser.id) throw new Error('User ID missing after save');

    const workspaceName = input.workspaceName ?? `${input.name}'s workspace`;
    const baseSlug = Workspace.generateSlug(workspaceName);

    const slugTaken = await this.workspaceRepo.findBySlug(baseSlug);
    const slug = slugTaken ? `${baseSlug}-${shortId()}` : baseSlug;

    const workspace = new Workspace({ name: workspaceName, slug });
    const savedWorkspace = await this.workspaceRepo.createWithOwner(workspace, savedUser.id);
    if (!savedWorkspace.id) throw new Error('Workspace ID missing after save');

    const tokens = this.jwtService.signPair({
      userId: savedUser.id,
      workspaceId: savedWorkspace.id,
      role: Role.ADMIN,
    });

    return {
      user: { id: savedUser.id, email: savedUser.email, name: savedUser.name },
      workspace: { id: savedWorkspace.id, name: savedWorkspace.name, slug: savedWorkspace.slug },
      tokens,
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) throw new InvalidCredentialsError();

    const isValid = await this.passwordService.compare(input.password, user.passwordHash);
    if (!isValid) throw new InvalidCredentialsError();

    const membership = await this.workspaceRepo.findPrimaryMembership(user.id ?? '');
    if (!membership) throw new InvalidCredentialsError();
    if (!user.id) throw new InvalidCredentialsError();

    const tokens = this.jwtService.signPair({
      userId: user.id,
      workspaceId: membership.workspaceId,
      role: membership.role,
    });

    if (!membership.workspace.id) throw new InvalidCredentialsError();

    return {
      user: { id: user.id, email: user.email, name: user.name },
      workspace: {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
      },
      tokens,
    };
  }

  refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verifyRefresh(refreshToken);
      const accessToken = this.jwtService.signAccess({
        userId: payload.sub,
        workspaceId: payload.workspaceId,
        role: payload.role as Role,
      });
      return Promise.resolve({ accessToken });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getMe(userId: string, workspaceId: string): Promise<MeResult> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new InvalidTokenError();
    if (!user.id) throw new InvalidTokenError();

    const membership = await this.workspaceRepo.findMembership(userId, workspaceId);
    if (!membership) throw new InvalidTokenError();
    if (!membership.workspace.id) throw new InvalidTokenError();

    return {
      user: { id: user.id, email: user.email, name: user.name },
      workspace: {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
      },
      role: membership.role,
    };
  }
}
