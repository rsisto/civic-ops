export type SignupInput = {
  email: string;
  name: string;
  password: string;
  workspaceName?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type UserDto = {
  id: string;
  email: string;
  name: string;
};

export type WorkspaceDto = {
  id: string;
  name: string;
  slug: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: UserDto;
  workspace: WorkspaceDto;
  tokens: TokenPair;
};

export type MeResult = {
  user: UserDto;
  workspace: WorkspaceDto;
  role: string;
};
