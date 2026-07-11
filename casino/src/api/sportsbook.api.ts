import { api } from './axios';

export interface SportsbookMatch {
    id: number;
    time: string;
    teams: string;
    isLive: boolean;
    odds: {
        oneBlue: string;
        onePink: string;
        xBlue: string;
        xPink: string;
        twoBlue: string;
        twoPink: string;
    };
}

export interface SportsbookCategory {
    sport: string;
    matches: SportsbookMatch[];
}

export const sportsbookApi = {
    getHomepageFeed: async (): Promise<SportsbookCategory[]> => {
        const response = await api.get('/sportsbook/homepage');
        return response.data;
    },
    getFullFeed: async (): Promise<SportsbookCategory[]> => {
        const response = await api.get('/sportsbook');
        return response.data;
    }
};
