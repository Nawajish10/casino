import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { FALLBACK_GAMES, FALLBACK_PROVIDERS } from '../../data/games.fallback';

@Injectable()
export class ProviderService {
    private readonly logger = new Logger(ProviderService.name);

    constructor(private readonly supabaseService: SupabaseService) {}

    private get db() {
        return this.supabaseService.db;
    }

    async getProviders() {
        try {
            const { data, error } = await this.db
                .from('Provider')
                .select('id, providerCode, providerName, providerLogo, apiProviderId, status, isVisible, sortOrder, createdAt, updatedAt')
                .order('sortOrder', { ascending: true });
            if (!error && data && data.length > 0) {
                return data;
            }
        } catch (err: any) {
            this.logger.warn(`Supabase getProviders failed: ${err.message}. Using fallback.`);
        }
        return FALLBACK_PROVIDERS;
    }

    async getGames(providerCode?: string) {
        try {
            if (providerCode) {
                const { data: provider, error: provErr } = await this.db
                    .from('Provider')
                    .select('id')
                    .eq('providerCode', providerCode)
                    .single();
                
                if (!provErr && provider) {
                    const { data, error } = await this.db
                        .from('Game')
                        .select('*')
                        .eq('providerId', provider.id);
                    if (!error && data && data.length > 0) return data;
                }
            } else {
                const { data, error } = await this.db
                    .from('Game')
                    .select('id, gameCode, gameName, category, thumbnail, banner, status, isActive, isFeatured, isPopular')
                    .limit(100);
                if (!error && data && data.length > 0) return data;
            }
        } catch (err: any) {
            this.logger.warn(`Supabase getGames failed: ${err.message}. Using fallback.`);
        }

        if (providerCode) {
            return FALLBACK_GAMES.filter(g => (g.providerName || '').toLowerCase().includes(providerCode.toLowerCase()));
        }
        return FALLBACK_GAMES;
    }

    async getProviderByCode(code: string) {
        try {
            const { data, error } = await this.db
                .from('Provider')
                .select('*')
                .eq('providerCode', code)
                .single();
            if (!error && data) return data;
        } catch (err: any) {
            this.logger.warn(`Supabase getProviderByCode failed: ${err.message}.`);
        }
        return FALLBACK_PROVIDERS.find(p => p.providerCode === code) || FALLBACK_PROVIDERS[0];
    }
}

