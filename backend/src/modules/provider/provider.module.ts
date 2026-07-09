import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';
import { ProviderSyncService } from './provider.sync.service';
import { ProviderGateway } from './provider.gateway';
import { ProviderMapper } from './provider.mapper';

@Module({
    imports: [HttpModule.register({ timeout: 10000 })],
    controllers: [ProviderController],
    providers: [
        ProviderService,
        ProviderSyncService,
        ProviderGateway,
        ProviderMapper,
    ],
    exports: [ProviderService, ProviderSyncService, ProviderGateway],
})
export class ProviderModule {}
