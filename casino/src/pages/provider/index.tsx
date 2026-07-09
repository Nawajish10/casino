import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Container } from '@mui/material';
import GameCard from 'components/game-card';
import EmptyGamesState from 'components/game-card/empty-games-state';
import GameGridSkeleton from 'components/game-card/game-grid-skeleton';
import { useProviderGames } from 'hooks/useGames';

const ProviderPage = () => {
    const { providerCode } = useParams<{ providerCode: string }>();
    const { data: games, isLoading, isError } = useProviderGames(providerCode || '');

    return (
        <Container maxWidth="xl" sx={{ py: 5 }}>
            <Box sx={{ mb: 5, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {providerCode} Games
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                    Explore the best games from {providerCode}
                </Typography>
            </Box>

            {isLoading && <GameGridSkeleton count={12} />}
            
            {isError && (
                <EmptyGamesState 
                    title="Error loading games" 
                    description="There was a problem communicating with the server." 
                />
            )}

            {!isLoading && !isError && games && games.length === 0 && (
                <EmptyGamesState />
            )}

            {!isLoading && !isError && games && games.length > 0 && (
                <Box 
                    sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' }, 
                        gap: 2 
                    }}
                >
                    {games.map((game: any) => (
                        <Box key={game.id}>
                            <GameCard
                                title={game.gameName}
                                image={game.thumbnail}
                                provider={game.providerName}
                                category={game.category}
                                href={`/game/${game.gameCode}`}
                            />
                        </Box>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default ProviderPage;
