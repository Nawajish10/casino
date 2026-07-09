import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class GameRepository {
    constructor(private readonly supabaseService: SupabaseService) {}

    private get db() {
        return this.supabaseService.db;
    }

    private readonly baseSelect = `
        id, providerId, providerGameId, gameCode, gameName, category,
        thumbnail, banner, launchCode, status, maintenanceMode,
        currentlyAvailable, isActive, isFeatured, isPopular,
        homepageVisible, sortOrder, playCount, tags, launchReady, createdAt, updatedAt
    `;

    private applyActiveFilters(query: any) {
        return query
            .eq('isActive', true)
            .eq('currentlyAvailable', true)
            .eq('maintenanceMode', false)
            .eq('status', 'live');
    }

    async findPaginated(page: number, limit: number, filters: Record<string, any> = {}, orderCol = 'sortOrder', ascending = true) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let countQuery = this.db.from('Game').select('id', { count: 'exact', head: true });
        let itemQuery = this.db.from('Game').select(this.baseSelect);

        // Apply active base filters
        countQuery = this.applyActiveFilters(countQuery);
        itemQuery = this.applyActiveFilters(itemQuery);

        // Apply additional filters
        for (const [key, val] of Object.entries(filters)) {
            if (val !== undefined && val !== null) {
                if (key === '__search') {
                    itemQuery = itemQuery.or(`gameName.ilike.%${val}%,gameCode.ilike.%${val}%`);
                    countQuery = countQuery.or(`gameName.ilike.%${val}%,gameCode.ilike.%${val}%`);
                } else if (key === '__providerCode') {
                    // Join via providerId — handled separately
                } else {
                    itemQuery = itemQuery.eq(key, val);
                    countQuery = countQuery.eq(key, val);
                }
            }
        }

        const [{ count }, { data, error }] = await Promise.all([
            countQuery,
            itemQuery.order(orderCol, { ascending }).range(from, to),
        ]);

        if (error) throw error;

        const total = count ?? 0;
        return {
            items: data || [],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getActiveGames(page: number, limit: number) {
        return this.findPaginated(page, limit, {}, 'sortOrder', true);
    }

    async getFeaturedGames(page: number, limit: number) {
        return this.findPaginated(page, limit, { isFeatured: true }, 'sortOrder', true);
    }

    async getGamesByCategory(category: string, page: number, limit: number) {
        return this.findPaginated(page, limit, { category }, 'sortOrder', true);
    }

    async searchGames(query: string, page: number, limit: number) {
        return this.findPaginated(page, limit, { __search: query }, 'sortOrder', true);
    }

    async getTrendingGames(page: number, limit: number) {
        return this.findPaginated(page, limit, {}, 'playCount', false);
    }

    async getRecentGames(page: number, limit: number) {
        return this.findPaginated(page, limit, {}, 'createdAt', false);
    }

    async getGamesByProvider(providerCode: string, page: number, limit: number) {
        // First find the provider by code
        const { data: providerData, error: provErr } = await this.db
            .from('Provider')
            .select('id')
            .eq('providerCode', providerCode)
            .single();

        if (provErr || !providerData) {
            return { items: [], total: 0, page, limit, totalPages: 0 };
        }

        return this.findPaginated(page, limit, { providerId: providerData.id }, 'sortOrder', true);
    }

    async getGameByCode(gameCode: string) {
        const { data, error } = await this.db
            .from('Game')
            .select(`
                id, providerId, providerGameId, gameCode, gameName, category,
                thumbnail, banner, launchCode, status, maintenanceMode,
                currentlyAvailable, isActive, isFeatured, isPopular,
                homepageVisible, sortOrder, playCount, tags, launchReady, createdAt, updatedAt,
                provider:Provider(id, providerCode, providerName, status)
            `)
            .eq('gameCode', gameCode)
            .single();

        if (error) throw error;
        return data;
    }
}
