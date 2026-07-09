import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Stack,
    Typography,
    Skeleton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
// Swiper — used on mobile for swipe support
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PromoBannerItem {
    /** Unique key */
    id: string;
    /** Display title (also used for alt text) */
    title: string;
    /** Image source — lazy loaded */
    image: string;
    /** Route to navigate to on click */
    route: string;
    /** Optional CTA label */
    cta?: string;
    /** Optional badge text e.g. "NEW", "HOT", "LIVE" */
    badge?: string;
    /** Badge color override */
    badgeColor?: string;
}

interface PromotionalBannerRowProps {
    items: PromoBannerItem[];
    /** How many columns on desktop (default 3) */
    desktopCols?: 2 | 3;
    /** Section title — omit to hide */
    title?: string;
}

// ─── Badge colours map ────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
    HOT: '#f57c00',
    NEW: '#1565c0',
    LIVE: '#e53935',
};

// ─── Single Banner Card ───────────────────────────────────────────────────────
const PromoBannerCard = memo(({ item }: { item: PromoBannerItem }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);

    const badgeBg = item.badgeColor ?? (item.badge ? BADGE_COLORS[item.badge] ?? '#333' : '#333');

    return (
        <Link to={item.route} style={{ textDecoration: 'none', display: 'block' }}>
            <Box
                id={`promo-banner-${item.id}`}
                sx={{
                    position: 'relative',
                    width: '100%',
                    // Stable 16:6 aspect ratio — prevents CLS
                    aspectRatio: '16 / 6',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    bgcolor: 'background.layer3',
                    cursor: 'pointer',
                    userSelect: 'none',
                    // Hover: lift + glow
                    transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
                    '&:hover': {
                        transform: 'translateY(-3px) scale(1.015)',
                        boxShadow: '0 14px 36px rgba(0,0,0,0.55)',
                    },
                    // Mobile press
                    '&:active': {
                        transform: 'scale(0.97)',
                        transition: 'transform 0.08s ease',
                    },
                }}
            >
                {/* Skeleton while image loads — prevents layout shift */}
                {!imgLoaded && !imgError && (
                    <Skeleton
                        variant="rectangular"
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            bgcolor: 'background.layer2',
                            transform: 'none',
                            zIndex: 1,
                        }}
                    />
                )}

                {/* Banner image — lazy loaded, object-fit cover */}
                {!imgError ? (
                    <Box
                        component="img"
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        onLoad={() => setImgLoaded(true)}
                        onError={() => { setImgError(true); setImgLoaded(true); }}
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            bgcolor: '#000000',
                            objectPosition: 'center',
                            display: 'block',
                            opacity: imgLoaded ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                        }}
                    />
                ) : (
                    /* Fallback gradient when image fails */
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}>
                            {item.title}
                        </Typography>
                    </Box>
                )}

                {/* Bottom gradient for label readability */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '60%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
                        pointerEvents: 'none',
                    }}
                />

                {/* Left-side accent gradient */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 45%)',
                        pointerEvents: 'none',
                    }}
                />

                {/* Badge */}
                {item.badge && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            bgcolor: badgeBg,
                            borderRadius: '6px',
                            px: 1,
                            py: 0.3,
                            zIndex: 2,
                        }}
                    >
                        <Typography
                            sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}
                        >
                            {item.badge}
                        </Typography>
                    </Box>
                )}

                {/* Title + CTA */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: { xs: 1.5, sm: 2, md: 2.5 },
                        zIndex: 2,
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '0.875rem', sm: '1.1rem', md: '1.25rem' },
                            color: '#fff',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                            lineHeight: 1.2,
                        }}
                    >
                        {item.title}
                    </Typography>
                    {item.cta && (
                        <Typography
                            sx={{
                                mt: 0.5,
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                color: 'rgba(255,255,255,0.75)',
                                fontWeight: 500,
                            }}
                        >
                            {item.cta}
                        </Typography>
                    )}
                </Box>

                {/* Hover shimmer layer */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                        '&:hover': { opacity: 1 },
                        pointerEvents: 'none',
                        zIndex: 3,
                    }}
                />
            </Box>
        </Link>
    );
});

PromoBannerCard.displayName = 'PromoBannerCard';

// ─── PromotionalBannerRow ─────────────────────────────────────────────────────
const PromotionalBannerRow = ({
    items,
    desktopCols = 3,
    title,
}: PromotionalBannerRowProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    if (!items || items.length === 0) return null;

    // On mobile → horizontal Swiper (1.1 cards visible, swipeable)
    // On tablet → grid 2 cols
    // On desktop → grid 2 or 3 cols

    return (
        <Box
            sx={{
                // Full-bleed breakout — same technique as other carousel components
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100vw',
                mt: { xs: 2.5, sm: 3 },
                mb: { xs: 0.5, sm: 1 },
                boxSizing: 'border-box',
            }}
        >
            {/* Section title — with consistent page padding */}
            {title && (
                <Typography
                    sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: 'text.primary',
                        letterSpacing: '0.05em',
                        px: { xs: 1, sm: 2, md: 3 },
                        mb: 1.5,
                    }}
                >
                    {title}
                </Typography>
            )}

            {isMobile ? (
                /* ── Mobile: Swiper horizontal swipe ── */
                <Box
                    sx={{
                        px: { xs: 1 },
                        '& .swiper': { overflow: 'visible', paddingBottom: '2px' },
                    }}
                >
                    <Swiper
                        modules={[FreeMode]}
                        slidesPerView={1.1}
                        spaceBetween={10}
                        freeMode={{ enabled: true, momentumRatio: 0.5 }}
                        grabCursor={true}
                        style={{ width: '100%' }}
                    >
                        {items.map((item) => (
                            <SwiperSlide key={item.id}>
                                <PromoBannerCard item={item} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>
            ) : (
                /* ── Tablet / Desktop: CSS Grid ── */
                <Box
                    sx={{
                        px: { sm: 2, md: 3 },
                        display: 'grid',
                        gridTemplateColumns: isTablet
                            ? 'repeat(2, 1fr)'
                            : `repeat(${desktopCols}, 1fr)`,
                        gap: { sm: 1.5, md: 2 },
                    }}
                >
                    {items.map((item) => (
                        <PromoBannerCard key={item.id} item={item} />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default PromotionalBannerRow;
