import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletRepository } from './wallet.repository';
import { ProviderModule } from '../provider/provider.module';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
    imports: [ProviderModule, PrismaModule],
    controllers: [WalletController],
    providers: [WalletService, WalletRepository],
    exports: [WalletService]
})
export class WalletModule {}
