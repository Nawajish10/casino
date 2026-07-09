import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
//utils
import axios from 'utils/axios';
import { setSession } from 'utils/auth';
import localStorageAvailable from 'utils/localStorageAvailable';
// store
import { balanceAction } from 'store/slices/balance';
import {
    languageAction,
    loginAction,
    logoutAction,
    preferenceAction,
    updatePreferenceAction,
    updateStakesAction,
    updateUserAction
} from 'store/slices/auth';
import { updateDeafultData, updateRecommendGames } from 'store/slices/setting';
// api
import { getUserBalance } from 'api';
import { casinoApi } from 'api/casino.api';
import { settingApi } from 'api/setting.api';
import { notificationApi } from 'api/notification.api';
//
import { AuthContext } from './auth-context';
import { updateNotification } from 'store/slices/notification';
import { getMe, verifyOtp, sendOtp, refreshSession, logoutUser } from 'api/auth.api';
import { walletApi } from 'api/wallet.api';


type AuthProviderProps = {
    children: React.ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
    const dispatch = useDispatch();
    const store = useSelector((state: any) => state.auth);
    const storageAvailable = localStorageAvailable();

    const loadSiteSetting = async () => {
        try {
            const data = await settingApi.getDefaulData();
            dispatch(updateDeafultData(data));
        } catch (error) {
            console.log('error');
        }
    };

    const loadRecommendGames = async () => {
        try {
            const data = await casinoApi.getRecommendGames();
            dispatch(updateRecommendGames(data));
        } catch (error) {
            console.log('error');
        }
    };

    const loadNotifications = async () => {
        try {
            const data = await notificationApi.getNotifications();
            dispatch(updateNotification(data));
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (store.user && store.isLogined) {
            getPreference();
        }
    }, [store.user]);

    const initialize = useCallback(async () => {
        try {
            loadSiteSetting();
            loadRecommendGames();

            const lang = localStorage.getItem('lang');
            if (lang) {
                languageAction(lang);
            } else {
                languageAction('en');
            }
            const accessToken = storageAvailable ? localStorage.getItem('betthrob-accessToken') : '';
            const refreshToken = storageAvailable ? localStorage.getItem('betthrob-refreshToken') : '';
            if (accessToken) {
                setSession(accessToken, refreshToken);
                try {
                    const user = await getMe();
                    dispatch(loginAction({ user, accessToken }));
                    const balanceData = await getUserBalance();
                    dispatch(balanceAction(balanceData));
                    loadNotifications();
                } catch (err) {
                    if (refreshToken) {
                        try {
                            const refreshRes = await refreshSession(refreshToken);
                            const newAccessToken = refreshRes.accessToken;
                            const newRefreshToken = refreshRes.refreshToken;
                            setSession(newAccessToken, newRefreshToken);
                            const user = await getMe();
                            dispatch(loginAction({ user, accessToken: newAccessToken }));
                            const balanceData = await getUserBalance();
                            dispatch(balanceAction(balanceData));
                            loadNotifications();
                        } catch (refreshErr) {
                            setSession(null, null);
                            dispatch(logoutAction());
                        }
                    } else {
                        setSession(null, null);
                        dispatch(logoutAction());
                    }
                }
            } else {
                dispatch(logoutAction());
            }
        } catch (error) {
            setSession(null, null);
            dispatch(logoutAction());
        }
    }, [storageAvailable, dispatch]);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const getPreference = async () => {
        const response = await axios.get('/api/preference');
        dispatch(preferenceAction(response.data));
        dispatch(languageAction(response.data.language));
    };

    // LOGIN
    const login = useCallback(
        async (mobile: string, otp: string) => {
            const response = await verifyOtp(mobile, otp);
            const { accessToken, refreshToken, user } = response;

            setSession(accessToken, refreshToken);
            dispatch(loginAction({ user, accessToken }));
            
            try {
                const syncData = await walletApi.syncWallet();
                dispatch(
                    balanceAction({
                        amount: syncData.balance,
                        currency: 'INR',
                        icon: '₹',
                        pending: 0,
                        bonus: 0,
                        turnover: 0,
                        withdrawable: syncData.balance
                    })
                );
            } catch (err) {
                const balanceData = await getUserBalance();
                dispatch(balanceAction(balanceData));
            }

            loadNotifications();
        },
        [dispatch]
    );

    // REGISTER
    const register = useCallback(async (registerValue: any) => {
        // Handled automatically via verifyOtp
    }, []);

    const setLanguage = useCallback(
        async (value: string) => {
            dispatch(languageAction(value));
        },
        [dispatch]
    );

    // UPDATE STAKES
    const updateStakes = useCallback(
        async (stakes: { name: string; value: number }[]) => {
            dispatch(updateStakesAction(stakes));
        },
        [dispatch]
    );

    const updatePreferenceData = useCallback(
        async (name: string, value: any) => {
            dispatch(updatePreferenceAction({ name, value }));
        },
        [dispatch]
    );

    // UPDATE USER
    const updateUser = useCallback(
        async (params: any) => {
            dispatch(updateUserAction(params));
        },
        [dispatch]
    );

    // LOGOUT
    const logout = useCallback(async () => {
        try {
            const refreshToken = storageAvailable ? localStorage.getItem('betthrob-refreshToken') : '';
            if (refreshToken) {
                await logoutUser(refreshToken);
            }
            setSession(null, null);
            dispatch(logoutAction());
            window.location.href = '/';
        } catch (error) {
            console.log(error);
            setSession(null, null);
            dispatch(logoutAction());
            window.location.href = '/';
        }
    }, [dispatch, storageAvailable]);

    const memoizedValue = useMemo(
        () => ({
            authLoading: store.authLoading,
            accessToken: store.accessToken,
            user: store.user,
            currencies: store.currencies,
            cryptoCurrencies: store.cryptoCurrencies,
            preference: store.preference,
            blockList: store.blockList,
            language: store.language,
            disabledMatch: store.disabledMatch,
            stakes: store.stakes,
            isLogined: store.isLogined,
            login,
            register,
            logout,
            updateUser,
            setLanguage,
            updatePreferenceData,
            updateStakes
        }),
        [store, login, logout, register, updateUser, updateStakes]
    );

    return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
