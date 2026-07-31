import { Box, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Link } from 'react-router-dom';

interface GameCardProps {
    title?: string;
    name?: string;
    gameName?: string;
    image?: string;
    thumbnail?: string;
    banner?: string;
    provider?: string;
    category?: string;
    href: string;
}

const GameCard = ({ title, name, gameName, image, thumbnail, banner, provider, category, href }: GameCardProps) => {
    const displayTitle = title || name || gameName || "Game";
    const defaultImage = "/default-game.svg";
    const resolvedImage = image || thumbnail || banner || defaultImage;

    return (
        <Link to={`${href}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '3 / 4',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    bgcolor: '#121824',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        '& .overlay': { opacity: 1 },
                        '& .play-button': { transform: 'scale(1.2)' }
                    },
                    '&:active': {
                        transform: 'scale(0.97)',
                    }
                }}
            >
                <Box
                    component="img"
                    src={resolvedImage}
                    alt={displayTitle}
                    loading="lazy"
                    onError={(e: any) => {
                        e.target.src = defaultImage;
                    }}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block'
                    }}
                />

                <Box
                    className="overlay"
                    sx={{
                        zIndex: 2,
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(10, 14, 23, 0.75)',
                        backdropFilter: 'blur(2px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1.5,
                        opacity: 0,
                        transition: 'opacity 0.25s ease-in-out',
                        cursor: 'pointer'
                    }}
                >
                    <Typography
                        sx={{
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            lineHeight: 1.2,
                            color: '#ffffff',
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {displayTitle}
                    </Typography>
                    {provider && (
                        <Typography
                            sx={{
                                fontSize: '0.7rem',
                                color: '#919EAB',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                mb: 1.5
                            }}
                        >
                            {provider}
                        </Typography>
                    )}
                    <Box
                        className="play-button"
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: '#000000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 16px rgba(0, 231, 1, 0.4)',
                            transition: 'transform 0.25s ease'
                        }}
                    >
                        <PlayArrowIcon sx={{ fontSize: 24, color: '#000000' }} />
                    </Box>
                </Box>
            </Box>
        </Link>
    );
};

export default GameCard;
