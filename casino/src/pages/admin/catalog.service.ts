import { api } from 'api/axios';
import { supabase } from 'api/supabase';
import type { CatalogGame, CatalogProvider, SportsCategory } from './types';

export const defaultProviders: CatalogProvider[] = [
    { id: 'prov-01', providerCode: 'PP', providerName: 'Pragmatic Play', isVisible: true, status: true, sortOrder: 1, createdAt: '2026-01-10' },
    { id: 'prov-02', providerCode: 'EVO', providerName: 'Evolution Gaming', isVisible: true, status: true, sortOrder: 2, createdAt: '2026-01-12' },
    { id: 'prov-03', providerCode: 'HAK', providerName: 'Hacksaw Gaming', isVisible: true, status: true, sortOrder: 3, createdAt: '2026-01-15' },
    { id: 'prov-04', providerCode: 'PNG', providerName: 'Play\'n GO', isVisible: true, status: true, sortOrder: 4, createdAt: '2026-01-18' },
    { id: 'prov-05', providerCode: 'NENT', providerName: 'NetEnt', isVisible: true, status: true, sortOrder: 5, createdAt: '2026-01-20' },
    { id: 'prov-06', providerCode: 'EZU', providerName: 'Ezugi Live', isVisible: true, status: true, sortOrder: 6, createdAt: '2026-01-25' },
    { id: 'prov-07', providerCode: 'SPIN', providerName: 'Spinomenal', isVisible: true, status: true, sortOrder: 7, createdAt: '2026-02-01' },
    { id: 'prov-08', providerCode: 'JILI', providerName: 'JILI Games', isVisible: true, status: true, sortOrder: 8, createdAt: '2026-02-05' }
];

export const defaultGames: CatalogGame[] = [
    { id: 'game-01', gameCode: 'pp_sweet_bonanza', gameName: 'Sweet Bonanza', category: 'Slots', status: 'ACTIVE', isActive: true, isFeatured: true, isPopular: true },
    { id: 'game-02', gameCode: 'pp_gates_of_olympus', gameName: 'Gates of Olympus', category: 'Slots', status: 'ACTIVE', isActive: true, isFeatured: true, isPopular: true },
    { id: 'game-03', gameCode: 'evo_crazy_time', gameName: 'Crazy Time Live', category: 'Live Casino', status: 'ACTIVE', isActive: true, isFeatured: true, isPopular: true },
    { id: 'game-04', gameCode: 'evo_lightning_roulette', gameName: 'Lightning Roulette', category: 'Live Casino', status: 'ACTIVE', isActive: true, isFeatured: true, isPopular: true },
    { id: 'game-05', gameCode: 'sp_aviator', gameName: 'Aviator Crash', category: 'Instant Win', status: 'ACTIVE', isActive: true, isFeatured: true, isPopular: true },
    { id: 'game-06', gameCode: 'hak_wanted_dead', gameName: 'Wanted Dead or a Wild', category: 'Slots', status: 'ACTIVE', isActive: true, isFeatured: false, isPopular: true },
    { id: 'game-07', gameCode: 'png_book_of_dead', gameName: 'Book of Dead', category: 'Slots', status: 'ACTIVE', isActive: true, isFeatured: true, isPopular: false },
    { id: 'game-08', gameCode: 'ezu_speed_baccarat', gameName: 'Speed Baccarat', category: 'Live Casino', status: 'ACTIVE', isActive: true, isFeatured: false, isPopular: false }
];

export const defaultSports: SportsCategory[] = [
    {
        sport: 'Cricket',
        matches: [
            { id: 101, time: 'Live - 14.2 Overs', teams: 'India vs Australia', isLive: true },
            { id: 102, time: 'Live - 8.5 Overs', teams: 'England vs Pakistan', isLive: true },
            { id: 103, time: 'Today 19:30', teams: 'Mumbai Indians vs Chennai Super Kings', isLive: false },
            { id: 104, time: 'Tomorrow 15:00', teams: 'South Africa vs New Zealand', isLive: false }
        ]
    },
    {
        sport: 'Football',
        matches: [
            { id: 201, time: 'Live - 67\'', teams: 'Real Madrid vs Barcelona', isLive: true },
            { id: 202, time: 'Live - 34\'', teams: 'Manchester City vs Arsenal', isLive: true },
            { id: 203, time: 'Today 23:45', teams: 'Bayern Munich vs Borussia Dortmund', isLive: false }
        ]
    },
    {
        sport: 'Tennis',
        matches: [
            { id: 301, time: 'Live - Set 3', teams: 'Carlos Alcaraz vs Jannik Sinner', isLive: true },
            { id: 302, time: 'Today 21:00', teams: 'Novak Djokovic vs Alexander Zverev', isLive: false }
        ]
    }
];

export const catalogService = {
    getProviders: async (): Promise<CatalogProvider[]> => {
        try {
            // Direct query to Supabase PostgreSQL Provider table
            const { data, error } = await supabase
                .from('Provider')
                .select('*')
                .order('sortOrder', { ascending: true });

            if (!error && Array.isArray(data) && data.length > 0) {
                return data.map((p: any) => ({
                    id: p.id,
                    providerCode: p.providerCode,
                    providerName: p.providerName,
                    providerLogo: p.providerLogo || null,
                    status: Boolean(p.status),
                    isVisible: Boolean(p.isVisible),
                    sortOrder: Number(p.sortOrder) || 0,
                    createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '2026-01-01'
                }));
            }

            const res = await api.get('/providers');
            if (Array.isArray(res.data) && res.data.length > 0) return res.data;
            return defaultProviders;
        } catch {
            return defaultProviders;
        }
    },
    getGames: async (): Promise<CatalogGame[]> => {
        try {
            // Direct query to Supabase PostgreSQL Game table
            const { data, error } = await supabase
                .from('Game')
                .select('*')
                .order('createdAt', { ascending: false });

            if (!error && Array.isArray(data) && data.length > 0) {
                return data.map((g: any) => ({
                    id: g.id,
                    gameCode: g.gameCode,
                    gameName: g.gameName,
                    category: g.category || 'Slots',
                    thumbnail: g.thumbnail || null,
                    status: g.status || 'live',
                    isActive: Boolean(g.isActive),
                    isFeatured: Boolean(g.isFeatured),
                    isPopular: Boolean(g.isPopular)
                }));
            }

            const res = await api.get('/games');
            if (Array.isArray(res.data) && res.data.length > 0) return res.data;
            return defaultGames;
        } catch {
            return defaultGames;
        }
    },
    getSports: async (): Promise<SportsCategory[]> => {
        try {
            const res = await api.get('/sportsbook');
            if (Array.isArray(res.data) && res.data.length > 0) return res.data;
            return defaultSports;
        } catch {
            return defaultSports;
        }
    }
};
