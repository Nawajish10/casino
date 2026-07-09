import { api } from './axios';

export interface GameTransaction {
    id: string; transactionId: string; providerCode: string; gameCode: string; gameName: string; gameImage: string | null; gameType: string;
    transactionType: string; betAmount: string; winAmount: string; userStartBalance: string;
    userEndBalance: string; createdAt: string;
}
export interface TransactionPage { items: GameTransaction[]; total: number; page: number; limit: number; pages: number }
export interface TransactionQuery { page?: number; limit?: number; start?: string; end?: string }

export const transactionsApi = {
    mine: async (params: TransactionQuery) => (await api.get<TransactionPage>('/transactions/me', { params })).data,
    sync: async (params: TransactionQuery = {}) => (await api.post('/transactions/sync', undefined, { params })).data,
};
