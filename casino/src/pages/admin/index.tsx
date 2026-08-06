import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import {
    Alert, Avatar, Box, Button, Card, CardContent, Chip, CssBaseline, Dialog, DialogActions,
    DialogContent, DialogTitle, Drawer, IconButton, InputAdornment, LinearProgress, List,
    ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select, Stack, Switch, Table,
    TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField,
    Tooltip, Typography
} from '@mui/material';
import { adminService } from './admin.service';
import { catalogService } from './catalog.service';
import type {
    AdminUserRecord, AuditLogItem, CatalogGame, CatalogProvider, DashboardMetrics,
    DepositRequestRecord, GameTransactionRecord, PaymentSettingsData, SyncLogItem,
    SystemHealthInfo, UserRecord, WithdrawalRequestRecord
} from './types';
import './admin.css';

const DRAWER_WIDTH = 270;

const navItems = [
    { id: 'overview', label: 'Dashboard', icon: 'solar:widget-add-bold-duotone', category: 'MAIN' },
    { id: 'admins', label: 'Admins', icon: 'solar:shield-user-bold-duotone', category: 'USER MANAGEMENT' },
    { id: 'users', label: 'Players', icon: 'solar:users-group-two-rounded-bold-duotone', category: 'USER MANAGEMENT' },
    { id: 'games', label: 'Games Catalog', icon: 'solar:gamepad-bold-duotone', category: 'GAMING' },
    { id: 'providers', label: 'Providers', icon: 'solar:server-square-bold-duotone', category: 'GAMING' },
    { id: 'deposits', label: 'Deposits', icon: 'solar:card-transfer-bold-duotone', category: 'FINANCE' },
    { id: 'withdrawals', label: 'Withdrawals', icon: 'solar:wallet-money-bold-duotone', category: 'FINANCE' },
    { id: 'transactions', label: 'Transactions', icon: 'solar:transfer-horizontal-bold-duotone', category: 'FINANCE' },
    { id: 'payment-settings', label: 'Payment Settings', icon: 'solar:qr-code-bold-duotone', category: 'SETTINGS' },
    { id: 'website-settings', label: 'Website Settings', icon: 'solar:settings-bold-duotone', category: 'SETTINGS' },
    { id: 'security', label: 'Security & Logs', icon: 'solar:shield-check-bold-duotone', category: 'SETTINGS' }
];

