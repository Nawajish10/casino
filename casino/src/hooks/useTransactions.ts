import { useQuery } from '@tanstack/react-query';
import { TransactionQuery, transactionsApi } from 'api/transactions.api';

export const useTransactions = (params: TransactionQuery = {}) => useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionsApi.mine(params),
});
