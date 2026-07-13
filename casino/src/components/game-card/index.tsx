import { Box, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Link } from 'react-router-dom';

interface GameCardProps {
    title?: string;
    name?: string;
    image?: string;
    provider?: string;
    category?: string;
    href: string;
}

const GameCard = ({ title, name, image, provider, category, href }: GameCardProps) => {
    const displayTitle = title || name || "Unknown";
    const defaultImage = "/default-game.svg"; // Fallback image logic
    const imgUrl = image || defaultImage;
    return (
        <Link to={`${href}`}>
            <Box
                sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    '&:hover .overlay': {
                        opacity: 1
                    },
                    '&:hover .play-button': {
                        transition: 'transform 0.3s',
                        transform: 'scale(1.5)'
                    },
                    pt: '124%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    backgroundSize: '150%',
                    '&::before': {
                        content: `""`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${imgUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(10px)'
                    }
                }}
            >
                <Box
                    sx={{
                        height: 1,
                        width: 1,
                        zIndex: 1,
                        top: 0,
                        right: 0,
                        position: 'absolute',
                        backgroundImage: `url(${imgUrl})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center center',
                        backgroundSize: { xs: 'cover', sm: '100% 100%' },
                        backgroundColor: 'background.default'
                    }}
                />
                <Box
                    className="overlay"
                    sx={{
                        zIndex: 2,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                        cursor: 'pointer'
                    }}
                >
                    <Typography
                        sx={{
                            position: 'absolute',
                            top: '20%',
                            width: '100%',
                            px: 2,
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: '0.875rem',
                            lineHeight: 1,
                            color: 'white'
                        }}
                    >
                        {displayTitle}
                        {provider && (
                            <Typography sx={{ fontSize: '0.75rem', opacity: 0.8, mt: 0.5 }}>
                                {provider}
                            </Typography>
                        )}
                    </Typography>
                    <Box
                        className="play-button"
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <PlayArrowIcon sx={{ color: 'white' }} />
                    </Box>
                </Box>
            </Box>
        </Link>
    );
};

export default GameCard;
