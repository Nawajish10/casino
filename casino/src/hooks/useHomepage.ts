import { useQuery } from '@tanstack/react-query';
import { homepageApi } from '../api/homepage.api';

export const useFeaturedGames = () => {
    return useQuery({
        queryKey: ['homepage', 'featured'],
        queryFn: homepageApi.getFeaturedGames,
        staleTime: 60000,
    });
};

export const usePopularGames = () => {
    return useQuery({
        queryKey: ['homepage', 'popular'],
        queryFn: homepageApi.getPopularGames,
        staleTime: 60000,
    });
};

export const useLiveCasinoGames = () => {
    return useQuery({
        queryKey: ['homepage', 'live-casino'],
        queryFn: homepageApi.getLiveCasinoGames,
        staleTime: 60000,
    });
};

export const useSlotsGames = () => {
    return useQuery({
        queryKey: ['homepage', 'slots'],
        queryFn: homepageApi.getSlotsGames,
        staleTime: 60000,
    });
};

export const useProviders = () => {
    return useQuery({
        queryKey: ['homepage', 'providers'],
        queryFn: homepageApi.getProviders,
        staleTime: 120000,
    });
};
