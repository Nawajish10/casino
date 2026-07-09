import { useRef } from 'react';
import { Box, Stack, Typography } from '@mui/material';
// routes
import { usePathname, useRouter } from 'routes/hook';

// ─── Constants ────────────────────────────────────────────────────────────────
export const CATEGORY_BAR_HEIGHT = 44; // px — used by layout to offset content

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CategoryItem {
    label: string;
    path: string;
    badge?: string; // e.g. 'LIVE'
}

interface CategoryBarProps {
    items: CategoryItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────
const CategoryBar = ({ items }: CategoryBarProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const scrollRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname === path || pathname.startsWith(path + '/');
    };

    return (
        <Box
            ref={scrollRef}
            sx={{
                position: 'fixed',
                top: '70px',       // sits flush below the fixed header
                left: 0,
                right: 0,
                zIndex: 1100,
                height: `${CATEGORY_BAR_HEIGHT}px`,
                bgcolor: '#F5C518',
                overflowX: 'auto',
                overflowY: 'hidden',
                // Hide scrollbar across browsers
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                sx={{
                    height: '100%',
                    px: 1,
                    gap: 0.25,
                    minWidth: 'max-content', // allow horizontal scroll
                }}
            >
                {items.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Box
                            key={item.label}
                            id={`cat-bar-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                            onClick={() => router.push(item.path)}
                            sx={{
                                position: 'relative',
                                px: { xs: 1.25, sm: 1.5 },
                                py: 0.75,
                                borderRadius: 1,
                                cursor: 'pointer',
                                userSelect: 'none',
                                bgcolor: active ? 'rgba(0,0,0,0.18)' : 'transparent',
                                transition: 'background-color 0.15s ease, transform 0.1s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.12)',
                                    transform: 'translateY(-1px)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                },
                                // Bottom indicator for active item
                                '&::after': active
                                    ? {
                                          content: '""',
                                          position: 'absolute',
                                          bottom: 0,
                                          left: '20%',
                                          right: '20%',
                                          height: '2px',
                                          bgcolor: 'rgba(0,0,0,0.5)',
                                          borderRadius: '2px 2px 0 0',
                                      }
                                    : {},
                            }}
                        >
                            {/* LIVE badge */}
                            {item.badge && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        bgcolor: '#e53935',
                                        borderRadius: '3px',
                                        px: 0.4,
                                        lineHeight: 1.4,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: '0.45rem',
                                            color: '#fff',
                                            fontWeight: 800,
                                            letterSpacing: '0.02em',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {item.badge}
                                    </Typography>
                                </Box>
                            )}

                            {/* Label */}
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: active ? 800 : 600,
                                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                    color: active ? '#000' : 'rgba(0,0,0,0.75)',
                                    letterSpacing: '0.01em',
                                    whiteSpace: 'nowrap',
                                    display: 'block',
                                }}
                            >
                                {item.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Stack>
        </Box>
    );
};

export default CategoryBar;
