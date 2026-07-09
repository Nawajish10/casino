import { useState, useEffect } from 'react';
import { useAuth } from 'hooks/use-auth-context';
import { useSettingsContext } from 'components/settings';
import { useWallet } from 'hooks/use-wallet';
import { useSnackbar } from 'notistack';
import { gameLaunch } from 'api';
import { useResponsive } from 'hooks/use-responsive';

export const useLaunchGame = () => {
    const { isLogined } = useAuth();
    const { onToggleModal } = useSettingsContext();
    const { wallet, sync } = useWallet();
    const { enqueueSnackbar } = useSnackbar();

    // Device detection (Phase 14)
    const isMobile = useResponsive('down', 'sm');
    const isTablet = useResponsive('between', 'sm', 'md');
    const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    const [loading, setLoading] = useState(false);
    const [launchUrl, setLaunchUrl] = useState('');
    const [launchState, setLaunchState] = useState(false);

    // Phase 13: deposit-before-launch check flow. Show Deposit Modal. After successful deposit, continue launch automatically.
    useEffect(() => {
        if (isLogined && Number(wallet.balance) > 0) {
            const pending = sessionStorage.getItem('pending_launch');
            if (pending) {
                sessionStorage.removeItem('pending_launch');
                try {
                    const { gameCode, options } = JSON.parse(pending);
                    launch(gameCode, options);
                } catch (e) {
                    console.error('Failed to parse pending launch', e);
                }
            }
        }
    }, [wallet.balance, isLogined]);

    const launch = async (
        gameCode?: string,
        options: {
            providerCode?: string;
            productCode?: string | number;
            gameType?: string;
            currency?: string;
            support_currency?: string;
        } = {}
    ) => {
        if (!isLogined && import.meta.env.VITE_GAME_TEST_MODE !== 'true') {
            onToggleModal('SIGNIN');
            return;
        }

        // Validate currency support if game details provide it
        if (options.support_currency) {
            const supportCurrencies = options.support_currency.split(',');
            if (!supportCurrencies.includes(wallet.currency)) {
                if (wallet.currency === 'IDR' && supportCurrencies.includes('IDR2')) {
                    // IDR2 allowed
                } else {
                    enqueueSnackbar('This game does not support your currency.', { variant: 'error' });
                    return;
                }
            }
        }

        // Check if balance is 0
        if (Number(wallet.balance) <= 0 && import.meta.env.VITE_GAME_LAUNCH_TEST_MODE !== 'true') {
            // Store pending launch configuration to run after deposit
            sessionStorage.setItem(
                'pending_launch',
                JSON.stringify({ gameCode, options })
            );
            enqueueSnackbar('Please deposit funds to play.', { variant: 'warning' });
            onToggleModal('DEPOSIT');
            return;
        }

        setLoading(true);
        try {
            const response = await gameLaunch({
                gameCode: gameCode || '',
                language: 'en',
                device,
                providerCode: options.providerCode,
                productCode: options.productCode,
                gameType: options.gameType,
                currency: options.currency || wallet.currency
            });

            if (response.success && response.launchUrl) {
                setLaunchUrl(response.launchUrl);
                setLaunchState(true);
                // Also update local wallet balance after launch
                sync();
                return response.launchUrl;
            } else {
                enqueueSnackbar(response.message || 'Unable to launch game', { variant: 'error' });
            }
        } catch (error: any) {
            const apiError = error?.response?.data || error;
            const errorMsg =
                apiError?.message ||
                apiError?.msg ||
                apiError?.detail ||
                (typeof apiError === 'string' ? apiError : null) ||
                'Temporary provider issue';
            enqueueSnackbar(errorMsg, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return {
        launch,
        loading,
        launchUrl,
        launchState,
        setLaunchUrl,
        setLaunchState
    };
};
