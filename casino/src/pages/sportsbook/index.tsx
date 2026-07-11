import { Box, Typography, Stack, Grid, Container } from '@mui/material';
import { useLaunchGame } from 'hooks/useLaunchGame';
import { useAuth } from 'hooks/use-auth-context';
import { useSettingsContext } from 'components/settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const sportsCategories = [
    { id: 'cricket', name: 'Cricket', icon: '🏏', color: '#1B5E20' },
    { id: 'football', name: 'Football', icon: '⚽', color: '#B71C1C' },
    { id: 'basketball', name: 'Basketball', icon: '🏀', color: '#E65100' },
    { id: 'tennis', name: 'Tennis', icon: '🎾', color: '#33691E' },
    { id: 'baseball', name: 'Baseball', icon: '⚾', color: '#01579B' },
    { id: 'horse-racing', name: 'Horse Racing', icon: '🏇', color: '#3E2723' },
    { id: 'esports', name: 'eSports', icon: '🎮', color: '#311B92' },
    { id: 'mma', name: 'MMA/UFC', icon: '🥊', color: '#b71c1c' },
];

export default function SportsbookPage() {
    const { launch, launchUrl } = useLaunchGame();
    const { isLogined } = useAuth();
    const { onToggleModal } = useSettingsContext();

    const handleLaunch = () => {
        if (!isLogined && import.meta.env.VITE_GAME_TEST_MODE !== 'true') {
            onToggleModal('SIGNIN');
            return;
        }
        launch('', { providerCode: 'SPORTSBOOK' });
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', pb: 8 }}>
            {/* Hero Banner */}
            <Box sx={{ 
                width: '100%', 
                height: { xs: 240, md: 360 }, 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                mb: 6,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{ 
                    position: 'absolute', 
                    top: 0, right: 0, left: 0, bottom: 0, 
                    opacity: 0.1, 
                    backgroundImage: 'url(/assets/images/sports-bg.png)',
                    backgroundSize: 'cover'
                }} />
                
                <Stack spacing={2} sx={{ position: 'relative', zIndex: 1, px: 2 }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
                        Premium Sportsbook
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Live Betting • Fast Markets • Cash Out
                    </Typography>
                </Stack>
            </Box>

            <Container maxWidth="xl">
                <Stack direction="row" alignItems="center" spacing={1} mb={4}>
                    <Box sx={{ width: 4, height: 28, bgcolor: 'primary.main', borderRadius: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>ALL SPORTS</Typography>
                </Stack>
                
                <Grid container spacing={3}>
                    {sportsCategories.map((sport) => (
                        <Grid item xs={6} sm={4} md={3} key={sport.id}>
                            <Box
                                onClick={handleLaunch}
                                sx={{
                                    position: 'relative',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    pt: '100%', // 1:1 Aspect Ratio
                                    bgcolor: sport.color,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': { 
                                        transform: 'translateY(-6px)', 
                                        boxShadow: '0 16px 32px rgba(0,0,0,0.3)',
                                    },
                                    '&:hover .overlay': {
                                        opacity: 1
                                    },
                                    '&:hover .play-button': {
                                        transform: 'scale(1.2)'
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.4) 100%)'
                                    }}
                                >
                                    <Typography sx={{ fontSize: { xs: 60, md: 80 }, mb: 2, filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.3))' }}>
                                        {sport.icon}
                                    </Typography>
                                    <Typography variant="h5" sx={{ color: 'common.white', fontWeight: 800, letterSpacing: 1 }}>
                                        {sport.name}
                                    </Typography>
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
                                        bgcolor: 'rgba(0, 0, 0, 0.5)',
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
                                            width: 56,
                                            height: 56,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        <PlayArrowIcon sx={{ color: 'common.black', fontSize: 32 }} />
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
