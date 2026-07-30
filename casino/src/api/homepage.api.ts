import { api } from './axios';
import { FALLBACK_GAMES } from '../data/fallbackGames';

export interface Game {
    id: string;
    gameCode: string;
    gameName: string;
    category?: string;
    thumbnail?: string;
    banner?: string;
    providerName?: string;
    isFeatured?: boolean;
    isPopular?: boolean;
}

export interface Provider {
    id: string;
    providerCode: string;
    providerName: string;
    providerLogo?: string;
}

export const homepageApi = {
    getFeaturedGames: async (): Promise<Game[]> => {
        try {
            const response = await api.get('/homepage/featured');
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                return response.data;
            }
        } catch (err) {
            console.warn('[homepageApi] getFeaturedGames error, using fallback games');
        }
        return FALLBACK_GAMES.filter(g => g.isFeatured).slice(0, 20);
    },
    getPopularGames: async (): Promise<Game[]> => {
        try {
            const response = await api.get('/homepage/popular');
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                return response.data;
            }
        } catch (err) {
            console.warn('[homepageApi] getPopularGames error, using fallback games');
        }
        return FALLBACK_GAMES.filter(g => g.isPopular).slice(0, 20);
    },
    getLiveCasinoGames: async (): Promise<Game[]> => {
        try {
            const response = await api.get('/homepage/live-casino');
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                return response.data;
            }
        } catch (err) {
            console.warn('[homepageApi] getLiveCasinoGames error, using fallback games');
        }
        return FALLBACK_GAMES.filter(g => (g.category || '').toLowerCase().includes('live')).slice(0, 20);
    },
    getSlotsGames: async (): Promise<Game[]> => {
        try {
            const response = await api.get('/homepage/slots');
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                return response.data;
            }
        } catch (err) {
            console.warn('[homepageApi] getSlotsGames error, using fallback games');
        }
        return FALLBACK_GAMES.filter(g => (g.category || '').toLowerCase().includes('slot')).slice(0, 20);
    },
    getProviders: async (): Promise<Provider[]> => {
        try {
            const response = await api.get('/homepage/providers');
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                return response.data;
            }
        } catch (err) {
            console.warn('[homepageApi] getProviders error, using fallback providers');
        }
        return [
            { id: '1', providerCode: 'HABANERO', providerName: 'Habanero' },
            { id: '2', providerCode: 'PRAGMATIC', providerName: 'Pragmatic Play' },
            { id: '3', providerCode: 'BOOONGO', providerName: 'Booongo' },
            { id: '4', providerCode: 'PLAYSON', providerName: 'Playson' }
        ];
    },
};

