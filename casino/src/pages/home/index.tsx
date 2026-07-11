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
// swiper css
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Home = () => {
    const { data: popularGames, isLoading: isLoadingPopular, error: popularError } = usePopularGames();

    useEffect(() => {
        if (popularError) {
            console.error('[Top Games API Error]', popularError);
        }
    }, [popularError]);

    const { data: featuredGamesData, isLoading: isLoadingFeatured } = useFeaturedGames();

    // Helper to generate a deterministic vibrant color from a string (game id/name)
    const getAccentColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ['#FF5630', '#00BAE6', '#22C55E', '#8E33FF', '#FFAB00', '#E53935'];
        return colors[Math.abs(hash) % colors.length];
    };

    const featuredItems = featuredGamesData?.map((g: any) => ({
        id: g.id,
        label: g.gameName,
        sublabel: g.Provider?.providerName || g.providerName || g.category || 'Featured',
        accentColor: getAccentColor(g.id || g.gameCode),
        image: g.banner || g.thumbnail || '/default-game.svg',
        path: `/game/${g.gameCode}`
    })) || [];

    const popularItems = popularGames?.map((g: any) => ({
        id: g.id,
        name: g.gameName,
        image: g.thumbnail || g.banner || '/default-game.svg',
        path: `/game/${g.gameCode}`,
        provider: g.Provider?.providerName || g.providerName
    })) || [];

    const { data: liveCasinoGames, isLoading: isLoadingLive } = useLiveCasinoGames();
    const { data: slotsGames, isLoading: isLoadingSlots } = useSlotsGames();

    const liveItems = liveCasinoGames?.map((g: any) => ({
        id: g.id,
        name: g.gameName,
        image: g.thumbnail || g.banner || '/default-game.svg',
        path: `/game/${g.gameCode}`,
        provider: g.Provider?.providerName || g.providerName
    })) || [];

    const slotItems = slotsGames?.map((g: any) => ({
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
            <Box sx={{ width: '100%', px: { xs: 0.5, md: 1 }, py: 3.5 }}>
                <Box
                    component="img"
                    src="/custom-banner.png"
                    alt="Casino Games Banner"
                    sx={{ 
                        width: '100%', 
                        height: { xs: 200, sm: 320, md: 440 }, 
                        objectFit: 'contain', 
                        bgcolor: '#000000',
                        borderRadius: 2,
                        boxShadow: '0px 12px 40px rgba(0,0,0,0.6)',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'scale(1.006)'
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
