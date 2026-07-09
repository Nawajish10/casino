import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { GameLogController } from './game-log.controller';
import { ProviderModule } from '../provider/provider.module';
import { GameLogRepository } from './game-log.repository';
import { GameLogService } from './game-log.service';

@Module({
  imports: [PrismaModule, ProviderModule],
  controllers: [GameLogController],
  providers: [GameLogService, GameLogRepository],
  exports: [GameLogService],
})
export class GameLogModule {}
