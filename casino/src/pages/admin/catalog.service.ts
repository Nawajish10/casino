import { api } from 'api/axios';
import type { CatalogGame, CatalogProvider, SportsCategory } from './types';

export const catalogService = {
    getProviders: async (): Promise<CatalogProvider[]> => (await api.get('/providers')).data,
    getGames: async (): Promise<CatalogGame[]> => (await api.get('/games')).data,
    // Sportsbook currently uses the existing live-feed service, not a Supabase table.
    getSports: async (): Promise<SportsCategory[]> => (await api.get('/sportsbook')).data
};
