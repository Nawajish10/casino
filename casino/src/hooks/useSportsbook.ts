import { useQuery } from '@tanstack/react-query';
import { sportsbookApi } from 'api/sportsbook.api';

export const useHomepageSportsbook = () => {
    return useQuery({
        queryKey: ['sportsbook-homepage'],
        queryFn: sportsbookApi.getHomepageFeed,
        refetchInterval: 15000, // Refresh every 15 seconds
    });
};

export const useFullSportsbook = () => {
    return useQuery({
        queryKey: ['sportsbook-full'],
        queryFn: sportsbookApi.getFullFeed,
        refetchInterval: 15000,
    });
};
