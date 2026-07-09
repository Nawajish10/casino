import { Outlet } from 'react-router-dom';
import { Suspense, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
// components
import Header from 'components/header';
import Tabbar from 'components/tabbar';
import MobileNavbar from 'components/navbar/mobile';
import Notification from 'components/notification';
import { LoadingScreen } from 'components/loading-screen';
import CategoryBar from 'components/category-bar';
import { CATEGORY_BAR_HEIGHT } from 'components/category-bar';
// data
import { categoryBarItems } from 'data';
// hooks
import { useResponsive } from 'hooks/use-responsive';

const HEADER_HEIGHT = 70; // px

const SportLayout = () => {
    const isDesktop = useResponsive('up', 'md');
    const [navStatus, setNavStatus] = useState(false);
    const [notificationState, setNotificationState] = useState(false);

    // Desktop sidebar removed — MobileNavbar (slide-out drawer) used on all screen sizes.
    // Hamburger button is visible on mobile only (xs–sm), handled inside Header.

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Header
                onHandleNav={() => setNavStatus((pre) => !pre)}
                onHandleNotification={() => setNotificationState(true)}
            />

            {/* Unified slide-out drawer */}
            <MobileNavbar isSport={true} open={navStatus} onClose={() => setNavStatus(false)} />

            {/* Competitor-style horizontal category bar */}
            <CategoryBar items={categoryBarItems} />

            <Box
                component="main"
                sx={{
                    minHeight: '100vh',
                    bgcolor: 'background.site',
                    ml: 0,
                    overflowX: 'hidden',
                    pt: `${HEADER_HEIGHT + CATEGORY_BAR_HEIGHT}px`,
                    pb: !isDesktop ? '70px' : 0
                }}
            >
                <Outlet />
            </Box>

            {!isDesktop && <Tabbar navStatus={navStatus} onHandleNav={() => setNavStatus((pre) => !pre)} />}
            <Notification open={notificationState} onClose={() => setNotificationState(false)} />
        </Suspense>
    );
};

export default SportLayout;
