import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './shared/config/config.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { SupabaseModule } from './shared/supabase/supabase.module';
import { ProviderModule } from './modules/provider/provider.module';
import { GameModule } from './modules/game/game.module';
import { AdminGameModule } from './modules/admin-game/admin-game.module';
import { HomepageModule } from './modules/homepage/homepage.module';
import { CatalogValidationModule } from './modules/catalog-validation/catalog-validation.module';
import { DatabaseHealthModule } from './modules/database-health/database-health.module';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { GameLogModule } from './modules/game-log/game-log.module';
import { GameLaunchModule } from './modules/game-launch/game-launch.module';


@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    SupabaseModule,
    CacheModule.register({ isGlobal: true }),
    ProviderModule,
    GameModule,
    AdminGameModule,
    HomepageModule,
    CatalogValidationModule,
    DatabaseHealthModule,
    AuthModule,
    WalletModule,
    GameLogModule,
    GameLaunchModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
