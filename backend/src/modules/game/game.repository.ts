import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { FALLBACK_GAMES } from '../../data/games.fallback';

@Injectable()
export class GameRepository {
    private readonly logger = new Logger(GameRepository.name);

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
            .eq('maintenanceMode', false);
    }

    private getFallbackPaginated(page: number, limit: number, filterFn?: (g: any) => boolean) {
        let items = FALLBACK_GAMES;
        if (filterFn) {
            items = items.filter(filterFn);
        }
        const total = items.length;
        const from = (page - 1) * limit;
        const paginatedItems = items.slice(from, from + limit);
        return {
            items: paginatedItems,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findPaginated(page: number, limit: number, filters: Record<string, any> = {}, orderCol = 'sortOrder', ascending = true) {
        try {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let countQuery = this.db.from('Game').select('id', { count: 'exact', head: true });
            let itemQuery = this.db.from('Game').select(this.baseSelect);

            countQuery = this.applyActiveFilters(countQuery);
            itemQuery = this.applyActiveFilters(itemQuery);

            for (const [key, val] of Object.entries(filters)) {
                if (val !== undefined && val !== null) {
                    if (key === '__search') {
                        itemQuery = itemQuery.or(`gameName.ilike.%${val}%,gameCode.ilike.%${val}%`);
                        countQuery = countQuery.or(`gameName.ilike.%${val}%,gameCode.ilike.%${val}%`);
                    } else if (key === '__providerCode') {
                        // Handled separately
                    } else {
                        itemQuery = itemQuery.eq(key, val);
                        countQuery = countQuery.eq(key, val);
                    }
                }
            }

            const [{ count, error: countErr }, { data, error }] = await Promise.all([
                countQuery,
                itemQuery.order(orderCol, { ascending }).range(from, to),
            ]);

            if (!error && !countErr && data && data.length > 0) {
                const total = count ?? data.length;
                return {
                    items: data,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                };
            }
        } catch (err: any) {
            this.logger.warn(`Supabase findPaginated failed: ${err.message}. Using fallback games.`);
        }

        // Fallback filter
        let filterFn: ((g: any) => boolean) | undefined;
        if (filters.isFeatured) {
            filterFn = (g) => g.isFeatured;
        } else if (filters.category) {
            const cat = String(filters.category).toLowerCase();
            filterFn = (g) => g.category.toLowerCase().includes(cat);
        } else if (filters.__search) {
            const s = String(filters.__search).toLowerCase();
            filterFn = (g) => g.gameName.toLowerCase().includes(s) || g.gameCode.toLowerCase().includes(s);
        }

        return this.getFallbackPaginated(page, limit, filterFn);
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
        try {
            const { data: providerData, error: provErr } = await this.db
                .from('Provider')
                .select('id')
                .eq('providerCode', providerCode)
                .single();

            if (!provErr && providerData) {
                return this.findPaginated(page, limit, { providerId: providerData.id }, 'sortOrder', true);
            }
        } catch (err: any) {
            this.logger.warn(`Supabase getGamesByProvider failed: ${err.message}. Using fallback.`);
        }

        return this.getFallbackPaginated(page, limit, (g) =>
            (g.providerName || '').toLowerCase().includes(providerCode.toLowerCase())
        );
    }

    async getGameByCode(gameCode: string) {
        try {
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

            if (!error && data) {
                return data;
            }
        } catch (err: any) {
            this.logger.warn(`Supabase getGameByCode failed: ${err.message}. Using fallback.`);
        }

        const found = FALLBACK_GAMES.find((g) => g.gameCode === gameCode || g.id === gameCode);
        return found || FALLBACK_GAMES[0];
    }
}

