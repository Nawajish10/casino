import { api } from './axios';
import { Game } from './homepage.api';
import { FALLBACK_GAMES } from '../data/fallbackGames';

export const gameApi = {
    searchGames: async (query: string): Promise<Game[]> => {
        if (!query) return [];
        try {
            const response = await api.get(`/games/search?q=${encodeURIComponent(query)}`);
            if (response.data && response.data.items && Array.isArray(response.data.items)) {
                return response.data.items;
            }
            if (Array.isArray(response.data)) {
                return response.data;
            }
        } catch (err) {
            console.warn('[gameApi] searchGames error, using fallback games');
        }
        const q = query.toLowerCase();
        return FALLBACK_GAMES.filter(g =>
            g.gameName.toLowerCase().includes(q) ||
            g.gameCode.toLowerCase().includes(q)
        );
    },
    getGamesByCategory: async (category: string): Promise<Game[]> => {
        try {
            const response = await api.get(`/games/category/${category}`);
            if (response.data && response.data.items && Array.isArray(response.data.items)) {
                return response.data.items;
            }
            if (Array.isArray(response.data)) {
                return response.data;
            }
        } catch (err) {
            console.warn('[gameApi] getGamesByCategory error, using fallback games');
        }
        const cat = category.toLowerCase();
        const filtered = FALLBACK_GAMES.filter(g => (g.category || '').toLowerCase().includes(cat));
        return filtered.length > 0 ? filtered : FALLBACK_GAMES.slice(0, 20);
    },
    getGamesByProvider: async (providerCode: string): Promise<Game[]> => {
        try {
            const response = await api.get(`/games/provider/${providerCode}`);
            if (response.data && response.data.items && Array.isArray(response.data.items)) {
                return response.data.items;
            }
            if (Array.isArray(response.data)) {
                return response.data;
            }
        } catch (err) {
            console.warn('[gameApi] getGamesByProvider error, using fallback games');
        }
        const prov = providerCode.toLowerCase();
        const filtered = FALLBACK_GAMES.filter(g => (g.providerName || '').toLowerCase().includes(prov));
        return filtered.length > 0 ? filtered : FALLBACK_GAMES.slice(0, 20);
    },
};

