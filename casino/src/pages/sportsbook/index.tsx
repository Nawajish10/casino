import { Box, Typography, Stack, Container, Button, Dialog, IconButton } from '@mui/material';
import { useLaunchGame } from 'hooks/useLaunchGame';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useSelector } from 'store/store';
import ColorButton from 'components/ColorButton';
import { useTranslate } from 'locales';
import { useSettingsContext } from 'components/settings';
import { useAuth } from 'hooks/use-auth-context';

export default function SportsbookPage() {
    const { launch, loading, launchUrl, launchState, setLaunchUrl, setLaunchState } = useLaunchGame();
    const balance = useSelector((state) => state.balance);
    const { t } = useTranslate();
    const { onToggleModal } = useSettingsContext();
    const { isLogined } = useAuth();

    const handleLaunch = () => {
        launch('', { providerCode: 'SPORTSBOOK' });
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', pb: 8 }}>
            
            {/* Game Launch Dialog */}
            <Dialog
                open={launchState}
                onClose={() => setLaunchState(false)}
                fullWidth
                fullScreen
                sx={{
                    '& .MuiDialog-paperFullWidth': {
                        position: 'relative',
                        overflow: 'hidden'
                    }
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 1, pr: 2, bgcolor: 'background.layer3' }}
                >
                    <IconButton
                        onClick={() => {
                            setLaunchState(false);
                            setLaunchUrl('');
                        }}
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={0.5}
                        sx={(theme) => ({
                            p: '3px',
                            height: { md: '40px', xs: '38px' },
                            border: `2px solid ${theme.palette.divider}`,
                            borderRadius: 2
                        })}
                    >
                        <Stack
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                            spacing={{ md: 1, xs: 0.5 }}
                        >
                            <Box
                                component="img"
                                src={balance?.icon || ''}
                                alt="currency"
                                sx={{ width: { md: 22, xs: '18px' }, height: { md: 20, xs: 16 } }}
                            />
                            <Typography sx={{ fontWeight: 600, fontSize: { md: '18px', xs: '12px' } }}>
                                {balance?.amount ? balance.amount.toFixed(2) : '0.00'}
                            </Typography>
                        </Stack>
                        
                        <ColorButton
                            onClick={() => onToggleModal('DEPOSIT')}
                            sx={{
                                height: '1.8rem',
                                fontSize: { md: '14px', xs: '10px' },
                                px: { md: 2, xs: 0 },
                                width: 'auto'
                            }}
                            >
                                {t('deposit')}
                            </ColorButton>
                        </Stack>
                </Stack>
                <iframe
                    style={{
                        width: '100%',
                        border: 'none',
                        zIndex: '100%',
                        height: '100%'
                    }}
                    src={launchUrl}
                />
            </Dialog>

            {/* Hero Banner */}
            <Box sx={{ 
                width: '100%', 
                height: { xs: 300, md: 500 }, 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{ 
                    position: 'absolute', 
                    top: 0, right: 0, left: 0, bottom: 0, 
                    opacity: 0.2, 
                    backgroundImage: 'url(/assets/images/sports-bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }} />
                
                <Stack spacing={4} sx={{ position: 'relative', zIndex: 1, px: 2, maxWidth: '800px', alignItems: 'center' }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, fontSize: { xs: '2.5rem', md: '4rem' } }}>
                        Premium Sportsbook
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        Live Betting • Fast Markets • Best Odds
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                        Experience the ultimate sports betting platform. Get access to thousands of live and pre-match markets across all major sports worldwide.
                    </Typography>
                    
                    <Button 
                        variant="contained" 
                        size="large"
                        onClick={handleLaunch}
                        disabled={loading}
                        sx={{ 
                            py: 1.5, 
                            px: 6, 
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            borderRadius: '30px',
                            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
                            '&:hover': {
                                background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.6)',
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'LOADING...' : 'ENTER SPORTSBOOK'}
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}
