import { Box, Skeleton } from '@mui/material';

interface GameGridSkeletonProps {
    count?: number;
}

const GameGridSkeleton = ({ count = 12 }: GameGridSkeletonProps) => {
    return (
        <Box 
            sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' }, 
                gap: 2 
            }}
        >
            {Array.from({ length: count }).map((_, i) => (
                <Box key={i}>
                    <Box sx={{ position: 'relative', pt: '124%', borderRadius: 2, overflow: 'hidden' }}>
                        <Skeleton 
                            variant="rectangular" 
                            sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%' 
                            }} 
                        />
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default GameGridSkeleton;
