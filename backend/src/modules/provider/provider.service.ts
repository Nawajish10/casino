import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class ProviderService {
    constructor(private readonly supabaseService: SupabaseService) {}

    private get db() {
        return this.supabaseService.db;
    }

    async getProviders() {
        const { data, error } = await this.db
            .from('Provider')
            .select('id, providerCode, providerName, providerLogo, apiProviderId, status, isVisible, sortOrder, createdAt, updatedAt')
            .order('sortOrder', { ascending: true });
        if (error) throw error;
        return data || [];
    }

    async getGames(providerCode?: string) {
        if (providerCode) {
            // First get provider ID
            const { data: provider, error: provErr } = await this.db
                .from('Provider')
                .select('id')
                .eq('providerCode', providerCode)
                .single();
            
            if (provErr || !provider) return [];

            const { data, error } = await this.db
                .from('Game')
                .select('*')
                .eq('providerId', provider.id);
            if (error) throw error;
            return data || [];
        }

        const { data, error } = await this.db
            .from('Game')
            .select('id, gameCode, gameName, category, thumbnail, banner, status, isActive, isFeatured, isPopular')
            .limit(100);
        if (error) throw error;
        return data || [];
    }

    async getProviderByCode(code: string) {
        const { data, error } = await this.db
            .from('Provider')
            .select('*')
            .eq('providerCode', code)
            .single();
        if (error) return null;
        return data;
    }
}
