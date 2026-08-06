import { supabase } from 'api/supabase';
import type { CatalogGame, CatalogProvider } from './types';

export const catalogService = {
    getProviders: async (): Promise<CatalogProvider[]> => {
        try {
            const { data, error } = await supabase
                .from('Provider')
                .select('*')
                .order('sortOrder', { ascending: true });

            if (!error && Array.isArray(data)) {
                return data.map((p: any) => ({
                    id: p.id,
                    providerCode: p.providerCode,
                    providerName: p.providerName,
                    providerLogo: p.providerLogo || null,
                    status: Boolean(p.status),
                    isVisible: Boolean(p.isVisible),
                    sortOrder: Number(p.sortOrder) || 0,
                    createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching providers from database:', error);
            return [];
        }
    },

    getGames: async (): Promise<CatalogGame[]> => {
        try {
            const { data, error } = await supabase
                .from('Game')
                .select('*')
                .order('createdAt', { ascending: false });

            if (!error && Array.isArray(data)) {
                return data.map((g: any) => ({
                    id: g.id,
                    gameCode: g.gameCode,
                    gameName: g.gameName,
                    providerId: g.providerId,
                    category: g.category || 'General',
                    thumbnail: g.thumbnail || null,
                    status: g.status || 'live',
                    isActive: Boolean(g.isActive),
                    isFeatured: Boolean(g.isFeatured),
                    isPopular: Boolean(g.isPopular),
                    playCount: Number(g.playCount) || 0,
                    createdAt: g.createdAt ? new Date(g.createdAt).toLocaleDateString() : 'N/A'
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching games from database:', error);
            return [];
        }
    },

    toggleProviderStatus: async (providerId: string, currentStatus: boolean): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('Provider')
                .update({ status: !currentStatus, updatedAt: new Date().toISOString() })
                .eq('id', providerId);
            return !error;
        } catch {
            return false;
        }
    },

    toggleGameStatus: async (gameId: string, currentStatus: boolean): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('Game')
                .update({ isActive: !currentStatus, updatedAt: new Date().toISOString() })
                .eq('id', gameId);
            return !error;
        } catch {
            return false;
        }
    }
};
