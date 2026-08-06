import { supabase } from 'api/supabase';
import { api } from 'api/axios';
import type {
    AuditLogItem, DashboardMetrics, GameTransactionRecord, SyncLogItem, SystemHealthInfo, UserRecord
} from './types';

export const adminService = {
    getDashboardOverviewMetrics: async (): Promise<DashboardMetrics> => {
        const metrics: DashboardMetrics = {
            totalUsers: 0,
            activeUsers24h: 0,
            totalGames: 0,
            activeProviders: 0,
            totalWalletBalance: 0,
            totalBetsCount: 0,
            totalBetAmount: 0,
            totalWinAmount: 0,
            activeSessionsCount: 0
        };

        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            const [
                usersRes,
                activeUsersRes,
                gamesRes,
                providersRes,
                walletsRes,
                txsRes,
                txAmountsRes,
                sessionsRes
            ] = await Promise.allSettled([
                supabase.from('User').select('id', { count: 'exact', head: true }),
                supabase.from('User').select('id', { count: 'exact', head: true }).gte('updatedAt', twentyFourHoursAgo),
                supabase.from('Game').select('id', { count: 'exact', head: true }),
                supabase.from('Provider').select('id', { count: 'exact', head: true }).eq('status', true),
                supabase.from('Wallet').select('balance'),
                supabase.from('GameTransaction').select('id', { count: 'exact', head: true }),
                supabase.from('GameTransaction').select('betAmount, winAmount'),
                supabase.from('GameSession').select('id', { count: 'exact', head: true }).eq('status', 'active')
            ]);

            if (usersRes.status === 'fulfilled' && usersRes.value.count !== null) {
                metrics.totalUsers = usersRes.value.count;
            }
            if (activeUsersRes.status === 'fulfilled' && activeUsersRes.value.count !== null) {
                metrics.activeUsers24h = activeUsersRes.value.count;
            }
            if (gamesRes.status === 'fulfilled' && gamesRes.value.count !== null) {
                metrics.totalGames = gamesRes.value.count;
            }
            if (providersRes.status === 'fulfilled' && providersRes.value.count !== null) {
                metrics.activeProviders = providersRes.value.count;
            }

            if (walletsRes.status === 'fulfilled' && Array.isArray(walletsRes.value.data)) {
                metrics.totalWalletBalance = walletsRes.value.data.reduce(
                    (sum, w) => sum + (Number(w.balance) || 0),
                    0
                );
            }

            if (txsRes.status === 'fulfilled' && txsRes.value.count !== null) {
                metrics.totalBetsCount = txsRes.value.count;
            }

            if (txAmountsRes.status === 'fulfilled' && Array.isArray(txAmountsRes.value.data)) {
                metrics.totalBetAmount = txAmountsRes.value.data.reduce(
                    (sum, t) => sum + (Number(t.betAmount) || 0),
                    0
                );
                metrics.totalWinAmount = txAmountsRes.value.data.reduce(
                    (sum, t) => sum + (Number(t.winAmount) || 0),
                    0
                );
            }

            if (sessionsRes.status === 'fulfilled' && sessionsRes.value.count !== null) {
                metrics.activeSessionsCount = sessionsRes.value.count;
            }
        } catch (error) {
            console.error('Error fetching admin dashboard metrics:', error);
        }

        return metrics;
    },

    getUsers: async (): Promise<UserRecord[]> => {
        try {
            const { data, error } = await supabase
                .from('User')
                .select('*, Wallet(balance)')
                .order('createdAt', { ascending: false });

            if (!error && Array.isArray(data)) {
                return data.map((u: any) => ({
                    id: u.id,
                    mobile: u.mobile || 'N/A',
                    email: u.email || null,
                    name: u.name || null,
                    emailVerified: Boolean(u.emailVerified),
                    mobileVerified: Boolean(u.mobileVerified),
                    createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
                    walletBalance: u.Wallet && u.Wallet[0] ? Number(u.Wallet[0].balance) || 0 : 0
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    getGameTransactions: async (): Promise<GameTransactionRecord[]> => {
        try {
            const { data, error } = await supabase
                .from('GameTransaction')
                .select('*')
                .order('createdAt', { ascending: false })
                .limit(100);

            if (!error && Array.isArray(data)) {
                return data.map((t: any) => ({
                    id: t.id,
                    transactionId: t.transactionId,
                    userCode: t.userCode || t.userId || 'N/A',
                    providerCode: t.providerCode,
                    gameCode: t.gameCode,
                    gameType: t.gameType || 'Slot',
                    transactionType: t.transactionType || 'Bet',
                    betAmount: Number(t.betAmount) || 0,
                    winAmount: Number(t.winAmount) || 0,
                    createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching game transactions:', error);
            return [];
        }
    },

    getAuditLogs: async (): Promise<AuditLogItem[]> => {
        try {
            const { data, error } = await supabase
                .from('AuditLog')
                .select('*')
                .order('createdAt', { ascending: false })
                .limit(100);

            if (!error && Array.isArray(data)) {
                return data.map((l: any) => ({
                    id: l.id,
                    timestamp: l.createdAt ? new Date(l.createdAt).toLocaleString() : 'N/A',
                    actor: l.adminUser || 'System',
                    action: l.action || 'LOG',
                    details: typeof l.newValue === 'object' ? JSON.stringify(l.newValue) : String(l.entityId || ''),
                    ip: 'Internal DB'
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            return [];
        }
    },

    getSyncLogs: async (): Promise<SyncLogItem[]> => {
        try {
            const { data, error } = await supabase
                .from('SyncLog')
                .select('*')
                .order('createdAt', { ascending: false })
                .limit(100);

            if (!error && Array.isArray(data)) {
                return data.map((s: any) => ({
                    id: s.id,
                    providerCode: s.providerCode || 'N/A',
                    type: s.type || 'SYNC',
                    status: s.status || 'INFO',
                    message: s.message || '',
                    createdAt: s.createdAt ? new Date(s.createdAt).toLocaleString() : 'N/A'
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching sync logs:', error);
            return [];
        }
    },

    getSystemHealth: async (): Promise<SystemHealthInfo> => {
        try {
            const res = await api.get('/database-health');
            if (res.data) {
                return {
                    connected: Boolean(res.data.connected),
                    tablesFound: res.data.tablesFound || [],
                    missingTables: res.data.missingTables || [],
                    overview: res.data.overview || { providers: 0, games: 0 }
                };
            }
        } catch {}

        // Direct fallback query via Supabase to check DB connectivity
        try {
            const { error: pErr } = await supabase.from('Provider').select('id', { head: true, count: 'exact' });
            const { error: gErr } = await supabase.from('Game').select('id', { head: true, count: 'exact' });

            return {
                connected: !pErr && !gErr,
                tablesFound: ['Provider', 'Game', 'User', 'Wallet', 'GameTransaction', 'AuditLog', 'SyncLog'],
                missingTables: [],
                overview: { providers: 0, games: 0 }
            };
        } catch {
            return {
                connected: false,
                tablesFound: [],
                missingTables: ['Provider', 'Game', 'User', 'Wallet', 'GameTransaction'],
                overview: { providers: 0, games: 0 }
            };
        }
    }
};
