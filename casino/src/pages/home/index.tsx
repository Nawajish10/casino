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
            thumbnail: 'https://bc.imgix.net/game/image/3ab84825-7a44-4793-b167-f7bdc0dbb8f2.png',
            banner: 'https://bc.imgix.net/game/image/3ab84825-7a44-4793-b167-f7bdc0dbb8f2.png',
            providerName: 'Spribe',
            isFeatured: true,
        },
        {
            id: 'featured-casino',
            gameCode: 'casino',
            gameName: 'Casino',
            category: 'Table Games',
            thumbnail: '/assets/casino.webp',
            banner: '/assets/casino.webp',
            providerName: '87 Originals',
            isFeatured: true,
        },
        {
            id: 'featured-roulette',
            gameCode: 'roulette',
            gameName: 'Roulette',
            category: 'Live Casino',
            thumbnail: 'https://assets.bd34fgabh.com/gs2c/common/lobby/v1/apps/slots-lobby-assets/vswayscheist/vswayscheist_800x600_NB.avif',
            banner: 'https://assets.bd34fgabh.com/gs2c/common/lobby/v1/apps/slots-lobby-assets/vswayscheist/vswayscheist_800x600_NB.avif',
            providerName: '87 Originals',
            isFeatured: true,
        }
    ];

    const rawFeatured = (featuredGamesData && featuredGamesData.length > 0)
        ? featuredGamesData
        : fallbackGames.filter((g: any) => g.isFeatured);

    // Pin mandatory 3 featured games (Aviator, Casino, Roulette) at top without duplicates
    const mandatoryKeys = new Set(mandatoryFeatured.map(m => m.gameCode));
    const otherFeatured = rawFeatured.filter((g: any) => !mandatoryKeys.has(g.gameCode || g.id));
    const featuredGames = [...mandatoryFeatured, ...otherFeatured].slice(0, 15);

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


    return (
        <Box sx={{ overflowX: 'hidden' }}>

            {/* ── 1. Hero Banner ─────────────────────────────────────── */}
            <Banner />

            {/* ── 2. Featured Game Carousel (large swipeable cards) ──── */}
            {isLoadingFeatured ? (
                <Box sx={{ p: 3 }}><GameGridSkeleton count={3} /></Box>
            ) : featuredItems.length > 0 && (
                <FeaturedGameCarousel
                    items={featuredItems}
                    title="Featured Games"
                />
            )}

            {/* ── 3. Custom Banner Image ─────────────────────────── */}
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

            {/* ── 4. Top Games (small clickable cards) ───────────────── */}
            {isLoadingPopular ? (
                <Box sx={{ p: 3 }}><GameGridSkeleton count={6} /></Box>
            ) : popularItems.length > 0 ? (
                <GameLauncherCards
                    items={popularItems}
                    title="Top Games"
                />
            ) : (
                <Stack sx={{ p: 5, textAlign: 'center', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 2, mx: 3, mb: 3 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Top Games Available
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                        Check back later for our most popular games!
                    </Typography>
                </Stack>
            )}

            {/* ── 5. Live Casino ───────────────── */}
            {isLoadingLive ? (
                <Box sx={{ p: 3 }}><GameGridSkeleton count={6} /></Box>
            ) : liveItems.length > 0 && (
                <GameLauncherCards
                    items={liveItems}
                    title="Live Casino"
                />
            )}

            {/* ── 6. Slots ───────────────── */}
            {isLoadingSlots ? (
                <Box sx={{ p: 3 }}><GameGridSkeleton count={6} /></Box>
            ) : slotItems.length > 0 && (
                <GameLauncherCards
                    items={slotItems}
                    title="Slots"
                />
            )}


        </Box>
    );
};

export default Home;
