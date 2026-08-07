import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import {
    Alert, Avatar, Box, Button, Card, CardContent, Chip, CssBaseline, Dialog, DialogActions,
    DialogContent, DialogTitle, Drawer, Grid, IconButton, InputAdornment, LinearProgress, List,
    ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select, Stack, Switch, Table,
    TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField,
    Tooltip, Typography
} from '@mui/material';
import { adminService } from './admin.service';
import { catalogService } from './catalog.service';
import type {
    AgentRecord, AuditLogItem, CatalogGame, CatalogProvider, DashboardMetrics,
    DepositRequestRecord, GameTransactionRecord, PaymentSettingsData, SyncLogItem,
    SystemHealthInfo, UserRecord, WithdrawalRequestRecord
} from './types';
import './admin.css';

const DRAWER_WIDTH = 270;

const navItems = [
    { id: 'overview', label: 'Dashboard', icon: 'solar:widget-add-bold-duotone', category: 'MAIN' },
    { id: 'agents', label: 'Agents', icon: 'solar:user-handshake-bold-duotone', category: 'MANAGEMENT' },
    { id: 'users', label: 'Players', icon: 'solar:users-group-two-rounded-bold-duotone', category: 'MANAGEMENT' },
    { id: 'games', label: 'Games', icon: 'solar:gamepad-bold-duotone', category: 'GAMING' },
    { id: 'providers', label: 'Providers', icon: 'solar:server-square-bold-duotone', category: 'GAMING' },
    { id: 'deposits', label: 'Deposits', icon: 'solar:card-transfer-bold-duotone', category: 'FINANCE' },
    { id: 'withdrawals', label: 'Withdrawals', icon: 'solar:wallet-money-bold-duotone', category: 'FINANCE' },
    { id: 'transactions', label: 'Transactions', icon: 'solar:transfer-horizontal-bold-duotone', category: 'FINANCE' },
    { id: 'reports', label: 'Reports', icon: 'solar:chart-2-bold-duotone', category: 'FINANCE' },
    { id: 'payment-settings', label: 'Payment Settings', icon: 'solar:qr-code-bold-duotone', category: 'SETTINGS' },
    { id: 'website-settings', label: 'Website Settings', icon: 'solar:settings-bold-duotone', category: 'SETTINGS' },
    { id: 'security', label: 'Security', icon: 'solar:shield-check-bold-duotone', category: 'SYSTEM' },
    { id: 'audit-logs', label: 'Audit Logs', icon: 'solar:document-text-bold-duotone', category: 'SYSTEM' },
    { id: 'profile', label: 'Profile', icon: 'solar:user-bold-duotone', category: 'SYSTEM' }
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
    const [agents, setAgents] = useState<AgentRecord[]>([]);
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
    const [agentFilter, setAgentFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [providerFilter, setProviderFilter] = useState<string>('all');
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [mobileOpen, setMobileOpen] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Agent Modals
    const [createAgentOpen, setCreateAgentOpen] = useState<boolean>(false);
    const [editAgentModal, setEditAgentModal] = useState<AgentRecord | null>(null);
    const [agentPlayersModal, setAgentPlayersModal] = useState<AgentRecord | null>(null);
    const [newAgentForm, setNewAgentForm] = useState({ name: '', username: '', email: '', mobile: '', walletBalance: 0 });

    // Player Modals
    const [editPlayerModal, setEditPlayerModal] = useState<UserRecord | null>(null);
    const [playerHistoryModal, setPlayerHistoryModal] = useState<{ player: UserRecord; type: 'DEPOSIT' | 'WITHDRAWAL'; items: any[] } | null>(null);

    // Payment Settings QR Upload States
    const [qrFile, setQrFile] = useState<File | null>(null);
    const [qrPreview, setQrPreview] = useState<string | null>(null);
    const [replaceQrConfirmOpen, setReplaceQrConfirmOpen] = useState<boolean>(false);
    const [deleteQrConfirmOpen, setDeleteQrConfirmOpen] = useState<boolean>(false);

    // Deposit & Withdrawal Action Dialogs
    const [screenshotModal, setScreenshotModal] = useState<DepositRequestRecord | null>(null);
    const [actionDialog, setActionDialog] = useState<{ type: 'APPROVE_DEP' | 'REJECT_DEP' | 'APPROVE_WD' | 'REJECT_WD' | 'DELETE_AGENT' | 'DELETE_PLAYER'; item: any } | null>(null);
    const [rejectReason, setRejectReason] = useState<string>('');

    // Load Data
    const loadAllData = async () => {
        setLoading(true);
        try {
            const [m, a, u, p, g, d, w, t, pay, audit, sync, h] = await Promise.all([
                adminService.getDashboardOverviewMetrics(),
                adminService.getAgents(),
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
            setAgents(a);
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

    // Filters
    const filteredAgents = useMemo(() => {
        return agents.filter(a => {
            const matchesSearch = !searchTerm ||
                a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (a.mobile && a.mobile.includes(searchTerm));
            const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [agents, searchTerm, statusFilter]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = !searchTerm ||
                u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.mobile.includes(searchTerm) ||
                (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesAgent = agentFilter === 'ALL' || u.agentId === agentFilter;
            const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
            return matchesSearch && matchesAgent && matchesStatus;
        });
    }, [users, searchTerm, agentFilter, statusFilter]);

    const filteredDeposits = useMemo(() => {
        return deposits.filter(d => {
            const matchesSearch = !searchTerm ||
                d.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (d.assignedAgent && d.assignedAgent.toLowerCase().includes(searchTerm.toLowerCase())) ||
                d.utr.toLowerCase().includes(searchTerm.toLowerCase());
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

    // Agent Handlers
    const handleCreateAgentSubmit = async () => {
        if (!newAgentForm.name || !newAgentForm.username || !newAgentForm.email) {
            showToast('Please fill out all required fields (Name, Username, Email)');
            return;
        }
        const success = await adminService.createAgent({
            name: newAgentForm.name,
            username: newAgentForm.username,
            email: newAgentForm.email,
            mobile: newAgentForm.mobile || undefined,
            walletBalance: newAgentForm.walletBalance
        });
        if (success) {
            showToast(`Agent "${newAgentForm.name}" created successfully!`);
            setCreateAgentOpen(false);
            setNewAgentForm({ name: '', username: '', email: '', mobile: '', walletBalance: 0 });
            loadAllData();
        } else {
            showToast('Failed to create agent. Username or Email may already exist.');
        }
    };

    const handleToggleAgentStatus = async (agent: AgentRecord) => {
        const ok = await adminService.toggleAgentStatus(agent.id);
        if (ok) {
            showToast(`Agent ${agent.name} is now ${agent.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'}.`);
            loadAllData();
        } else {
            showToast('Failed to toggle agent status');
        }
    };

    const handleEditAgentSubmit = async () => {
        if (!editAgentModal) return;
        const ok = await adminService.updateAgent(editAgentModal.id, {
            name: editAgentModal.name,
            email: editAgentModal.email,
            mobile: editAgentModal.mobile || undefined,
            walletBalance: editAgentModal.walletBalance,
            status: editAgentModal.status
        });
        if (ok) {
            showToast(`Agent ${editAgentModal.name} updated successfully!`);
            setEditAgentModal(null);
            loadAllData();
        } else {
            showToast('Failed to update agent details');
        }
    };

    // Player Handlers
    const handleTogglePlayerStatus = async (player: UserRecord) => {
        const ok = await adminService.togglePlayerStatus(player.id);
        if (ok) {
            showToast(`Player ${player.username} is now ${player.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'}.`);
            loadAllData();
        } else {
            showToast('Failed to change player status');
        }
    };

    const handleEditPlayerSubmit = async () => {
        if (!editPlayerModal) return;
        const ok = await adminService.updatePlayer(editPlayerModal.id, {
            name: editPlayerModal.name || undefined,
            email: editPlayerModal.email || undefined,
            agentId: editPlayerModal.agentId,
            status: editPlayerModal.status
        });
        if (ok) {
            showToast(`Player ${editPlayerModal.username} updated successfully!`);
            setEditPlayerModal(null);
            loadAllData();
        } else {
            showToast('Failed to update player');
        }
    };

    const handleViewPlayerDepositHistory = async (player: UserRecord) => {
        const history = await adminService.getPlayerDepositHistory(player.id);
        setPlayerHistoryModal({ player, type: 'DEPOSIT', items: history });
    };

    const handleViewPlayerWithdrawalHistory = async (player: UserRecord) => {
        const history = await adminService.getPlayerWithdrawalHistory(player.id);
        setPlayerHistoryModal({ player, type: 'WITHDRAWAL', items: history });
    };

    // QR Image Upload & Management Handlers
    const handleQrFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            validateAndSetQrFile(file);
        }
    };

    const handleQrDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetQrFile(e.dataTransfer.files[0]);
        }
    };

    const validateAndSetQrFile = (file: File) => {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showToast('Invalid file format. Please upload PNG, JPG, JPEG, or WEBP images only.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size exceeds 5MB limit. Please choose a smaller image.');
            return;
        }
        setQrFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setQrPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSavePaymentSettings = async () => {
        if (qrFile) {
            // Confirm replacement if existing QR exists
            if (paymentSettings.qrCodeUrl) {
                setReplaceQrConfirmOpen(true);
                return;
            }
            await processQrUploadAndSave();
        } else {
            const ok = await adminService.updatePaymentSettings(paymentSettings);
            if (ok) {
                showToast('Payment settings saved successfully!');
            } else {
                showToast('Failed to update payment settings');
            }
        }
    };

    const processQrUploadAndSave = async () => {
        if (!qrFile) return;
        setLoading(true);
        const uploadedUrl = await adminService.uploadPaymentQrCode(qrFile);
        if (uploadedUrl) {
            const updated = { ...paymentSettings, qrCodeUrl: uploadedUrl };
            const ok = await adminService.updatePaymentSettings(updated);
            if (ok) {
                setPaymentSettings(updated);
                setQrFile(null);
                setQrPreview(null);
                showToast('New Payment QR code uploaded & updated live across the platform!');
            } else {
                showToast('Failed to save updated QR code URL');
            }
        } else {
            showToast('Failed to upload QR code image file');
        }
        setLoading(false);
        setReplaceQrConfirmOpen(false);
    };

    const handleDeleteQr = async () => {
        const updated = { ...paymentSettings, qrCodeUrl: null };
        const ok = await adminService.updatePaymentSettings(updated);
        if (ok) {
            setPaymentSettings(updated);
            setQrFile(null);
            setQrPreview(null);
            showToast('Active Payment QR Code deleted successfully!');
        } else {
            showToast('Failed to delete QR code');
        }
        setDeleteQrConfirmOpen(false);
    };

    // Deposit Approval Handlers
    const handleConfirmAction = async () => {
        if (!actionDialog) return;
        const { type, item } = actionDialog;

        if (type === 'APPROVE_DEP') {
            const ok = await adminService.approveDepositRequest(item.id, item.userId, item.amount);
            if (ok) {
                showToast(`Approved deposit of ₹${item.amount} for ${item.username}. Player wallet credited!`);
                loadAllData();
            } else {
                showToast('Failed to approve deposit request');
            }
        } else if (type === 'REJECT_DEP') {
            const ok = await adminService.rejectDepositRequest(item.id, rejectReason || 'Payment verification failed');
            if (ok) {
                showToast(`Rejected deposit request for ${item.username}.`);
                loadAllData();
            } else {
                showToast('Failed to reject deposit request');
            }
        } else if (type === 'APPROVE_WD') {
            const ok = await adminService.approveWithdrawalRequest(item.id);
            if (ok) {
                showToast(`Approved withdrawal of ₹${item.amount} for ${item.username}.`);
                loadAllData();
            } else {
                showToast('Failed to approve withdrawal request');
            }
        } else if (type === 'REJECT_WD') {
            const ok = await adminService.rejectWithdrawalRequest(item.id, rejectReason || 'Bank details mismatch');
            if (ok) {
                showToast(`Rejected withdrawal request for ${item.username}.`);
                loadAllData();
            } else {
                showToast('Failed to reject withdrawal request');
            }
        } else if (type === 'DELETE_AGENT') {
            const ok = await adminService.deleteAgent(item.id);
            if (ok) {
                showToast(`Agent ${item.name} deleted successfully.`);
                loadAllData();
            } else {
                showToast('Failed to delete agent');
            }
        } else if (type === 'DELETE_PLAYER') {
            const ok = await adminService.deletePlayer(item.id);
            if (ok) {
                showToast(`Player ${item.username} deleted successfully.`);
                loadAllData();
            } else {
                showToast('Failed to delete player');
            }
        }

        setActionDialog(null);
        setRejectReason('');
    };

    // CSV Export
    const exportDepositsCsv = () => {
        const headers = ['Player', 'Assigned Agent', 'Amount (INR)', 'Gateway', 'UTR Number', 'Deposit Time', 'Status'];
        const rows = filteredDeposits.map(d => [
            d.username,
            d.assignedAgent || 'Unassigned',
            d.amount,
            d.gateway,
            d.utr,
            d.createdAt,
            d.status
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Deposits_Report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Deposits CSV export generated successfully!');
    };

    // --- SIDEBAR DRAWER CONTENT ---
    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0b1120', color: '#fff' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}>
                    <Icon icon="solar:shield-star-bold" width="24" color="#fff" />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '0.5px', color: '#fff', fontSize: '1.1rem' }}>
                        PLAYVERSE
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        ADMIN BACK-OFFICE
                    </Typography>
                </Box>
            </Box>

            {/* Admin Profile Header Badge */}
            <Box sx={{ p: 2, mx: 2, my: 2, borderRadius: '12px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366f1', fontSize: '0.9rem', fontWeight: 700 }}>A</Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ color: '#f8fafc', fontSize: '0.85rem' }}>
                        System Admin
                    </Typography>
                    <Chip label="Highest Authority" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 700, mt: 0.3 }} />
                </Box>
            </Box>

            {/* Navigation List */}
            <Box sx={{ flexGrow: 1, px: 2, overflowY: 'auto' }}>
                {['MAIN', 'MANAGEMENT', 'GAMING', 'FINANCE', 'SETTINGS', 'SYSTEM'].map(cat => {
                    const categoryItems = navItems.filter(i => i.category === cat);
                    if (categoryItems.length === 0) return null;
                    return (
                        <Box key={cat} sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ px: 1.5, py: 0.5, color: '#64748b', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', display: 'block' }}>
                                {cat}
                            </Typography>
                            <List disablePadding>
                                {categoryItems.map(item => {
                                    const active = page === item.id;
                                    return (
                                        <ListItemButton
                                            key={item.id}
                                            component={Link}
                                            to={`/admin/${item.id}`}
                                            selected={active}
                                            onClick={() => setMobileOpen(false)}
                                            sx={{
                                                borderRadius: '10px',
                                                mb: 0.5,
                                                py: 1,
                                                px: 1.5,
                                                color: active ? '#fff' : '#94a3b8',
                                                bgcolor: active ? '#4f46e5 !important' : 'transparent',
                                                boxShadow: active ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none',
                                                '&:hover': {
                                                    bgcolor: active ? '#4f46e5' : 'rgba(255,255,255,0.05)',
                                                    color: '#fff'
                                                }
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 32, color: active ? '#fff' : '#64748b' }}>
                                                <Icon icon={item.icon} width="20" />
                                            </ListItemIcon>
                                            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500 }} />
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </Box>
                    );
                })}
            </Box>

            {/* Logout Footer */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <ListItemButton
                    onClick={() => navigate('/')}
                    sx={{ borderRadius: '10px', color: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                >
                    <ListItemIcon sx={{ minWidth: 32, color: '#ef4444' }}>
                        <Icon icon="solar:logout-3-bold-duotone" width="20" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a', color: '#f8fafc' }}>
            <CssBaseline />

            {/* Sidebar Drawers */}
            <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: 'none', bgcolor: '#0b1120' } }}
                >
                    {drawerContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: '1px solid rgba(255,255,255,0.08)', bgcolor: '#0b1120' } }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Workspace */}
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, minHeight: '100vh', overflowX: 'hidden' }}>

                {/* Top Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { md: 'none' }, color: '#fff' }}>
                            <Icon icon="solar:hamburger-menu-linear" width="24" />
                        </IconButton>
                        <Box>
                            <Typography variant="h5" fontWeight={800} sx={{ textTransform: 'capitalize', letterSpacing: '-0.5px' }}>
                                {page === 'overview' ? 'Dashboard Overview' : page.replace('-', ' ')}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                Single Admin Authority System &bull; Live Real-Time Operations
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                        {loading && <LinearProgress sx={{ width: 100, borderRadius: 1 }} />}
                        <Chip
                            icon={<Icon icon="solar:shield-check-bold" color="#10b981" />}
                            label="ADMIN (Highest Authority)"
                            sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}
                        />
                    </Stack>
                </Box>

                {/* Toast Notification */}
                {toastMessage && (
                    <Alert severity="info" onClose={() => setToastMessage(null)} sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        {toastMessage}
                    </Alert>
                )}

                {/* ============================================================ */}
                {/* 1. DASHBOARD OVERVIEW PAGE */}
                {/* ============================================================ */}
                {page === 'overview' && (
                    <Stack spacing={4}>
                        {/* Section 1: Overview */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#94a3b8', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                Overview Metrics
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
                                <MetricCard title="Total Agents" value={metrics?.totalAgents ?? 0} icon="solar:user-handshake-bold-duotone" color="#6366f1" />
                                <MetricCard title="Active Agents" value={metrics?.activeAgents ?? 0} icon="solar:user-check-bold-duotone" color="#10b981" />
                                <MetricCard title="Total Players" value={metrics?.totalPlayers ?? 0} icon="solar:users-group-two-rounded-bold-duotone" color="#3b82f6" />
                                <MetricCard title="Online Players (24h)" value={metrics?.onlinePlayers ?? 0} icon="solar:radio-waves-bold-duotone" color="#ec4899" />
                            </Box>
                        </Box>

                        {/* Section 2: Finance */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#94a3b8', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                Finance Analytics
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
                                <MetricCard title="Today's Deposits" value={`₹${(metrics?.todaysDeposits ?? 0).toLocaleString()}`} icon="solar:card-transfer-bold-duotone" color="#10b981" />
                                <MetricCard title="Today's Withdrawals" value={`₹${(metrics?.todaysWithdrawals ?? 0).toLocaleString()}`} icon="solar:wallet-money-bold-duotone" color="#f59e0b" />
                                <MetricCard title="Total Wallet Balance" value={`₹${(metrics?.totalWalletBalance ?? 0).toLocaleString()}`} icon="solar:vault-bold-duotone" color="#8b5cf6" />
                                <MetricCard title="Platform Revenue" value={`₹${(metrics?.platformRevenue ?? 0).toLocaleString()}`} icon="solar:dollar-minimalistic-bold-duotone" color="#06b6d4" />
                            </Box>
                        </Box>

                        {/* Section 3: Gaming & Operations */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#94a3b8', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                    Gaming Overview
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                                    <MetricCard title="Active Games" value={metrics?.activeGames ?? 0} icon="solar:gamepad-bold-duotone" color="#6366f1" />
                                    <MetricCard title="Providers" value={metrics?.activeProviders ?? 0} icon="solar:server-square-bold-duotone" color="#3b82f6" />
                                    <MetricCard title="Bets Today" value={metrics?.betsToday ?? 0} icon="solar:chart-2-bold-duotone" color="#f43f5e" />
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#94a3b8', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                    Operations Queue
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                                    <MetricCard title="Pending Deposits" value={metrics?.pendingDeposits ?? 0} icon="solar:clock-circle-bold-duotone" color="#eab308" />
                                    <MetricCard title="Pending Withdrawals" value={metrics?.pendingWithdrawals ?? 0} icon="solar:history-bold-duotone" color="#f97316" />
                                    <MetricCard title="Failed Transactions" value={metrics?.failedTransactions ?? 0} icon="solar:danger-triangle-bold-duotone" color="#ef4444" />
                                </Box>
                            </Box>
                        </Box>
                    </Stack>
                )}

                {/* ============================================================ */}
                {/* 2. AGENT MANAGEMENT PAGE */}
                {/* ============================================================ */}
                {page === 'agents' && (
                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <Stack direction="row" spacing={2} sx={{ flexGrow: 1, maxWidth: 500 }}>
                                <TextField
                                    placeholder="Search agents by name, email, mobile..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Icon icon="solar:magnifer-linear" color="#64748b" /></InputAdornment>,
                                    }}
                                    sx={{ bgcolor: '#1e293b', borderRadius: '10px', input: { color: '#fff' } }}
                                />
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    size="small"
                                    sx={{ bgcolor: '#1e293b', color: '#fff', borderRadius: '10px', minWidth: 130 }}
                                >
                                    <MenuItem value="ALL">All Status</MenuItem>
                                    <MenuItem value="ACTIVE">Active</MenuItem>
                                    <MenuItem value="DISABLED">Disabled</MenuItem>
                                </Select>
                            </Stack>
                            <Button
                                variant="contained"
                                startIcon={<Icon icon="solar:user-plus-bold" />}
                                onClick={() => setCreateAgentOpen(true)}
                                sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, borderRadius: '10px', px: 3, fontWeight: 700 }}
                            >
                                Create Agent
                            </Button>
                        </Box>

                        <TableContainer component={Paper} sx={{ bgcolor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#0f172a' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Agent Name</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Email</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Mobile Number</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Assigned Players</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Wallet Balance</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Reg Date</TableCell>
                                        <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 800 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAgents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#64748b' }}>
                                                No agents found matching search parameters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAgents.slice(pageNumber * rowsPerPage, pageNumber * rowsPerPage + rowsPerPage).map(agent => (
                                            <TableRow key={agent.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar sx={{ bgcolor: '#4f46e5', width: 36, height: 36, fontWeight: 700 }}>{agent.name.charAt(0)}</Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#f8fafc' }}>{agent.name}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#64748b' }}>@{agent.username}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ color: '#cbd5e1' }}>{agent.email}</TableCell>
                                                <TableCell sx={{ color: '#cbd5e1' }}>{agent.mobile || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={agent.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: agent.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                            color: agent.status === 'ACTIVE' ? '#34d399' : '#f87171',
                                                            fontWeight: 700
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={<Icon icon="solar:users-group-two-rounded-bold" />}
                                                        label={`${agent.assignedPlayersCount} Players`}
                                                        onClick={() => setAgentPlayersModal(agent)}
                                                        clickable
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 700 }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#34d399', fontWeight: 700 }}>
                                                    ₹{agent.walletBalance.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{agent.createdAt}</TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Tooltip title="View Assigned Players">
                                                            <IconButton size="small" onClick={() => setAgentPlayersModal(agent)} sx={{ color: '#818cf8' }}>
                                                                <Icon icon="solar:users-group-two-rounded-bold" width="18" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Edit Agent">
                                                            <IconButton size="small" onClick={() => setEditAgentModal(agent)} sx={{ color: '#38bdf8' }}>
                                                                <Icon icon="solar:pen-bold" width="18" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={agent.status === 'ACTIVE' ? 'Disable Agent' : 'Enable Agent'}>
                                                            <IconButton size="small" onClick={() => handleToggleAgentStatus(agent)} sx={{ color: agent.status === 'ACTIVE' ? '#f59e0b' : '#10b981' }}>
                                                                <Icon icon={agent.status === 'ACTIVE' ? "solar:forbidden-circle-bold" : "solar:check-circle-bold"} width="18" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete Agent">
                                                            <IconButton size="small" onClick={() => setActionDialog({ type: 'DELETE_AGENT', item: agent })} sx={{ color: '#ef4444' }}>
                                                                <Icon icon="solar:trash-bin-trash-bold" width="18" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50]}
                                component="div"
                                count={filteredAgents.length}
                                rowsPerPage={rowsPerPage}
                                page={pageNumber}
                                onPageChange={(_, p) => setPageNumber(p)}
                                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                sx={{ color: '#94a3b8' }}
                            />
                        </TableContainer>
                    </Stack>
                )}

                {/* ============================================================ */}
                {/* 3. PLAYER MANAGEMENT PAGE */}
                {/* ============================================================ */}
                {page === 'users' && (
                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <Stack direction="row" spacing={2} sx={{ flexGrow: 1, maxWidth: 650 }}>
                                <TextField
                                    placeholder="Search players by username, mobile, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Icon icon="solar:magnifer-linear" color="#64748b" /></InputAdornment>,
                                    }}
                                    sx={{ bgcolor: '#1e293b', borderRadius: '10px', input: { color: '#fff' } }}
                                />
                                <Select
                                    value={agentFilter}
                                    onChange={(e) => setAgentFilter(e.target.value)}
                                    size="small"
                                    sx={{ bgcolor: '#1e293b', color: '#fff', borderRadius: '10px', minWidth: 150 }}
                                >
                                    <MenuItem value="ALL">All Agents</MenuItem>
                                    {agents.map(a => (
                                        <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                                    ))}
                                </Select>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    size="small"
                                    sx={{ bgcolor: '#1e293b', color: '#fff', borderRadius: '10px', minWidth: 130 }}
                                >
                                    <MenuItem value="ALL">All Status</MenuItem>
                                    <MenuItem value="ACTIVE">Active</MenuItem>
                                    <MenuItem value="SUSPENDED">Suspended</MenuItem>
                                </Select>
                            </Stack>
                        </Box>

                        <TableContainer component={Paper} sx={{ bgcolor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#0f172a' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Username / Player</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Assigned Agent</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Wallet Balance</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Last Login</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Reg Date</TableCell>
                                        <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 800 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748b' }}>
                                                No players found matching filter criteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.slice(pageNumber * rowsPerPage, pageNumber * rowsPerPage + rowsPerPage).map(user => (
                                            <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar sx={{ bgcolor: '#06b6d4', width: 36, height: 36, fontWeight: 700 }}>{user.username.charAt(0).toUpperCase()}</Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#f8fafc' }}>{user.username}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#64748b' }}>{user.mobile}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.assignedAgent}
                                                        size="small"
                                                        sx={{ bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 700 }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#34d399', fontWeight: 700 }}>
                                                    ₹{user.walletBalance.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: user.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                            color: user.status === 'ACTIVE' ? '#34d399' : '#f87171',
                                                            fontWeight: 700
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user.lastLoginAt || 'Recent'}</TableCell>
                                                <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user.createdAt}</TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Tooltip title="Deposit History">
                                                            <IconButton size="small" onClick={() => handleViewPlayerDepositHistory(user)} sx={{ color: '#10b981' }}>
                                                                <Icon icon="solar:card-transfer-bold" width="18" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Withdrawal History">
                                                            <IconButton size="small" onClick={() => handleViewPlayerWithdrawalHistory(user)} sx={{ color: '#f59e0b' }}>
                                                                <Icon icon="solar:wallet-money-bold" width="18" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Edit / Reassign Agent">
                                                            <IconButton size="small" onClick={() => setEditPlayerModal(user)} sx={{ color: '#38bdf8' }}>
                                                                <Icon icon="solar:pen-bold" width="18" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={user.status === 'ACTIVE' ? 'Suspend Player' : 'Activate Player'}>
                                                            <IconButton size="small" onClick={() => handleTogglePlayerStatus(user)} sx={{ color: user.status === 'ACTIVE' ? '#f97316' : '#10b981' }}>
                                                                <Icon icon={user.status === 'ACTIVE' ? "solar:forbidden-circle-bold" : "solar:check-circle-bold"} width="18" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete Player">
                                                            <IconButton size="small" onClick={() => setActionDialog({ type: 'DELETE_PLAYER', item: user })} sx={{ color: '#ef4444' }}>
                                                                <Icon icon="solar:trash-bin-trash-bold" width="18" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50]}
                                component="div"
                                count={filteredUsers.length}
                                rowsPerPage={rowsPerPage}
                                page={pageNumber}
                                onPageChange={(_, p) => setPageNumber(p)}
                                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                                sx={{ color: '#94a3b8' }}
                            />
                        </TableContainer>
                    </Stack>
                )}

                {/* ============================================================ */}
                {/* 4. PAYMENT SETTINGS (QR CODE MANAGEMENT) PAGE */}
                {/* ============================================================ */}
                {page === 'payment-settings' && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
                        <Box>
                            <Card sx={{ bgcolor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', p: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Icon icon="solar:qr-code-bold-duotone" color="#6366f1" />
                                        Platform Payment QR Code Management
                                    </Typography>

                                    <Stack spacing={3}>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#cbd5e1', mb: 1 }}>
                                                Upload & Replace Active QR Image
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                                                Supported Formats: PNG, JPG, JPEG, WEBP &bull; Max File Size: 5MB &bull; Replaces active QR instantly across platform.
                                            </Typography>

                                            {/* Drag and drop uploader */}
                                            <Box
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={handleQrDrop}
                                                sx={{
                                                    border: '2px dashed rgba(99, 102, 241, 0.4)',
                                                    borderRadius: '16px',
                                                    p: 4,
                                                    textAlign: 'center',
                                                    bgcolor: 'rgba(15, 23, 42, 0.5)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.05)' }
                                                }}
                                                onClick={() => document.getElementById('qr-upload-input')?.click()}
                                            >
                                                <input
                                                    type="file"
                                                    id="qr-upload-input"
                                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                                    onChange={handleQrFileSelect}
                                                    style={{ display: 'none' }}
                                                />
                                                <Icon icon="solar:cloud-upload-bold-duotone" width="48" color="#818cf8" />
                                                <Typography variant="body1" fontWeight={700} sx={{ mt: 1, color: '#f8fafc' }}>
                                                    Drag & Drop QR Image here or <span style={{ color: '#818cf8', textDecoration: 'underline' }}>Browse File</span>
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
                                                    PNG, JPG, JPEG, WEBP up to 5MB
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Dynamic Preview before saving */}
                                        {(qrPreview || paymentSettings.qrCodeUrl) && (
                                            <Box sx={{ p: 2, bgcolor: '#0f172a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Box component="img" src={qrPreview || paymentSettings.qrCodeUrl || ''} sx={{ width: 90, height: 90, borderRadius: '8px', objectFit: 'contain', bgcolor: '#fff', p: 0.5 }} />
                                                    <Box>
                                                        <Chip label={qrPreview ? "New Pending Upload" : "Active Live QR Code"} size="small" color={qrPreview ? "warning" : "success"} sx={{ fontWeight: 700, mb: 0.5 }} />
                                                        <Typography variant="body2" fontWeight={700} sx={{ color: '#fff' }}>
                                                            {qrFile ? qrFile.name : 'Current Active Platform Payment QR'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                            Displayed on all player deposit pages automatically
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                {paymentSettings.qrCodeUrl && !qrPreview && (
                                                    <Button variant="outlined" color="error" size="small" startIcon={<Icon icon="solar:trash-bin-trash-bold" />} onClick={() => setDeleteQrConfirmOpen(true)}>
                                                        Delete QR
                                                    </Button>
                                                )}
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                            <TextField
                                                label="UPI ID"
                                                value={paymentSettings.upiId}
                                                onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                                                fullWidth
                                                size="small"
                                                sx={{ bgcolor: '#0f172a', input: { color: '#fff' }, label: { color: '#94a3b8' } }}
                                            />
                                            <TextField
                                                label="UPI Payee Name"
                                                value={paymentSettings.upiName}
                                                onChange={(e) => setPaymentSettings({ ...paymentSettings, upiName: e.target.value })}
                                                fullWidth
                                                size="small"
                                                sx={{ bgcolor: '#0f172a', input: { color: '#fff' }, label: { color: '#94a3b8' } }}
                                            />
                                            <TextField
                                                label="Min Deposit (₹)"
                                                type="number"
                                                value={paymentSettings.minDeposit}
                                                onChange={(e) => setPaymentSettings({ ...paymentSettings, minDeposit: Number(e.target.value) })}
                                                fullWidth
                                                size="small"
                                                sx={{ bgcolor: '#0f172a', input: { color: '#fff' }, label: { color: '#94a3b8' } }}
                                            />
                                            <TextField
                                                label="Max Deposit (₹)"
                                                type="number"
                                                value={paymentSettings.maxDeposit}
                                                onChange={(e) => setPaymentSettings({ ...paymentSettings, maxDeposit: Number(e.target.value) })}
                                                fullWidth
                                                size="small"
                                                sx={{ bgcolor: '#0f172a', input: { color: '#fff' }, label: { color: '#94a3b8' } }}
                                            />
                                        </Box>

                                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                                            <Button variant="outlined" onClick={() => { setQrFile(null); setQrPreview(null); loadAllData(); }} sx={{ color: '#94a3b8', borderColor: '#475569' }}>
                                                Cancel
                                            </Button>
                                            <Button variant="contained" onClick={handleSavePaymentSettings} sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, px: 4, fontWeight: 700 }}>
                                                Save Changes
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* QR Live Mobile Mockup Preview */}
                        <Box>
                            <Card sx={{ bgcolor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', p: 3, textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                                    Player Deposit View Preview
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 3 }}>
                                    This is how the payment QR code appears on the player's deposit screen.
                                </Typography>

                                <Box sx={{ maxWidth: 320, mx: 'auto', p: 3, bgcolor: '#0f172a', borderRadius: '24px', border: '2px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#818cf8', mb: 2 }}>
                                        INSTANT UPI QR DEPOSIT
                                    </Typography>
                                    <Box sx={{ width: 200, height: 200, mx: 'auto', bgcolor: '#fff', borderRadius: '16px', p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                                        {qrPreview || paymentSettings.qrCodeUrl ? (
                                            <Box component="img" src={qrPreview || paymentSettings.qrCodeUrl || ''} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <Box sx={{ color: '#64748b', textAlign: 'center' }}>
                                                <Icon icon="solar:qr-code-bold-duotone" width="64" color="#cbd5e1" />
                                                <Typography variant="caption" display="block">No QR Code Uploaded</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    <Typography variant="body2" fontWeight={700} sx={{ mt: 2, color: '#f8fafc' }}>
                                        {paymentSettings.upiName}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 600, display: 'block' }}>
                                        {paymentSettings.upiId}
                                    </Typography>
                                </Box>
                            </Card>
                        </Box>
                    </Box>
                )}

                {/* ============================================================ */}
                {/* 5. DEPOSIT MANAGEMENT PAGE */}
                {/* ============================================================ */}
                {page === 'deposits' && (
                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <Stack direction="row" spacing={2} sx={{ flexGrow: 1, maxWidth: 600 }}>
                                <TextField
                                    placeholder="Search by player, agent, UTR number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Icon icon="solar:magnifer-linear" color="#64748b" /></InputAdornment>,
                                    }}
                                    sx={{ bgcolor: '#1e293b', borderRadius: '10px', input: { color: '#fff' } }}
                                />
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    size="small"
                                    sx={{ bgcolor: '#1e293b', color: '#fff', borderRadius: '10px', minWidth: 140 }}
                                >
                                    <MenuItem value="ALL">All Status</MenuItem>
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="APPROVED">Approved</MenuItem>
                                    <MenuItem value="REJECTED">Rejected</MenuItem>
                                </Select>
                            </Stack>

                            <Button
                                variant="outlined"
                                startIcon={<Icon icon="solar:export-bold" />}
                                onClick={exportDepositsCsv}
                                sx={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', borderRadius: '10px', fontWeight: 700 }}
                            >
                                Export CSV
                            </Button>
                        </Box>

                        <TableContainer component={Paper} sx={{ bgcolor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#0f172a' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Player</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Assigned Agent</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Amount</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Payment Screenshot</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>UTR / Ref No.</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Deposit Time</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Status</TableCell>
                                        <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 800 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredDeposits.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#64748b' }}>
                                                No deposit requests found matching filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredDeposits.slice(pageNumber * rowsPerPage, pageNumber * rowsPerPage + rowsPerPage).map(dep => (
                                            <TableRow key={dep.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                                <TableCell sx={{ color: '#f8fafc', fontWeight: 700 }}>{dep.username}</TableCell>
                                                <TableCell>
                                                    <Chip label={dep.assignedAgent || 'Unassigned'} size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 700 }} />
                                                </TableCell>
                                                <TableCell sx={{ color: '#34d399', fontSize: '0.95rem', fontWeight: 800 }}>₹{dep.amount.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    {dep.screenshotUrl ? (
                                                        <Button
                                                            size="small"
                                                            startIcon={<Icon icon="solar:eye-bold" />}
                                                            onClick={() => setScreenshotModal(dep)}
                                                            sx={{ color: '#38bdf8', bgcolor: 'rgba(56, 189, 248, 0.1)', textTransform: 'none', borderRadius: '8px' }}
                                                        >
                                                            View Proof
                                                        </Button>
                                                    ) : (
                                                        <Typography variant="caption" sx={{ color: '#64748b' }}>No Screenshot</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ color: '#cbd5e1', fontFamily: 'monospace', fontWeight: 700 }}>{dep.utr}</TableCell>
                                                <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{dep.createdAt}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={dep.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: dep.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : dep.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                                                            color: dep.status === 'APPROVED' ? '#34d399' : dep.status === 'REJECTED' ? '#f87171' : '#facc15',
                                                            fontWeight: 700
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {dep.status === 'PENDING' ? (
                                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => setActionDialog({ type: 'APPROVE_DEP', item: dep })}
                                                                sx={{ fontWeight: 700, borderRadius: '8px' }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => setActionDialog({ type: 'REJECT_DEP', item: dep })}
                                                                sx={{ fontWeight: 700, borderRadius: '8px' }}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="caption" sx={{ color: '#64748b' }}>Completed</Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                )}

                {/* ============================================================ */}
                {/* OTHER MODULE PAGES (Withdrawals, Games, Providers, Reports, Security, Audit Logs, Profile) */}
                {/* ============================================================ */}
                {page === 'withdrawals' && (
                    <TableContainer component={Paper} sx={{ bgcolor: '#1e293b', borderRadius: '16px' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#0f172a' }}>
                                <TableRow>
                                    <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Player</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Amount</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Bank / Account</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>IFSC</TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 800 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {withdrawals.map(w => (
                                    <TableRow key={w.id}>
                                        <TableCell sx={{ color: '#fff' }}>{w.username}</TableCell>
                                        <TableCell sx={{ color: '#f59e0b', fontWeight: 800 }}>₹{w.amount}</TableCell>
                                        <TableCell sx={{ color: '#cbd5e1' }}>{w.bankName} - {w.accountNumber}</TableCell>
                                        <TableCell sx={{ color: '#94a3b8' }}>{w.ifsc}</TableCell>
                                        <TableCell><Chip label={w.status} size="small" color={w.status === 'APPROVED' ? 'success' : w.status === 'REJECTED' ? 'error' : 'warning'} /></TableCell>
                                        <TableCell align="right">
                                            {w.status === 'PENDING' && (
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Button size="small" variant="contained" color="success" onClick={() => setActionDialog({ type: 'APPROVE_WD', item: w })}>Approve</Button>
                                                    <Button size="small" variant="contained" color="error" onClick={() => setActionDialog({ type: 'REJECT_WD', item: w })}>Reject</Button>
                                                </Stack>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {page === 'games' && (
                    <Typography variant="h6" sx={{ color: '#94a3b8' }}>Games Catalog ({games.length} Games Active)</Typography>
                )}

                {page === 'providers' && (
                    <Typography variant="h6" sx={{ color: '#94a3b8' }}>Game Providers ({providers.length} Providers Connected)</Typography>
                )}

                {page === 'audit-logs' && (
                    <TableContainer component={Paper} sx={{ bgcolor: '#1e293b', borderRadius: '16px' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#0f172a' }}>
                                <TableRow>
                                    <TableCell sx={{ color: '#94a3b8' }}>Timestamp</TableCell>
                                    <TableCell sx={{ color: '#94a3b8' }}>Actor</TableCell>
                                    <TableCell sx={{ color: '#94a3b8' }}>Action</TableCell>
                                    <TableCell sx={{ color: '#94a3b8' }}>Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {auditLogs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell sx={{ color: '#94a3b8' }}>{log.timestamp}</TableCell>
                                        <TableCell sx={{ color: '#818cf8', fontWeight: 700 }}>{log.actor}</TableCell>
                                        <TableCell sx={{ color: '#38bdf8' }}>{log.action}</TableCell>
                                        <TableCell sx={{ color: '#cbd5e1' }}>{log.details}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {/* ============================================================ */}
            {/* MODALS & DIALOGS */}
            {/* ============================================================ */}

            {/* Create Agent Modal */}
            <Dialog open={createAgentOpen} onClose={() => setCreateAgentOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1e293b', color: '#fff', borderRadius: '16px' } }}>
                <DialogTitle fontWeight={800}>Create New Agent</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Agent Full Name *" value={newAgentForm.name} onChange={(e) => setNewAgentForm({ ...newAgentForm, name: e.target.value })} fullWidth size="small" sx={{ bgcolor: '#0f172a', input: { color: '#fff' }, label: { color: '#94a3b8' } }} />
                        <TextField label="Username *" value={newAgentForm.username} onChange={(e) => setNewAgentForm({ ...newAgentForm, username: e.target.value })} fullWidth size="small" sx={{ bgcolor: '#0f172a', input: { color: '#fff' }, label: { color: '#94a3b8' } }} />
                        <TextField label="Email Address *" type="email" value={newAgentForm.email} onChange={(e) => setNewAgentForm({ ...newAgentForm, email: e.target.value })} fullWidth size="small" sx={{ bgcolor: '#0f172a', input: { color: '#fff' }, label: { color: '#94a3b8' } }} />
                        <TextField label="Mobile Number" value={newAgentForm.mobile} onChange={(e) => setNewAgentForm({ ...newAgentForm, mobile: e.target.value })} fullWidth size="small" sx={{ bgcolor: '#0f172a', input: { color: '#fff' }, label: { color: '#94a3b8' } }} />
                        <TextField label="Initial Wallet Balance (₹)" type="number" value={newAgentForm.walletBalance} onChange={(e) => setNewAgentForm({ ...newAgentForm, walletBalance: Number(e.target.value) })} fullWidth size="small" sx={{ bgcolor: '#0f172a', input: { color: '#fff' }, label: { color: '#94a3b8' } }} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setCreateAgentOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateAgentSubmit} sx={{ bgcolor: '#4f46e5', fontWeight: 700 }}>Create Agent</Button>
                </DialogActions>
            </Dialog>

            {/* View Screenshot Modal */}
            <Dialog open={Boolean(screenshotModal)} onClose={() => setScreenshotModal(null)} maxWidth="md" PaperProps={{ sx: { bgcolor: '#0f172a', color: '#fff', borderRadius: '16px', p: 1 } }}>
                <DialogTitle fontWeight={800}>
                    Payment Proof Screenshot - {screenshotModal?.username} (₹{screenshotModal?.amount})
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    {screenshotModal?.screenshotUrl ? (
                        <Box component="img" src={screenshotModal.screenshotUrl} sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px', objectFit: 'contain' }} />
                    ) : (
                        <Typography sx={{ color: '#94a3b8' }}>No screenshot available</Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setScreenshotModal(null)} variant="outlined" sx={{ color: '#fff', borderColor: '#475569' }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Replace QR Confirmation Modal */}
            <Dialog open={replaceQrConfirmOpen} onClose={() => setReplaceQrConfirmOpen(false)} PaperProps={{ sx: { bgcolor: '#1e293b', color: '#fff', borderRadius: '16px' } }}>
                <DialogTitle fontWeight={800}>Confirm QR Code Replacement</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px' }}>
                        Uploading a new payment QR code will immediately replace the current QR code across all player deposit pages.
                    </Alert>
                    <Typography variant="body2" sx={{ mt: 2, color: '#cbd5e1' }}>
                        Are you sure you want to activate this new QR code for all player deposits?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setReplaceQrConfirmOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
                    <Button variant="contained" color="warning" onClick={processQrUploadAndSave} sx={{ fontWeight: 700 }}>Confirm Replace</Button>
                </DialogActions>
            </Dialog>

            {/* Action Confirmation Modal (Approve/Reject/Delete) */}
            <Dialog open={Boolean(actionDialog)} onClose={() => setActionDialog(null)} PaperProps={{ sx: { bgcolor: '#1e293b', color: '#fff', borderRadius: '16px' } }}>
                <DialogTitle fontWeight={800}>
                    {actionDialog?.type.includes('APPROVE') ? 'Confirm Approval' : actionDialog?.type.includes('REJECT') ? 'Confirm Rejection' : 'Confirm Deletion'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 2 }}>
                        {actionDialog?.type === 'APPROVE_DEP' && `Approve deposit of ₹${actionDialog.item.amount} for ${actionDialog.item.username}? Player wallet will be credited instantly.`}
                        {actionDialog?.type === 'REJECT_DEP' && `Reject deposit of ₹${actionDialog.item.amount} for ${actionDialog.item.username}?`}
                        {actionDialog?.type === 'DELETE_AGENT' && `Are you sure you want to delete Agent "${actionDialog.item.name}"? Assigned players will be unassigned.`}
                        {actionDialog?.type === 'DELETE_PLAYER' && `Are you sure you want to delete Player "${actionDialog.item.username}"?`}
                    </Typography>

                    {actionDialog?.type.includes('REJECT') && (
                        <TextField
                            label="Reason for Rejection"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            fullWidth
                            size="small"
                            sx={{ mt: 1, bgcolor: '#0f172a', input: { color: '#fff' }, label: { color: '#94a3b8' } }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setActionDialog(null)} sx={{ color: '#94a3b8' }}>Cancel</Button>
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

function MetricCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
    return (
        <Card sx={{ bgcolor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {title}
                        </Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#f8fafc', mt: 0.5 }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon icon={icon} width="26" color={color} />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
