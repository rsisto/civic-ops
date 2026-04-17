declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      workspaceId: string;
      role: string;
    };
  }
}
