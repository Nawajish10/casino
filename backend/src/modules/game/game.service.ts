import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { GameRepository } from './game.repository';
import { PaginationQueryDto, GameSearchQueryDto } from './game.dto';

@Injectable()
export class GameService {
    // Default TTL of 300 seconds (5 minutes)
    private readonly CACHE_TTL = 300000; 

    constructor(
        private readonly gameRepository: GameRepository,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    private generateCacheKey(prefix: string, page: number, limit: number, extra?: string) {
        return `${prefix}:${page}:${limit}${extra ? `:${extra}` : ''}`;
    }

    private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
        const cached = await this.cacheManager.get<T>(key);
        if (cached) {
            return cached;
        }

        const data = await fetcher();
        await this.cacheManager.set(key, data, this.CACHE_TTL);
        return data;
    }

    async getActiveGames(query: PaginationQueryDto) {
        const cacheKey = this.generateCacheKey('active-games', query.page!, query.limit!);
        return this.getCached(cacheKey, () =>
            this.gameRepository.getActiveGames(query.page!, query.limit!)
        );
    }

    async getFeaturedGames(query: PaginationQueryDto) {
        const cacheKey = this.generateCacheKey('featured-games', query.page!, query.limit!);
        return this.getCached(cacheKey, () =>
            this.gameRepository.getFeaturedGames(query.page!, query.limit!)
        );
    }

    async getGamesByProvider(providerCode: string, query: PaginationQueryDto) {
        const cacheKey = this.generateCacheKey('provider-games', query.page!, query.limit!, providerCode);
        return this.getCached(cacheKey, () =>
            this.gameRepository.getGamesByProvider(providerCode, query.page!, query.limit!)
        );
    }

    async getGamesByCategory(category: string, query: PaginationQueryDto) {
        const cacheKey = this.generateCacheKey('category-games', query.page!, query.limit!, category);
        return this.getCached(cacheKey, () =>
            this.gameRepository.getGamesByCategory(category, query.page!, query.limit!)
        );
    }

    async searchGames(query: GameSearchQueryDto) {
        // We typically don't cache search queries because they are highly variable,
        // but we can if we want to. For now, let's just query directly to save Redis memory.
        if (!query.q) {
            return this.getActiveGames(query);
        }
        return this.gameRepository.searchGames(query.q, query.page!, query.limit!);
    }

    async getTrendingGames(query: PaginationQueryDto) {
        const cacheKey = this.generateCacheKey('trending-games', query.page!, query.limit!);
        return this.getCached(cacheKey, () =>
            this.gameRepository.getTrendingGames(query.page!, query.limit!)
        );
    }

    async getRecentGames(query: PaginationQueryDto) {
        const cacheKey = this.generateCacheKey('recent-games', query.page!, query.limit!);
        return this.getCached(cacheKey, () =>
            this.gameRepository.getRecentGames(query.page!, query.limit!)
        );
    }

    async getGameByCode(gameCode: string) {
        return this.gameRepository.getGameByCode(gameCode);
    }
}
