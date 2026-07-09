import React, { useState } from 'react';
import { Box, Typography, Stack, Button, TextField, IconButton, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { useSnackbar } from 'notistack';

// --- Types ---
interface Odds {
    oneBlue?: string;
    onePink?: string;
    xBlue?: string;
    xPink?: string;
    twoBlue?: string;
    twoPink?: string;
}

interface Match {
    id: number;
    time: string;
    teams: string;
    isLive: boolean;
    odds: Odds;
}

interface SportCategory {
    sport: string;
    icon: React.ReactNode;
    matches: Match[];
}

interface SelectedBet {
    matchId: number;
    sport: string;
    teams: string;
    market: string;
    odds: number;
    oddsType: 'oneBlue' | 'onePink' | 'xBlue' | 'xPink' | 'twoBlue' | 'twoPink';
}

// --- Mock Data ---
const SPORTS_DATA: SportCategory[] = [
    {
        sport: 'Cricket',
        icon: <SportsCricketIcon sx={{ fontSize: 18, color: '#9FE871' }} />,
        matches: [
            { id: 1, time: 'Live Now', teams: 'Amo Sharks v Speen Ghar Tigers', isLive: true, odds: { oneBlue: '6.2', onePink: '6.6', twoBlue: '1.18', twoPink: '1.19' } },
            { id: 2, time: 'Live Now', teams: 'Durham W v The Blaze W', isLive: true, odds: { oneBlue: '0', onePink: '0', twoBlue: '72', twoPink: '77' } },
            { id: 3, time: 'Live Now', teams: 'Essex W v Surrey W', isLive: true, odds: { oneBlue: '3.65', onePink: '3.85', twoBlue: '1.35', twoPink: '1.38' } },
        ],
    },
    {
        sport: 'Soccer',
        icon: <SportsSoccerIcon sx={{ fontSize: 18, color: '#24EE89' }} />,
        matches: [
            { id: 4, time: '06 Jul 01:30', teams: 'Brazil v Norway', isLive: false, odds: { oneBlue: '1.87', onePink: '1.88', xBlue: '3.8', xPink: '3.85', twoBlue: '4.8', twoPink: '4.9' } },
            { id: 5, time: '06 Jul 05:30', teams: 'Mexico v England', isLive: false, odds: { oneBlue: '3.3', onePink: '3.35', xBlue: '3.3', xPink: '3.35', twoBlue: '2.5', twoPink: '2.52' } },
            { id: 6, time: '07 Jul 00:30', teams: 'Portugal v Spain', isLive: false, odds: { oneBlue: '4.3', onePink: '4.4', xBlue: '3.75', xPink: '3.8', twoBlue: '1.97', twoPink: '1.98' } },
        ],
    },
    {
        sport: 'Tennis',
        icon: <SportsTennisIcon sx={{ fontSize: 18, color: '#00BAE6' }} />,
        matches: [
            { id: 7, time: '05 Jul 17:00', teams: 'Muchova v B Krejcikova', isLive: false, odds: { oneBlue: '1.59', onePink: '1.6', twoBlue: '2.66', twoPink: '2.7' } },
            { id: 8, time: '05 Jul 17:30', teams: 'J Pegula v I Jovic', isLive: false, odds: { oneBlue: '1.42', onePink: '1.43', twoBlue: '3.35', twoPink: '3.4' } },
            { id: 9, time: '05 Jul 18:00', teams: 'Safiullin v Djokovic', isLive: false, odds: { oneBlue: '6.2', onePink: '6.4', twoBlue: '1.18', twoPink: '1.19' } },
        ],
    }
];

const SportsbookTable = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [selectedBet, setSelectedBet] = useState<SelectedBet | null>(null);
    const [betAmount, setBetAmount] = useState<string>('100');
    const [isPlacingBet, setIsPlacingBet] = useState<boolean>(false);
    const [betPlacedSuccessfully, setBetPlacedSuccessfully] = useState<boolean>(false);

    const handleSelectOdds = (match: Match, sport: string, market: string, oddsVal: string, oddsType: SelectedBet['oddsType']) => {
        const val = parseFloat(oddsVal);
        if (!val || val === 0) return;

        // Toggle bet if clicked again
        if (selectedBet && selectedBet.matchId === match.id && selectedBet.oddsType === oddsType) {
            setSelectedBet(null);
            setBetPlacedSuccessfully(false);
            return;
        }

        setSelectedBet({
            matchId: match.id,
            sport,
            teams: match.teams,
            market,
            odds: val,
            oddsType
        });
        setBetPlacedSuccessfully(false);
    };

    const handlePlaceBet = () => {
        const amount = parseFloat(betAmount);
        if (isNaN(amount) || amount <= 0) {
            enqueueSnackbar('Please enter a valid bet amount', { variant: 'warning' });
            return;
        }

        setIsPlacingBet(true);
        setTimeout(() => {
            setIsPlacingBet(false);
            setBetPlacedSuccessfully(true);
            enqueueSnackbar('Bet placed successfully! Good luck! 🎉', { variant: 'success' });
        }, 1500);
    };

    // Subcomponent helper for Odds Button
    const renderOddsButton = (match: Match, sport: string, market: string, oddsVal?: string, oddsType?: SelectedBet['oddsType'], isPink: boolean = false) => {
        if (!oddsVal || oddsVal === '0') {
            return (
                <Box
                    sx={{
                        width: 44,
                        height: 32,
                        bgcolor: 'background.layer1',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 0.25,
                        opacity: 0.4
                    }}
                >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>-</Typography>
                </Box>
            );
        }

        const isSelected = selectedBet && selectedBet.matchId === match.id && selectedBet.oddsType === oddsType;
        const colorBase = isPink ? '#F06292' : '#00BAE6';

        return (
            <Button
                onClick={() => handleSelectOdds(match, sport, market, oddsVal, oddsType!)}
                sx={{
                    width: 44,
                    minWidth: 44,
                    height: 32,
                    p: 0,
                    mx: 0.25,
                    bgcolor: isSelected ? colorBase : 'background.layer3',
                    border: '1px solid',
                    borderColor: isSelected ? colorBase : 'background.border',
                    color: isSelected ? '#000' : (isPink ? '#F06292' : '#00BAE6'),
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        bgcolor: isSelected ? colorBase : alpha(colorBase, 0.15),
                        borderColor: colorBase
                    }
                }}
            >
                {oddsVal}
            </Button>
        );
    };

    return (
        <Box 
            sx={{ 
                width: '100%', 
                px: { xs: 1.5, md: 3 }, 
                py: 2,
                mt: 3, 
                mb: 5, 
                bgcolor: 'background.layer2', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'background.border',
                position: 'relative'
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Box sx={{ width: 4, height: 18, bgcolor: 'primary.main', borderRadius: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.02em' }}>
                    Sportsbook Lobby
                </Typography>
                <Box 
                    sx={{ 
                        bgcolor: 'rgba(36,238,137,0.15)', 
                        color: '#24EE89', 
                        px: 1.2, 
                        py: 0.2, 
                        borderRadius: 1, 
                        fontSize: '0.65rem', 
                        fontWeight: 900,
                        textTransform: 'uppercase'
                    }}
                >
                    Live Betting
                </Box>
            </Stack>

            {SPORTS_DATA.map((category, catIdx) => (
                <Box key={catIdx} sx={{ mb: 4, '&:last-of-type': { mb: 1 } }}>
                    {/* Category Title Header */}
                    <Stack 
                        direction="row" 
                        alignItems="center" 
                        spacing={1} 
                        sx={{ 
                            bgcolor: 'background.layer3', 
                            py: 1, 
                            px: 2, 
                            borderRadius: '6px 6px 0 0',
                            borderBottom: '1px solid',
                            borderColor: 'background.border'
                        }}
                    >
                        {category.icon}
                        <Typography sx={{ color: 'text.primary', fontWeight: 800, fontSize: '0.875rem' }}>
                            {category.sport}
                        </Typography>
                    </Stack>

                    {/* Table Column headers (1 X 2 labels) */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            px: 2, 
                            py: 0.5, 
                            borderBottom: '1px solid', 
                            borderColor: 'background.border',
                            bgcolor: alpha('#000', 0.1)
                        }}
                    >
                        <Stack direction="row" sx={{ width: { xs: '100%', sm: '320px', md: '360px' } }} justifyContent="space-between">
                            <Typography variant="caption" sx={{ fontWeight: 800, width: 100, textAlign: 'center', color: 'text.secondary' }}>1 (Home)</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, width: 100, textAlign: 'center', color: 'text.secondary' }}>X (Draw)</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, width: 100, textAlign: 'center', color: 'text.secondary' }}>2 (Away)</Typography>
                        </Stack>
                    </Box>

                    {/* Match Rows */}
                    {category.matches.map((match) => (
                        <Box
                            key={match.id}
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'stretch', sm: 'center' },
                                justifyContent: 'space-between',
                                borderBottom: '1px solid',
                                borderColor: 'background.border',
                                py: 1.5,
                                px: 2,
                                gap: { xs: 1.5, sm: 0 },
                                transition: 'background-color 0.2s',
                                '&:hover': { bgcolor: alpha('#FFF', 0.02) }
                            }}
                        >
                            {/* Match Details info */}
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                                <Stack spacing={0.25}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        {match.isLive ? (
                                            <Box 
                                                sx={{ 
                                                    width: 6, 
                                                    height: 6, 
                                                    borderRadius: '50%', 
                                                    bgcolor: '#FF5630', 
                                                    boxShadow: '0 0 8px #FF5630',
                                                    animation: 'pulse 1.5s infinite alternate' 
                                                }} 
                                            />
                                        ) : null}
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                fontWeight: 800, 
                                                color: match.isLive ? '#FF5630' : 'text.secondary',
                                                fontSize: '0.7rem'
                                            }}
                                        >
                                            {match.time}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        {match.teams}
                                    </Typography>
                                </Stack>
                            </Stack>

                            {/* Odds Selection Buttons */}
                            <Stack direction="row" alignItems="center" justifyContent="flex-end">
                                {/* Back / Lay columns */}
                                <Stack direction="row" sx={{ width: 100 }} justifyContent="center">
                                    {renderOddsButton(match, category.sport, '1 (Home Win)', match.odds.oneBlue, 'oneBlue', false)}
                                    {renderOddsButton(match, category.sport, '1 (Home Win)', match.odds.onePink, 'onePink', true)}
                                </Stack>
                                <Stack direction="row" sx={{ width: 100 }} justifyContent="center">
                                    {renderOddsButton(match, category.sport, 'X (Draw)', match.odds.xBlue, 'xBlue', false)}
                                    {renderOddsButton(match, category.sport, 'X (Draw)', match.odds.xPink, 'xPink', true)}
                                </Stack>
                                <Stack direction="row" sx={{ width: 100 }} justifyContent="center">
                                    {renderOddsButton(match, category.sport, '2 (Away Win)', match.odds.twoBlue, 'twoBlue', false)}
                                    {renderOddsButton(match, category.sport, '2 (Away Win)', match.odds.twoPink, 'twoPink', true)}
                                </Stack>
                            </Stack>
                        </Box>
                    ))}
                </Box>
            ))}

            {/* --- Dynamic Interactive Floating Bet Slip --- */}
            {selectedBet && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 80, md: 24 }, 
                        right: { xs: 16, md: 24 },
                        zIndex: 2000,
                        width: { xs: 'calc(100% - 32px)', sm: 340 },
                        bgcolor: 'background.layer3',
                        border: '1px solid',
                        borderColor: betPlacedSuccessfully ? 'success.main' : 'primary.main',
                        borderRadius: 2,
                        boxShadow: '0px 10px 30px rgba(0,0,0,0.6)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0.02))'
                    }}
                >
                    {/* Bet Slip Header */}
                    <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="center" 
                        sx={{ 
                            bgcolor: betPlacedSuccessfully ? 'success.darker' : 'background.layer4', 
                            px: 2, 
                            py: 1.5,
                            borderBottom: '1px solid',
                            borderColor: 'background.border'
                        }}
                    >
                        <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#fff' }}>
                            {betPlacedSuccessfully ? 'Bet Placed' : 'Bet Slip'}
                        </Typography>
                        <IconButton 
                            size="small" 
                            onClick={() => { setSelectedBet(null); setBetPlacedSuccessfully(false); }}
                            sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Stack>

                    {/* Bet Slip Body */}
                    <Box sx={{ p: 2 }}>
                        {betPlacedSuccessfully ? (
                            <Stack alignItems="center" spacing={1.5} sx={{ py: 2 }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#22C55E' }} />
                                <Stack alignItems="center" spacing={0.5}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff' }}>
                                        Receipt Success!
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                                        Your bet of ${betAmount} on {selectedBet.market} has been locked in.
                                    </Typography>
                                </Stack>
                                <Button 
                                    variant="outlined" 
                                    color="success" 
                                    size="small"
                                    onClick={() => { setSelectedBet(null); setBetPlacedSuccessfully(false); }}
                                    sx={{ mt: 1, textTransform: 'none', fontWeight: 700 }}
                                >
                                    Dismiss
                                </Button>
                            </Stack>
                        ) : (
                            <Stack spacing={2}>
                                {/* Market & Match info */}
                                <Stack spacing={0.5}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, textTransform: 'uppercase' }}>
                                            {selectedBet.sport}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Odds: <span style={{ color: '#fff', fontWeight: 900 }}>{selectedBet.odds}</span>
                                        </Typography>
                                    </Stack>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                                        {selectedBet.market}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {selectedBet.teams}
                                    </Typography>
                                </Stack>

                                {/* Stake & Payout Inputs */}
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <TextField
                                        label="Risk Amount ($)"
                                        size="small"
                                        type="number"
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(e.target.value)}
                                        disabled={isPlacingBet}
                                        slotProps={{
                                            inputLabel: { shrink: true }
                                        }}
                                        sx={{ 
                                            flex: 1,
                                            '& label.Mui-focused': { color: 'primary.main' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'background.border' },
                                                '&:hover fieldset': { borderColor: 'background.layer4' },
                                                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                                            }
                                        }}
                                    />
                                    <Stack spacing={0.25} sx={{ textAlign: 'right', minWidth: 100 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                            Est. Returns
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ color: '#24EE89', fontWeight: 800 }}>
                                            ${(parseFloat(betAmount || '0') * selectedBet.odds).toFixed(2)}
                                        </Typography>
                                    </Stack>
                                </Stack>

                                {/* Place Bet Action Button */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handlePlaceBet}
                                    disabled={isPlacingBet}
                                    sx={{
                                        py: 1.2,
                                        fontWeight: 800,
                                        fontSize: '0.875rem',
                                        textTransform: 'none',
                                        bgcolor: 'primary.main',
                                        backgroundImage: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
                                        boxShadow: '0px 4px 12px rgba(0, 186, 230, 0.3)',
                                        color: '#fff',
                                        '&:hover': {
                                            backgroundImage: 'linear-gradient(90deg, #006C9C 0%, #00BAE6 100%)'
                                        }
                                    }}
                                >
                                    {isPlacingBet ? (
                                        <CircularProgress size={20} sx={{ color: '#fff' }} />
                                    ) : (
                                        `Place Bet`
                                    )}
                                </Button>
                            </Stack>
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default SportsbookTable;
