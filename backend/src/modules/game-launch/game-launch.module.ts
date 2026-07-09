import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';
import { ProviderModule } from '../provider/provider.module';
import { GameLaunchController } from './game-launch.controller';
import { GameLaunchService } from './game-launch.service';
import { GameSessionRepository } from './game-session.repository';

@Module({
  imports: [PrismaModule, WalletModule, ProviderModule],
  controllers: [GameLaunchController],
  providers: [GameLaunchService, GameSessionRepository],
  exports: [GameLaunchService],
})
export class GameLaunchModule {}
