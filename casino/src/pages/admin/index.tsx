import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import {
    Alert, Avatar, Box, Button, Chip, CssBaseline, Dialog, DialogActions, DialogContent,
    DialogTitle, Drawer, IconButton, InputAdornment, LinearProgress, List, ListItemButton,
    ListItemIcon, ListItemText, Paper, Stack, Switch, Table, TableBody, TableCell,
    TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography
} from '@mui/material';
import { adminService } from './admin.service';
import { catalogService } from './catalog.service';
import type {
    AuditLogItem, CatalogGame, CatalogProvider, DashboardMetrics,
    GameTransactionRecord, SyncLogItem, SystemHealthInfo, UserRecord
} from './types';
import './admin.css';

const DRAWER_WIDTH = 260;

const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: 'solar:widget-add-bold-duotone' },
    { id: 'users', label: 'Players & Wallets', icon: 'solar:users-group-two-rounded-bold-duotone' },
    { id: 'games', label: 'Game Catalog', icon: 'solar:gamepad-bold-duotone' },
    { id: 'providers', label: 'Game Providers', icon: 'solar:server-square-bold-duotone' },
    { id: 'transactions', label: 'Game Transactions', icon: 'solar:transfer-horizontal-bold-duotone' },
    { id: 'logs', label: 'Audit & Sync Logs', icon: 'solar:document-text-bold-duotone' },
    { id: 'health', label: 'Platform Diagnostics', icon: 'solar:shield-check-bold-duotone' }
];

