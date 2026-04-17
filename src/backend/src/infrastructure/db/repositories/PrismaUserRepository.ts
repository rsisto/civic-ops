import type { PrismaClient } from '@prisma/client';
import { User } from '../../../domain/identity/User';
import type { IUserRepository } from '../../../domain/identity/repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    if (!record) return null;
    return new User({ id: record.id, email: record.email, name: record.name, passwordHash: record.passwordHash });
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) return null;
    return new User({ id: record.id, email: record.email, name: record.name, passwordHash: record.passwordHash });
  }

  async save(user: User): Promise<User> {
    const record = await this.prisma.user.create({
      data: { email: user.email, name: user.name, passwordHash: user.passwordHash },
    });
    return new User({ id: record.id, email: record.email, name: record.name, passwordHash: record.passwordHash });
  }
}
