import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProviderGateway } from './provider.gateway';
import { ProviderMapper } from './provider.mapper';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class ProviderSyncService {
    private readonly logger = new Logger(ProviderSyncService.name);

    constructor(
        private readonly providerGateway: ProviderGateway,
        private readonly providerMapper: ProviderMapper,
        private readonly supabaseService: SupabaseService,
    ) {}

    private get db() {
        return this.supabaseService.db;
    }

    private async logSync(type: string, status: string, message: string, providerCode?: string) {
        try {
            await this.db.from('SyncLog').insert({
                id: crypto.randomUUID(),
                type,
                status,
                message: message.substring(0, 255),
                providerCode: providerCode || null,
                createdAt: new Date().toISOString(),
            });
        } catch (e) {
            this.logger.error('Failed to write sync log', e);
        }
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }

    async syncProviders() {
        this.logger.log('Starting provider sync...');
        try {
            const response = await this.providerGateway.getProviders();

            if (response.status !== 1 || !response.providers) {
                throw new Error(`Provider sync failed with status ${response.status}: ${response.msg}`);
            }

            for (const rawProvider of response.providers) {
                const normalized = this.providerMapper.normalizeProvider(rawProvider);

                // Check if provider exists
                const { data: existing } = await this.db
                    .from('Provider')
                    .select('id')
                    .eq('providerCode', normalized.providerCode)
                    .single();

                if (existing) {
                    await this.db.from('Provider').update({
                        providerName: normalized.providerName,
                        providerLogo: normalized.providerLogo,
                        status: normalized.status,
                        updatedAt: new Date().toISOString(),
                    }).eq('providerCode', normalized.providerCode);
                } else {
                    await this.db.from('Provider').insert({
                        id: crypto.randomUUID(),
                        providerCode: normalized.providerCode,
                        providerName: normalized.providerName,
                        providerLogo: normalized.providerLogo,
                        status: normalized.status,
                        isVisible: true,
                        sortOrder: 0,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });
                }
            }

            const message = `Synced ${response.providers.length} providers`;
            this.logger.log(message);
            await this.logSync('SYNC_PROVIDERS', 'SUCCESS', message);

            return { success: true, count: response.providers.length, message };
        } catch (error: any) {
            this.logger.error('Provider sync failed', error.stack);
            await this.logSync('SYNC_PROVIDERS', 'ERROR', error.message);
            throw error;
        }
    }

    async syncGames(providerCode: string) {
        this.logger.log(`Starting game sync for provider ${providerCode}...`);
        
        try {
            const { data: provider, error: provErr } = await this.db
                .from('Provider')
                .select('id, providerCode')
                .eq('providerCode', providerCode)
                .single();

            if (provErr || !provider) {
                throw new Error(`Provider ${providerCode} not found in database`);
            }

            const response = await this.providerGateway.getProviderGames(providerCode);

            if (response.status !== 1 || !response.games) {
                throw new Error(`Game sync failed with status ${response.status}: ${response.msg}`);
            }

            const chunks = this.chunkArray(response.games, 50);
            
            for (const chunk of chunks) {
                for (const rawGame of chunk) {
                    const normalized = this.providerMapper.normalizeGame(rawGame);

                    // Check if game exists
                    const { data: existing } = await this.db
                        .from('Game')
                        .select('id')
                        .eq('gameCode', normalized.gameCode)
                        .single();

                    if (existing) {
                        await this.db.from('Game').update({
                            gameName: normalized.gameName,
                            category: normalized.category,
                            thumbnail: normalized.thumbnail,
                            banner: normalized.banner,
                            isActive: rawGame.status === 1,
                            updatedAt: new Date().toISOString(),
                        }).eq('gameCode', normalized.gameCode);
                    } else {
                        await this.db.from('Game').insert({
                            id: crypto.randomUUID(),
                            providerId: provider.id,
                            providerGameId: normalized.providerGameId,
                            gameCode: normalized.gameCode,
                            gameName: normalized.gameName,
                            category: normalized.category,
                            thumbnail: normalized.thumbnail,
                            banner: normalized.banner,
                            isActive: rawGame.status === 1,
                            status: 'live',
                            maintenanceMode: false,
                            currentlyAvailable: true,
                            isFeatured: false,
                            isPopular: false,
                            homepageVisible: true,
                            sortOrder: 0,
                            playCount: 0,
                            tags: [],
                            launchReady: false,
                            validationErrors: [],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        });
                    }
                }
            }

            const message = `Synced ${response.games.length} games for provider ${providerCode}`;
            this.logger.log(message);
            await this.logSync('SYNC_GAMES', 'SUCCESS', message, providerCode);

            return { success: true, count: response.games.length, message };
        } catch (error: any) {
            this.logger.error(`Game sync failed for provider ${providerCode}`, error.stack);
            await this.logSync('SYNC_GAMES', 'ERROR', error.message, providerCode);
            throw error;
        }
    }

    async syncAll() {
        this.logger.log('Starting full synchronization...');
        try {
            await this.syncProviders();
            
            const { data: providers } = await this.db
                .from('Provider')
                .select('providerCode');
            
            for (const provider of providers || []) {
                await this.syncGames(provider.providerCode);
            }
            
            const message = `Full synchronization completed successfully`;
            this.logger.log(message);
            await this.logSync('SYNC_ALL', 'SUCCESS', message);

            return { success: true, message };
        } catch (error: any) {
            this.logger.error('Full synchronization failed', error.stack);
            await this.logSync('SYNC_ALL', 'ERROR', error.message);
            throw error;
        }
    }

    async initializeSetup() {
        this.logger.log('Starting Initialization Setup...');
        const startTime = Date.now();
        
        let providersInserted = 0;
        let gamesInserted = 0;
        let failedProviders = 0;
        
        try {
            const providerResult = await this.syncProviders();
            providersInserted = providerResult.count;
            
            const { data: providers } = await this.db
                .from('Provider')
                .select('providerCode');
            
            for (const provider of providers || []) {
                try {
                    const gameResult = await this.syncGames(provider.providerCode);
                    gamesInserted += gameResult.count;
                } catch (e) {
                    failedProviders++;
                }
            }
            
            const duration = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
            
            const [{ count: totalProviders }, { count: totalGames }] = await Promise.all([
                this.db.from('Provider').select('id', { count: 'exact', head: true }),
                this.db.from('Game').select('id', { count: 'exact', head: true }),
            ]);
            
            return {
                success: true,
                providersInserted: totalProviders ?? 0,
                gamesInserted: totalGames ?? 0,
                failedProviders,
                duration,
            };
            
        } catch (error: any) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
            return {
                success: false,
                error: error.message,
                providersInserted,
                gamesInserted,
                failedProviders,
                duration,
            };
        }
    }

    @Cron('0 */6 * * *')
    async scheduledSync() {
        this.logger.log('Running scheduled synchronization...');
        await this.syncAll();
    }
}
