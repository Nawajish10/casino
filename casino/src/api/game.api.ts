import { api } from './axios';
import { Game } from './homepage.api';

export const gameApi = {
    searchGames: async (query: string): Promise<Game[]> => {
        if (!query) return [];
        const response = await api.get(`/games/search?q=${encodeURIComponent(query)}`);
        return response.data.items;
    },
    getGamesByCategory: async (category: string): Promise<Game[]> => {
        const response = await api.get(`/games/category/${category}`);
        return response.data.items;
    },
    getGamesByProvider: async (providerCode: string): Promise<Game[]> => {
        const response = await api.get(`/games/provider/${providerCode}`);
        return response.data.items;
    },
};