export default function AdminPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const page = useMemo(() => {
        const pathParts = location.pathname.split('/admin/').filter(Boolean);
        return pathParts[0] || 'overview';
    }, [location.pathname]);

    // Data States
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [providers, setProviders] = useState<CatalogProvider[]>([]);
    const [games, setGames] = useState<CatalogGame[]>([]);
    const [transactions, setTransactions] = useState<GameTransactionRecord[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
    const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([]);
    const [health, setHealth] = useState<SystemHealthInfo | null>(null);

    // UI States
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [providerFilter, setProviderFilter] = useState<string>('all');
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [mobileOpen, setMobileOpen] = useState<boolean>(false);

    // Initial Load & Page Refetching
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const loadData = async () => {
            try {
                const [m, u, p, g, t, a, s, h] = await Promise.all([
                    adminService.getDashboardOverviewMetrics(),
                    adminService.getUsers(),
                    catalogService.getProviders(),
                    catalogService.getGames(),
                    adminService.getGameTransactions(),
                    adminService.getAuditLogs(),
                    adminService.getSyncLogs(),
                    adminService.getSystemHealth()
                ]);

                if (isMounted) {
                    setMetrics(m);
                    setUsers(u);
                    setProviders(p);
                    setGames(g);
                    setTransactions(t);
                    setAuditLogs(a);
                    setSyncLogs(s);
                    setHealth(h);
                }
            } catch (err) {
                console.error('Failed to fetch real database data for admin dashboard:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [page]);

    // Filter Logic
    const filteredGames = useMemo(() => {
        return games.filter(g => {
            const matchesSearch = !searchTerm || g.gameName.toLowerCase().includes(searchTerm.toLowerCase()) || g.gameCode.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProvider = providerFilter === 'all' || g.providerId === providerFilter;
            return matchesSearch && matchesProvider;
        });
    }, [games, searchTerm, providerFilter]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            return !searchTerm ||
                u.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    }, [users, searchTerm]);

    const handleToggleProvider = async (id: string, currentStatus: boolean) => {
        const success = await catalogService.toggleProviderStatus(id, currentStatus);
        if (success) {
            setProviders(prev => prev.map(p => p.id === id ? { ...p, status: !currentStatus } : p));
        }
    };

    const handleToggleGame = async (id: string, currentStatus: boolean) => {
        const success = await catalogService.toggleGameStatus(id, currentStatus);
        if (success) {
            setGames(prev => prev.map(g => g.id === id ? { ...g, isActive: !currentStatus } : g));
        }
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0d111c', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgGradient: 'linear-gradient(135deg, #FF4842, #7A0C2E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon="solar:gamepad-bold" width="22" color="#FFF" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFF', lineHeight: 1.2 }}>
                        CASINO ADMIN
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                        Live Operations Console
                    </Typography>
                </Box>
            </Box>

            <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
                {navItems.map(item => {
                    const active = page === item.id;
                    return (
                        <ListItemButton
                            key={item.id}
                            component={Link}
                            to={`/admin/${item.id}`}
                            selected={active}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                color: active ? '#FF4842' : 'rgba(255,255,255,0.7)',
                                bgcolor: active ? 'rgba(255, 72, 66, 0.12)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                            }}
                        >
                            <ListItemIcon sx={{ color: active ? '#FF4842' : 'rgba(255,255,255,0.5)', minWidth: 38 }}>
                                <Icon icon={item.icon} width="22" />
                            </ListItemIcon>
                            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 700 : 500 }} />
                        </ListItemButton>
                    );
                })}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => navigate('/')}
                    startIcon={<Icon icon="solar:home-angle-bold-duotone" />}
                    sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}
                >
                    Back to Player App
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#090d16', color: '#FFF' }}>
            <CssBaseline />

            {/* Sidebar for Desktop */}
            <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH }
                    }}
                >
                    {drawerContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderWidth: 0 }
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content Area */}
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
                {/* Header Toolbar */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <IconButton
                            color="inherit"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            sx={{ display: { md: 'none' } }}
                        >
                            <Icon icon="solar:hamburger-menu-linear" />
                        </IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {navItems.find(i => i.id === page)?.label || 'Dashboard Overview'}
                        </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Chip
                            icon={<Icon icon="solar:database-bold" color={health?.connected ? '#54D62C' : '#FF4842'} />}
                            label={health?.connected ? 'Database Connected' : 'Database Offline'}
                            variant="outlined"
                            sx={{
                                borderColor: health?.connected ? 'rgba(84,214,44,0.3)' : 'rgba(255,72,66,0.3)',
                                color: health?.connected ? '#54D62C' : '#FF4842',
                                fontWeight: 600
                            }}
                        />
                    </Stack>
                </Stack>

                {loading && <LinearProgress sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#FF4842' } }} />}

                {/* OVERVIEW PAGE */}
                {page === 'overview' && metrics && (
                    <Stack spacing={3}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700 }}>
                            Real-Time Database Business Key Performance Indicators
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2.5 }}>
                            <Paper sx={{ p: 2.5, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Total Registered Players</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#FFF' }}>{metrics.totalUsers}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(51, 144, 255, 0.12)', color: '#3390FF' }}>
                                        <Icon icon="solar:users-group-two-rounded-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Active Players (24h)</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#FFF' }}>{metrics.activeUsers24h}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(84, 214, 44, 0.12)', color: '#54D62C' }}>
                                        <Icon icon="solar:user-check-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Total Wallet Balances</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#54D62C' }}>₹{metrics.totalWalletBalance.toLocaleString('en-IN')}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255, 193, 7, 0.12)', color: '#FFC107' }}>
                                        <Icon icon="solar:wallet-money-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Active Game Sessions</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#FFF' }}>{metrics.activeSessionsCount}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(183, 110, 255, 0.12)', color: '#B76EFF' }}>
                                        <Icon icon="solar:bolt-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Total Catalog Games</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#FFF' }}>{metrics.totalGames}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255, 72, 66, 0.12)', color: '#FF4842' }}>
                                        <Icon icon="solar:gamepad-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Active Providers</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#FFF' }}>{metrics.activeProviders}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(0, 184, 217, 0.12)', color: '#00B8D9' }}>
                                        <Icon icon="solar:server-square-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Total Bet Transactions</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#FFF' }}>{metrics.totalBetsCount}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(51, 144, 255, 0.12)', color: '#3390FF' }}>
                                        <Icon icon="solar:transfer-horizontal-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Total Bet Amount</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#FFF' }}>₹{metrics.totalBetAmount.toLocaleString('en-IN')}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(84, 214, 44, 0.12)', color: '#54D62C' }}>
                                        <Icon icon="solar:tag-price-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>
                        </Box>

                        {/* Recent Database Operations Audit */}
                        <Paper sx={{ p: 3, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, mt: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Audit Log Operations</Typography>
                            {auditLogs.length === 0 ? (
                                <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)' }}>
                                    No audit log entries recorded in database.
                                </Alert>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Timestamp</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Actor</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Action</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Details</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {auditLogs.slice(0, 5).map(log => (
                                                <TableRow key={log.id}>
                                                    <TableCell sx={{ color: '#FFF' }}>{log.timestamp}</TableCell>
                                                    <TableCell sx={{ color: '#FFF' }}>{log.actor}</TableCell>
                                                    <TableCell><Chip label={log.action} size="small" color="primary" variant="outlined" /></TableCell>
                                                    <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{log.details}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    </Stack>
                )}

                {/* PLAYERS & WALLETS PAGE */}
                {page === 'users' && (
                    <Paper sx={{ p: 3, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Database Player Records ({filteredUsers.length})</Typography>
                            <TextField
                                size="small"
                                placeholder="Search by mobile or name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Icon icon="solar:magnifer-linear" color="rgba(255,255,255,0.5)" />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ width: 280, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1.5 }}
                            />
                        </Stack>

                        {filteredUsers.length === 0 ? (
                            <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)' }}>
                                No players found in the User database table.
                            </Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Mobile</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Name / Email</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Wallet Balance</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Mobile Verified</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Joined Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredUsers.slice(pageNumber * rowsPerPage, (pageNumber + 1) * rowsPerPage).map(u => (
                                            <TableRow key={u.id}>
                                                <TableCell sx={{ color: '#FFF', fontWeight: 600 }}>{u.mobile}</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                    {u.name || 'N/A'}<br />
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{u.email || 'No email'}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ color: '#54D62C', fontWeight: 700 }}>₹{u.walletBalance.toLocaleString('en-IN')}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={u.mobileVerified ? 'Verified' : 'Pending'}
                                                        size="small"
                                                        color={u.mobileVerified ? 'success' : 'warning'}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{u.createdAt}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <TablePagination
                                    component="div"
                                    count={filteredUsers.length}
                                    page={pageNumber}
                                    onPageChange={(_, p) => setPageNumber(p)}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPageNumber(0); }}
                                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                                />
                            </TableContainer>
                        )}
                    </Paper>
                )}

                {/* GAME CATALOG PAGE */}
                {page === 'games' && (
                    <Paper sx={{ p: 3, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Database Games Catalog ({filteredGames.length})</Typography>
                            <TextField
                                size="small"
                                placeholder="Search games..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Icon icon="solar:magnifer-linear" color="rgba(255,255,255,0.5)" />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ width: 280, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1.5 }}
                            />
                        </Stack>

                        {filteredGames.length === 0 ? (
                            <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)' }}>
                                No games found in the Game database table.
                            </Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Game Name</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Game Code</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Category</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Plays</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Active Toggle</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredGames.slice(pageNumber * rowsPerPage, (pageNumber + 1) * rowsPerPage).map(g => (
                                            <TableRow key={g.id}>
                                                <TableCell sx={{ color: '#FFF', fontWeight: 600 }}>{g.gameName}</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{g.gameCode}</TableCell>
                                                <TableCell><Chip label={g.category || 'Slot'} size="small" variant="outlined" color="primary" /></TableCell>
                                                <TableCell sx={{ color: '#FFF' }}>{g.playCount}</TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={g.isActive}
                                                        onChange={() => handleToggleGame(g.id, g.isActive)}
                                                        color="error"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <TablePagination
                                    component="div"
                                    count={filteredGames.length}
                                    page={pageNumber}
                                    onPageChange={(_, p) => setPageNumber(p)}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPageNumber(0); }}
                                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                                />
                            </TableContainer>
                        )}
                    </Paper>
                )}

                {/* GAME PROVIDERS PAGE */}
                {page === 'providers' && (
                    <Paper sx={{ p: 3, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Database Game Providers ({providers.length})</Typography>
                        {providers.length === 0 ? (
                            <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)' }}>
                                No providers found in the Provider database table.
                            </Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Provider Name</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Provider Code</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Status</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Created At</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Toggle</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {providers.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell sx={{ color: '#FFF', fontWeight: 600 }}>{p.providerName}</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{p.providerCode}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={p.status ? 'Active' : 'Disabled'}
                                                        size="small"
                                                        color={p.status ? 'success' : 'default'}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>{p.createdAt}</TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={p.status}
                                                        onChange={() => handleToggleProvider(p.id, p.status)}
                                                        color="error"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                )}

                {/* GAME TRANSACTIONS PAGE */}
                {page === 'transactions' && (
                    <Paper sx={{ p: 3, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Database Game Transactions ({transactions.length})</Typography>
                        {transactions.length === 0 ? (
                            <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)' }}>
                                No transactions logged in GameTransaction database table.
                            </Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Txn ID</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>User Code</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Provider / Game</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Bet Amount</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Win Amount</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Timestamp</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell sx={{ color: '#FFF', fontFamily: 'monospace' }}>{t.transactionId}</TableCell>
                                                <TableCell sx={{ color: '#FFF' }}>{t.userCode}</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{t.providerCode} / {t.gameCode}</TableCell>
                                                <TableCell sx={{ color: '#FF4842', fontWeight: 600 }}>₹{t.betAmount.toLocaleString('en-IN')}</TableCell>
                                                <TableCell sx={{ color: '#54D62C', fontWeight: 600 }}>₹{t.winAmount.toLocaleString('en-IN')}</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>{t.createdAt}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                )}

                {/* AUDIT & SYNC LOGS PAGE */}
                {page === 'logs' && (
                    <Stack spacing={3}>
                        <Paper sx={{ p: 3, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Audit Logs ({auditLogs.length})</Typography>
                            {auditLogs.length === 0 ? (
                                <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)' }}>
                                    No entries in AuditLog table.
                                </Alert>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Timestamp</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Actor</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Action</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Details</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {auditLogs.map(l => (
                                                <TableRow key={l.id}>
                                                    <TableCell sx={{ color: '#FFF' }}>{l.timestamp}</TableCell>
                                                    <TableCell sx={{ color: '#FFF' }}>{l.actor}</TableCell>
                                                    <TableCell><Chip label={l.action} size="small" color="primary" variant="outlined" /></TableCell>
                                                    <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{l.details}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>

                        <Paper sx={{ p: 3, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Sync Logs ({syncLogs.length})</Typography>
                            {syncLogs.length === 0 ? (
                                <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)' }}>
                                    No entries in SyncLog table.
                                </Alert>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Timestamp</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Provider</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Type</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Status</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Message</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {syncLogs.map(s => (
                                                <TableRow key={s.id}>
                                                    <TableCell sx={{ color: '#FFF' }}>{s.createdAt}</TableCell>
                                                    <TableCell sx={{ color: '#FFF' }}>{s.providerCode}</TableCell>
                                                    <TableCell>{s.type}</TableCell>
                                                    <TableCell><Chip label={s.status} size="small" color={s.status === 'SUCCESS' ? 'success' : 'error'} variant="outlined" /></TableCell>
                                                    <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{s.message}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    </Stack>
                )}

                {/* PLATFORM DIAGNOSTICS PAGE */}
                {page === 'health' && (
                    <Paper sx={{ p: 3, bgcolor: '#111726', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Database & Backend Platform Diagnostics</Typography>
                        <Stack spacing={2}>
                            <Alert severity={health?.connected ? 'success' : 'error'} sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                                PostgreSQL / Supabase Database Connection: {health?.connected ? 'HEALTHY & ONLINE' : 'OFFLINE'}
                            </Alert>
                            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Verified Database Tables:</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {(health?.tablesFound || []).map(t => (
                                        <Chip key={t} label={t} color="success" size="small" variant="outlined" />
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    </Paper>
                )}
            </Box>
        </Box>
    );
}
