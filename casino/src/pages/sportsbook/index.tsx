import { Box, Typography, Stack, Container } from '@mui/material';
import SportsbookTable from 'components/sportsbook-table';
import { useFullSportsbook } from 'hooks/useSportsbook';

export default function SportsbookPage() {
    const { data: categories, isLoading, error } = useFullSportsbook();

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
                
                <SportsbookTable 
                    categories={categories} 
                    isLoading={isLoading} 
                    error={error} 
                    hideViewMore 
                />
            </Container>
        </Box>
    );
}
