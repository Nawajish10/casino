import { memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, Stack, Typography, useMediaQuery, useTheme, Skeleton } from '@mui/material';
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

// ─── Single Small Game Card ───────────────────────────────────────────────────
const SmallGameCard = memo(({ item }: { item: TopGameItem }) => {
    return (
        <Link to={item.path} style={{ textDecoration: 'none', display: 'block' }}>
            <Box
                id={`top-game-${item.id}`}
                sx={{
                    position: 'relative',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    userSelect: 'none',
                    bgcolor: 'background.layer3',
                    aspectRatio: '16 / 9',
                    // Hover: scale + shadow
                    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-3px) scale(1.04)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                    },
                    // Active (mobile tap)
                    '&:active': {
                        transform: 'scale(0.95)',
                        transition: 'transform 0.08s ease',
                    },
                }}
            >
                {/* Game thumbnail — lazy loaded */}
                <Box
                    component="img"
                    src={item.image}
                    loading="lazy"
                    alt={item.name}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block',
                    }}
                />

                {/* Hover overlay with play icon */}
                <Box
                    className="game-overlay"
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        '.MuiBox-root:hover &': { opacity: 1 },
                    }}
                >
                    {/* Play circle */}
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.15)',
                            border: '2px solid rgba(255,255,255,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <Box
                            sx={{
                                width: 0,
                                height: 0,
                                borderTop: '7px solid transparent',
                                borderBottom: '7px solid transparent',
                                borderLeft: '12px solid rgba(255,255,255,0.9)',
                                ml: '3px',
                            }}
                        />
                    </Box>
                </Box>

                {/* HOT / NEW badge */}
                {(item.isHot || item.isNew) && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            bgcolor: item.isHot ? '#f57c00' : '#1565c0',
                            borderRadius: '4px',
                            px: 0.6,
                            py: 0.2,
                        }}
                    >
                        <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>
                            {item.isHot ? 'HOT' : 'NEW'}
                        </Typography>
                    </Box>
                )}

                {/* Bottom label */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        px: 0.75,
                        py: 0.75,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                    }}
                >
                    <Typography
                        noWrap
                        sx={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: '#fff',
                            textAlign: 'center',
                        }}
                    >
                        {item.name}
                    </Typography>
                    {item.provider && (
                        <Typography
                            noWrap
                            sx={{
                                fontSize: '0.55rem',
                                fontWeight: 500,
                                color: 'rgba(255,255,255,0.6)',
                                textAlign: 'center',
                            }}
                        >
                            {item.provider}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Link>
    );
});

SmallGameCard.displayName = 'SmallGameCard';

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const GameCardSkeleton = () => (
    <Box sx={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '16 / 9' }}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: 'background.layer3', transform: 'none' }} />
    </Box>
);

// ─── GameLauncherCards ────────────────────────────────────────────────────────
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
                                  <SmallGameCard item={item} />
                              </SwiperSlide>
                          ))}
                </Swiper>
            </Box>
        </Stack>
    );
};

export default GameLauncherCards;
