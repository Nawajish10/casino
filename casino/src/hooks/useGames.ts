import { useQuery } from '@tanstack/react-query';
import { gameApi } from '../api/game.api';

export const useSearchGames = (query: string) => {
    return useQuery({
        queryKey: ['games', 'search', query],
        queryFn: () => gameApi.searchGames(query),
        enabled: query.length > 2,
        staleTime: 30000,
    });
};

export const useCategoryGames = (category: string) => {
    return useQuery({
        queryKey: ['games', 'category', category],
        queryFn: () => gameApi.getGamesByCategory(category),
        enabled: !!category,
        staleTime: 60000,
    });
};

export const useProviderGames = (providerCode: string) => {
    return useQuery({
        queryKey: ['games', 'provider', providerCode],
        queryFn: () => gameApi.getGamesByProvider(providerCode),
        enabled: !!providerCode,
        staleTime: 60000,
    });
};
