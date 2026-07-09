import Slider from 'react-slick';
import { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography, useTheme, useMediaQuery, styled } from '@mui/material';
// hooks
import { useAuth } from 'hooks/use-auth-context';
// components
import Image from 'components/image';
import ColorButton from 'components/ColorButton';
import { useTranslate } from 'locales';
// store
import { useSelector } from 'store/store';
// utils
import { ASSETS } from 'utils/axios';

const BannerContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: (theme.shape.borderRadius as number) * 1.5,
    background: `linear-gradient(261deg, ${theme.palette.background.layer4} 70.44%, rgb(96, 104, 105) 128.85%)`,
    backgroundSize: 'cover',
    backgroundRepeat: 'repeat-x',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
}));

const BannerImage = styled('img')({
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%'
});
const BannerImage2 = styled('img')({
    position: 'absolute',
    left: '-4.5rem',
    top: '-1rem',
    height: '360px',
    width: '354px'
});

const ContentContainer = styled(Stack, {
    shouldForwardProp: (prop) => prop !== 'scale'
})<{ scale?: number }>(({ theme, scale = 1 }) => ({
    position: 'absolute',
    top: 0,
    left: theme.spacing(1.5),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        left: '19%',
        top: '4%',
        height: 'auto',
        alignItems: 'center',
        padding: 0,
        textAlign: 'center'
    }
}));

const PromoBox = styled(Box)(({ theme }) => ({
    borderRadius: (theme.shape.borderRadius as number) * 1.5,
    marginTop: theme.spacing(1.5),
    padding: 0,
    [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(2),
        backgroundColor: 'rgba(176, 255, 216, 0.2)',
        backdropFilter: 'blur(4px)',
        padding: theme.spacing(1.5, 15)
    }
}));

const GradientText = styled(Typography)({
    background: 'linear-gradient(to right, #9FE871, #24EE89)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginLeft: 4
});

const StyledButton = styled(ColorButton)(({ theme }) => ({
    marginTop: 'auto',
    width: 112,
    height: 40,
    [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(2.5),
        width: 240
    }
}));

const Banner = () => {
    const theme = useTheme();
    const { t } = useTranslate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const { isLogined } = useAuth();
    const { banners } = useSelector((state) => state.setting);

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sliderSettings = useMemo(
        () => ({
            dots: true,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 5000,
            pauseOnHover: true,
            arrows: false,
            swipeToSlide: true,
            adaptiveHeight: true,
            lazyLoad: 'ondemand' as const,
        }),
        []
    );

    const displayBanners = isLogined && banners && banners.length > 0
        ? banners.map(b => ASSETS(b.image))
        : ['/new-banner.png', '/new-banner.png', '/new-banner.png', '/new-banner.png', '/new-banner.png'];

    return (
        <Stack
            className="slider-container"
            sx={{
                width: 1,
                m: 0,
                mt: { xs: 2.5, sm: 4 },
                p: 0,
                '& .slick-dots': {
                    bottom: -12
                },
                '& .slick-dots li button:before': {
                    color: 'background.layer3',
                    fontSize: '10px',
                    opacity: 1
                },
                '& .slick-dots li.slick-active button:before': {
                    color: 'primary.main',
                    opacity: 1
                },
                '& .slick-slide > div': {
                    px: 0.5
                },
                mb: 2
            }}
        >
            <Slider {...sliderSettings}>
                {displayBanners.map((imgSrc, index) => (
                    <Box key={index} sx={{ borderRadius: 1, overflow: 'hidden', aspectRatio: { xs: '21/9', md: '32/9' } }}>
                        <Box
                            component="img"
                            src={imgSrc}
                            alt={`banner-${index}`}
                            sx={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }}
                        />
                    </Box>
                ))}
            </Slider>
        </Stack>
    );
};

export default Banner;
