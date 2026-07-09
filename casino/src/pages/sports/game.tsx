import { useTranslate } from 'locales';
import { useEffect } from 'react';
// @mui
import { Stack } from '@mui/material';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
// hooks
import { useAuth } from 'hooks/use-auth-context';
import { useLaunchGame } from 'hooks/useLaunchGame';
// components
import ColorButton from 'components/ColorButton';
import { useSettingsContext } from 'components/settings';
// routes
import { useParams } from 'routes/hook';

const SportsGame = () => {
    const { t } = useTranslate();
    const { isLogined } = useAuth();
    const { onToggleModal } = useSettingsContext();
    const { product_code, currency } = useParams();
    const { launch, launchUrl } = useLaunchGame();

    const getGameLaunchUrl = async () => {
        await launch(undefined, {
            productCode: product_code,
            gameType: 'SPORT_BOOK',
            currency
        });
    };

    useEffect(() => {
        if ((isLogined || import.meta.env.VITE_GAME_TEST_MODE === 'true') && product_code && currency) {
            getGameLaunchUrl();
        }
    }, [isLogined, product_code, currency]);

    if (launchUrl) {
        return (
            <iframe
                style={{
                    top: 56,
                    width: '100%',
                    border: 'none',
                    position: 'absolute',
                    height: 'calc(100vh - 56px)'
                }}
                src={launchUrl}
            />
        );
    }

    return (
        <Stack
            sx={{
                width: 1,
                height: 'calc(100vh - 56px)',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {!isLogined && import.meta.env.VITE_GAME_TEST_MODE !== 'true' && (
                <Stack
                    sx={{
                        width: { md: '400px', sx: '300px' },
                        bgcolor: 'background.layer3',
                        borderRadius: 2,
                        padding: 2
                    }}
                    gap={4}
                >
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <ColorButton
                            sx={{ width: '12rem', display: 'flex', alignItems: 'center', gap: 1 }}
                            onClick={() => onToggleModal('SIGNIN')}
                        >
                            <PlayCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                            {t('signin')}
                        </ColorButton>
                    </Stack>
                </Stack>
            )}
        </Stack>
    );
};

export default SportsGame;
