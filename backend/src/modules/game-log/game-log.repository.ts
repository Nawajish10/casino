import { Injectable } from '@nestjs/common';
import { Prisma, GameTransaction } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

export interface TransactionFilters { page: number; limit: number; start?: Date; end?: Date }

@Injectable()
export class GameLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsert(transactionId: string, data: Prisma.GameTransactionUncheckedCreateInput) {
    return this.prisma.gameTransaction.upsert({ where: { transactionId }, create: data, update: { ...data, id: undefined, syncedAt: new Date() } });
  }

  async find(userId: string | undefined, filters: TransactionFilters) {
    const where: Prisma.GameTransactionWhereInput = {
      ...(userId ? { userId } : {}),
      ...((filters.start || filters.end) ? { createdAt: { ...(filters.start ? { gte: filters.start } : {}), ...(filters.end ? { lte: filters.end } : {}) } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.gameTransaction.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (filters.page - 1) * filters.limit, take: filters.limit }),
      this.prisma.gameTransaction.count({ where }),
    ]);
    const games = await this.prisma.game.findMany({
      where: { gameCode: { in: [...new Set(items.map(item => item.gameCode))] } },
      select: { gameCode: true, gameName: true, thumbnail: true },
    });
    const gameByCode = new Map(games.map(game => [game.gameCode, game]));
    return {
      items: items.map(item => ({ ...item, gameName: gameByCode.get(item.gameCode)?.gameName ?? item.gameCode, gameImage: gameByCode.get(item.gameCode)?.thumbnail ?? null })),
      total, page: filters.page, limit: filters.limit, pages: Math.ceil(total / filters.limit),
    };
  }

  latestForUser(userId: string): Promise<GameTransaction | null> {
    return this.prisma.gameTransaction.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}
