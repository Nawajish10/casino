import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { HomepageRepository } from './homepage.repository';

@Injectable()
export class HomepageService {
    private readonly CACHE_TTL = 60000; // 1 minute cache for homepage

    constructor(
        private readonly homepageRepo: HomepageRepository,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
        console.log(`[HomepageService] getCached called for key: ${key}`);
        const cached = await this.cacheManager.get<T>(key);
        if (cached) {
            console.log(`[HomepageService] Cache HIT for key: ${key}`);
            return cached;
        }
        console.log(`[HomepageService] Cache MISS for key: ${key}, calling fetcher`);
        const data = await fetcher();
        console.log(`[HomepageService] Fetcher returned for key: ${key}, setting cache`);
        await this.cacheManager.set(key, data, this.CACHE_TTL);
        console.log(`[HomepageService] Cache set for key: ${key}`);
        return data;
    }

    async getFeaturedGames() {
        console.log('[HomepageService] getFeaturedGames started');
        return this.getCached('homepage:featured', () => {
            console.log('[HomepageService] calling homepageRepo.getFeaturedGames');
            return this.homepageRepo.getFeaturedGames();
        });
    }

    async getPopularGames() {
        console.log('[HomepageService] getPopularGames started');
        return this.getCached('homepage:popular', () => {
            console.log('[HomepageService] calling homepageRepo.getPopularGames');
            return this.homepageRepo.getPopularGames();
        });
    }

    async getLiveCasinoGames() {
        return this.getCached('homepage:live-casino', () => this.homepageRepo.getLiveCasinoGames());
    }

    async getSlotsGames() {
        return this.getCached('homepage:slots', () => this.homepageRepo.getSlotsGames());
    }

    async getProviders() {
        return this.getCached('homepage:providers', () => this.homepageRepo.getProviders());
    }
}
