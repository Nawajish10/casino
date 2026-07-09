import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface EmptyGamesStateProps {
    title?: string;
    description?: string;
    showHomeButton?: boolean;
}

const EmptyGamesState = ({ 
    title = 'No games found', 
    description = 'Try adjusting your search or filters to find what you are looking for.',
    showHomeButton = true
}: EmptyGamesStateProps) => {
    const navigate = useNavigate();

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 10,
                px: 3,
                textAlign: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2
            }}
        >
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                {title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                {description}
            </Typography>
            {showHomeButton && (
                <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                    Go to Homepage
                </Button>
            )}
        </Box>
    );
};

export default EmptyGamesState;
