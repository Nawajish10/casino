import { Box, Card, Chip, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTransactions } from 'hooks/useTransactions';

const money = (value: string) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value));

export default function TransactionHistory() {
    const activity = useLocation().pathname.endsWith('/activity');
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useTransactions({ page, limit: 20 });
    return <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 4 }}>
        <Typography variant="h4" fontWeight={800} mb={3}>{activity ? 'Player Activity' : 'Bet History'}</Typography>
        {isLoading && <Stack alignItems="center" py={8}><CircularProgress /></Stack>}
        {isError && <Typography color="error">Transaction history could not be loaded.</Typography>}
        {!isLoading && !data?.items.length && <Typography color="text.secondary">No game transactions found.</Typography>}
        <Stack spacing={1.5}>
            {data?.items.map(txn => {
                const won = Number(txn.winAmount) > Number(txn.betAmount);
                return <Card key={txn.id} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'background.layer2' }}>
                    {txn.gameImage && <Box component="img" src={txn.gameImage} alt={txn.gameName} sx={{ width: 56, height: 56, borderRadius: 1, objectFit: 'cover' }} />}
                    <Box sx={{ flex: 1 }}><Typography fontWeight={700}>{txn.gameName}</Typography><Typography variant="body2" color="text.secondary">{txn.providerCode} · {new Date(txn.createdAt).toLocaleString()}</Typography></Box>
                    <Stack alignItems="flex-end"><Typography>Bet {money(txn.betAmount)}</Typography><Typography color={won ? 'success.main' : 'text.secondary'}>Win {money(txn.winAmount)}</Typography><Chip size="small" color={won ? 'success' : 'default'} label={won ? 'Win' : 'Loss'} /></Stack>
                </Card>;
            })}
        </Stack>
        {!!data?.pages && data.pages > 1 && <Stack alignItems="center" mt={3}><Pagination page={page} count={data.pages} onChange={(_, value) => setPage(value)} /></Stack>}
    </Box>;
}
