import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { walletApi } from 'api/wallet.api';
import { balanceAction } from 'store/slices/balance';

export const useWallet = () => {
    const dispatch = useDispatch();
    const balanceState = useSelector((state: any) => state.balance);
    const [loading, setLoading] = useState(false);

    const fetchWallet = useCallback(async () => {
        setLoading(true);
        try {
            const data = await walletApi.getWallet();
            dispatch(
                balanceAction({
                    amount: data.balance,
                    currency: data.currency,
                    icon: data.currency === 'INR' ? '₹' : '₹',
                    pending: 0,
                    bonus: 0,
                    turnover: 0,
                    withdrawable: data.balance
                })
            );
            return data;
        } catch (error) {
            console.error('Failed to fetch wallet:', error);
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    const sync = useCallback(async () => {
        setLoading(true);
        try {
            const data = await walletApi.syncWallet();
            dispatch(
                balanceAction({
                    amount: data.balance,
                    currency: 'INR',
                    icon: '₹',
                    pending: 0,
                    bonus: 0,
                    turnover: 0,
                    withdrawable: data.balance
                })
            );
            return data;
        } catch (error) {
            console.error('Failed to sync wallet:', error);
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    return {
        wallet: {
            balance: balanceState.amount,
            currency: balanceState.currency
        },
        loading,
        fetchWallet,
        sync
    };
};
export default useWallet;
