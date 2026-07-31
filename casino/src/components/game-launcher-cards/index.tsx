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
    <Box sx={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '3 / 4' }}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: 'background.layer3', transform: 'none' }} />
    </Box>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const GameLauncherCards = ({ items, title = 'Top Games', loading = false, onSeeAll }: GameLauncherCardsProps) => {
    return (
        <Stack gap={1.5} sx={{ mt: 3 }}>
            {/* Section Header */}
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

            {/* Responsive Container without viewport overflow */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    px: { xs: 0.5, sm: 1 },
                    boxSizing: 'border-box',
                    '& .swiper': { overflow: 'hidden', paddingBottom: '4px' },
                }}
            >
                <Swiper
                    modules={[FreeMode]}
                    spaceBetween={10}
                    breakpoints={{
                        320: { slidesPerView: 2.3, spaceBetween: 8 },
                        480: { slidesPerView: 3.3, spaceBetween: 10 },
                        768: { slidesPerView: 4.5, spaceBetween: 10 },
                        1024: { slidesPerView: 6.2, spaceBetween: 12 },
                        1440: { slidesPerView: 7.2, spaceBetween: 12 }
                    }}
                    freeMode={{
                        enabled: true,
                        momentumRatio: 0.5,
                        momentumVelocityRatio: 0.7,
                    }}
                    grabCursor={true}
                    style={{ width: '100%' }}
                >
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => (
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
