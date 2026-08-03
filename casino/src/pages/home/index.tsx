import { useEffect } from 'react';
// @mui
import { Box, Typography, Stack } from '@mui/material';
// components
import Banner from 'components/banner';
import FeaturedGameCarousel from 'components/featured-game-carousel';
import GameLauncherCards from 'components/game-launcher-cards';

import GameGridSkeleton from 'components/game-card/game-grid-skeleton';
// hooks
import { useFeaturedGames, usePopularGames, useLiveCasinoGames, useSlotsGames } from 'hooks/useHomepage';
import { FALLBACK_GAMES } from 'data/fallbackGames';
// swiper css
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Home = () => {
    const { data: popularGames, isLoading: isLoadingPopular, error: popularError } = usePopularGames();
    const { data: featuredGamesData, isLoading: isLoadingFeatured } = useFeaturedGames();
    const { data: liveCasinoGames, isLoading: isLoadingLive } = useLiveCasinoGames();
    const { data: slotsGames, isLoading: isLoadingSlots } = useSlotsGames();

    useEffect(() => {
        if (popularError) {
            console.error('[Top Games API Error]', popularError);
        }
    }, [popularError]);

    // Helper to generate a deterministic vibrant color from a string (game id/name)
    const getAccentColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ['#FF5630', '#00BAE6', '#22C55E', '#8E33FF', '#FFAB00', '#E53935'];
        return colors[Math.abs(hash) % colors.length];
    };

    // Combine all retrieved games to act as a fallback pool
    const allGamesPool = [
        ...(featuredGamesData || []),
        ...(popularGames || []),
        ...(liveCasinoGames || []),
        ...(slotsGames || []),
        ...FALLBACK_GAMES
    ];

    const uniqueGamesMap = new Map();
    allGamesPool.forEach((g: any) => {
        if (g && (g.id || g.gameCode)) {
            const key = g.gameCode || g.id;
            if (!uniqueGamesMap.has(key)) {
                uniqueGamesMap.set(key, g);
            }
        }
    });
    const fallbackGames = Array.from(uniqueGamesMap.values());

    const mandatoryFeatured = [
        {
            id: 'featured-aviator',
            gameCode: 'aviator',
            gameName: 'Aviator',
            category: 'Originals',
            thumbnail: '/aviator.png',
            banner: '/aviator.png',
            image_url: '/aviator.png',
            providerName: 'Spribe',
            isFeatured: true,
        },
        {
            id: 'featured-casino',
            gameCode: 'casino',
            gameName: 'Casino',
            category: 'Table Games',
            thumbnail: '/assets/casino.png',
            banner: '/assets/casino.png',
            providerName: '87 Originals',
            isFeatured: true,
        },
        {
            id: 'featured-roulette',
            gameCode: 'roulette',
            gameName: 'Roulette',
            category: 'Live Casino',
            thumbnail: '/assets/featured/live-casino.png',
            banner: '/assets/featured/live-casino.png',
            providerName: '87 Originals',
            isFeatured: true,
        }
    ];

    // Featured Games section must contain ONLY 3 games: Aviator, Casino, Roulette
    const featuredGames = mandatoryFeatured;

    let popularGamesList = (popularGames && popularGames.length > 0) ? popularGames : [];
    if (popularGamesList.length === 0) {
        popularGamesList = fallbackGames.filter((g: any) => g.isPopular);
        if (popularGamesList.length === 0) {
            popularGamesList = fallbackGames.slice(0, 12);
        }
    }

    let liveCasinoList = (liveCasinoGames && liveCasinoGames.length > 0) ? liveCasinoGames : [];
    if (liveCasinoList.length === 0) {
        liveCasinoList = fallbackGames.filter((g: any) => (g.category || '').toLowerCase().includes('live'));
        if (liveCasinoList.length === 0) {
            liveCasinoList = fallbackGames.slice(12, 24);
        }
    }

    let slotsList = (slotsGames && slotsGames.length > 0) ? slotsGames : [];
    if (slotsList.length === 0) {
        slotsList = fallbackGames.filter((g: any) => (g.category || '').toLowerCase().includes('slot'));
        if (slotsList.length === 0) {
            slotsList = fallbackGames.slice(0, 24);
        }
    }

    const featuredItems = featuredGames?.map((g: any) => ({
        id: g.id,
        label: g.gameName,
        sublabel: g.Provider?.providerName || g.providerName || g.category || 'Featured',
        accentColor: getAccentColor(g.id || g.gameCode),
        image: g.banner || g.thumbnail || '/default-game.svg',
        path: `/game/${g.gameCode}`
    })) || [];

    const popularItems = popularGamesList?.map((g: any) => ({
        id: g.id,
        name: g.gameName,
        image: g.thumbnail || g.banner || '/default-game.svg',
        path: `/game/${g.gameCode}`,
        provider: g.Provider?.providerName || g.providerName
    })) || [];

    const liveItems = liveCasinoList?.map((g: any) => ({
        id: g.id,
        name: g.gameName,
        image: g.thumbnail || g.banner || '/default-game.svg',
        path: `/game/${g.gameCode}`,
        provider: g.Provider?.providerName || g.providerName
    })) || [];

    const slotItems = slotsList?.map((g: any) => ({
        id: g.id,
        name: g.gameName,
        image: g.thumbnail || g.banner || '/default-game.svg',
        path: `/game/${g.gameCode}`,
        provider: g.Provider?.providerName || g.providerName
    })) || [];


    // Dedicated Crash Games list
    const crashGamesList = [
        {
            id: 'crash-aviator',
            gameCode: 'aviator',
            gameName: 'Aviator',
            thumbnail: '/aviator.png',
            banner: '/aviator.png',
            image_url: '/aviator.png',
            providerName: 'Spribe'
        },
        {
            id: 'crash-mines',
            gameCode: 'mines',
            gameName: 'Mines',
            thumbnail: 'https://assets.bd34fgabh.com/img/habanero/SGHotHotSummer.png',
            providerName: '87 Originals'
        },
        {
            id: 'crash-dice',
            gameCode: 'dice',
            gameName: 'Dice',
            thumbnail: 'https://assets.bd34fgabh.com/gs2c/common/lobby/v1/apps/slots-lobby-assets/vs20olympgate/vs20olympgate_800x600_NB.avif',
            providerName: '87 Originals'
        },
        {
            id: 'crash-hilo',
            gameCode: 'hilo',
            gameName: 'HiLo',
            thumbnail: '/assets/casino.webp',
            providerName: '87 Originals'
        },
        {
            id: 'crash-roulette',
            gameCode: 'roulette',
            gameName: 'Roulette',
            thumbnail: 'https://assets.bd34fgabh.com/gs2c/common/lobby/v1/apps/slots-lobby-assets/vswayscheist/vswayscheist_800x600_NB.avif',
            providerName: '87 Originals'
        }
    ];

    const crashItems = crashGamesList.map((g: any) => ({
        id: g.id,
        name: g.gameName,
        image: g.thumbnail || '/default-game.svg',
        path: `/game/${g.gameCode}`,
        provider: g.providerName
    }));

    return (
        <Box sx={{ overflowX: 'hidden' }}>

            {/* ── 1. Hero Banner ─────────────────────────────────────── */}
            <Banner />

            {/* ── 2. Featured Game Carousel (large swipeable cards) ──── */}
            {isLoadingFeatured ? (
                <Box sx={{ p: 3 }}><GameGridSkeleton count={3} /></Box>
            ) : featuredItems.length > 0 ? (
                <FeaturedGameCarousel
                    items={featuredItems}
                    title="Featured Games"
                />
            ) : null}

            {/* ── 3. Crash Games (Dedicated Section featuring Aviator) ──── */}
            <GameLauncherCards
                items={crashItems}
                title="Crash & Originals"
            />

            {/* ── 4. Custom Banner Image ─────────────────────────── */}
            <Box sx={{ width: '100%', px: { xs: 0.5, md: 1 }, py: 2 }}>
                <Box
                    component="img"
                    src="/custom-banner.png"
                    alt="Casino Games Banner"
                    sx={{ 
                        width: '100%', 
                        height: 'auto',
                        aspectRatio: { xs: '16/8', sm: '21/8', md: '28/8' }, 
                        objectFit: 'cover', 
                        borderRadius: 3,
                        boxShadow: '0px 8px 32px rgba(0,0,0,0.4)',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'scale(1.004)'
                        }
                    }}
                />
            </Box>

            {/* ── 5. Top Games ───────────────── */}
            {isLoadingPopular ? (
                <Box sx={{ p: 3 }}><GameGridSkeleton count={6} /></Box>
            ) : popularItems.length > 0 ? (
                <GameLauncherCards
                    items={popularItems}
                    title="Top Games"
                />
            ) : null}

            {/* ── 6. Live Casino ───────────────── */}
            {isLoadingLive ? (
                <Box sx={{ p: 3 }}><GameGridSkeleton count={6} /></Box>
            ) : liveItems.length > 0 ? (
                <GameLauncherCards
                    items={liveItems}
                    title="Live Casino"
                />
            ) : null}

            {/* ── 7. Slots ───────────────── */}
            {isLoadingSlots ? (
                <Box sx={{ p: 3 }}><GameGridSkeleton count={6} /></Box>
            ) : slotItems.length > 0 ? (
                <GameLauncherCards
                    items={slotItems}
                    title="Slots"
                />
            ) : null}

        </Box>
    );
};

export default Home;
