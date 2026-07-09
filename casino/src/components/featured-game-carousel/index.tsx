import { useRef, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FeaturedCard {
    id: string;
    label: string;
    sublabel?: string;
    image: string;           // banner background image
    path: string;            // navigation target (uses existing routing)
    accentColor: string;     // gradient accent for overlay
    badge?: string;          // e.g. 'HOT', 'LIVE', 'NEW'
}

interface FeaturedGameCarouselProps {
    items: FeaturedCard[];
    title?: string;
}

// ─── Single Card ──────────────────────────────────────────────────────────────
const FeaturedCard = memo(({ card }: { card: FeaturedCard }) => {
    return (
        <Link to={card.path} style={{ textDecoration: 'none', display: 'block' }}>
            <Box
                id={`featured-card-${card.id}`}
                sx={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    aspectRatio: '2 / 1',
                    cursor: 'pointer',
                    userSelect: 'none',
                    // Hover effect
                    transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
                    '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${card.accentColor}44`,
                    },
                    // Active/press effect (mobile-friendly)
                    '&:active': {
                        transform: 'scale(0.97)',
                        transition: 'transform 0.1s ease',
                    },
                }}
            >
                {/* Background image — lazy loaded */}
                <Box
                    component="img"
                    src={card.image}
                    loading="lazy"
                    alt={card.label}
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transition: 'transform 0.4s ease',
                        '.featured-card-wrap:hover &': {
                            transform: 'scale(1.05)',
                        },
                    }}
                />

                {/* Dark gradient overlay for text readability */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(135deg, ${card.accentColor}55 0%, transparent 50%, rgba(0,0,0,0.55) 100%)`,
                    }}
                />

                {/* Bottom gradient for label */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '55%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)',
                    }}
                />

                {/* Badge */}
                {card.badge && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            bgcolor: card.badge === 'LIVE' ? '#e53935' : card.badge === 'HOT' ? '#f57c00' : '#1565c0',
                            borderRadius: '6px',
                            px: 1,
                            py: 0.3,
                        }}
                    >
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
                            {card.badge}
                        </Typography>
                    </Box>
                )}

                {/* Label */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: { xs: 1.5, sm: 2 },
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '0.875rem', sm: '1.125rem', md: '1.25rem' },
                            color: '#fff',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                            lineHeight: 1.2,
                        }}
                    >
                        {card.label}
                    </Typography>
                    {card.sublabel && (
                        <Typography
                            sx={{
                                fontWeight: 500,
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                color: 'rgba(255,255,255,0.75)',
                                mt: 0.3,
                            }}
                        >
                            {card.sublabel}
                        </Typography>
                    )}
                </Box>

                {/* Shimmer effect on hover */}
                <Box
                    className="shimmer"
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.08) 50%, transparent 65%)',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                        '&:hover': { opacity: 1 },
                        pointerEvents: 'none',
                    }}
                />
            </Box>
        </Link>
    );
});

FeaturedCard.displayName = 'FeaturedCard';

// ─── Main Carousel ────────────────────────────────────────────────────────────
const FeaturedGameCarousel = ({ items, title = 'Featured Games' }: FeaturedGameCarouselProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Responsive slides visible
    const slidesPerView = isMobile ? 1.15 : isTablet ? 2.15 : 3.25;

    return (
        <Stack gap={1.5} sx={{ mt: 3 }}>
            {title && (
                <Typography
                    sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: 'text.primary',
                        letterSpacing: '0.05em',
                        px: { xs: 1, sm: 2, md: 3 },
                    }}
                >
                    {title}
                </Typography>
            )}

            {/* Full-bleed slider — breaks out of Container max-width */}
            <Box
                sx={{
                    position: 'relative',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100vw',
                    px: { xs: 1, sm: 2, md: 3 },
                    boxSizing: 'border-box',
                    '& .swiper': {
                        overflow: 'visible',
                        paddingBottom: '4px',
                    },
                    '& .swiper-slide': {
                        height: 'auto',
                    },
                }}
            >
                <Swiper
                    modules={[FreeMode, Autoplay]}
                    slidesPerView={slidesPerView}
                    spaceBetween={12}
                    freeMode={{
                        enabled: true,
                        momentumRatio: 0.6,
                        momentumVelocityRatio: 0.8,
                    }}
                    grabCursor={true}
                    autoplay={{
                        delay: 4500,
                        disableOnInteraction: true,
                        pauseOnMouseEnter: true,
                    }}
                    loop={items.length > Math.ceil(slidesPerView)}
                    style={{ width: '100%' }}
                >
                    {items.map((card) => (
                        <SwiperSlide key={card.id}>
                            <FeaturedCard card={card} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>
        </Stack>
    );
};

export default FeaturedGameCarousel;
