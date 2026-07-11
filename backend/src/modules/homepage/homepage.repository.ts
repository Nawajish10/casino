import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class HomepageRepository {
    constructor(private readonly supabaseService: SupabaseService) {}

    private get db() {
        return this.supabaseService.db;
    }

    private baseGameSelect = `
        id, providerId, providerGameId, gameCode, gameName, category,
        thumbnail, banner, launchCode, status, maintenanceMode,
        currentlyAvailable, isActive, isFeatured, isPopular,
        homepageVisible, sortOrder, playCount, tags, launchReady,
        createdAt, updatedAt
    `;

    private baseGameFilter = {
        isActive: true,
        currentlyAvailable: true,
        maintenanceMode: false,
        homepageVisible: true,
        status: 'live',
    };

    async getFeaturedGames(limit: number = 20) {
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

        if (error) throw error;
        return data || [];
    }

    async getPopularGames(limit: number = 20) {
        console.log('[HomepageRepository] getPopularGames query starting');
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

        console.log('[HomepageRepository] getPopularGames query finished, error:', error);
        if (error) throw error;
        return data || [];
    }

    async getLiveCasinoGames(limit: number = 20) {
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

        if (error) throw error;
        return data || [];
    }

    async getSlotsGames(limit: number = 20) {
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

        if (error) throw error;
        return data || [];
    }

    async getProviders() {
        const { data, error } = await this.db
            .from('Provider')
            .select('id, providerCode, providerName, providerLogo, status, isVisible, sortOrder')
            .eq('status', true)
            .eq('isVisible', true)
            .order('sortOrder', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async getAllGames(limit: number = 100) {
        const { data, error } = await this.db
            .from('Game')
            .select(this.baseGameSelect)
            .eq('isActive', true)
            .eq('currentlyAvailable', true)
            .eq('maintenanceMode', false)
            .eq('status', 'live')
            .order('sortOrder', { ascending: true })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }
}
