import axios from 'utils/axios';

// Auth
export const updateUsername = async (username: string) => {
    const res = await axios.patch('/api/player/username', { username });
    return res.data;
};

export const updateAvatar = async (formData: FormData) => {
    const res = await axios.patch('/api/player/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return res.data;
};

export const updatePassword = async (data: any) => {
    const res = await axios.patch('/api/player/password', data);
    return res.data;
};

export const getKyc = async () => {
    const res = await axios.get('/api/player/kyc');
    return res.data;
};

export const personalVerify = async (data: FormData) => {
    const res = await axios.post('/api/player/kyc', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return res.data;
};

export const updatePreference = async (data: any) => {
    const res = await axios.patch('/api/preference', data);
    return res.data;
};

export const updateSelectedCurrency = async (currencyId: string) => {
    const res = await axios.patch('/api/player/currency', { currencyId });
    return res.data;
};

// Game
export const getProviderGameList = async (data: {
    gameType: string;
    productIds: number[];
    currentPage: number;
    perPage: number;
}) => {
    const res = await axios.post('/api/casino/games', data);
    return res.data;
};

export const getSports = async () => {
    const res = await axios.get(`/api/sport`);
    return res.data;
};

export const getGameDetails = async (gameCode: string) => {
    const res = await axios.get(`/games/detail/${gameCode}`);
    return res.data;
};

export const gameLaunch = async (data: {
    gameCode?: string;
    language?: string;
    device?: string;
    providerCode?: string;
    productCode?: string | number;
    gameType?: string;
    currency?: string;
}) => {
    if (data.gameCode) {
        const res = await axios.post(`/games/${data.gameCode}/launch`, {
            lang: data.language || 'en',
            device: data.device || 'desktop'
        });
        return res.data;
    } else {
        const res = await axios.post(`/games/launch`, {
            providerCode: data.providerCode,
            productCode: data.productCode,
            gameType: data.gameType,
            lang: data.language || 'en',
            device: data.device || 'desktop'
        });
        return res.data;
    }
};

export const getProviderList = async (type: string) => {
    const res = await axios.get('/providers');
    return res.data;
};

import { FALLBACK_GAMES } from '../data/fallbackGames';

export const getGamesBySearch = async (name: string, gameType: string, currentPage: number, perPage: number) => {
    try {
        const res = await axios.get(`/games/search?q=${name}&page=${currentPage}&limit=${perPage}`);
        if (res.data && res.data.items) {
            return { data: res.data.items || [], count: res.data.total || 0 };
        }
    } catch (err) {
        console.warn('[getGamesBySearch] Error, using fallback games search');
    }
    const filtered = FALLBACK_GAMES.filter(g => 
        g.gameName.toLowerCase().includes(name.toLowerCase()) || 
        g.gameCode.toLowerCase().includes(name.toLowerCase())
    );
    const start = (currentPage - 1) * perPage;
    return { data: filtered.slice(start, start + perPage), count: filtered.length };
};

// Slot
export const getSlotGames = async (data: {
    currentPage: number;
    perPage: number;
    categories?: string;
    provider?: string[];
}) => {
    try {
        let url = `/games/active?page=${data.currentPage}&limit=${data.perPage}`;
        if (data.provider && data.provider.length > 0 && data.provider[0] !== 'All') {
            url = `/games/provider/${data.provider[0]}?page=${data.currentPage}&limit=${data.perPage}`;
        } else if (data.categories) {
            url = `/games/category/${data.categories}?page=${data.currentPage}&limit=${data.perPage}`;
        }
        const res = await axios.get(url);
        if (res.data && res.data.items) {
            return { data: res.data.items || [], count: res.data.total || 0 };
        }
    } catch (err) {
        console.warn('[getSlotGames] Error, using fallback games');
    }

    let filtered = FALLBACK_GAMES;
    if (data.categories) {
        const cat = data.categories.toLowerCase();
        filtered = FALLBACK_GAMES.filter(g => (g.category || '').toLowerCase().includes(cat));
    }
    const page = data.currentPage || 1;
    const limit = data.perPage || 20;
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), count: filtered.length };
};

export const getSlotProviders = async (categorie: string) => {
    try {
        const res = await axios.get('/providers');
        if (res.data && Array.isArray(res.data)) {
            return res.data.map((p: any) => p.providerCode);
        }
    } catch (err) {
        console.warn('[getSlotProviders] Error, using fallback provider codes');
    }
    return ['HABANERO', 'PRAGMATIC', 'BOOONGO', 'PLAYSON'];
};

export const getAgCategory = async () => {
    try {
        const res = await axios.get('/api/casino/ag-category');
        return res.data;
    } catch (err) {
        return [];
    }
};

export const getAgGameDetails = async (gameCode: string) => {
    try {
        const res = await axios.get(`/games/detail/${gameCode}`);
        if (res.data) return res.data;
    } catch (err) {
        console.warn('[getAgGameDetails] Error, using fallback game details');
    }
    const found = FALLBACK_GAMES.find(g => g.gameCode === gameCode || g.id === gameCode);
    return found || FALLBACK_GAMES[0];
};

// Payment
export const nowpayDeposit = async (amount: number, currency: string) => {
    const res = await axios.post('/api/nowpay/deposit', { amount, currency });
    return res.data;
};

export const getNowPaymentCurrencies = async () => {
    const res = await axios.get('/api/nowpay/currency');
    return res.data;
};

export const getCurrencyList = async () => {
    const res = await axios.get('/api/currency/list');
    return res.data;
};

export const getUserBalance = async () => {
    const res = await axios.get('/api/player/balance');

    return res.data;
};

// Withdraw api
export const getWithdrawCurrency = async (withdrawAmount: number, currencyCode: string) => {
    const res = await axios.post('/api/nowpay/get-withdraw-currency', { withdrawAmount, currencyCode });
    return res.data;
};

export const withdraw = async (
    fromCurrency: String,
    toCurrency: string,
    fromAmount: number,
    payoutType: string,
    address: string
) => {
    const res = await axios.post('/api/withdraw', { fromCurrency, toCurrency, fromAmount, payoutType, address });
    return res.data;
};

// histories
export const getTransactions = async (data: any) => {
    const res = await axios.post('/api/player/transaction', data);
    return res.data;
};

// bonus
export const getBonusList = async () => {
    const res = await axios.get('/api/bonus');

    return res.data;
};

export const getBonusById = async (id: string) => {
    const res = await axios.get(`/api/bonus/${id}`);

    return res.data;
};

export const getPackages = async () => {
    const res = await axios.get('/api/package');

    return res.data;
};

// Offline Games
export {
    playCoinFlip,
    playDice,
    playHiLo,
    startMines,
    clickMinesTile,
    cashoutMines,
    getActiveMinesGame,
    playRoulette,
    getGameHistory,
    getAllGameHistory
} from './offlineGame.api';
