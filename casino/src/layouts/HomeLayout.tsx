import { Suspense, useState } from 'react';
// components
import Header from 'components/header';
import Tabbar from 'components/tabbar';
import MobileNavbar from 'components/navbar/mobile';
import Notification from 'components/notification';
import { LoadingScreen } from 'components/loading-screen';
import CategoryBar from 'components/category-bar';
// data
import { categoryBarItems } from 'data';
// hooks
import { useResponsive } from 'hooks/use-responsive';
//
import Wrapper from './Wrapper';

const MainLayout = () => {
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

            {/* Unified slide-out drawer for all screen sizes */}
            <MobileNavbar open={navStatus} onClose={() => setNavStatus(false)} />

            {/* Competitor-style horizontal category bar — sticky below header */}
            <CategoryBar items={categoryBarItems} />

            {/* Main content — no sidebar margin on desktop */}
            <Wrapper />

            {!isDesktop && <Tabbar navStatus={navStatus} onHandleNav={() => setNavStatus((pre) => !pre)} />}
            <Notification open={notificationState} onClose={() => setNotificationState(false)} />
        </Suspense>
    );
};

export default MainLayout;
