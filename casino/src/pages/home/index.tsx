import { useEffect } from 'react';
// @mui
import { Box, Typography, Stack } from '@mui/material';
// components
import Banner from 'components/banner';
import FeaturedGameCarousel from 'components/featured-game-carousel';
import GameLauncherCards from 'components/game-launcher-cards';
import SportsbookTable from 'components/sportsbook-table';
import GameGridSkeleton from 'components/game-card/game-grid-skeleton';
// hooks
import { useFeaturedGames, usePopularGames } from 'hooks/useHomepage';
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

    const featuredItems = [
        {
            id: 'aviator',
            label: 'Aviator',
            sublabel: 'Spribe',
            accentColor: '#FF5630',
            image: '/assets/featured/aviator.png',
            path: '/game/aviator'
        },
        {
            id: 'casino',
            label: 'Casino',
            sublabel: 'Live Lobby',
            accentColor: '#00BAE6',
            image: '/assets/featured/live-casino.png',
            path: '/casino'
        },
        {
            id: 'roulette',
            label: 'Roulette',
            sublabel: 'Classic Table',
            accentColor: '#22C55E',
            image: '/assets/images/games/roulette.png',
            path: '/offline-games/roulette'
        }
    ];

    const popularItems = popularGames?.map(g => ({
        id: g.id,
        name: g.gameName,
        image: g.thumbnail || '/default-game.png',
        path: `/game/${g.gameCode}`,
        provider: (g as any).Provider?.providerName || g.providerName
    })) || [];

    return (
        <Box sx={{ overflowX: 'hidden' }}>

            {/* ── 1. Hero Banner ─────────────────────────────────────── */}
            <Banner />

            {/* ── 2. Featured Game Carousel (large swipeable cards) ──── */}
            <FeaturedGameCarousel
                items={featuredItems}
                title="Featured Games"
            />

            {/* ── 3 & 4. Custom Banner Image ─────────────────────────── */}
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

            <SportsbookTable />
        </Box>
    );
};

export default Home;
