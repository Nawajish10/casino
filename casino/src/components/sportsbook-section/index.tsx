import { Box, Button, Grid, Stack, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from 'locales';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useLaunchGame } from 'hooks/useLaunchGame';
import { useAuth } from 'hooks/use-auth-context';
import { useSettingsContext } from 'components/settings';

const FEATURED_SPORTS = [
    { name: 'Cricket', icon: '🏏', path: '/assets/images/sports/cricket.jpg' },
    { name: 'Football', icon: '⚽', path: '/assets/images/sports/football.jpg' },
    { name: 'Horse Racing', icon: '🏇', path: '/assets/images/sports/racing.jpg' }
];

export default function SportsbookSection() {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const theme = useTheme();
    const { launch, launchUrl } = useLaunchGame();
    const { isLogined } = useAuth();
    const { onToggleModal } = useSettingsContext();

    const handleLaunch = () => {
        if (!isLogined && import.meta.env.VITE_GAME_TEST_MODE !== 'true') {
            onToggleModal('SIGNIN');
            return;
        }
        launch(undefined, { providerCode: 'SPORTSBOOK' });
    };

    if (launchUrl) {
        // useLaunchGame handles opening the modal/iframe automatically in this template
    }

    return (
        <Box sx={{ width: '100%', px: { xs: 1, md: 3 }, py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>SPORTSBOOK</Typography>
                </Stack>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => navigate('/sportsbook')}
                    sx={{ borderRadius: 8, fontWeight: 700 }}
                >
                    View All Sports →
                </Button>
            </Stack>

            <Grid container spacing={3}>
                {FEATURED_SPORTS.map((sport, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                        <Box
                            onClick={handleLaunch}
                            sx={{
                                position: 'relative',
                                borderRadius: 3,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                pt: '56.25%', // 16:9 Aspect Ratio
                                '&:hover .overlay': {
                                    opacity: 1
                                },
                                '&:hover .play-button': {
                                    transform: 'scale(1.2)'
                                },
                                '&::before': {
                                    content: `""`,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)`,
                                    zIndex: 1
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    bgcolor: 'background.paper',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography sx={{ fontSize: 80, opacity: 0.1, position: 'absolute' }}>
                                    {sport.icon}
                                </Typography>
                            </Box>
                            
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: '100%',
                                    p: 2,
                                    zIndex: 2,
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography sx={{ fontSize: 24 }}>{sport.icon}</Typography>
                                    <Typography variant="h6" sx={{ color: 'common.white', fontWeight: 800 }}>
                                        {sport.name}
                                    </Typography>
                                </Stack>
                            </Box>

                            <Box
                                className="overlay"
                                sx={{
                                    zIndex: 3,
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: '100%',
                                    height: '100%',
                                    bgcolor: 'rgba(0, 0, 0, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.3s'
                                }}
                            >
                                <Box
                                    className="play-button"
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        bgcolor: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'transform 0.3s'
                                    }}
                                >
                                    <PlayArrowIcon sx={{ color: 'common.black', fontSize: 28 }} />
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
