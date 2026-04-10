import { prisma } from '../prismaClient';

describe('prismaClient', () => {
  it('exports a prisma client instance', () => {
    expect(prisma).toBeDefined();
  });

  it('exposes the expected model accessors for Sprint 1 schema', () => {
    expect(prisma.user).toBeDefined();
    expect(prisma.workspace).toBeDefined();
    expect(prisma.workspaceMember).toBeDefined();
    expect(prisma.meeting).toBeDefined();
    expect(prisma.meetingNote).toBeDefined();
    expect(prisma.meetingSummary).toBeDefined();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
