import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameRepository } from './game.repository';

@Module({
    imports: [
        // Registering CacheManager for this module
        CacheModule.register(),
    ],
    controllers: [GameController],
    providers: [GameService, GameRepository],
    exports: [GameService],
})
export class GameModule {}
