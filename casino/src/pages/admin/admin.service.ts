import { supabase } from 'api/supabase';
import { api } from 'api/axios';
import type {
    AgentRecord, AuditLogItem, DashboardMetrics, DepositRequestRecord,
    GameTransactionRecord, PaymentSettingsData, SyncLogItem, SystemHealthInfo,
    UserRecord, WithdrawalRequestRecord
} from './types';

export const adminService = {
    getDashboardOverviewMetrics: async (): Promise<DashboardMetrics> => {
        const metrics: DashboardMetrics = {
            totalAgents: 0,
            activeAgents: 0,
            totalPlayers: 0,
            onlinePlayers: 0,
            todaysDeposits: 0,
            todaysWithdrawals: 0,
            totalWalletBalance: 0,
            platformRevenue: 0,
            activeGames: 0,
            activeProviders: 0,
            betsToday: 0,
            pendingDeposits: 0,
            pendingWithdrawals: 0,
            failedTransactions: 0
        };

        try {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            const todayIso = startOfToday.toISOString();
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            const [
                agentsRes,
                activeAgentsRes,
                usersRes,
                sessionsRes,
                todayDepRes,
                todayWdRes,
                walletsRes,
                txsRes,
                gamesRes,
                providersRes,
                pendingDepRes,
                pendingWdRes,
                failedTxRes
            ] = await Promise.allSettled([
                supabase.from('Agent').select('id', { count: 'exact', head: true }),
                supabase.from('Agent').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
                supabase.from('User').select('id', { count: 'exact', head: true }),
                supabase.from('GameSession').select('id', { count: 'exact', head: true }).gte('startedAt', twentyFourHoursAgo),
                supabase.from('DepositRequest').select('amount').eq('status', 'APPROVED').gte('createdAt', todayIso),
                supabase.from('WithdrawalRequest').select('amount').eq('status', 'APPROVED').gte('createdAt', todayIso),
                supabase.from('Wallet').select('balance'),
                supabase.from('GameTransaction').select('betAmount, winAmount').gte('createdAt', todayIso),
                supabase.from('Game').select('id', { count: 'exact', head: true }).eq('isActive', true),
                supabase.from('Provider').select('id', { count: 'exact', head: true }).eq('status', true),
                supabase.from('DepositRequest').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
                supabase.from('WithdrawalRequest').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
                supabase.from('SyncLog').select('id', { count: 'exact', head: true }).eq('status', 'ERROR')
            ]);

            if (agentsRes.status === 'fulfilled' && agentsRes.value.count !== null) {
                metrics.totalAgents = agentsRes.value.count;
            }
            if (activeAgentsRes.status === 'fulfilled' && activeAgentsRes.value.count !== null) {
                metrics.activeAgents = activeAgentsRes.value.count;
            }
            if (usersRes.status === 'fulfilled' && usersRes.value.count !== null) {
                metrics.totalPlayers = usersRes.value.count;
            }
            if (sessionsRes.status === 'fulfilled' && sessionsRes.value.count !== null) {
                metrics.onlinePlayers = sessionsRes.value.count;
            }

            if (todayDepRes.status === 'fulfilled' && Array.isArray(todayDepRes.value.data)) {
                metrics.todaysDeposits = todayDepRes.value.data.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
            }
            if (todayWdRes.status === 'fulfilled' && Array.isArray(todayWdRes.value.data)) {
                metrics.todaysWithdrawals = todayWdRes.value.data.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
            }
            if (walletsRes.status === 'fulfilled' && Array.isArray(walletsRes.value.data)) {
                metrics.totalWalletBalance = walletsRes.value.data.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
            }

            if (txsRes.status === 'fulfilled' && Array.isArray(txsRes.value.data)) {
                metrics.betsToday = txsRes.value.data.length;
                const totalBet = txsRes.value.data.reduce((sum, t) => sum + (Number(t.betAmount) || 0), 0);
                const totalWin = txsRes.value.data.reduce((sum, t) => sum + (Number(t.winAmount) || 0), 0);
                metrics.platformRevenue = Math.max(0, totalBet - totalWin);
            }

            if (gamesRes.status === 'fulfilled' && gamesRes.value.count !== null) {
                metrics.activeGames = gamesRes.value.count;
            }
            if (providersRes.status === 'fulfilled' && providersRes.value.count !== null) {
                metrics.activeProviders = providersRes.value.count;
            }
            if (pendingDepRes.status === 'fulfilled' && pendingDepRes.value.count !== null) {
                metrics.pendingDeposits = pendingDepRes.value.count;
            }
            if (pendingWdRes.status === 'fulfilled' && pendingWdRes.value.count !== null) {
                metrics.pendingWithdrawals = pendingWdRes.value.count;
            }
            if (failedTxRes.status === 'fulfilled' && failedTxRes.value.count !== null) {
                metrics.failedTransactions = failedTxRes.value.count;
            }
        } catch (error) {
            console.error('Error fetching admin dashboard metrics:', error);
        }

        return metrics;
    },

    // --- AGENT MANAGEMENT ---
    getAgents: async (): Promise<AgentRecord[]> => {
        try {
            const res = await api.get('/api/agents');
            if (res.data && Array.isArray(res.data)) {
                return res.data;
            }
        } catch {}

        try {
            const [agentsRes, playersRes] = await Promise.all([
                supabase.from('Agent').select('*').order('createdAt', { ascending: false }),
                supabase.from('User').select('agentId')
            ]);

            if (!agentsRes.error && Array.isArray(agentsRes.data)) {
                const playersData = playersRes.data || [];
                return agentsRes.data.map((a: any) => {
                    const count = playersData.filter((p: any) => p.agentId === a.id).length;
                    return {
                        id: a.id,
                        name: a.name,
                        username: a.username,
                        email: a.email,
                        mobile: a.mobile || null,
                        status: a.status || 'ACTIVE',
                        walletBalance: Number(a.walletBalance) || 0,
                        assignedPlayersCount: count,
                        lastLoginAt: a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : null,
                        createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'
                    };
                });
            }
        } catch {}

        return [];
    },

    createAgent: async (agent: { name: string; username: string; email: string; mobile?: string; walletBalance?: number }): Promise<boolean> => {
        try {
            const res = await api.post('/api/agents', {
                name: agent.name,
                username: agent.username,
                email: agent.email,
                mobile: agent.mobile,
                initialBalance: agent.walletBalance || 0
            });
            return Boolean(res.data);
        } catch {
            try {
                const { error } = await supabase.from('Agent').insert({
                    id: crypto.randomUUID(),
                    name: agent.name,
                    username: agent.username,
                    email: agent.email,
                    mobile: agent.mobile || null,
                    status: 'ACTIVE',
                    walletBalance: agent.walletBalance || 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                return !error;
            } catch {
                return false;
            }
        }
    },

    updateAgent: async (id: string, data: { name?: string; email?: string; mobile?: string; walletBalance?: number; status?: 'ACTIVE' | 'DISABLED' }): Promise<boolean> => {
        try {
            await api.patch(`/api/agents/${id}`, data);
            return true;
        } catch {
            try {
                const { error } = await supabase.from('Agent').update({ ...data, updatedAt: new Date().toISOString() }).eq('id', id);
                return !error;
            } catch {
                return false;
            }
        }
    },

    toggleAgentStatus: async (id: string): Promise<boolean> => {
        try {
            await api.patch(`/api/agents/${id}/toggle-status`);
            return true;
        } catch {
            try {
                const { data } = await supabase.from('Agent').select('status').eq('id', id).single();
                if (data) {
                    const newStatus = data.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                    const { error } = await supabase.from('Agent').update({ status: newStatus, updatedAt: new Date().toISOString() }).eq('id', id);
                    return !error;
                }
            } catch {}
            return false;
        }
    },

    deleteAgent: async (id: string): Promise<boolean> => {
        try {
            await api.delete(`/api/agents/${id}`);
            return true;
        } catch {
            try {
                await supabase.from('User').update({ agentId: null }).eq('agentId', id);
                const { error } = await supabase.from('Agent').delete().eq('id', id);
                return !error;
            } catch {
                return false;
            }
        }
    },

    // --- PLAYER MANAGEMENT ---
    getUsers: async (): Promise<UserRecord[]> => {
        try {
            const res = await api.get('/api/players');
            if (res.data && Array.isArray(res.data)) {
                return res.data;
            }
        } catch {}

        try {
            const [usersRes, walletsRes, agentsRes] = await Promise.all([
                supabase.from('User').select('*').order('createdAt', { ascending: false }),
                supabase.from('Wallet').select('*'),
                supabase.from('Agent').select('id, name')
            ]);

            const usersData = usersRes.data || [];
            const walletsData = walletsRes.data || [];
            const agentsData = agentsRes.data || [];

            return usersData.map((u: any) => {
                const userWallet = walletsData.find((w: any) => w.userId === u.id);
                const assignedAgentObj = agentsData.find((a: any) => a.id === u.agentId);
                return {
                    id: u.id,
                    username: u.username || u.mobile || 'N/A',
                    mobile: u.mobile || 'N/A',
                    email: u.email || null,
                    name: u.name || null,
                    agentId: u.agentId || null,
                    assignedAgent: assignedAgentObj ? assignedAgentObj.name : 'Unassigned',
                    status: u.status || 'ACTIVE',
                    createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
                    lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : null,
                    walletBalance: userWallet ? Number(userWallet.balance) || 0 : 0
                };
            });
        } catch (error) {
            console.error('Error fetching players:', error);
            return [];
        }
    },

    updatePlayer: async (id: string, data: { name?: string; email?: string; agentId?: string | null; status?: 'ACTIVE' | 'SUSPENDED' }): Promise<boolean> => {
        try {
            await api.patch(`/api/players/${id}`, data);
            return true;
        } catch {
            try {
                const { error } = await supabase.from('User').update({ ...data, updatedAt: new Date().toISOString() }).eq('id', id);
                return !error;
            } catch {
                return false;
            }
        }
    },

    togglePlayerStatus: async (id: string): Promise<boolean> => {
        try {
            await api.patch(`/api/players/${id}/toggle-status`);
            return true;
        } catch {
            try {
                const { data } = await supabase.from('User').select('status').eq('id', id).single();
                if (data) {
                    const newStatus = data.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
                    const { error } = await supabase.from('User').update({ status: newStatus, updatedAt: new Date().toISOString() }).eq('id', id);
                    return !error;
                }
            } catch {}
            return false;
        }
    },

    deletePlayer: async (id: string): Promise<boolean> => {
        try {
            await api.delete(`/api/players/${id}`);
            return true;
        } catch {
            try {
                await supabase.from('Wallet').delete().eq('userId', id);
                const { error } = await supabase.from('User').delete().eq('id', id);
                return !error;
            } catch {
                return false;
            }
        }
    },

    getPlayerDepositHistory: async (playerId: string): Promise<DepositRequestRecord[]> => {
        try {
            const res = await api.get(`/api/players/${playerId}/deposits`);
            if (res.data && Array.isArray(res.data)) return res.data;
        } catch {}

        try {
            const { data } = await supabase.from('DepositRequest').select('*').eq('userId', playerId).order('createdAt', { ascending: false });
            if (Array.isArray(data)) {
                return data.map((d: any) => ({
                    id: d.id,
                    userId: d.userId,
                    username: d.username,
                    amount: Number(d.amount) || 0,
                    gateway: d.gateway || 'UPI QR',
                    utr: d.utr,
                    screenshotUrl: d.screenshotUrl || null,
                    status: d.status || 'PENDING',
                    rejectReason: d.rejectReason || null,
                    createdAt: d.createdAt ? new Date(d.createdAt).toLocaleString() : 'N/A'
                }));
            }
        } catch {}
        return [];
    },

    getPlayerWithdrawalHistory: async (playerId: string): Promise<WithdrawalRequestRecord[]> => {
        try {
            const res = await api.get(`/api/players/${playerId}/withdrawals`);
            if (res.data && Array.isArray(res.data)) return res.data;
        } catch {}

        try {
            const { data } = await supabase.from('WithdrawalRequest').select('*').eq('userId', playerId).order('createdAt', { ascending: false });
            if (Array.isArray(data)) {
                return data.map((w: any) => ({
                    id: w.id,
                    userId: w.userId,
                    username: w.username,
                    amount: Number(w.amount) || 0,
                    bankName: w.bankName,
                    accountNumber: w.accountNumber,
                    ifsc: w.ifsc,
                    status: w.status || 'PENDING',
                    rejectReason: w.rejectReason || null,
                    createdAt: w.createdAt ? new Date(w.createdAt).toLocaleString() : 'N/A'
                }));
            }
        } catch {}
        return [];
    },

    // --- PAYMENT SETTINGS & QR CODE MANAGEMENT ---
    getPaymentSettings: async (): Promise<PaymentSettingsData> => {
        try {
            const { data } = await supabase.from('PaymentSettings').select('*').single();
            if (data) {
                return {
                    upiId: data.upiId || 'playverse@upi',
                    upiName: data.upiName || 'PLAYVERSE GAMING',
                    qrCodeUrl: data.qrCodeUrl || null,
                    minDeposit: Number(data.minDeposit) || 100,
                    maxDeposit: Number(data.maxDeposit) || 100000,
                    isEnabled: Boolean(data.isEnabled)
                };
            }
        } catch {}

        return {
            upiId: 'playverse@upi',
            upiName: 'PLAYVERSE GAMING ARCHITECTURE',
            qrCodeUrl: null,
            minDeposit: 100,
            maxDeposit: 100000,
            isEnabled: true
        };
    },

    updatePaymentSettings: async (settings: PaymentSettingsData): Promise<boolean> => {
        try {
            const { error } = await supabase.from('PaymentSettings').upsert({
                id: 'default',
                upiId: settings.upiId,
                upiName: settings.upiName,
                qrCodeUrl: settings.qrCodeUrl,
                minDeposit: settings.minDeposit,
                maxDeposit: settings.maxDeposit,
                isEnabled: settings.isEnabled,
                updatedAt: new Date().toISOString()
            });
            return !error;
        } catch {
            return false;
        }
    },

    uploadPaymentQrCode: async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/api/upload/qr', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data && res.data.url) {
                return res.data.url;
            }
        } catch (error) {
            console.error('Error uploading payment QR code via API, trying base64 fallback:', error);
        }

        // Base64 fallback if backend offline
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    },

    uploadDepositScreenshot: async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/api/upload/screenshot', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data && res.data.url) {
                return res.data.url;
            }
        } catch (error) {
            console.error('Error uploading payment screenshot via API:', error);
        }

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    },

    submitDepositRequest: async (req: { userId: string; username: string; amount: number; utr: string; screenshotUrl: string | null }): Promise<boolean> => {
        try {
            // Find player's assigned agent
            const { data: userData } = await supabase.from('User').select('agentId, agent(name)').eq('id', req.userId).single();
            const agentId = userData?.agentId || null;
            const agentName = (userData as any)?.agent?.name || 'Direct / Unassigned';

            const { error } = await supabase.from('DepositRequest').insert({
                id: crypto.randomUUID(),
                userId: req.userId,
                username: req.username,
                agentId,
                agentName,
                amount: req.amount,
                gateway: 'UPI QR',
                utr: req.utr,
                screenshotUrl: req.screenshotUrl,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            return !error;
        } catch {
            return false;
        }
    },

    // --- DEPOSIT MANAGEMENT ---
    getDepositRequests: async (): Promise<DepositRequestRecord[]> => {
        try {
            const [depositsRes, usersRes, agentsRes] = await Promise.all([
                supabase.from('DepositRequest').select('*').order('createdAt', { ascending: false }),
                supabase.from('User').select('id, agentId'),
                supabase.from('Agent').select('id, name')
            ]);

            if (!depositsRes.error && Array.isArray(depositsRes.data)) {
                const usersData = usersRes.data || [];
                const agentsData = agentsRes.data || [];

                return depositsRes.data.map((d: any) => {
                    const userObj = usersData.find((u: any) => u.id === d.userId);
                    const agentObj = agentsData.find((a: any) => a.id === (d.agentId || userObj?.agentId));
                    return {
                        id: d.id,
                        userId: d.userId,
                        username: d.username,
                        agentId: d.agentId || userObj?.agentId || null,
                        assignedAgent: d.agentName || (agentObj ? agentObj.name : 'Unassigned'),
                        amount: Number(d.amount) || 0,
                        gateway: d.gateway || 'UPI QR',
                        utr: d.utr,
                        screenshotUrl: d.screenshotUrl || null,
                        status: d.status || 'PENDING',
                        rejectReason: d.rejectReason || null,
                        createdAt: d.createdAt ? new Date(d.createdAt).toLocaleString() : 'N/A'
                    };
                });
            }
            return [];
        } catch {
            return [];
        }
    },

    approveDepositRequest: async (depositId: string, userId: string, amount: number): Promise<boolean> => {
        try {
            const { error: depErr } = await supabase
                .from('DepositRequest')
                .update({ status: 'APPROVED', updatedAt: new Date().toISOString() })
                .eq('id', depositId);

            if (depErr) return false;

            const { data: walletData } = await supabase.from('Wallet').select('*').eq('userId', userId).single();

            if (walletData) {
                const newBalance = (Number(walletData.balance) || 0) + amount;
                await supabase
                    .from('Wallet')
                    .update({ balance: newBalance, updatedAt: new Date().toISOString() })
                    .eq('userId', userId);
            } else {
                await supabase.from('Wallet').insert({
                    userId: userId,
                    balance: amount,
                    currency: 'INR'
                });
            }

            return true;
        } catch {
            return false;
        }
    },

    rejectDepositRequest: async (depositId: string, reason: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('DepositRequest')
                .update({ status: 'REJECTED', rejectReason: reason, updatedAt: new Date().toISOString() })
                .eq('id', depositId);
            return !error;
        } catch {
            return false;
        }
    },

    // --- WITHDRAWAL MANAGEMENT ---
    getWithdrawalRequests: async (): Promise<WithdrawalRequestRecord[]> => {
        try {
            const { data, error } = await supabase
                .from('WithdrawalRequest')
                .select('*')
                .order('createdAt', { ascending: false });

            if (!error && Array.isArray(data)) {
                return data.map((w: any) => ({
                    id: w.id,
                    userId: w.userId,
                    username: w.username,
                    amount: Number(w.amount) || 0,
                    bankName: w.bankName,
                    accountNumber: w.accountNumber,
                    ifsc: w.ifsc,
                    status: w.status || 'PENDING',
                    rejectReason: w.rejectReason || null,
                    createdAt: w.createdAt ? new Date(w.createdAt).toLocaleString() : 'N/A'
                }));
            }
            return [];
        } catch {
            return [];
        }
    },

    approveWithdrawalRequest: async (withdrawalId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('WithdrawalRequest')
                .update({ status: 'APPROVED', updatedAt: new Date().toISOString() })
                .eq('id', withdrawalId);
            return !error;
        } catch {
            return false;
        }
    },

    rejectWithdrawalRequest: async (withdrawalId: string, reason: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('WithdrawalRequest')
                .update({ status: 'REJECTED', rejectReason: reason, updatedAt: new Date().toISOString() })
                .eq('id', withdrawalId);
            return !error;
        } catch {
            return false;
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
                    actor: l.adminUser || 'Admin',
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

        try {
            const { error: pErr } = await supabase.from('Provider').select('id', { head: true, count: 'exact' });
            const { error: gErr } = await supabase.from('Game').select('id', { head: true, count: 'exact' });

            return {
                connected: !pErr && !gErr,
                tablesFound: ['Agent', 'User', 'Wallet', 'Provider', 'Game', 'GameTransaction', 'AuditLog', 'SyncLog', 'DepositRequest', 'WithdrawalRequest', 'PaymentSettings'],
                missingTables: [],
                overview: { providers: 0, games: 0 }
            };
        } catch {
            return {
                connected: false,
                tablesFound: [],
                missingTables: ['Provider', 'Game', 'User', 'Wallet'],
                overview: { providers: 0, games: 0 }
            };
        }
    }
};
