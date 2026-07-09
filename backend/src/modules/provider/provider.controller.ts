import { Controller, Post, Get, Param, HttpCode } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderSyncService } from './provider.sync.service';

@Controller()
export class ProviderController {
    constructor(
        private readonly providerService: ProviderService,
        private readonly providerSyncService: ProviderSyncService,
    ) {}

    // Admin Sync Endpoints
    @Post('admin/setup/initialize')
    @HttpCode(200)
    async initializeSetup() {
        return this.providerSyncService.initializeSetup();
    }

    @Post('admin/providers/sync')
    @HttpCode(200)
    async syncProviders() {
        return this.providerSyncService.syncProviders();
    }

    @Post('admin/providers/:providerCode/games/sync')
    @HttpCode(200)
    async syncGames(@Param('providerCode') providerCode: string) {
        return this.providerSyncService.syncGames(providerCode);
    }

    @Post('admin/providers/sync-all')
    @HttpCode(200)
    async syncAll() {
        return this.providerSyncService.syncAll();
    }

    // Public / Query Endpoints
    @Get('providers')
    async getProviders() {
        return this.providerService.getProviders();
    }

    @Get('games')
    async getGames() {
        return this.providerService.getGames();
    }
}
