import { Module } from '@nestjs/common';
import { AdminGameController } from './admin-game.controller';
import { AdminGameService } from './admin-game.service';
import { AdminGameRepository } from './admin-game.repository';

@Module({
    controllers: [AdminGameController],
    providers: [AdminGameService, AdminGameRepository],
    exports: [AdminGameService],
})
export class AdminGameModule {}
