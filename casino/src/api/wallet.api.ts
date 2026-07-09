import { api } from './axios';

export const walletApi = {
    getWallet: async () => {
        const res = await api.get('/wallet/me');
        return res.data;
    },
    syncWallet: async () => {
        const res = await api.post('/wallet/sync');
        return res.data;
    },
    getAgentBalance: async () => {
        const res = await api.get('/wallet/agent-balance');
        return res.data;
    }
};
