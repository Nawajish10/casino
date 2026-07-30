import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { FALLBACK_GAMES, FALLBACK_PROVIDERS } from '../../data/games.fallback';

@Injectable()
export class HomepageRepository {
    private readonly logger = new Logger(HomepageRepository.name);

    constructor(private readonly supabaseService: SupabaseService) {}

    private get db() {
        return this.supabaseService.db;
    }

    private baseGameSelect = `
        id, providerId, providerGameId, gameCode, gameName, category,
        thumbnail, banner, launchCode, status, maintenanceMode,
        currentlyAvailable, isActive, isFeatured, isPopular,
        homepageVisible, sortOrder, playCount, tags, launchReady,
        createdAt, updatedAt, Provider(providerName, providerLogo)
    `;

    async getFeaturedGames(limit: number = 20) {
        try {
            const { data, error } = await this.db
                .from('Game')
                .select(this.baseGameSelect)
                .eq('isActive', true)
                .eq('currentlyAvailable', true)
                .eq('maintenanceMode', false)
                .eq('homepageVisible', true)
                .eq('status', 'live')
                .eq('isFeatured', true)
                .order('sortOrder', { ascending: true })
                .limit(limit);

            if (!error && data && data.length > 0) {
                return data;
            }
        } catch (err: any) {
            this.logger.warn(`Supabase getFeaturedGames failed: ${err.message}. Using fallback games.`);
        }

        return FALLBACK_GAMES.filter(g => g.isFeatured).slice(0, limit);
    }

    async getPopularGames(limit: number = 20) {
        try {
            const { data, error } = await this.db
                .from('Game')
                .select(this.baseGameSelect)
                .eq('isActive', true)
                .eq('currentlyAvailable', true)
                .eq('maintenanceMode', false)
                .eq('homepageVisible', true)
                .eq('status', 'live')
                .eq('isPopular', true)
                .order('playCount', { ascending: false })
                .limit(limit);

            if (!error && data && data.length > 0) {
                return data;
            }
        } catch (err: any) {
            this.logger.warn(`Supabase getPopularGames failed: ${err.message}. Using fallback games.`);
        }

        return FALLBACK_GAMES.filter(g => g.isPopular).slice(0, limit);
    }

    async getLiveCasinoGames(limit: number = 20) {
        try {
            const { data, error } = await this.db
                .from('Game')
                .select(this.baseGameSelect)
                .eq('isActive', true)
                .eq('currentlyAvailable', true)
                .eq('maintenanceMode', false)
                .eq('homepageVisible', true)
                .eq('status', 'live')
                .ilike('category', '%live%')
                .order('sortOrder', { ascending: true })
                .limit(limit);

            if (!error && data && data.length > 0) {
                return data;
            }
        } catch (err: any) {
            this.logger.warn(`Supabase getLiveCasinoGames failed: ${err.message}. Using fallback games.`);
        }

        return FALLBACK_GAMES.filter(g => g.category.toLowerCase().includes('live')).slice(0, limit);
    }

    async getSlotsGames(limit: number = 20) {
        try {
            const { data, error } = await this.db
                .from('Game')
                .select(this.baseGameSelect)
                .eq('isActive', true)
                .eq('currentlyAvailable', true)
                .eq('maintenanceMode', false)
                .eq('homepageVisible', true)
                .eq('status', 'live')
                .ilike('category', '%slot%')
                .order('sortOrder', { ascending: true })
                .limit(limit);

            if (!error && data && data.length > 0) {
                return data;
            }
        } catch (err: any) {
            this.logger.warn(`Supabase getSlotsGames failed: ${err.message}. Using fallback games.`);
        }

        return FALLBACK_GAMES.filter(g => g.category.toLowerCase().includes('slot')).slice(0, limit);
    }

    async getProviders() {
        try {
            const { data, error } = await this.db
                .from('Provider')
                .select('id, providerCode, providerName, providerLogo, status, isVisible, sortOrder')
                .eq('status', true)
                .eq('isVisible', true)
                .order('sortOrder', { ascending: true });

            if (!error && data && data.length > 0) {
                return data;
            }
        } catch (err: any) {
            this.logger.warn(`Supabase getProviders failed: ${err.message}. Using fallback providers.`);
        }

        return FALLBACK_PROVIDERS;
    }

    async getAllGames(limit: number = 100) {
        try {
            const { data, error } = await this.db
                .from('Game')
                .select(this.baseGameSelect)
                .eq('isActive', true)
                .eq('currentlyAvailable', true)
                .eq('maintenanceMode', false)
                .eq('status', 'live')
                .order('sortOrder', { ascending: true })
                .limit(limit);

            if (!error && data && data.length > 0) {
                return data;
            }
        } catch (err: any) {
            this.logger.warn(`Supabase getAllGames failed: ${err.message}. Using fallback games.`);
        }

        return FALLBACK_GAMES.slice(0, limit);
    }
}

