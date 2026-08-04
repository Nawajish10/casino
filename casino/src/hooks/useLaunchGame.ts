import { useState, useEffect } from 'react';
import { useAuth } from 'hooks/use-auth-context';
import { useSettingsContext } from 'components/settings';
import { useWallet } from 'hooks/use-wallet';
import { useSnackbar } from 'notistack';
import { gameLaunch } from 'api';
import { useResponsive } from 'hooks/use-responsive';

/**
 * Build a provider-specific demo URL that is embeddable in an iframe.
 * Many third-party "demogamesfree" URLs block iframe embedding via
 * X-Frame-Options. We route to official embed-friendly demo endpoints
 * when possible, and fall back to opening in a new window.
 */
function buildDemoUrl(gameCode: string, providerCode?: string): { url: string; canEmbed: boolean } {
    const code = (gameCode || '').trim().toLowerCase();
    const prov = (providerCode || '').trim().toLowerCase();

    // Spribe games — their demo endpoint allows iframe embedding
    if (code.includes('aviator') || prov.includes('spribe')) {
        return { url: 'https://demo.spribe.io/launch/aviator?g_token=demo', canEmbed: true };
    }
    if (code.includes('mines') && !code.startsWith('sg') && !code.startsWith('vs')) {
        return { url: 'https://demo.spribe.io/launch/mines?g_token=demo', canEmbed: true };
    }
    if (code.includes('plinko')) {
        return { url: 'https://demo.spribe.io/launch/plinko?g_token=demo', canEmbed: true };
    }
    if (code === 'dice' || (code.includes('dice') && prov.includes('spribe'))) {
        return { url: 'https://demo.spribe.io/launch/dice?g_token=demo', canEmbed: true };
    }
    if (code.includes('hilo') && prov.includes('spribe')) {
        return { url: 'https://demo.spribe.io/launch/hilo?g_token=demo', canEmbed: true };
    }

    // Pragmatic Play (e.g. vs5jokerdice, vs20olympgate, vs10bbbnz1000)
    if (code.startsWith('vs') || prov.includes('pragmatic')) {
        return {
            url: `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=${encodeURIComponent(gameCode)}&lang=en&cur=USD`,
            canEmbed: false,
        };
    }

    // Habanero
    if (prov.includes('habanero') || code.startsWith('sg')) {
        return {
            url: `https://app-test.insvr.com/frontend/final/display.html?gamecode=${encodeURIComponent(gameCode)}&mode=demo`,
            canEmbed: true,
        };
    }

    // Booongo / 3 Oaks
    if (code.includes('sun_of_egypt') || code.includes('olympus') || prov.includes('booongo') || prov.includes('3oaks') || prov.includes('bng')) {
        return {
            url: `https://demo.3oaks.com/openGame.do?gameSymbol=${encodeURIComponent(gameCode)}&lang=en&cur=USD`,
            canEmbed: false,
        };
    }

    // Playson
    if (code.includes('joker_staxx') || code.includes('sunny_fruits') || prov.includes('playson')) {
        return {
            url: `https://demo.playson.com/openGame.do?gameSymbol=${encodeURIComponent(gameCode)}&lang=en&cur=USD`,
            canEmbed: false,
        };
    }

    // Default fallback to Pragmatic Play demo
    return {
        url: `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=${encodeURIComponent(gameCode || 'vs5jokerdice')}&lang=en&cur=USD`,
        canEmbed: false,
    };
}

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
    const [launchError, setLaunchError] = useState('');

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
        // Reset error state on each attempt
        setLaunchError('');

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

            if (response && (response.success || response.launchUrl) && (response.launchUrl || response.launch_url)) {
                const url = response.launchUrl || response.launch_url;
                setLaunchUrl(url);
                setLaunchState(true);
                setLoading(false);
                sync();
                return url;
            }
        } catch (error: any) {
            console.warn('[useLaunchGame] Primary launch failed, executing demo fallback:', error?.message || error);
        }

        // Fallback demo launcher — route via provider-specific demo endpoints
        const code = (gameCode || 'vs5jokerdice').trim();
        const { url: demoUrl, canEmbed } = buildDemoUrl(code, options.providerCode);

        if (demoUrl) {
            if (canEmbed) {
                setLaunchUrl(demoUrl);
                setLaunchState(true);
                setLoading(false);
                return demoUrl;
            } else {
                setLoading(false);
                window.open(demoUrl, '_blank', 'noopener,noreferrer');
                enqueueSnackbar('Game opened in a new tab.', {
                    variant: 'info',
                    autoHideDuration: 4000,
                });
                return demoUrl;
            }
        }

        setLoading(false);
        setLaunchError('Failed to launch game');
        enqueueSnackbar('Failed to launch game. Please try again later.', { variant: 'error' });
    };

    return {
        launch,
        loading,
        launchUrl,
        launchState,
        launchError,
        setLaunchUrl,
        setLaunchState,
        setLaunchError,
    };
};
