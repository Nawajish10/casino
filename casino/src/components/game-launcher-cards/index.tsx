import { memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, Stack, Typography, useMediaQuery, useTheme, Skeleton } from '@mui/material';
import GameCard from 'components/game-card';
// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TopGameItem {
    id: string;
    name: string;
    image: string;         // thumbnail image
    path: string;          // uses existing game routing (e.g. /ag-game/:id)
    provider?: string;     // optional provider badge
    isHot?: boolean;
    isNew?: boolean;
}

interface GameLauncherCardsProps {
    items: TopGameItem[];
    title?: string;
    loading?: boolean;
    onSeeAll?: () => void;
}
// ─── Skeleton Card ────────────────────────────────────────────────────────────
const GameCardSkeleton = () => (
    <Box sx={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '16 / 9' }}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: 'background.layer3', transform: 'none' }} />
    </Box>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const GameLauncherCards = ({ items, title = 'Top Games', loading = false, onSeeAll }: GameLauncherCardsProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const slidesPerView = isMobile ? 3.2 : isTablet ? 5.2 : 8.5;

    const skeletonCount = isMobile ? 4 : isTablet ? 6 : 9;

    return (
        <Stack gap={1.5} sx={{ mt: 3 }}>
            {/* Section Header — stays within normal padding */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ px: { xs: 1, sm: 2, md: 3 } }}
            >
                <Typography
                    sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: 'text.primary',
                        letterSpacing: '0.05em',
                    }}
                >
                    {title}
                </Typography>
                {onSeeAll && (
                    <Box
                        component="span"
                        onClick={onSeeAll}
                        sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'primary.main',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        See All →
                    </Box>
                )}
            </Stack>

            {/* Full-bleed slider — breaks out of Container max-width */}
            <Box
                sx={{
                    position: 'relative',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100vw',
                    px: { xs: 1, sm: 2, md: 3 },
                    boxSizing: 'border-box',
                    '& .swiper': { overflow: 'visible', paddingBottom: '4px' },
                }}
            >
                <Swiper
                    modules={[FreeMode]}
                    slidesPerView={slidesPerView}
                    spaceBetween={8}
                    freeMode={{
                        enabled: true,
                        momentumRatio: 0.5,
                        momentumVelocityRatio: 0.7,
                    }}
                    grabCursor={true}
                    style={{ width: '100%' }}
                >
                    {loading
                        ? Array.from({ length: skeletonCount }).map((_, i) => (
                              <SwiperSlide key={`sk-${i}`}>
                                  <GameCardSkeleton />
                              </SwiperSlide>
                          ))
                        : items.map((item) => (
                              <SwiperSlide key={item.id}>
                                  <GameCard name={item.name} image={item.image} href={item.path} provider={item.provider} />
                              </SwiperSlide>
                          ))}
                </Swiper>
            </Box>
        </Stack>
    );
};

export default GameLauncherCards;