export default function AdminPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Active Admin Session
    const [currentRole, setCurrentRole] = useState<'SUPER_ADMIN' | 'ADMIN'>('SUPER_ADMIN');

    const page = useMemo(() => {
        const pathParts = location.pathname.split('/admin/').filter(Boolean);
        return pathParts[0] || 'overview';
    }, [location.pathname]);

    // Data States
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [admins, setAdmins] = useState<AdminUserRecord[]>([]);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [providers, setProviders] = useState<CatalogProvider[]>([]);
    const [games, setGames] = useState<CatalogGame[]>([]);
    const [deposits, setDeposits] = useState<DepositRequestRecord[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequestRecord[]>([]);
    const [transactions, setTransactions] = useState<GameTransactionRecord[]>([]);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsData>({
        upiId: 'playverse@upi',
        upiName: 'PLAYVERSE GAMING',
        qrCodeUrl: null,
        minDeposit: 100,
        maxDeposit: 100000,
        isEnabled: true
    });
    const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
    const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([]);
    const [health, setHealth] = useState<SystemHealthInfo | null>(null);

    // UI States
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [providerFilter, setProviderFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [mobileOpen, setMobileOpen] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Modals
    const [createAdminOpen, setCreateAdminOpen] = useState<boolean>(false);
    const [newAdminForm, setNewAdminForm] = useState({ name: '', username: '', email: '', mobile: '', role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' });
    const [screenshotModal, setScreenshotModal] = useState<DepositRequestRecord | null>(null);
    const [actionDialog, setActionDialog] = useState<{ type: 'APPROVE_DEP' | 'REJECT_DEP' | 'APPROVE_WD' | 'REJECT_WD', item: any } | null>(null);
    const [rejectReason, setRejectReason] = useState<string>('');

    // Load Data
    const loadAllData = async () => {
        setLoading(true);
        try {
            const [m, a, u, p, g, d, w, t, pay, audit, sync, h] = await Promise.all([
                adminService.getDashboardOverviewMetrics(),
                adminService.getAdmins(),
                adminService.getUsers(),
                catalogService.getProviders(),
                catalogService.getGames(),
                adminService.getDepositRequests(),
                adminService.getWithdrawalRequests(),
                adminService.getGameTransactions(),
                adminService.getPaymentSettings(),
                adminService.getAuditLogs(),
                adminService.getSyncLogs(),
                adminService.getSystemHealth()
            ]);

            setMetrics(m);
            setAdmins(a);
            setUsers(u);
            setProviders(p);
            setGames(g);
            setDeposits(d);
            setWithdrawals(w);
            setTransactions(t);
            setPaymentSettings(pay);
            setAuditLogs(audit);
            setSyncLogs(sync);
            setHealth(h);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, [page]);

    // Toast helper
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

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

    const filteredDeposits = useMemo(() => {
        return deposits.filter(d => {
            const matchesSearch = !searchTerm || d.username.toLowerCase().includes(searchTerm.toLowerCase()) || d.utr.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [deposits, searchTerm, statusFilter]);

    const filteredWithdrawals = useMemo(() => {
        return withdrawals.filter(w => {
            const matchesSearch = !searchTerm || w.username.toLowerCase().includes(searchTerm.toLowerCase()) || w.accountNumber.includes(searchTerm);
            const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [withdrawals, searchTerm, statusFilter]);

    // Actions
    const handleCreateAdminSubmit = async () => {
        if (!newAdminForm.name || !newAdminForm.username || !newAdminForm.email) {
            showToast('Please fill out all required fields');
            return;
        }
        const success = await adminService.createAdmin({
            name: newAdminForm.name,
            username: newAdminForm.username,
            email: newAdminForm.email,
            mobile: newAdminForm.mobile || null,
            role: newAdminForm.role,
            status: 'ACTIVE',
            assignedPlayersCount: 0
        });
        if (success) {
            showToast(`Admin ${newAdminForm.name} created successfully!`);
            setCreateAdminOpen(false);
            setNewAdminForm({ name: '', username: '', email: '', mobile: '', role: 'ADMIN' });
            loadAllData();
        } else {
            showToast('Failed to create admin record');
        }
    };

    const handleConfirmAction = async () => {
        if (!actionDialog) return;
        const { type, item } = actionDialog;

        if (type === 'APPROVE_DEP') {
            const ok = await adminService.approveDepositRequest(item.id, item.userId, item.amount);
            if (ok) {
                showToast(`Approved deposit of ₹${item.amount} for ${item.username}. Player wallet credited!`);
                loadAllData();
            }
        } else if (type === 'REJECT_DEP') {
            const ok = await adminService.rejectDepositRequest(item.id, rejectReason || 'Payment verification failed');
            if (ok) {
                showToast(`Rejected deposit request for ${item.username}`);
                loadAllData();
            }
        } else if (type === 'APPROVE_WD') {
            const ok = await adminService.approveWithdrawalRequest(item.id);
            if (ok) {
                showToast(`Approved withdrawal of ₹${item.amount} for ${item.username}`);
                loadAllData();
            }
        } else if (type === 'REJECT_WD') {
            const ok = await adminService.rejectWithdrawalRequest(item.id, rejectReason || 'Account details invalid');
            if (ok) {
                showToast(`Rejected withdrawal request for ${item.username}`);
                loadAllData();
            }
        }

        setActionDialog(null);
        setRejectReason('');
    };

    const handleQRFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image size exceeds 5MB limit');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentSettings(prev => ({ ...prev, qrCodeUrl: reader.result as string }));
                showToast('QR Code uploaded. Click Save Changes to apply.');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePaymentSettings = async () => {
        const ok = await adminService.updatePaymentSettings(paymentSettings);
        if (ok) {
            showToast('Payment Settings & QR Code updated successfully!');
        } else {
            showToast('Failed to save payment settings');
        }
    };

    // Sidebar Content (LIGHT THEME)
    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}>
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #E5E7EB' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgGradient: 'linear-gradient(135deg, #FF4842, #7A0C2E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon="solar:shield-bold" width="24" color="#FFF" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                        PLAYVERSE
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 0.8 }}>
                        ENTERPRISE BACK-OFFICE
                    </Typography>
                </Box>
            </Box>

            <List sx={{ px: 1.5, py: 2, flexGrow: 1, overflowY: 'auto' }}>
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
                                color: active ? '#FF4842' : '#4B5563',
                                bgcolor: active ? 'rgba(255, 72, 66, 0.08)' : 'transparent',
                                '&:hover': { bgcolor: '#F3F4F6' }
                            }}
                        >
                            <ListItemIcon sx={{ color: active ? '#FF4842' : '#6B7280', minWidth: 38 }}>
                                <Icon icon={item.icon} width="22" />
                            </ListItemIcon>
                            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: active ? 700 : 600 }} />
                        </ListItemButton>
                    );
                })}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => navigate('/')}
                    startIcon={<Icon icon="solar:home-angle-bold-duotone" />}
                    sx={{ borderColor: '#D1D5DB', color: '#374151', fontSize: '0.82rem', fontWeight: 600 }}
                >
                    Back to Player Portal
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6F8', color: '#111827' }}>
            <CssBaseline />

            {/* Toast Notification */}
            {toastMessage && (
                <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
                    <Alert severity="info" variant="filled" sx={{ bgcolor: '#FF4842', color: '#FFF', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                        {toastMessage}
                    </Alert>
                </Box>
            )}

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

            {/* Main Content (LIGHT THEME) */}
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3.5 }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
                {/* Header Toolbar */}
                <Paper sx={{ p: 2, mb: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { md: 'none' } }}>
                                <Icon icon="solar:hamburger-menu-linear" />
                            </IconButton>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#111827' }}>
                                    {navItems.find(i => i.id === page)?.label || 'Dashboard Overview'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                    Role Scoped: <strong style={{ color: '#FF4842' }}>{currentRole}</strong>
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Chip
                                icon={<Icon icon="solar:database-bold" color={health?.connected ? '#22C55E' : '#EF4444'} />}
                                label={health?.connected ? 'Database Healthy' : 'Database Offline'}
                                variant="outlined"
                                size="small"
                                sx={{ borderColor: health?.connected ? '#BBF7D0' : '#FECACA', color: health?.connected ? '#15803D' : '#B91C1C', fontWeight: 700, bgcolor: health?.connected ? '#F0FDF4' : '#FEF2F2' }}
                            />
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#FF4842', fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>AM</Avatar>
                        </Stack>
                    </Stack>
                </Paper>

                {loading && <LinearProgress sx={{ mb: 3, bgcolor: '#E5E7EB', '& .MuiLinearProgress-bar': { bgcolor: '#FF4842' } }} />}

                {/* DASHBOARD OVERVIEW */}
                {page === 'overview' && metrics && (
                    <Stack spacing={3}>
                        {/* Summary Cards */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2.5 }}>
                            <Paper sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Total Registered Players</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#111827' }}>{metrics.totalUsers}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(51, 144, 255, 0.1)', color: '#2563EB' }}>
                                        <Icon icon="solar:users-group-two-rounded-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Active Players (24h)</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#111827' }}>{metrics.activeUsers24h}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#16A34A' }}>
                                        <Icon icon="solar:user-check-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Total Admins</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#111827' }}>{metrics.totalAdmins}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255, 72, 66, 0.1)', color: '#DC2626' }}>
                                        <Icon icon="solar:shield-user-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Player Wallet Balances</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#16A34A' }}>₹{metrics.totalWalletBalance.toLocaleString('en-IN')}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}>
                                        <Icon icon="solar:wallet-money-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Pending Deposit Requests</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: metrics.pendingDepositsCount > 0 ? '#D97706' : '#111827' }}>{metrics.pendingDepositsCount}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}>
                                        <Icon icon="solar:card-transfer-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Pending Withdrawal Requests</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: metrics.pendingWithdrawalsCount > 0 ? '#DC2626' : '#111827' }}>{metrics.pendingWithdrawalsCount}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#DC2626' }}>
                                        <Icon icon="solar:wallet-money-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Active Games</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#111827' }}>{metrics.totalGames}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(147, 51, 234, 0.1)', color: '#9333EA' }}>
                                        <Icon icon="solar:gamepad-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>Active Providers</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: '#111827' }}>{metrics.activeProviders}</Typography>
                                    </Box>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(14, 165, 233, 0.1)', color: '#0284C7' }}>
                                        <Icon icon="solar:server-square-bold" width="28" />
                                    </Box>
                                </Stack>
                            </Paper>
                        </Box>

                        {/* Recent Activity Table */}
                        <Paper sx={{ p: 3, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>System Audit Activity</Typography>
                            {auditLogs.length === 0 ? (
                                <Alert severity="info" sx={{ bgcolor: '#F9FAFB', color: '#4B5563' }}>No audit activity entries logged in database.</Alert>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Timestamp</TableCell>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Actor</TableCell>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Action</TableCell>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Details</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {auditLogs.slice(0, 5).map(log => (
                                                <TableRow key={log.id}>
                                                    <TableCell sx={{ color: '#111827' }}>{log.timestamp}</TableCell>
                                                    <TableCell sx={{ color: '#111827', fontWeight: 600 }}>{log.actor}</TableCell>
                                                    <TableCell><Chip label={log.action} size="small" color="primary" variant="outlined" /></TableCell>
                                                    <TableCell sx={{ color: '#374151' }}>{log.details}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    </Stack>
                )}

                {/* ADMINS MANAGEMENT */}
                {page === 'admins' && (
                    <Paper sx={{ p: 3, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>Admin User Directory ({admins.length})</Typography>
                                <Typography variant="caption" sx={{ color: '#6B7280' }}>Manage administrative access and player assignments</Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<Icon icon="solar:add-circle-bold" />}
                                onClick={() => setCreateAdminOpen(true)}
                                sx={{ bgcolor: '#FF4842', '&:hover': { bgcolor: '#B72136' }, textTransform: 'none', fontWeight: 700 }}
                            >
                                Create Admin
                            </Button>
                        </Stack>

                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Name</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Username / Email</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Role</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Assigned Players</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Created Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {admins.map(a => (
                                        <TableRow key={a.id}>
                                            <TableCell sx={{ color: '#111827', fontWeight: 700 }}>{a.name}</TableCell>
                                            <TableCell sx={{ color: '#374151' }}>
                                                @{a.username}<br />
                                                <Typography variant="caption" sx={{ color: '#6B7280' }}>{a.email}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={a.role}
                                                    size="small"
                                                    color={a.role === 'SUPER_ADMIN' ? 'error' : 'info'}
                                                    variant="filled"
                                                    sx={{ fontWeight: 700 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={a.status}
                                                    size="small"
                                                    color={a.status === 'ACTIVE' ? 'success' : 'default'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: '#111827', fontWeight: 600 }}>{a.assignedPlayersCount} Players</TableCell>
                                            <TableCell sx={{ color: '#6B7280' }}>{a.createdAt}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {/* PLAYERS MANAGEMENT */}
                {page === 'users' && (
                    <Paper sx={{ p: 3, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>Registered Players Directory ({filteredUsers.length})</Typography>
                            <TextField
                                size="small"
                                placeholder="Search player mobile or name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Icon icon="solar:magnifer-linear" color="#9CA3AF" />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ width: 280, bgcolor: '#F9FAFB', borderRadius: 1.5 }}
                            />
                        </Stack>

                        {filteredUsers.length === 0 ? (
                            <Alert severity="info" sx={{ bgcolor: '#F9FAFB', color: '#4B5563' }}>No players found in User database table.</Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Mobile</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Name / Email</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Assigned Agent</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Wallet Balance</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Verification</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Registration Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredUsers.slice(pageNumber * rowsPerPage, (pageNumber + 1) * rowsPerPage).map(u => (
                                            <TableRow key={u.id}>
                                                <TableCell sx={{ color: '#111827', fontWeight: 700 }}>{u.mobile}</TableCell>
                                                <TableCell sx={{ color: '#374151' }}>
                                                    {u.name || 'Player'}<br />
                                                    <Typography variant="caption" sx={{ color: '#6B7280' }}>{u.email || 'No email'}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563' }}>{u.agent}</TableCell>
                                                <TableCell sx={{ color: '#16A34A', fontWeight: 800 }}>₹{u.walletBalance.toLocaleString('en-IN')}</TableCell>
                                                <TableCell>
                                                    <Chip label={u.mobileVerified ? 'Verified' : 'Pending'} size="small" color={u.mobileVerified ? 'success' : 'warning'} variant="outlined" />
                                                </TableCell>
                                                <TableCell sx={{ color: '#6B7280' }}>{u.createdAt}</TableCell>
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
                                    sx={{ color: '#4B5563' }}
                                />
                            </TableContainer>
                        )}
                    </Paper>
                )}

                {/* GAMES CATALOG */}
                {page === 'games' && (
                    <Paper sx={{ p: 3, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>Database Games Catalog ({filteredGames.length})</Typography>
                            <TextField
                                size="small"
                                placeholder="Search games..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Icon icon="solar:magnifer-linear" color="#9CA3AF" />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ width: 280, bgcolor: '#F9FAFB', borderRadius: 1.5 }}
                            />
                        </Stack>

                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Game Name</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Game Code</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Category</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Plays</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Active Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredGames.slice(pageNumber * rowsPerPage, (pageNumber + 1) * rowsPerPage).map(g => (
                                        <TableRow key={g.id}>
                                            <TableCell sx={{ color: '#111827', fontWeight: 600 }}>{g.gameName}</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontFamily: 'monospace' }}>{g.gameCode}</TableCell>
                                            <TableCell><Chip label={g.category || 'Slot'} size="small" variant="outlined" color="primary" /></TableCell>
                                            <TableCell sx={{ color: '#111827' }}>{g.playCount}</TableCell>
                                            <TableCell>
                                                <Switch checked={g.isActive} color="error" />
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
                                sx={{ color: '#4B5563' }}
                            />
                        </TableContainer>
                    </Paper>
                )}

                {/* PROVIDERS */}
                {page === 'providers' && (
                    <Paper sx={{ p: 3, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>Database Game Providers ({providers.length})</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Provider Name</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Provider Code</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Created Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {providers.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell sx={{ color: '#111827', fontWeight: 700 }}>{p.providerName}</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontFamily: 'monospace' }}>{p.providerCode}</TableCell>
                                            <TableCell><Chip label={p.status ? 'Active' : 'Disabled'} size="small" color={p.status ? 'success' : 'default'} variant="outlined" /></TableCell>
                                            <TableCell sx={{ color: '#6B7280' }}>{p.createdAt}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {/* DEPOSIT APPROVAL MANAGEMENT */}
                {page === 'deposits' && (
                    <Paper sx={{ p: 3, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>Player Deposit Verification Queue ({filteredDeposits.length})</Typography>
                                <Typography variant="caption" sx={{ color: '#6B7280' }}>Verify player payment screenshots & UTR numbers to approve manual deposit requests</Typography>
                            </Box>
                            <Stack direction="row" spacing={2}>
                                <Select
                                    size="small"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    sx={{ bgcolor: '#F9FAFB', color: '#111827', width: 140 }}
                                >
                                    <MenuItem value="ALL">All Status</MenuItem>
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="APPROVED">Approved</MenuItem>
                                    <MenuItem value="REJECTED">Rejected</MenuItem>
                                </Select>
                            </Stack>
                        </Stack>

                        {filteredDeposits.length === 0 ? (
                            <Alert severity="info" sx={{ bgcolor: '#F9FAFB', color: '#4B5563' }}>No deposit verification requests found in database.</Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Player</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Amount</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>UTR Number</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Screenshot</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredDeposits.map(d => (
                                            <TableRow key={d.id}>
                                                <TableCell sx={{ color: '#111827', fontWeight: 700 }}>{d.username}</TableCell>
                                                <TableCell sx={{ color: '#16A34A', fontWeight: 800 }}>₹{d.amount.toLocaleString('en-IN')}</TableCell>
                                                <TableCell sx={{ color: '#374151', fontFamily: 'monospace' }}>{d.utr}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<Icon icon="solar:eye-bold" />}
                                                        onClick={() => setScreenshotModal(d)}
                                                        sx={{ color: '#2563EB', borderColor: '#BFDBFE', textTransform: 'none' }}
                                                    >
                                                        View Receipt
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={d.status}
                                                        size="small"
                                                        color={d.status === 'APPROVED' ? 'success' : d.status === 'PENDING' ? 'warning' : 'error'}
                                                        variant="filled"
                                                        sx={{ fontWeight: 700 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {d.status === 'PENDING' && (
                                                        <Stack direction="row" spacing={1}>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => setActionDialog({ type: 'APPROVE_DEP', item: d })}
                                                                sx={{ fontWeight: 700, textTransform: 'none' }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                onClick={() => setActionDialog({ type: 'REJECT_DEP', item: d })}
                                                                sx={{ fontWeight: 700, textTransform: 'none' }}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </Stack>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                )}

                {/* WITHDRAWALS MANAGEMENT */}
                {page === 'withdrawals' && (
                    <Paper sx={{ p: 3, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>Player Withdrawal Processing Queue ({filteredWithdrawals.length})</Typography>
                        {filteredWithdrawals.length === 0 ? (
                            <Alert severity="info" sx={{ bgcolor: '#F9FAFB', color: '#4B5563' }}>No withdrawal requests found in database.</Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Player</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Amount</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Bank Details</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredWithdrawals.map(w => (
                                            <TableRow key={w.id}>
                                                <TableCell sx={{ color: '#111827', fontWeight: 700 }}>{w.username}</TableCell>
                                                <TableCell sx={{ color: '#DC2626', fontWeight: 800 }}>₹{w.amount.toLocaleString('en-IN')}</TableCell>
                                                <TableCell sx={{ color: '#374151' }}>
                                                    {w.bankName}<br />
                                                    <Typography variant="caption" sx={{ color: '#6B7280', fontFamily: 'monospace' }}>A/C: {w.accountNumber} | IFSC: {w.ifsc}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={w.status} size="small" color={w.status === 'APPROVED' ? 'success' : w.status === 'PENDING' ? 'warning' : 'error'} variant="filled" />
                                                </TableCell>
                                                <TableCell>
                                                    {w.status === 'PENDING' && (
                                                        <Stack direction="row" spacing={1}>
                                                            <Button size="small" variant="contained" color="success" onClick={() => setActionDialog({ type: 'APPROVE_WD', item: w })}>Approve</Button>
                                                            <Button size="small" variant="outlined" color="error" onClick={() => setActionDialog({ type: 'REJECT_WD', item: w })}>Reject</Button>
                                                        </Stack>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                )}

                {/* PAYMENT SETTINGS & QR CODE MANAGER */}
                {page === 'payment-settings' && (
                    <Paper sx={{ p: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#111827' }}>Player Manual Payment & QR Code Settings</Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', mb: 4 }}>
                            Configure the deposit UPI QR code and payment guidelines displayed to players when making manual deposits.
                        </Typography>

                        <Stack spacing={4} sx={{ maxWidth: 640 }}>
                            <Box sx={{ p: 3, border: '2px dashed #D1D5DB', borderRadius: 3, textAlign: 'center', bgcolor: '#F9FAFB' }}>
                                {paymentSettings.qrCodeUrl ? (
                                    <Box sx={{ mb: 2 }}>
                                        <img src={paymentSettings.qrCodeUrl} alt="Deposit QR" style={{ width: 180, height: 180, borderRadius: 12, objectFit: 'contain' }} />
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 3 }}>
                                        <Icon icon="solar:qr-code-bold-duotone" width="64" color="#FF4842" />
                                        <Typography variant="body2" sx={{ color: '#6B7280', mt: 1 }}>No Payment QR uploaded yet</Typography>
                                    </Box>
                                )}

                                <Stack direction="row" justifyContent="center" spacing={2}>
                                    <Button
                                        variant="contained"
                                        component="label"
                                        startIcon={<Icon icon="solar:upload-square-bold" />}
                                        sx={{ bgcolor: '#FF4842', '&:hover': { bgcolor: '#B72136' }, textTransform: 'none', fontWeight: 700 }}
                                    >
                                        Upload QR Code Image
                                        <input type="file" hidden accept="image/png, image/jpeg, image/webp" onChange={handleQRFileUpload} />
                                    </Button>
                                    {paymentSettings.qrCodeUrl && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => setPaymentSettings(prev => ({ ...prev, qrCodeUrl: null }))}
                                        >
                                            Remove QR
                                        </Button>
                                    )}
                                </Stack>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 1.5, display: 'block' }}>
                                    Supported formats: PNG, JPG, WebP (Max 5MB)
                                </Typography>
                            </Box>

                            <TextField
                                label="Merchant UPI ID"
                                value={paymentSettings.upiId}
                                onChange={e => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                                fullWidth
                                sx={{ bgcolor: '#F9FAFB', borderRadius: 1.5 }}
                            />

                            <TextField
                                label="Merchant Display Name"
                                value={paymentSettings.upiName}
                                onChange={e => setPaymentSettings({ ...paymentSettings, upiName: e.target.value })}
                                fullWidth
                                sx={{ bgcolor: '#F9FAFB', borderRadius: 1.5 }}
                            />

                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Minimum Deposit (₹)"
                                    type="number"
                                    value={paymentSettings.minDeposit}
                                    onChange={e => setPaymentSettings({ ...paymentSettings, minDeposit: Number(e.target.value) })}
                                    fullWidth
                                    sx={{ bgcolor: '#F9FAFB' }}
                                />
                                <TextField
                                    label="Maximum Deposit (₹)"
                                    type="number"
                                    value={paymentSettings.maxDeposit}
                                    onChange={e => setPaymentSettings({ ...paymentSettings, maxDeposit: Number(e.target.value) })}
                                    fullWidth
                                    sx={{ bgcolor: '#F9FAFB' }}
                                />
                            </Stack>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleSavePaymentSettings}
                                sx={{ bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' }, fontWeight: 800, textTransform: 'none', py: 1.5 }}
                            >
                                Save Payment Settings
                            </Button>
                        </Stack>
                    </Paper>
                )}

                {/* GAME TRANSACTIONS */}
                {page === 'transactions' && (
                    <Paper sx={{ p: 3, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>Game Transactions Log ({transactions.length})</Typography>
                        {transactions.length === 0 ? (
                            <Alert severity="info" sx={{ bgcolor: '#F9FAFB', color: '#4B5563' }}>No transactions logged in GameTransaction database table.</Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                        <TableRow>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Txn ID</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>User</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Provider / Game</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Bet</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Win</TableCell>
                                            <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Timestamp</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell sx={{ color: '#111827', fontFamily: 'monospace' }}>{t.transactionId}</TableCell>
                                                <TableCell sx={{ color: '#111827', fontWeight: 600 }}>{t.userCode}</TableCell>
                                                <TableCell sx={{ color: '#374151' }}>{t.providerCode} / {t.gameCode}</TableCell>
                                                <TableCell sx={{ color: '#DC2626', fontWeight: 600 }}>₹{t.betAmount.toLocaleString('en-IN')}</TableCell>
                                                <TableCell sx={{ color: '#16A34A', fontWeight: 600 }}>₹{t.winAmount.toLocaleString('en-IN')}</TableCell>
                                                <TableCell sx={{ color: '#6B7280' }}>{t.createdAt}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                )}

                {/* SECURITY & LOGS */}
                {page === 'security' && (
                    <Stack spacing={3}>
                        <Paper sx={{ p: 3, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>Audit Logs ({auditLogs.length})</Typography>
                            {auditLogs.length === 0 ? (
                                <Alert severity="info" sx={{ bgcolor: '#F9FAFB', color: '#4B5563' }}>No AuditLog table entries recorded.</Alert>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Timestamp</TableCell>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Actor</TableCell>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Action</TableCell>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Details</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {auditLogs.map(l => (
                                                <TableRow key={l.id}>
                                                    <TableCell sx={{ color: '#111827' }}>{l.timestamp}</TableCell>
                                                    <TableCell sx={{ color: '#111827', fontWeight: 600 }}>{l.actor}</TableCell>
                                                    <TableCell><Chip label={l.action} size="small" color="primary" variant="outlined" /></TableCell>
                                                    <TableCell sx={{ color: '#374151' }}>{l.details}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>

                        <Paper sx={{ p: 3, bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>Sync Logs ({syncLogs.length})</Typography>
                            {syncLogs.length === 0 ? (
                                <Alert severity="info" sx={{ bgcolor: '#F9FAFB', color: '#4B5563' }}>No SyncLog table entries recorded.</Alert>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                            <TableRow>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Timestamp</TableCell>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Provider</TableCell>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Type</TableCell>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Status</TableCell>
                                                <TableCell sx={{ color: '#4B5563', fontWeight: 700 }}>Message</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {syncLogs.map(s => (
                                                <TableRow key={s.id}>
                                                    <TableCell sx={{ color: '#111827' }}>{s.createdAt}</TableCell>
                                                    <TableCell sx={{ color: '#111827', fontWeight: 600 }}>{s.providerCode}</TableCell>
                                                    <TableCell>{s.type}</TableCell>
                                                    <TableCell><Chip label={s.status} size="small" color={s.status === 'SUCCESS' ? 'success' : 'error'} variant="outlined" /></TableCell>
                                                    <TableCell sx={{ color: '#374151' }}>{s.message}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    </Stack>
                )}
            </Box>

            {/* CREATE ADMIN DIALOG */}
            <Dialog open={createAdminOpen} onClose={() => setCreateAdminOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#FFFFFF', color: '#111827' } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Create New Admin Account</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Full Name" value={newAdminForm.name} onChange={e => setNewAdminForm({ ...newAdminForm, name: e.target.value })} fullWidth sx={{ bgcolor: '#F9FAFB' }} />
                        <TextField label="Username" value={newAdminForm.username} onChange={e => setNewAdminForm({ ...newAdminForm, username: e.target.value })} fullWidth sx={{ bgcolor: '#F9FAFB' }} />
                        <TextField label="Email Address" value={newAdminForm.email} onChange={e => setNewAdminForm({ ...newAdminForm, email: e.target.value })} fullWidth sx={{ bgcolor: '#F9FAFB' }} />
                        <TextField label="Mobile Number" value={newAdminForm.mobile} onChange={e => setNewAdminForm({ ...newAdminForm, mobile: e.target.value })} fullWidth sx={{ bgcolor: '#F9FAFB' }} />
                        <Select value={newAdminForm.role} onChange={e => setNewAdminForm({ ...newAdminForm, role: e.target.value as any })} fullWidth sx={{ bgcolor: '#F9FAFB', color: '#111827' }}>
                            <MenuItem value="ADMIN">ADMIN (Assigned Players Only)</MenuItem>
                            <MenuItem value="SUPER_ADMIN">SUPER ADMIN (Full Platform Control)</MenuItem>
                        </Select>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setCreateAdminOpen(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleCreateAdminSubmit} sx={{ bgcolor: '#FF4842', fontWeight: 700 }}>Create Account</Button>
                </DialogActions>
            </Dialog>

            {/* SCREENSHOT RECEIPT VIEWER DIALOG */}
            <Dialog open={Boolean(screenshotModal)} onClose={() => setScreenshotModal(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#FFFFFF', color: '#111827' } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Player Payment Screenshot Verification</DialogTitle>
                <DialogContent>
                    {screenshotModal && (
                        <Stack spacing={2} sx={{ mt: 1, alignItems: 'center' }}>
                            <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, width: '100%', border: '1px solid #E5E7EB' }}>
                                <Typography variant="subtitle2">Player: <strong>{screenshotModal.username}</strong></Typography>
                                <Typography variant="subtitle2">Amount: <strong style={{ color: '#16A34A' }}>₹{screenshotModal.amount}</strong></Typography>
                                <Typography variant="subtitle2">UTR Number: <strong style={{ fontFamily: 'monospace' }}>{screenshotModal.utr}</strong></Typography>
                            </Box>
                            {screenshotModal.screenshotUrl ? (
                                <img src={screenshotModal.screenshotUrl} alt="Payment Receipt" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, objectFit: 'contain' }} />
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F9FAFB', width: '100%', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                                    <Icon icon="solar:document-text-bold-duotone" width="48" color="#9CA3AF" />
                                    <Typography variant="body2" sx={{ color: '#6B7280', mt: 1 }}>No image uploaded. Verified via UTR ({screenshotModal.utr})</Typography>
                                </Box>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setScreenshotModal(null)} color="inherit">Close</Button>
                </DialogActions>
            </Dialog>

            {/* ACTION DIALOG FOR APPROVE / REJECT */}
            <Dialog open={Boolean(actionDialog)} onClose={() => setActionDialog(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#FFFFFF', color: '#111827' } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Confirm Action</DialogTitle>
                <DialogContent>
                    {actionDialog && (
                        <Typography variant="body2" sx={{ color: '#374151', mt: 1 }}>
                            Are you sure you want to {actionDialog.type.toLowerCase().includes('approve') ? 'approve' : 'reject'} this request of <strong>₹{actionDialog.item.amount}</strong> for <strong>{actionDialog.item.username}</strong>?
                        </Typography>
                    )}
                    {actionDialog?.type.includes('REJECT') && (
                        <TextField
                            label="Reason for Rejection"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            fullWidth
                            sx={{ mt: 2, bgcolor: '#F9FAFB' }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setActionDialog(null)} color="inherit">Cancel</Button>
                    <Button
                        variant="contained"
                        color={actionDialog?.type.includes('APPROVE') ? 'success' : 'error'}
                        onClick={handleConfirmAction}
                        sx={{ fontWeight: 700 }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
