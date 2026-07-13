import { useRef, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import GameCard from 'components/game-card';
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
                            <GameCard name={card.label} image={card.image} href={card.path} provider={card.sublabel} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>
        </Stack>
    );
};

export default FeaturedGameCarousel;
