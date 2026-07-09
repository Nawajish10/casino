import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletService } from './modules/wallet/wallet.service';
import { PrismaService } from './shared/prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: WalletService,
          useValue: {
            getOrCreateWallet: jest.fn(),
            syncBalance: jest.fn(),
            launchGame: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            game: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
