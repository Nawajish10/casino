import { Injectable, Logger } from '@nestjs/common';

export interface SportsbookMatch {
    id: number;
    time: string;
    teams: string;
    isLive: boolean;
    odds: {
        oneBlue: string;
        onePink: string;
        xBlue: string;
        xPink: string;
        twoBlue: string;
        twoPink: string;
    };
}

export interface SportsbookCategory {
    sport: string;
    matches: SportsbookMatch[];
}

@Injectable()
export class SportsbookService {
    private readonly logger = new Logger(SportsbookService.name);

    private homepageCache: SportsbookCategory[] | null = null;
    private fullCache: SportsbookCategory[] | null = null;
    
    private homepageCacheExpiresAt = 0;
    private fullCacheExpiresAt = 0;
    
    private readonly CACHE_TTL_MS = 15000; // 15 seconds

    private generateSimulatedOdds() {
        // Randomize odds slightly to simulate live feed
        const baseOdds = () => (Math.random() * (4.5 - 1.1) + 1.1).toFixed(2);
        return {
            oneBlue: baseOdds(),
            onePink: (parseFloat(baseOdds()) + 0.05).toFixed(2),
            xBlue: (Math.random() * (4.0 - 2.5) + 2.5).toFixed(2),
            xPink: (Math.random() * (4.0 - 2.5) + 2.5).toFixed(2),
            twoBlue: baseOdds(),
            twoPink: (parseFloat(baseOdds()) + 0.05).toFixed(2),
        };
    }

    private generateSimulatedFeed(): SportsbookCategory[] {
        return [
            {
                sport: 'Cricket',
                matches: [
                    { id: 101, time: 'Live Now', teams: 'England U19 vs SA U19', isLive: true, odds: this.generateSimulatedOdds() },
                    { id: 102, time: '10 Jul 18:00', teams: 'India vs Australia', isLive: false, odds: this.generateSimulatedOdds() },
                    { id: 103, time: '11 Jul 15:30', teams: 'Essex W vs Surrey W', isLive: false, odds: this.generateSimulatedOdds() },
                ]
            },
            {
                sport: 'Football',
                matches: [
                    { id: 201, time: 'Live Now', teams: 'Brazil vs Norway', isLive: true, odds: this.generateSimulatedOdds() },
                    { id: 202, time: 'Live Now', teams: 'Mexico vs England', isLive: true, odds: this.generateSimulatedOdds() },
                    { id: 203, time: '12 Jul 20:00', teams: 'Portugal vs Spain', isLive: false, odds: this.generateSimulatedOdds() },
                ]
            },
            {
                sport: 'Horse Racing',
                matches: [
                    { id: 301, time: 'Live Now', teams: 'Royal Ascot - Race 1', isLive: true, odds: this.generateSimulatedOdds() },
                    { id: 302, time: '10 Jul 14:00', teams: 'Cheltenham - Race 4', isLive: false, odds: this.generateSimulatedOdds() },
                    { id: 303, time: '10 Jul 16:30', teams: 'Epsom Downs - Race 2', isLive: false, odds: this.generateSimulatedOdds() },
                ]
            },
            {
                sport: 'Tennis',
                matches: [
                    { id: 401, time: 'Live Now', teams: 'Muchova vs B Krejcikova', isLive: true, odds: this.generateSimulatedOdds() },
                    { id: 402, time: '10 Jul 17:30', teams: 'J Pegula vs I Jovic', isLive: false, odds: this.generateSimulatedOdds() },
                    { id: 403, time: '11 Jul 18:00', teams: 'Safiullin vs Djokovic', isLive: false, odds: this.generateSimulatedOdds() },
                ]
            },
            {
                sport: 'Basketball',
                matches: [
                    { id: 501, time: 'Live Now', teams: 'Lakers vs Warriors', isLive: true, odds: this.generateSimulatedOdds() },
                    { id: 502, time: '12 Jul 21:00', teams: 'Bulls vs Celtics', isLive: false, odds: this.generateSimulatedOdds() },
                    { id: 503, time: '13 Jul 19:30', teams: 'Heat vs Knicks', isLive: false, odds: this.generateSimulatedOdds() },
                ]
            }
        ];
    }

    async getHomepageFeed(): Promise<SportsbookCategory[]> {
        const now = Date.now();
        if (this.homepageCache && now < this.homepageCacheExpiresAt) {
            return this.homepageCache;
        }

        // Generate full feed
        const fullFeed = this.generateSimulatedFeed();
        
        // Filter for homepage (only Cricket, Football, Horse Racing)
        const homepageSports = ['Cricket', 'Football', 'Horse Racing'];
        const homepageData = fullFeed.filter(cat => homepageSports.includes(cat.sport));

        // Update cache
        this.homepageCache = homepageData;
        this.homepageCacheExpiresAt = now + this.CACHE_TTL_MS;
        
        // While we're at it, update the full cache with the same generated data to keep them in sync
        this.fullCache = fullFeed;
        this.fullCacheExpiresAt = now + this.CACHE_TTL_MS;

        return homepageData;
    }

    async getFullSportsbookFeed(): Promise<SportsbookCategory[]> {
        const now = Date.now();
        if (this.fullCache && now < this.fullCacheExpiresAt) {
            return this.fullCache;
        }

        // Generate full feed
        const fullFeed = this.generateSimulatedFeed();
        
        // Update cache
        this.fullCache = fullFeed;
        this.fullCacheExpiresAt = now + this.CACHE_TTL_MS;

        return fullFeed;
    }
}
