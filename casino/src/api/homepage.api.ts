import { api } from './axios';

export interface Game {
    id: string;
    gameCode: string;
    gameName: string;
    category?: string;
    thumbnail?: string;
    banner?: string;
    providerName?: string;
}

export interface Provider {
    id: string;
    providerCode: string;
    providerName: string;
    providerLogo?: string;
}

export const homepageApi = {
    getFeaturedGames: async (): Promise<Game[]> => {
        const response = await api.get('/homepage/featured');
        return response.data;
    },
    getPopularGames: async (): Promise<Game[]> => {
        const response = await api.get('/homepage/popular');
        return response.data;
    },
    getLiveCasinoGames: async (): Promise<Game[]> => {
        const response = await api.get('/homepage/live-casino');
        return response.data;
    },
    getSlotsGames: async (): Promise<Game[]> => {
        const response = await api.get('/homepage/slots');
        return response.data;
    },
    getProviders: async (): Promise<Provider[]> => {
        const response = await api.get('/homepage/providers');
        return response.data;
    },
};
