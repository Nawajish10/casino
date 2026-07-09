import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ProviderGateway } from '../provider/provider.gateway';
import { GameLogRepository, TransactionFilters } from './game-log.repository';

export interface ProviderGameLog {
  history_id?: string | number;
  id?: string | number;
  txn_id: string;
  user_code?: string;
  provider_code?: string;
  game_code?: string;
  game_type?: string;
  txn_type?: string;
  transaction_type?: string;
  bet_amount?: string | number;
  win_amount?: string | number;
  user_start_balance?: string | number;
  user_end_balance?: string | number;
  created_at?: string;
  createdAt?: string;
}

@Injectable()
export class GameLogService {
  private readonly logger = new Logger(GameLogService.name);
  private schedulerRunning = false;
  constructor(private readonly gateway: ProviderGateway, private readonly repository: GameLogRepository, private readonly prisma: PrismaService) {}

  private async retry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
    try { return await operation(); } catch (error) {
      if (attempts <= 1) throw error;
      await new Promise(resolve => setTimeout(resolve, (4 - attempts) * 500));
      return this.retry(operation, attempts - 1);
    }
  }

  private decimal(value: unknown) { return new Prisma.Decimal(String(value ?? 0)); }
  private map(txn: ProviderGameLog, userId: string, userCode: string): Prisma.GameTransactionUncheckedCreateInput {
    if (!txn.txn_id) throw new Error('Provider transaction is missing txn_id');
    const createdAt = new Date(txn.created_at ?? txn.createdAt ?? Date.now());
    if (Number.isNaN(createdAt.getTime())) throw new Error(`Invalid transaction date for ${txn.txn_id}`);
    return {
      historyId: BigInt(txn.history_id ?? txn.id ?? 0), transactionId: String(txn.txn_id), userId,
      userCode: String(txn.user_code ?? userCode), providerCode: String(txn.provider_code ?? 'UNKNOWN'),
      gameCode: String(txn.game_code ?? 'UNKNOWN'), gameType: String(txn.game_type ?? 'UNKNOWN'),
      transactionType: String(txn.transaction_type ?? txn.txn_type ?? 'BET'),
      betAmount: this.decimal(txn.bet_amount), winAmount: this.decimal(txn.win_amount),
      userStartBalance: this.decimal(txn.user_start_balance), userEndBalance: this.decimal(txn.user_end_balance), createdAt,
    };
  }

  async syncUser(userId: string, options: { userCode?: string; gameType?: string; start?: Date; end?: Date } = {}) {
    const userCode = options.userCode ?? userId;
    const end = options.end ?? new Date();
    const latest = await this.repository.latestForUser(userId);
    const start = options.start ?? latest?.createdAt ?? new Date(end.getTime() - 24 * 60 * 60 * 1000);
    let page = 1, synced = 0, hasMore = true;
    while (hasMore && page <= 100) {
      const result = await this.retry(() => this.gateway.getGameLog(userCode, options.gameType, start.toISOString(), end.toISOString(), page));
      for (const txn of result.transactions) { await this.repository.upsert(txn.txn_id, this.map(txn, userId, userCode)); synced++; }
      hasMore = result.hasMore; page++;
    }
    const latestTxn = await this.repository.latestForUser(userId);
    if (latestTxn) await this.reconcile(userId, latestTxn.userEndBalance);
    return { synced, start, end };
  }

  private async reconcile(userId: string, providerEndingBalance: Prisma.Decimal) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return;
    if (!wallet.balance.equals(providerEndingBalance)) {
      await this.prisma.$transaction([
        this.prisma.wallet.update({ where: { userId }, data: { balance: providerEndingBalance } }),
        this.prisma.auditLog.create({ data: { adminUser: 'SYSTEM_GAME_LOG', action: 'BALANCE_MISMATCH', entityId: userId, previousValue: { balance: wallet.balance.toString() }, newValue: { balance: providerEndingBalance.toString() } } }),
      ]);
    }
  }

  findMine(userId: string, filters: TransactionFilters) { return this.repository.find(userId, filters); }
  findUser(userId: string, filters: TransactionFilters) { return this.repository.find(userId, filters); }

  @Cron('*/5 * * * *')
  async scheduledSync() {
    if (this.schedulerRunning) return;
    this.schedulerRunning = true;
    try {
      const users = await this.prisma.user.findMany({ select: { id: true } });
      for (const user of users) {
        try { await this.syncUser(user.id); } catch (error: any) { this.logger.error(`Game log sync failed for ${user.id}: ${error.message}`); }
      }
    } finally { this.schedulerRunning = false; }
  }
}
