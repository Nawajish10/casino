import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { ProviderGateway } from '../provider/provider.gateway';
import { GameSessionRepository } from './game-session.repository';

@Injectable()
export class GameLaunchService {
  private readonly logger = new Logger(GameLaunchService.name);
  private readonly rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  private readonly launchLocks = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly providerGateway: ProviderGateway,
    private readonly configService: ConfigService,
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  private checkRateLimit(userId: string) {
    const now = Date.now();
    const entry = this.rateLimitMap.get(userId);

    if (!entry || entry.resetAt <= now) {
      this.rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
      return;
    }

    if (entry.count >= 10) {
      this.writeAuditLog(userId, 'RATE_LIMIT', { error: 'Too many requests' });
      throw new BadRequestException('Too many launch requests. Please wait a moment and try again.');
    }

    entry.count += 1;
  }

  private acquireLaunchLock(userId: string) {
    const now = Date.now();
    const lockedUntil = this.launchLocks.get(userId);
    if (lockedUntil && lockedUntil > now) {
      this.writeAuditLog(userId, 'LAUNCH_LOCK', { error: 'Launch already in progress' });
      throw new BadRequestException('Launch already in progress');
    }
    this.launchLocks.set(userId, now + 10_000);
  }

  private async writeAuditLog(userId: string, action: string, data: Record<string, any>, entityId?: string) {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminUser: userId,
          action,
          entityId: entityId || '',
          newValue: data,
        },
      });
    } catch (e) {
      this.logger.warn(`Failed to write audit log: ${e.message}`);
    }
  }

  private getFailureAction(error: any): string {
    const msg = String(error.message || '').toUpperCase();
    if (msg.includes('TIMEOUT') || msg.includes('ETIMEDOUT')) {
      return 'PROVIDER_TIMEOUT';
    }
    if (msg.includes('INSUFFICIENT_BALANCE') || msg.includes('BALANCE')) {
      return 'INSUFFICIENT_BALANCE';
    }
    if (msg.includes('INVALID_PROVIDER')) {
      return 'INVALID_PROVIDER';
    }
    if (msg.includes('INVALID_GAME')) {
      return 'INVALID_GAME';
    }
    if (msg.includes('INVALID_USER')) {
      return 'INVALID_USER';
    }
    if (msg.includes('EXTERNAL_ERROR')) {
      return 'EXTERNAL_ERROR';
    }
    if (msg.includes('INTERNAL_ERROR')) {
      return 'INTERNAL_ERROR';
    }
    if (msg.includes('MAINTENANCE')) {
      return 'MAINTENANCE';
    }
    return 'FAILED';
  }

  private async resolveUser(userId: string): Promise<any> {
    let user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      if (this.configService.get<string>('GAME_TEST_MODE') === 'true') {
        user = await this.prisma.user.create({
          data: {
            id: userId,
            mobile: '+1234567890',
            name: 'Development Test User',
            mobileVerified: true,
          },
        });
        // Also ensure a wallet exists for this user
        await this.prisma.wallet.upsert({
          where: { userId },
          update: {},
          create: {
            userId,
            balance: 1000,
            currency: 'USD',
          },
        }).catch(() => undefined);
      } else {
        await this.writeAuditLog(userId, 'FAILED', { error: 'User not found' });
        throw new NotFoundException('User not found');
      }
    }
    return user;
  }

  private async resolveGameOrFallback(gameCode: string): Promise<any> {
    const game = await this.prisma.game.findUnique({
      where: { gameCode },
      include: { provider: true },
    });

    if (game) {
      return game;
    }

    if (this.configService.get<string>('GAME_TEST_MODE') !== 'true') {
      return null;
    }

    const fallbackProviderCode = this.configService.get<string>('TEST_GAME_PROVIDER_CODE') || 'PRAGMATIC';
    const provider = await this.prisma.provider.findFirst({
      where: { providerCode: { equals: fallbackProviderCode, mode: 'insensitive' } },
    });

    if (!provider) {
      return null;
    }

    return {
      id: null,
      gameCode,
      gameName: `Test Game ${gameCode}`,
      provider,
      isActive: true,
      maintenanceMode: false,
      currentlyAvailable: true,
      launchReady: true,
      status: 'live',
    } as any;
  }

  private mapProviderError(error: any): never {
    const message = String(error.message || 'INTERNAL_ERROR');
    const upper = message.toUpperCase();
    let statusMessage = 'INTERNAL_ERROR';

    if (upper.includes('INVALID_PROVIDER')) {
      statusMessage = 'INVALID_PROVIDER';
    } else if (upper.includes('INVALID_GAME')) {
      statusMessage = 'INVALID_GAME';
    } else if (upper.includes('EXTERNAL_ERROR')) {
      statusMessage = 'EXTERNAL_ERROR';
    } else if (upper.includes('INTERNAL_ERROR')) {
      statusMessage = 'INTERNAL_ERROR';
    } else if (upper.includes('INSUFFICIENT_BALANCE')) {
      statusMessage = 'INSUFFICIENT_BALANCE';
    } else if (upper.includes('MAINTENANCE')) {
      statusMessage = 'MAINTENANCE';
    } else {
      statusMessage = message;
    }

    throw new HttpException(
      {
        status: 0,
        msg: statusMessage,
        detail: message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  private async retryRequest<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 750));
      return this.retryRequest(fn, retries - 1);
    }
  }

  async launchGame(userId: string, gameCode: string, options: { lang?: string; device?: string } = {}) {
    await this.writeAuditLog(userId, 'LAUNCH_REQUESTED', { gameCode, options });

    this.checkRateLimit(userId);
    this.acquireLaunchLock(userId);

    const user = await this.resolveUser(userId);

    const game = await this.resolveGameOrFallback(gameCode);

    if (!game) {
      await this.writeAuditLog(userId, 'INVALID_GAME', { gameCode });
      throw new NotFoundException('Selected game is unavailable');
    }

    if (!game.id) {
      await this.writeAuditLog(userId, 'GAME_FALLBACK', { gameCode, providerCode: game.provider?.providerCode });
    }

    await this.writeAuditLog(userId, 'GAME_VALIDATED', { gameCode, gameName: game.gameName }, game.id);

    if (!game.isActive || game.maintenanceMode || !game.currentlyAvailable || !game.launchReady || game.status?.toLowerCase() !== 'live') {
      await this.writeAuditLog(userId, 'MAINTENANCE', { gameCode }, game.id);
      throw new BadRequestException('Selected game is unavailable');
    }

    try {
      // Optimize wallet: 30s cache
      const wallet = await this.prisma.wallet.findFirst({ where: { userId } });
      const localBalance = Number(wallet?.balance ?? 0);
      const lastSynced = wallet?.updatedAt ? wallet.updatedAt.getTime() : 0;
      const needsSync = !wallet || (Date.now() - lastSynced > 30_000);

      let syncedBalance = localBalance;
      if (needsSync) {
        await this.writeAuditLog(userId, 'BALANCE_SYNC', { localBalance });
        try {
          syncedBalance = await this.walletService.syncBalance(userId);
        } catch (e) {
          if (this.configService.get<string>('GAME_LAUNCH_TEST_MODE') !== 'true') {
            throw e;
          }
          this.logger.warn(`Wallet balance sync failed in test mode: ${e.message}`);
        }
      }

      // money_info check
      await this.writeAuditLog(userId, 'PROVIDER_REQUEST', { method: 'money_info' });
      try {
        const providerUser = await this.retryRequest(() => this.providerGateway.getUserInfo(user.id));
        if (!providerUser || providerUser.status !== 1) {
          throw new Error('INVALID_PROVIDER: Provider money_info check failed');
        }
      } catch (e) {
        if (this.configService.get<string>('GAME_LAUNCH_TEST_MODE') !== 'true') {
          throw e;
        }
        this.logger.warn(`Provider money_info check failed in test mode: ${e.message}`);
      }

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      const providerCode = String(game.provider?.providerCode || '').toUpperCase();
      const resolvedGameCode = String(game.gameCode || '').trim();

      const payload = {
        method: 'game_launch',
        agent_code: this.configService.get<string>('PROVIDER_AGENT_CODE'),
        agent_token: this.configService.get<string>('PROVIDER_AGENT_TOKEN'),
        user_code: user.id,
        provider_code: game.provider?.providerCode || providerCode,
        game_code: resolvedGameCode,
        lang: options.lang || 'en',
        rtp: 92,
        lobby_url: `${frontendUrl}/lobby`,
      };

      await this.writeAuditLog(userId, 'PROVIDER_REQUEST', { method: 'game_launch', payload });

      const response = await this.retryRequest(() => this.providerGateway.launchGame(payload));
      const launchUrl = response.launch_url || response.launchUrl;
      if (!launchUrl) {
        throw new Error('INTERNAL_ERROR: Launch URL was not returned');
      }

      const sessionToken = randomUUID();
      await this.gameSessionRepository.create({
        userId: user.id,
        gameId: game.id ?? null,
        providerCode: game.provider?.providerCode || providerCode,
        gameCode: game.gameCode,
        sessionToken,
        launchUrl,
        providerSession: response.session_token || response.sessionToken || null,
        status: 'active',
        startedAt: new Date(),
        device: options.device || 'desktop',
        currency: wallet?.currency || 'USD',
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      });

      await this.writeAuditLog(userId, 'SESSION_CREATED', { sessionToken, launchUrl });
      await this.writeAuditLog(userId, 'SUCCESS', { launchUrl });

      if (this.configService.get<string>('GAME_TEST_MODE') === 'true') {
        this.logger.log(`
=========================================
Game Launch Request [Verification Mode]
Development Mode: ENABLED
Development User: ${user.id}
Provider: ${game.provider?.providerCode || providerCode}
Game Code: ${resolvedGameCode}
Provider Response Status: ${response.status}
Launch URL: ${launchUrl}
GameSession ID: ${sessionToken}
=========================================
        `);
      }

      return { success: true, launchUrl };
    } catch (error: any) {
      this.logger.error(`Failed to launch game ${gameCode} for user ${userId}: ${error.message}`);
      await this.prisma.syncLog.create({
        data: {
          providerCode: game.provider?.providerCode || null,
          type: 'GAME_LAUNCH',
          status: 'ERROR',
          message: error.message || 'Launch failed',
        },
      }).catch(() => undefined);

      const failureAction = this.getFailureAction(error);
      await this.writeAuditLog(userId, failureAction, { error: error.message });
      this.mapProviderError(error);
    }
  }

  async launchLobby(userId: string, options: { providerCode?: string; productCode?: string | number; gameType?: string; lang?: string; device?: string }) {
    await this.writeAuditLog(userId, 'LAUNCH_REQUESTED', { options });

    this.checkRateLimit(userId);
    this.acquireLaunchLock(userId);

    const user = await this.resolveUser(userId);

    let providerCode = options.providerCode;
    if (!providerCode && options.productCode) {
      if (String(options.productCode) === '1164') {
        providerCode = 'DIGITAIN';
      }
    }
    if (!providerCode && options.gameType === 'SPORT_BOOK') {
      providerCode = 'DIGITAIN';
    }
    providerCode = providerCode ? providerCode.toUpperCase() : 'DIGITAIN';

    const provider = await this.prisma.provider.findFirst({
      where: { providerCode: { equals: providerCode, mode: 'insensitive' } },
    });

    if (!provider) {
      await this.writeAuditLog(userId, 'INVALID_PROVIDER', { providerCode });
      throw new BadRequestException('Game provider unavailable');
    }

    try {
      // Optimize wallet: 30s cache
      const wallet = await this.prisma.wallet.findFirst({ where: { userId } });
      const localBalance = Number(wallet?.balance ?? 0);
      const lastSynced = wallet?.updatedAt ? wallet.updatedAt.getTime() : 0;
      const needsSync = !wallet || (Date.now() - lastSynced > 30_000);

      let syncedBalance = localBalance;
      if (needsSync) {
        await this.writeAuditLog(userId, 'BALANCE_SYNC', { localBalance });
        try {
          syncedBalance = await this.walletService.syncBalance(userId);
        } catch (e) {
          if (this.configService.get<string>('GAME_LAUNCH_TEST_MODE') !== 'true') {
            throw e;
          }
          this.logger.warn(`Wallet balance sync failed in test mode: ${e.message}`);
        }
      }

      // money_info check
      await this.writeAuditLog(userId, 'PROVIDER_REQUEST', { method: 'money_info' });
      try {
        const providerUser = await this.retryRequest(() => this.providerGateway.getUserInfo(user.id));
        if (!providerUser || providerUser.status !== 1) {
          throw new Error('INVALID_PROVIDER: Provider money_info check failed');
        }
      } catch (e) {
        if (this.configService.get<string>('GAME_LAUNCH_TEST_MODE') !== 'true') {
          throw e;
        }
        this.logger.warn(`Provider money_info check failed in test mode: ${e.message}`);
      }

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

      const payload = {
        method: 'game_launch',
        agent_code: this.configService.get<string>('PROVIDER_AGENT_CODE'),
        agent_token: this.configService.get<string>('PROVIDER_AGENT_TOKEN'),
        user_code: user.id,
        provider_code: providerCode,
        game_code: '',
        lang: options.lang || 'en',
        rtp: 92,
        lobby_url: `${frontendUrl}/lobby`,
      };

      await this.writeAuditLog(userId, 'PROVIDER_REQUEST', { method: 'game_launch', payload });

      const response = await this.retryRequest(() => this.providerGateway.launchGame(payload));
      const launchUrl = response.launch_url || response.launchUrl;
      if (!launchUrl) {
        throw new Error('INTERNAL_ERROR: Launch URL was not returned');
      }

      const sessionToken = randomUUID();
      await this.gameSessionRepository.create({
        userId: user.id,
        gameId: null,
        providerCode: providerCode,
        gameCode: null,
        sessionToken,
        launchUrl,
        providerSession: response.session_token || response.sessionToken || null,
        status: 'active',
        startedAt: new Date(),
        device: options.device || 'desktop',
        currency: wallet?.currency || 'USD',
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      });

      await this.writeAuditLog(userId, 'SESSION_CREATED', { sessionToken, launchUrl });
      await this.writeAuditLog(userId, 'SUCCESS', { launchUrl });

      if (this.configService.get<string>('GAME_TEST_MODE') === 'true') {
        this.logger.log(`
=========================================
Game Lobby Launch Request [Verification Mode]
Development Mode: ENABLED
Development User: ${user.id}
Provider: ${providerCode}
Provider Response Status: ${response.status}
Launch URL: ${launchUrl}
GameSession ID: ${sessionToken}
=========================================
        `);
      }

      return { success: true, launchUrl };
    } catch (error: any) {
      this.logger.error(`Failed to launch lobby ${providerCode} for user ${userId}: ${error.message}`);
      await this.prisma.syncLog.create({
        data: {
          providerCode,
          type: 'GAME_LAUNCH',
          status: 'ERROR',
          message: error.message || 'Launch failed',
        },
      }).catch(() => undefined);

      const failureAction = this.getFailureAction(error);
      await this.writeAuditLog(userId, failureAction, { error: error.message });
      this.mapProviderError(error);
    }
  }

  async getGameHistory(userId: string, gameCode: string) {
    const game = await this.prisma.game.findUnique({
      where: { gameCode },
      include: { provider: true },
    });

    if (!game || !game.provider) {
      throw new NotFoundException('Game not found');
    }

    const providerCode = String(game.provider.providerCode).toUpperCase();
    if (providerCode !== 'PRAGMATIC') {
      throw new BadRequestException('Selected game does not support history view');
    }

    try {
      const response = await this.providerGateway.getGameHistory(userId, gameCode);
      return { success: true, url: response.url || response.launch_url };
    } catch (error: any) {
      this.mapProviderError(error);
    }
  }
}
