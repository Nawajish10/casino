import { BadRequestException } from '@nestjs/common';
import { GameLaunchService } from './game-launch.service';

describe('GameLaunchService', () => {
  const createConfigService = (overrides: Record<string, string> = {}) => ({
    get: jest.fn((key: string) => {
      switch (key) {
        case 'FRONTEND_URL':
          return 'http://localhost:5173';
        case 'PROVIDER_AGENT_CODE':
          return 'TEST_AGENT';
        case 'PROVIDER_AGENT_TOKEN':
          return 'TEST_TOKEN';
        default:
          return overrides[key] ?? 'false';
      }
    }),
  });

  it('rejects launch when the game is not launch-ready', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1' }) },
      game: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'game-1',
          gameCode: 'aviator',
          isActive: true,
          currentlyAvailable: true,
          maintenanceMode: false,
          status: 'live',
          launchReady: false,
          provider: { providerCode: 'PRAGMATIC' },
        }),
      },
      wallet: { findFirst: jest.fn().mockResolvedValue({ balance: 100, currency: 'USD', updatedAt: new Date() }) },
      gameSession: { create: jest.fn() },
      auditLog: { create: jest.fn() },
      syncLog: { create: jest.fn() },
    };

    const walletService = { syncBalance: jest.fn().mockResolvedValue(100) };
    const gateway = {
      getAgentInfo: jest.fn().mockResolvedValue({ status: 1 }),
      getUserInfo: jest.fn().mockResolvedValue({ status: 1, user: { balance: 100 } }),
      launchGame: jest.fn(),
    };

    const service = new GameLaunchService(
      prisma as any,
      walletService as any,
      gateway as any,
      createConfigService(),
      { create: jest.fn() } as any,
    );

    await expect(service.launchGame('user-1', 'aviator', { lang: 'en', device: 'desktop' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('falls back to a test provider game when game metadata is missing in test mode', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1' }) },
      game: { findUnique: jest.fn().mockResolvedValue(null) },
      provider: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'provider-1',
          providerCode: 'PRAGMATIC',
          providerName: 'Pragmatic',
          status: true,
          isVisible: true,
          sortOrder: 0,
        }),
      },
      wallet: { findFirst: jest.fn().mockResolvedValue({ balance: 100, currency: 'USD', updatedAt: new Date() }) },
      gameSession: { create: jest.fn().mockResolvedValue({}) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      syncLog: { create: jest.fn().mockResolvedValue({}) },
    };

    const walletService = { syncBalance: jest.fn().mockResolvedValue(100) };
    const gateway = {
      getAgentInfo: jest.fn().mockResolvedValue({ status: 1 }),
      getUserInfo: jest.fn().mockResolvedValue({ status: 1, user: { balance: 100 } }),
      launchGame: jest.fn().mockResolvedValue({ status: 1, launch_url: 'https://test-launch.url', session_token: 'token-1' }),
    };

    const gameSessionRepository = { create: jest.fn().mockResolvedValue({}) };

    const service = new GameLaunchService(
      prisma as any,
      walletService as any,
      gateway as any,
      createConfigService({ GAME_TEST_MODE: 'true', TEST_GAME_PROVIDER_CODE: 'PRAGMATIC' }),
      gameSessionRepository as any,
    );

    const result = await service.launchGame('user-1', 'aviator', { lang: 'en', device: 'desktop' });

    expect(result).toEqual({ success: true, launchUrl: 'https://test-launch.url' });
    expect(prisma.provider.findFirst).toHaveBeenCalledWith({
      where: { providerCode: { equals: 'PRAGMATIC', mode: 'insensitive' } },
    });
    expect(gameSessionRepository.create).toHaveBeenCalledWith(expect.objectContaining({ gameId: null, providerCode: 'PRAGMATIC', gameCode: 'aviator' }));
  });

  describe('getDemoLaunchUrl', () => {
    it('returns the correct fallback demo URLs for different providers', () => {
      const service = new GameLaunchService(
        {} as any,
        {} as any,
        {} as any,
        createConfigService(),
        {} as any,
      );

      const getDemoLaunchUrl = (service as any).getDemoLaunchUrl.bind(service);

      expect(getDemoLaunchUrl('aviator', 'spribe')).toBe('https://demo.spribe.io/launch/aviator?g_token=demo');
      expect(getDemoLaunchUrl('sunny_fruits', 'playson')).toBe('https://demo.playson.com/openGame.do?gameSymbol=sunny_fruits&lang=en&cur=USD');
      expect(getDemoLaunchUrl('sun_of_egypt_2', 'booongo')).toBe('https://demo.3oaks.com/openGame.do?gameSymbol=sun_of_egypt_2&lang=en&cur=USD');
      expect(getDemoLaunchUrl('SGHotHotSummer', 'habanero')).toBe('https://app-test.insvr.com/frontend/final/display.html?gamecode=SGHotHotSummer&mode=demo');
      expect(getDemoLaunchUrl('vs20olympgate', 'pragmatic')).toBe('https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate&lang=en&cur=USD');
      expect(getDemoLaunchUrl('casino', '87originals')).toBe('https://demo.3oaks.com/openGame.do?gameSymbol=casino&lang=en&cur=USD');
    });
  });
});
