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
        const cached = await this.cacheManager.get<T>(key);
        if (cached) return cached;
        const data = await fetcher();
        await this.cacheManager.set(key, data, this.CACHE_TTL);
        return data;
    }

    async getFeaturedGames() {
        return this.getCached('homepage:featured', () => this.homepageRepo.getFeaturedGames());
    }

    async getPopularGames() {
        return this.getCached('homepage:popular', () => this.homepageRepo.getPopularGames());
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
