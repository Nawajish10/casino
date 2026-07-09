import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class GameSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Record<string, any>) {
    return this.prisma.$transaction(async (tx: any) => tx.gameSession.create({ data }));
  }
}
