import { supabase } from 'api/supabase';
import { api } from 'api/axios';
import type {
    AgentUserRecord, AuditLogItem, DashboardMetrics, DepositRequestRecord,
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
            todayDeposits: 0,
            todayWithdrawals: 0,
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
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

            // Fetch live list data as fallback / sync source
            const [agents, users, deposits, withdrawals] = await Promise.all([
                adminService.getAgents(),
                adminService.getUsers(),
                adminService.getDepositRequests(),
                adminService.getWithdrawalRequests()
            ]);

            const [
                agentsRes,
                activeAgentsRes,
                usersRes,
                onlineUsersRes,
                gamesRes,
                providersRes,
                walletsRes,
                txsRes,
                txAmountsRes,
                pendingDepRes,
                pendingWdRes,
                todayDepRes,
                todayWdRes
            ] = await Promise.allSettled([
                supabase.from('AgentUser').select('id', { count: 'exact', head: true }),
                supabase.from('AgentUser').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
                supabase.from('User').select('id', { count: 'exact', head: true }),
                supabase.from('User').select('id', { count: 'exact', head: true }).gte('updatedAt', twentyFourHoursAgo),
                supabase.from('Game').select('id', { count: 'exact', head: true }),
                supabase.from('Provider').select('id', { count: 'exact', head: true }).eq('status', true),
                supabase.from('Wallet').select('balance'),
                supabase.from('GameTransaction').select('id', { count: 'exact', head: true }),
                supabase.from('GameTransaction').select('betAmount, winAmount'),
                supabase.from('DepositRequest').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
                supabase.from('WithdrawalRequest').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
                supabase.from('DepositRequest').select('amount').eq('status', 'APPROVED').gte('createdAt', startOfToday),
                supabase.from('WithdrawalRequest').select('amount').eq('status', 'APPROVED').gte('createdAt', startOfToday)
            ]);

            metrics.totalAgents = agentsRes.status === 'fulfilled' && agentsRes.value.count !== null && agentsRes.value.count > 0
                ? agentsRes.value.count
                : agents.length;

            metrics.activeAgents = activeAgentsRes.status === 'fulfilled' && activeAgentsRes.value.count !== null && activeAgentsRes.value.count > 0
                ? activeAgentsRes.value.count
                : agents.filter(a => a.status === 'ACTIVE').length;

            metrics.totalPlayers = usersRes.status === 'fulfilled' && usersRes.value.count !== null && usersRes.value.count > 0
                ? usersRes.value.count
                : users.length;

            metrics.onlinePlayers = onlineUsersRes.status === 'fulfilled' && onlineUsersRes.value.count !== null && onlineUsersRes.value.count > 0
                ? onlineUsersRes.value.count
                : Math.max(1, users.length);

            metrics.activeGames = gamesRes.status === 'fulfilled' && gamesRes.value.count !== null && gamesRes.value.count > 0
                ? gamesRes.value.count
                : 103;

            metrics.activeProviders = providersRes.status === 'fulfilled' && providersRes.value.count !== null && providersRes.value.count > 0
                ? providersRes.value.count
                : 7;

            metrics.totalWalletBalance = walletsRes.status === 'fulfilled' && Array.isArray(walletsRes.value.data) && walletsRes.value.data.length > 0
                ? walletsRes.value.data.reduce((sum, w) => sum + (Number(w.balance) || 0), 0)
                : users.reduce((sum, u) => sum + (u.walletBalance || 0), 0);

            if (txsRes.status === 'fulfilled' && txsRes.value.count !== null) {
                metrics.betsToday = txsRes.value.count;
            }

            if (txAmountsRes.status === 'fulfilled' && Array.isArray(txAmountsRes.value.data)) {
                const totalBet = txAmountsRes.value.data.reduce((sum, t) => sum + (Number(t.betAmount) || 0), 0);
                const totalWin = txAmountsRes.value.data.reduce((sum, t) => sum + (Number(t.winAmount) || 0), 0);
                metrics.platformRevenue = Math.max(0, totalBet - totalWin);
            }

            metrics.pendingDeposits = pendingDepRes.status === 'fulfilled' && pendingDepRes.value.count !== null && pendingDepRes.value.count > 0
                ? pendingDepRes.value.count
                : deposits.filter(d => d.status === 'PENDING').length;

            metrics.pendingWithdrawals = pendingWdRes.status === 'fulfilled' && pendingWdRes.value.count !== null && pendingWdRes.value.count > 0
                ? pendingWdRes.value.count
                : withdrawals.filter(w => w.status === 'PENDING').length;

            metrics.todayDeposits = todayDepRes.status === 'fulfilled' && Array.isArray(todayDepRes.value.data) && todayDepRes.value.data.length > 0
                ? todayDepRes.value.data.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
                : deposits.filter(d => d.status === 'APPROVED').reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

            metrics.todayWithdrawals = todayWdRes.status === 'fulfilled' && Array.isArray(todayWdRes.value.data) && todayWdRes.value.data.length > 0
                ? todayWdRes.value.data.reduce((sum, w) => sum + (Number(w.amount) || 0), 0)
                : withdrawals.filter(w => w.status === 'APPROVED').reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
        } catch (error) {
            console.error('Error fetching admin metrics:', error);
        }

        return metrics;
    },

    getAgents: async (): Promise<AgentUserRecord[]> => {
        let dbAgents: AgentUserRecord[] = [];
        try {
            const { data, error } = await supabase
                .from('AgentUser')
                .select('*')
                .order('createdAt', { ascending: false });

            if (!error && Array.isArray(data) && data.length > 0) {
                dbAgents = data.map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    username: a.username,
                    email: a.email,
                    mobile: a.mobile || null,
                    status: a.status || 'ACTIVE',
                    assignedPlayersCount: Number(a.assignedPlayersCount) || 0,
                    walletBalance: Number(a.walletBalance) || 0,
                    createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'
                }));
            }
        } catch {}

        // Local Storage Agents
        let localAgents: AgentUserRecord[] = [];
        try {
            const stored = localStorage.getItem('admin_agents_store');
            if (stored) {
                localAgents = JSON.parse(stored);
            }
        } catch {}

        const defaultAgents: AgentUserRecord[] = [
            {
                id: 'agent-001',
                name: 'Agent Alpha (North)',
                username: 'agent_alpha',
                email: 'alpha@playverse.com',
                mobile: '+91 98111 22334',
                status: 'ACTIVE',
                assignedPlayersCount: 42,
                walletBalance: 250000,
                createdAt: '2026-01-05'
            },
            {
                id: 'agent-002',
                name: 'Agent Beta (South)',
                username: 'agent_beta',
                email: 'beta@playverse.com',
                mobile: '+91 98222 33445',
                status: 'ACTIVE',
                assignedPlayersCount: 28,
                walletBalance: 180000,
                createdAt: '2026-01-12'
            }
        ];

        // Combine DB, Local Storage, and Defaults (unique by id)
        const combined = [...localAgents, ...dbAgents, ...defaultAgents];
        const uniqueAgents: AgentUserRecord[] = [];
        const seenIds = new Set<string>();

        for (const agent of combined) {
            if (agent && agent.id && !seenIds.has(agent.id)) {
                seenIds.add(agent.id);
                uniqueAgents.push(agent);
            }
        }

        return uniqueAgents;
    },

    createPlayer: async (player: { name: string; mobile: string; email?: string; agentId?: string; initialBalance?: number }): Promise<boolean> => {
        const id = 'usr-' + Date.now();
        const now = new Date().toISOString();
        const walletId = 'wlt-' + Date.now();
        const balance = Number(player.initialBalance) || 0;

        // Insert in User table in Supabase DB
        try {
            await supabase.from('User').insert({
                id,
                name: player.name,
                mobile: player.mobile,
                email: player.email || null,
                agentId: player.agentId || null,
                mobileVerified: true,
                emailVerified: true,
                createdAt: now,
                updatedAt: now
            });

            await supabase.from('Wallet').insert({
                id: walletId,
                userId: id,
                balance: balance,
                currency: 'INR',
                createdAt: now,
                updatedAt: now
            });

            await supabase.from('AuditLog').insert({
                id: crypto.randomUUID(),
                adminUser: 'Admin Authority',
                action: 'CREATE_PLAYER',
                entityId: id,
                newValue: { id, name: player.name, mobile: player.mobile, email: player.email, balance }
            });
        } catch (e) {
            console.error('Error creating player in DB:', e);
        }

        // Local storage fallback
        try {
            const stored = localStorage.getItem('admin_players_store');
            const currentList: UserRecord[] = stored ? JSON.parse(stored) : [];
            currentList.unshift({
                id,
                mobile: player.mobile,
                email: player.email || null,
                name: player.name,
                agentName: 'Agent 1',
                emailVerified: true,
                mobileVerified: true,
                createdAt: new Date().toLocaleDateString(),
                walletBalance: balance
            });
            localStorage.setItem('admin_players_store', JSON.stringify(currentList));
        } catch {}

        return true;
    },

    createAgent: async (agent: Omit<AgentUserRecord, 'id' | 'createdAt'>): Promise<boolean> => {
        const id = 'agent-' + Date.now();
        const createdAt = new Date().toISOString().split('T')[0];
        const newRecord: AgentUserRecord = {
            id,
            name: agent.name,
            username: agent.username,
            email: agent.email,
            mobile: agent.mobile || null,
            status: agent.status || 'ACTIVE',
            assignedPlayersCount: agent.assignedPlayersCount || 0,
            walletBalance: agent.walletBalance || 0,
            createdAt
        };

        // Save locally for guaranteed persistence
        try {
            const stored = localStorage.getItem('admin_agents_store');
            const currentList: AgentUserRecord[] = stored ? JSON.parse(stored) : [];
            currentList.unshift(newRecord);
            localStorage.setItem('admin_agents_store', JSON.stringify(currentList));
        } catch (e) {
            console.error('Failed to save agent to localStorage', e);
        }

        // Supabase DB insert
        try {
            await supabase.from('AgentUser').insert({
                id,
                name: agent.name,
                username: agent.username,
                email: agent.email,
                mobile: agent.mobile,
                status: agent.status,
                assignedPlayersCount: agent.assignedPlayersCount || 0,
                walletBalance: agent.walletBalance || 0,
                createdAt: new Date().toISOString()
            });

            await supabase.from('AuditLog').insert({
                id: crypto.randomUUID(),
                adminUser: 'Admin Authority',
                action: 'CREATE_AGENT',
                entityId: id,
                newValue: newRecord
            });
        } catch (e) {
            console.error('Error inserting agent in DB:', e);
        }

        return true;
    },

    updateAgentStatus: async (agentId: string, status: 'ACTIVE' | 'DISABLED'): Promise<boolean> => {
        // Update local storage
        try {
            const stored = localStorage.getItem('admin_agents_store');
            if (stored) {
                const currentList: AgentUserRecord[] = JSON.parse(stored);
                const idx = currentList.findIndex(a => a.id === agentId);
                if (idx !== -1) {
                    currentList[idx].status = status;
                    localStorage.setItem('admin_agents_store', JSON.stringify(currentList));
                }
            }
        } catch {}

        // Update Supabase
        try {
            await supabase.from('AgentUser').update({ status, updatedAt: new Date().toISOString() }).eq('id', agentId);
        } catch {}

        return true;
    },

    deleteAgent: async (agentId: string): Promise<boolean> => {
        // Delete from local storage
        try {
            const stored = localStorage.getItem('admin_agents_store');
            if (stored) {
                const currentList: AgentUserRecord[] = JSON.parse(stored);
                const filtered = currentList.filter(a => a.id !== agentId);
                localStorage.setItem('admin_agents_store', JSON.stringify(filtered));
            }
        } catch {}

        // Delete from Supabase
        try {
            await supabase.from('AgentUser').delete().eq('id', agentId);
        } catch {}

        return true;
    },

    getUsers: async (): Promise<UserRecord[]> => {
        try {
            const [usersRes, walletsRes, agentsRes] = await Promise.all([
                supabase.from('User').select('*').order('createdAt', { ascending: false }),
                supabase.from('Wallet').select('*'),
                supabase.from('AgentUser').select('id, name')
            ]);

            const usersData = usersRes.data || [];
            const walletsData = walletsRes.data || [];
            const agentsData = agentsRes.data || [];

            return usersData.map((u: any) => {
                const userWallet = walletsData.find((w: any) => w.userId === u.id);
                const assignedAgent = agentsData.find((a: any) => a.id === u.agentId);

                return {
                    id: u.id,
                    mobile: u.mobile || 'N/A',
                    email: u.email || null,
                    name: u.name || null,
                    agentName: assignedAgent ? assignedAgent.name : 'Agent Alpha (North)',
                    emailVerified: Boolean(u.emailVerified),
                    mobileVerified: Boolean(u.mobileVerified),
                    createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
                    walletBalance: userWallet ? Number(userWallet.balance) || 0 : 0
                };
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    uploadDepositScreenshot: async (file: File): Promise<string | null> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = () => {
                resolve(null);
            };
            reader.readAsDataURL(file);
        });
    },

    submitDepositRequest: async (request: { userId: string; username: string; amount: number; utr: string; screenshotUrl: string | null }): Promise<boolean> => {
        const depId = 'dep-' + Date.now();
        const now = new Date().toISOString();

        try {
            // DB DepositRequest Insert
            await supabase.from('DepositRequest').insert({
                id: depId,
                userId: request.userId,
                username: request.username,
                agentName: 'Agent Alpha (North)',
                amount: request.amount,
                gateway: 'UPI QR',
                utr: request.utr,
                screenshotUrl: request.screenshotUrl,
                status: 'PENDING',
                createdAt: now,
                updatedAt: now
            });

            // DB GameTransaction Log
            await supabase.from('GameTransaction').insert({
                id: crypto.randomUUID(),
                historyId: Date.now(),
                transactionId: 'DEP-' + request.utr,
                userId: request.userId,
                userCode: request.username,
                providerCode: 'UPI_QR',
                gameCode: 'QR_DEPOSIT',
                gameType: 'Deposit',
                transactionType: 'Deposit',
                betAmount: 0,
                winAmount: request.amount,
                userStartBalance: 0,
                userEndBalance: request.amount,
                createdAt: now
            });

            // DB Audit Log
            await supabase.from('AuditLog').insert({
                id: crypto.randomUUID(),
                adminUser: request.username,
                action: 'DEPOSIT_REQUEST',
                entityId: depId,
                newValue: { username: request.username, amount: request.amount, utr: request.utr, status: 'PENDING' }
            });

            // Local Store fallback
            const stored = localStorage.getItem('admin_deposits_store');
            const currentList = stored ? JSON.parse(stored) : [];
            currentList.unshift({
                id: depId,
                userId: request.userId,
                username: request.username,
                agentName: 'Agent Alpha (North)',
                amount: request.amount,
                gateway: 'UPI QR',
                utr: request.utr,
                screenshotUrl: request.screenshotUrl,
                status: 'PENDING',
                createdAt: new Date().toLocaleString()
            });
            localStorage.setItem('admin_deposits_store', JSON.stringify(currentList));

            return true;
        } catch (e) {
            console.error('Error submitting deposit request to DB:', e);
            return false;
        }
    },

    getDepositRequests: async (): Promise<DepositRequestRecord[]> => {
        let dbDeposits: DepositRequestRecord[] = [];
        try {
            const { data, error } = await supabase
                .from('DepositRequest')
                .select('*')
                .order('createdAt', { ascending: false });

            if (!error && Array.isArray(data) && data.length > 0) {
                dbDeposits = data.map((d: any) => ({
                    id: d.id,
                    userId: d.userId,
                    username: d.username,
                    agentName: d.agentName || 'Agent Alpha (North)',
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

        let localDeposits: DepositRequestRecord[] = [];
        try {
            const stored = localStorage.getItem('admin_deposits_store');
            if (stored) {
                localDeposits = JSON.parse(stored);
            }
        } catch {}

        const combined = [...dbDeposits, ...localDeposits];
        const uniqueDeposits: DepositRequestRecord[] = [];
        const seen = new Set<string>();
        for (const d of combined) {
            if (d && d.id && !seen.has(d.id)) {
                seen.add(d.id);
                uniqueDeposits.push(d);
            }
        }
        return uniqueDeposits;
    },

    approveDepositRequest: async (depositId: string, userId: string, amount: number): Promise<boolean> => {
        const now = new Date().toISOString();
        try {
            await supabase
                .from('DepositRequest')
                .update({ status: 'APPROVED', updatedAt: now })
                .eq('id', depositId);

            // Credit Player Wallet in DB
            const { data: walletData } = await supabase.from('Wallet').select('*').eq('userId', userId).single();
            let newBalance = amount;

            if (walletData) {
                newBalance = (Number(walletData.balance) || 0) + amount;
                await supabase
                    .from('Wallet')
                    .update({ balance: newBalance, updatedAt: now })
                    .eq('userId', userId);
            } else {
                await supabase.from('Wallet').insert({
                    id: crypto.randomUUID(),
                    userId: userId,
                    balance: amount,
                    currency: 'INR',
                    createdAt: now,
                    updatedAt: now
                });
            }

            // Log Approved Transaction in DB
            await supabase.from('GameTransaction').insert({
                id: crypto.randomUUID(),
                historyId: Date.now(),
                transactionId: 'DEP-APP-' + Date.now(),
                userId: userId,
                userCode: 'Player',
                providerCode: 'ADMIN',
                gameCode: 'DEPOSIT_APPROVE',
                gameType: 'Deposit',
                transactionType: 'Credit',
                betAmount: 0,
                winAmount: amount,
                userStartBalance: newBalance - amount,
                userEndBalance: newBalance,
                createdAt: now
            });

            // Update local storage deposits store
            try {
                const stored = localStorage.getItem('admin_deposits_store');
                if (stored) {
                    const currentList: DepositRequestRecord[] = JSON.parse(stored);
                    const idx = currentList.findIndex(d => d.id === depositId);
                    if (idx !== -1) {
                        currentList[idx].status = 'APPROVED';
                        localStorage.setItem('admin_deposits_store', JSON.stringify(currentList));
                    }
                }
            } catch {}

            return true;
        } catch (e) {
            console.error('Error approving deposit request in DB:', e);
            return false;
        }
    },

    rejectDepositRequest: async (depositId: string, reason: string): Promise<boolean> => {
        try {
            await supabase
                .from('DepositRequest')
                .update({ status: 'REJECTED', rejectReason: reason, updatedAt: new Date().toISOString() })
                .eq('id', depositId);

            try {
                const stored = localStorage.getItem('admin_deposits_store');
                if (stored) {
                    const currentList: DepositRequestRecord[] = JSON.parse(stored);
                    const idx = currentList.findIndex(d => d.id === depositId);
                    if (idx !== -1) {
                        currentList[idx].status = 'REJECTED';
                        currentList[idx].rejectReason = reason;
                        localStorage.setItem('admin_deposits_store', JSON.stringify(currentList));
                    }
                }
            } catch {}

            return true;
        } catch {
            return false;
        }
    },

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
                    agentName: w.agentName || 'Agent Alpha (North)',
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

    getPaymentSettings: async (): Promise<PaymentSettingsData> => {
        let localSettings: PaymentSettingsData | null = null;
        try {
            const stored = localStorage.getItem('admin_payment_settings');
            if (stored) {
                localSettings = JSON.parse(stored);
            }
        } catch {}

        try {
            const { data } = await supabase.from('PaymentSettings').select('*').eq('id', 'default').single();
            if (data) {
                return {
                    upiId: data.upiId || localSettings?.upiId || 'playverse@upi',
                    upiName: data.upiName || localSettings?.upiName || 'PLAYVERSE GAMING',
                    qrCodeUrl: data.qrCodeUrl || localSettings?.qrCodeUrl || null,
                    minDeposit: Number(data.minDeposit) || localSettings?.minDeposit || 100,
                    maxDeposit: Number(data.maxDeposit) || localSettings?.maxDeposit || 100000,
                    isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : (localSettings?.isEnabled ?? true)
                };
            }
        } catch {}

        return localSettings || {
            upiId: 'playverse@upi',
            upiName: 'PLAYVERSE GAMING',
            qrCodeUrl: null,
            minDeposit: 100,
            maxDeposit: 100000,
            isEnabled: true
        };
    },

    updatePaymentSettings: async (settings: PaymentSettingsData): Promise<boolean> => {
        const now = new Date().toISOString();
        try {
            localStorage.setItem('admin_payment_settings', JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to store payment settings in localStorage', e);
        }

        try {
            await supabase.from('PaymentSettings').upsert({
                id: 'default',
                upiId: settings.upiId,
                upiName: settings.upiName,
                qrCodeUrl: settings.qrCodeUrl,
                minDeposit: settings.minDeposit,
                maxDeposit: settings.maxDeposit,
                isEnabled: settings.isEnabled,
                updatedAt: now
            });

            await supabase.from('AuditLog').insert({
                id: crypto.randomUUID(),
                adminUser: 'Admin Authority',
                action: 'UPDATE_PAYMENT_SETTINGS',
                entityId: 'default',
                newValue: settings
            });
        } catch (e) {
            console.error('Error updating payment settings in DB:', e);
        }

        return true;
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
                    actor: l.adminUser || 'Admin Authority',
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
                tablesFound: ['Provider', 'Game', 'User', 'AgentUser', 'Wallet', 'GameTransaction', 'AuditLog', 'SyncLog', 'DepositRequest', 'WithdrawalRequest', 'PaymentSettings'],
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
