import { Outlet } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// components
import Footer from 'components/footer';
// category-bar height constant so padding stays in sync
import { CATEGORY_BAR_HEIGHT } from 'components/category-bar';
// hooks
import { useResponsive } from 'hooks/use-responsive';

const HEADER_HEIGHT = 70; // px — matches header sx height

const Wrapper = () => {
    const isDesktop = useResponsive('up', 'md');

    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.site',
                // Sidebar removed on desktop — no left margin needed
                ml: 0,
                // Prevent horizontal scrollbar from 100vw full-bleed carousels
                overflowX: 'hidden',
                // Space for fixed header + fixed category bar on all breakpoints
                pb: !isDesktop ? '70px' : 0
            }}
        >
            <Box
                sx={{
                    pt: `${HEADER_HEIGHT + CATEGORY_BAR_HEIGHT + 16}px`,
                    pb: 3,
                    px: { xs: 1, sm: 2, md: 3 },
                    maxWidth: '100%',
                }}
            >
                <Outlet />
            </Box>

            <Footer />
        </Box>
    );
};

export default Wrapper;
