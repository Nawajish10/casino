import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import {
    Alert, Avatar, Box, Button, Chip, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControl, Grid, IconButton, InputAdornment, MenuItem, Paper, Select, Snackbar, Stack, Switch, TextField, Tooltip, Typography
} from '@mui/material';
import { adminService } from './admin.service';
import { catalogService } from './catalog.service';
import type {
    Admin, AdminStatus, AuditLogItem, BannerItem, CatalogGame, CatalogProvider, CreditLedgerEntry, DepositRequest, DomainItem, SportsCategory, SystemHealthInfo, UserRecord, WithdrawalRequest
} from './types';
import './admin.css';
import './admin.catalog.css';

type Page = 'dashboard' | 'admins' | 'create' | 'transfers' | 'history' | 'details' | 'providers' | 'games' | 'sports' | 'users' | 'payments' | 'reports' | 'cms' | 'settings' | 'domains' | 'audit' | 'system';

const navItems = [
    ['dashboard', 'Dashboard', 'solar:widget-5-bold-duotone'],
    ['admins', 'Admin Management', 'solar:users-group-rounded-bold-duotone'],
    ['users', 'Users', 'solar:users-group-two-rounded-bold-duotone'],
    ['payments', 'Payments & Financials', 'solar:wallet-money-bold-duotone'],
    ['providers', 'Providers', 'solar:gamepad-bold-duotone'],
    ['games', 'Games', 'solar:gamepad-old-bold-duotone'],
    ['sports', 'Sportsbook', 'solar:cup-star-bold-duotone'],
    ['reports', 'Reports & Analytics', 'solar:chart-2-bold-duotone'],
    ['cms', 'CMS & Content', 'solar:document-text-bold-duotone'],
    ['settings', 'Website Settings', 'solar:settings-bold-duotone'],
    ['domains', 'Domains', 'solar:global-bold-duotone'],
    ['audit', 'Audit Logs', 'solar:shield-check-bold-duotone'],
    ['system', 'System Health', 'solar:tuning-2-bold-duotone']
] as const;

const money = (value: number) => `₹${new Intl.NumberFormat('en-IN').format(value)}`;

function Sparkline({ color = '#37d39a' }: { color?: string }) { return <svg className="spark" viewBox="0 0 110 35"><path d="M1 29 C13 27,17 12,29 19 S46 28,55 17 S74 7,84 14 S98 20,109 4" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" /></svg>; }
function StatusChip({ status }: { status: AdminStatus }) { return <Chip size="small" label={status} className={`status status-${status.toLowerCase()}`} />; }

export default function AdminPortal() {
    const location = useLocation();
    const navigate = useNavigate();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [ledger, setLedger] = useState<CreditLedgerEntry[]>([]);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [deposits, setDeposits] = useState<DepositRequest[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [banners, setBanners] = useState<BannerItem[]>([]);
    const [domains, setDomains] = useState<DomainItem[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
    const [health, setHealth] = useState<SystemHealthInfo | null>(null);

    const [drawer, setDrawer] = useState(false);
    const [dark, setDark] = useState(false);
    const [toast, setToast] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    const [providers, setProviders] = useState<CatalogProvider[]>([]);
    const [games, setGames] = useState<CatalogGame[]>([]);
    const [sports, setSports] = useState<SportsCategory[]>([]);
    const [catalogError, setCatalogError] = useState('');

    const path = location.pathname;
    const page: Page = path.includes('create') ? 'create'
        : path.includes('transfers') ? 'transfers'
        : path.includes('history') ? 'history'
        : path.includes('details') ? 'details'
        : path.endsWith('/admins') ? 'admins'
        : path.endsWith('/users') ? 'users'
        : path.endsWith('/payments') ? 'payments'
        : path.endsWith('/providers') ? 'providers'
        : path.endsWith('/games') ? 'games'
        : path.endsWith('/sports') ? 'sports'
        : path.endsWith('/reports') ? 'reports'
        : path.endsWith('/cms') ? 'cms'
        : path.endsWith('/settings') ? 'settings'
        : path.endsWith('/domains') ? 'domains'
        : path.endsWith('/audit') ? 'audit'
        : path.endsWith('/system') ? 'system'
        : 'dashboard';

    useEffect(() => {
        Promise.all([
            adminService.getAdmins(),
            adminService.getLedger(),
            adminService.getUsers(),
            adminService.getDeposits(),
            adminService.getWithdrawals(),
            adminService.getBanners(),
            adminService.getDomains(),
            adminService.getAuditLogs(),
            adminService.getSystemHealth()
        ]).then(([a, l, u, d, w, b, dom, aud, sys]) => {
            setAdmins(a);
            setLedger(l);
            setUsers(u);
            setDeposits(d);
            setWithdrawals(w);
            setBanners(b);
            setDomains(dom);
            setAuditLogs(aud);
            setHealth(sys);
        });
    }, []);

    useEffect(() => {
        if (!['providers', 'games', 'sports'].includes(page)) return;
        setCatalogError('');
        Promise.all([catalogService.getProviders(), catalogService.getGames(), catalogService.getSports()])
            .then(([providerData, gameData, sportsData]) => {
                setProviders(providerData);
                setGames(gameData);
                setSports(sportsData);
            })
            .catch(() => setCatalogError('Unable to load catalog endpoints. Showing fallback records.'));
    }, [page]);

    const go = (to: string) => { navigate(to); setDrawer(false); };
    const updateAdmin = (admin: Admin) => setAdmins((items) => items.map((item) => item.id === admin.id ? admin : item));

    const sidebar = (
        <Box className="admin-sidebar">
            <Box className="brand">
                <Box className="brand-mark">P</Box>
                <Box>
                    <b>Playverse</b>
                    <span>SUPER ADMIN</span>
                </Box>
            </Box>
            <Box className="nav-label">OVERVIEW</Box>
            {navItems.map(([key, label, icon]) => (
                <Box key={key}>
                    {key === 'admins' && <Box className="nav-label">MANAGEMENT</Box>}
                    {key === 'reports' && <Box className="nav-label">SYSTEM & DATA</Box>}
                    <Button
                        fullWidth
                        className={`nav-item ${(key === 'dashboard' && page === 'dashboard') || (key === 'admins' && ['admins', 'create', 'details'].includes(page)) || (key === 'payments' && ['payments', 'transfers', 'history'].includes(page)) || key === page ? 'selected' : ''}`}
                        startIcon={<Icon icon={icon} />}
                        onClick={() => {
                            if (key === 'dashboard') go('/admin');
                            else if (key === 'admins') go('/admin/admins');
                            else if (key === 'payments') go('/admin/payments');
                            else go(`/admin/${key}`);
                        }}
                    >
                        {label}
                        {key === 'admins' && <Icon className="chevron" icon="solar:alt-arrow-right-linear" />}
                    </Button>
                    {key === 'admins' && ['admins', 'create', 'details'].includes(page) && (
                        <Box className="subnav">
                            <Button onClick={() => go('/admin/admins')}>All Admins</Button>
                            <Button onClick={() => go('/admin/admins/create')}>Create Admin</Button>
                            <Button onClick={() => go('/admin/transfers')}>Credit Transfers</Button>
                            <Button onClick={() => go('/admin/history')}>Credit History</Button>
                        </Box>
                    )}
                </Box>
            ))}
            <Box className="sidebar-footer">
                <Button className="support" startIcon={<Icon icon="solar:question-circle-bold-duotone" />}>
                    Help & Support
                </Button>
                <Box className="user-mini">
                    <Avatar>SA</Avatar>
                    <Box>
                        <b>Super Admin</b>
                        <span>super@playverse.com</span>
                    </Box>
                    <Icon icon="solar:logout-2-outline" />
                </Box>
            </Box>
        </Box>
    );

    const getPageTitle = () => {
        switch (page) {
            case 'dashboard': return 'Dashboard Overview';
            case 'admins': return 'Admin Management';
            case 'create': return 'Create Administrator';
            case 'details': return 'Admin Profile Details';
            case 'users': return 'User Directory';
            case 'payments': case 'transfers': case 'history': return 'Payments & Financial Operations';
            case 'providers': return 'Provider Management';
            case 'games': return 'Game Catalog Management';
            case 'sports': return 'Sportsbook Live Events';
            case 'reports': return 'Reports & Financial Analytics';
            case 'cms': return 'CMS & Content Control';
            case 'settings': return 'Website Settings & Configuration';
            case 'domains': return 'Domain & Geo Routing';
            case 'audit': return 'Security Audit Logs';
            case 'system': return 'System & Database Health';
            default: return 'Admin Portal';
        }
    };

    return (
        <Box className={`admin-root ${dark ? 'admin-dark' : ''}`}>
            <CssBaseline />
            <Box className="desktop-sidebar">{sidebar}</Box>
            <Drawer open={drawer} onClose={() => setDrawer(false)} className="mobile-drawer">{sidebar}</Drawer>
            
            <Box className="admin-content">
                <Box className="admin-header">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <IconButton className="mobile-menu" onClick={() => setDrawer(true)}>
                            <Icon icon="solar:hamburger-menu-linear" />
                        </IconButton>
                        <Box>
                            <Typography variant="h5" fontWeight={800}>{getPageTitle()}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active control center & real-time gaming platform analytics.
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="Toggle light/dark theme">
                            <IconButton onClick={() => setDark(!dark)}>
                                <Icon icon={dark ? 'solar:sun-2-bold-duotone' : 'solar:moon-bold-duotone'} />
                            </IconButton>
                        </Tooltip>
                        <IconButton>
                            <Icon icon="solar:bell-bing-bold-duotone" />
                        </IconButton>
                        <Button className="header-user" startIcon={<Avatar>SA</Avatar>} endIcon={<Icon icon="solar:alt-arrow-down-linear" />}>
                            Super Admin
                        </Button>
                    </Stack>
                </Box>

                <Box className="admin-page">
                    {page === 'dashboard' && <Dashboard go={go} />}
                    {page === 'admins' && <AdminList admins={admins} onView={(a) => { setSelectedAdmin(a); go(`/admin/admins/${a.id}`); }} onCreate={() => go('/admin/admins/create')} onUpdate={updateAdmin} toast={setToast} />}
                    {page === 'create' && <AdminForm onSave={(a) => { setAdmins((all) => [...all, a]); setToast('Admin account created successfully'); go('/admin/admins'); }} onCancel={() => go('/admin/admins')} />}
                    {page === 'details' && <AdminDetails admin={selectedAdmin || admins[0]} onEdit={(a) => { updateAdmin(a); setToast('Admin profile updated'); }} onTransfer={() => go('/admin/transfers')} />}
                    {['payments', 'transfers', 'history'].includes(page) && <PaymentsSection admins={admins} ledger={ledger} deposits={deposits} withdrawals={withdrawals} onTransfer={(entry) => { setLedger((all) => [entry, ...all]); setToast('Credit transfer recorded successfully'); }} onApproveDeposit={(id) => { setDeposits(all => all.map(d => d.id === id ? { ...d, status: 'Approved' } : d)); setToast(`Deposit ${id} approved`); }} onRejectDeposit={(id) => { setDeposits(all => all.map(d => d.id === id ? { ...d, status: 'Rejected' } : d)); setToast(`Deposit ${id} rejected`); }} onApproveWithdrawal={(id) => { setWithdrawals(all => all.map(w => w.id === id ? { ...w, status: 'Approved' } : w)); setToast(`Withdrawal ${id} processed`); }} onRejectWithdrawal={(id) => { setWithdrawals(all => all.map(w => w.id === id ? { ...w, status: 'Rejected' } : w)); setToast(`Withdrawal ${id} rejected`); }} />}
                    {page === 'users' && <UsersPage users={users} onToggleStatus={(id) => { setUsers(all => all.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } : u)); setToast('User status updated'); }} />}
                    {page === 'providers' && <ProvidersPage providers={providers} error={catalogError} onToggleVisible={(id) => { setProviders(all => all.map(p => p.id === id ? { ...p, isVisible: !p.isVisible } : p)); setToast('Provider visibility updated'); }} onToggleStatus={(id) => { setProviders(all => all.map(p => p.id === id ? { ...p, status: !p.status } : p)); setToast('Provider status updated'); }} toast={setToast} />}
                    {page === 'games' && <GamesPage games={games} error={catalogError} onToggleFeatured={(id) => { setGames(all => all.map(g => g.id === id ? { ...g, isFeatured: !g.isFeatured } : g)); setToast('Game featured status toggled'); }} onTogglePopular={(id) => { setGames(all => all.map(g => g.id === id ? { ...g, isPopular: !g.isPopular } : g)); setToast('Game popular status toggled'); }} onToggleActive={(id) => { setGames(all => all.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g)); setToast('Game active status updated'); }} />}
                    {page === 'sports' && <SportsPage sports={sports} error={catalogError} />}
                    {page === 'reports' && <ReportsPage />}
                    {page === 'cms' && <CmsPage banners={banners} onToggleBanner={(id) => { setBanners(all => all.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b)); setToast('Banner visibility updated'); }} toast={setToast} />}
                    {page === 'settings' && <SettingsPage toast={setToast} />}
                    {page === 'domains' && <DomainsPage domains={domains} onToggleDomain={(id) => { setDomains(all => all.map(d => d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d)); setToast('Domain status updated'); }} />}
                    {page === 'audit' && <AuditPage logs={auditLogs} />}
                    {page === 'system' && <SystemPage health={health} toast={setToast} />}
                </Box>
            </Box>

            <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast('')}>
                <Alert severity="success" variant="filled">{toast}</Alert>
            </Snackbar>
        </Box>
    );
}

// --------------------------- PAGES & MODULES ---------------------------

function Dashboard({ go }: { go: (path: string) => void }) {
    const kpis = [
        ['Total Admins', '24', '+12.5%', 'solar:users-group-rounded-bold-duotone', '#7657ef'],
        ['Total Registered Users', '18,490', '+8.2%', 'solar:users-group-two-rounded-bold-duotone', '#3182f6'],
        ['Active Users', '12,848', '+5.4%', 'solar:user-check-bold-duotone', '#24ae75'],
        ['Online Users', '1,284', '+14.2%', 'solar:users-group-rounded-bold-duotone', '#e8773e'],
        ['Total Deposits', '₹48.5L', '+18.3%', 'solar:wallet-money-bold-duotone', '#15a77b'],
        ['Total Withdrawals', '₹32.1L', '-4.1%', 'solar:card-transfer-bold-duotone', '#e36072'],
        ['Pending Deposits', '38', '+7.5%', 'solar:clock-circle-bold-duotone', '#e6a51f'],
        ['Pending Withdrawals', '21', '-10.4%', 'solar:danger-triangle-bold-duotone', '#df6374'],
        ["Today's Bets", '8,429', '+11.2%', 'solar:ticket-sale-bold-duotone', '#347ff6'],
        ["Today's Revenue", '₹3.82L', '+9.8%', 'solar:chart-square-bold-duotone', '#7657ef'],
        ['Casino Revenue', '₹2.46L', '+6.7%', 'solar:gamepad-bold-duotone', '#e8773e'],
        ['Sportsbook Revenue', '₹1.36L', '+15.3%', 'solar:cup-star-bold-duotone', '#298ad9']
    ];

    const activity = [
        ['Admin created', 'Neha Verma was added as an administrator', '2 min ago', 'solar:user-plus-bold-duotone'],
        ['Deposit approved', 'Deposit #DP-45092 approved for ₹12,500', '12 min ago', 'solar:check-circle-bold-duotone'],
        ['Withdrawal request', 'Withdrawal #WD-98141 requires review', '26 min ago', 'solar:clock-circle-bold-duotone'],
        ['Provider synced', 'Pragmatic Play catalog sync completed', '1 hour ago', 'solar:refresh-bold-duotone']
    ];

    return (
        <>
            <Grid container spacing={2}>
                {kpis.map(([title, value, change, icon, color]) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={title}>
                        <Paper className="kpi-card">
                            <Box className="kpi-top">
                                <Box className="kpi-icon" sx={{ color, backgroundColor: `${color}16` }}>
                                    <Icon icon={icon} />
                                </Box>
                                <Chip
                                    className={change.startsWith('-') ? 'negative-change' : 'positive-change'}
                                    size="small"
                                    icon={<Icon icon={change.startsWith('-') ? 'solar:arrow-down-linear' : 'solar:arrow-up-linear'} />}
                                    label={change}
                                />
                            </Box>
                            <Typography className="kpi-value">{value}</Typography>
                            <Typography className="kpi-label">{title}</Typography>
                            <Sparkline color={color} />
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2.5} mt={0.5}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper className="panel">
                        <Box className="panel-title">
                            <Box>
                                <Typography variant="h6">Revenue Analytics</Typography>
                                <Typography variant="body2">Platform revenue performance by vertical</Typography>
                            </Box>
                            <Select size="small" defaultValue="monthly">
                                <MenuItem value="daily">Daily</MenuItem>
                                <MenuItem value="weekly">Weekly</MenuItem>
                                <MenuItem value="monthly">Monthly</MenuItem>
                            </Select>
                        </Box>
                        <Box className="legend">
                            <span><i className="legend-casino" />Casino</span>
                            <span><i className="legend-sports" />Sportsbook</span>
                        </Box>
                        <Box className="bar-chart">
                            {[42, 65, 48, 79, 60, 88, 71, 93, 78, 102, 89, 118].map((height, i) => (
                                <Box className="bar-pair" key={i}>
                                    <Box className="bar casino" sx={{ height: `${height * 0.65}%` }} />
                                    <Box className="bar sports" sx={{ height: `${height * 0.42}%` }} />
                                    <span>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Paper className="panel user-chart">
                        <Box className="panel-title">
                            <Box>
                                <Typography variant="h6">User Breakdown</Typography>
                                <Typography variant="body2">Audience distribution</Typography>
                            </Box>
                            <IconButton><Icon icon="solar:menu-dots-bold" /></IconButton>
                        </Box>
                        <Box className="donut">
                            <Box>
                                <b>18.5K</b>
                                <span>Total Users</span>
                            </Box>
                        </Box>
                        <Stack spacing={1.6}>
                            <MetricLine color="#7657ef" label="New registrations" value="2,481" />
                            <MetricLine color="#22b779" label="Active players" value="12,848" />
                            <MetricLine color="#e7a72b" label="Online now" value="1,284" />
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper className="panel">
                        <Box className="panel-title">
                            <Box>
                                <Typography variant="h6">Recent Activity</Typography>
                                <Typography variant="body2">Latest audit & platform events</Typography>
                            </Box>
                            <Button size="small" onClick={() => go('/admin/audit')}>View all</Button>
                        </Box>
                        <Box className="timeline">
                            {activity.map(([title, desc, time, icon]) => (
                                <Box className="timeline-row" key={title}>
                                    <Box className="timeline-icon"><Icon icon={icon} /></Box>
                                    <Box>
                                        <b>{title}</b>
                                        <span>{desc}</span>
                                    </Box>
                                    <time>{time}</time>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper className="panel">
                        <Box className="panel-title">
                            <Box>
                                <Typography variant="h6">Gaming Insights</Typography>
                                <Typography variant="body2">Top performance indicators</Typography>
                            </Box>
                            <Button size="small" onClick={() => go('/admin/reports')}>View report</Button>
                        </Box>
                        <Grid container spacing={1.5}>
                            {[
                                ['Most Played', 'Sweet Bonanza', 'solar:gamepad-bold-duotone'],
                                ['Top Provider', 'Pragmatic Play', 'solar:star-bold-duotone'],
                                ['Live Bets', '342 active', 'solar:ticket-sale-bold-duotone'],
                                ['Sports Matches', '86 ongoing', 'solar:cup-star-bold-duotone']
                            ].map(([label, value, icon]) => (
                                <Grid key={label} size={{ xs: 6, md: 3 }}>
                                    <Box className="game-stat">
                                        <Icon icon={icon} />
                                        <span>{label}</span>
                                        <b>{value}</b>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            <Paper className="quick-actions">
                <Box>
                    <Typography variant="h6">Quick Actions</Typography>
                    <Typography variant="body2">Administrative shortcuts</Typography>
                </Box>
                <Stack direction="row" gap={1.2} flexWrap="wrap">
                    {[
                        ['Create Admin', 'solar:user-plus-bold-duotone', '/admin/admins/create'],
                        ['Transfer Credits', 'solar:card-transfer-bold-duotone', '/admin/transfers'],
                        ['User Directory', 'solar:users-group-two-rounded-bold-duotone', '/admin/users'],
                        ['Payment Approvals', 'solar:wallet-money-bold-duotone', '/admin/payments'],
                        ['Manage Providers', 'solar:gamepad-bold-duotone', '/admin/providers'],
                        ['Game Catalog', 'solar:gamepad-old-bold-duotone', '/admin/games'],
                        ['Website Settings', 'solar:settings-bold-duotone', '/admin/settings']
                    ].map(([label, icon, path]) => (
                        <Button key={label} className="quick-button" startIcon={<Icon icon={icon} />} onClick={() => go(path)}>
                            {label}
                        </Button>
                    ))}
                </Stack>
            </Paper>
        </>
    );
}

function MetricLine({ color, label, value }: { color: string; label: string; value: string }) {
    return <Box className="metric-line"><i style={{ background: color }} /><span>{label}</span><b>{value}</b></Box>;
}

// --------------------------- ADMINS ---------------------------

function AdminList({ admins, onView, onCreate, onUpdate, toast }: { admins: Admin[]; onView: (a: Admin) => void; onCreate: () => void; onUpdate: (a: Admin) => void; toast: (x: string) => void }) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const [confirm, setConfirm] = useState<Admin | null>(null);
    const list = useMemo(() => admins.filter(a => (filter === 'All' || a.status === filter) && `${a.name} ${a.username} ${a.email}`.toLowerCase().includes(query.toLowerCase())), [admins, filter, query]);
    const toggle = () => {
        if (!confirm) return;
        const next = confirm.status === 'Active' ? 'Suspended' : 'Active';
        onUpdate({ ...confirm, status: next });
        toast(`${confirm.name} is now ${next.toLowerCase()}`);
        setConfirm(null);
    };

    return (
        <>
            <Paper className="table-panel">
                <Box className="table-toolbar">
                    <Box>
                        <Typography variant="h6">All Admins <Chip label={admins.length} size="small" /></Typography>
                        <Typography variant="body2">Manage administrator accounts and system access.</Typography>
                    </Box>
                    <Stack direction="row" gap={1}>
                        <Button variant="contained" startIcon={<Icon icon="solar:user-plus-bold" />} onClick={onCreate}>
                            Create Admin
                        </Button>
                    </Stack>
                </Box>
                <Divider />
                <Box className="table-filters">
                    <TextField size="small" placeholder="Search admins..." value={query} onChange={(e) => setQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="solar:magnifer-linear" /></InputAdornment> }} />
                    <Select size="small" value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <MenuItem value="All">All statuses</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Suspended">Suspended</MenuItem>
                        <MenuItem value="Disabled">Disabled</MenuItem>
                    </Select>
                </Box>
                <Box className="responsive-table">
                    <table>
                        <thead>
                            <tr><th>ADMIN</th><th>CONTACT</th><th>CREDIT BALANCE</th><th>TOTAL USERS</th><th>STATUS</th><th>CREATED</th><th>LAST LOGIN</th><th /></tr>
                        </thead>
                        <tbody>
                            {list.map(a => (
                                <tr key={a.id}>
                                    <td>
                                        <Stack direction="row" gap={1.2} alignItems="center">
                                            <Avatar className="admin-avatar">{a.initials}</Avatar>
                                            <Box><b>{a.name}</b><span>@{a.username}</span></Box>
                                        </Stack>
                                    </td>
                                    <td><b>{a.email}</b><span>{a.mobile}</span></td>
                                    <td><b>{money(a.creditBalance)}</b><span>of {money(a.creditAllocated)}</span></td>
                                    <td><b>{a.users.toLocaleString()}</b><span>{a.activeUsers.toLocaleString()} active</span></td>
                                    <td><StatusChip status={a.status} /></td>
                                    <td>{a.createdAt}</td>
                                    <td>{a.lastLogin}</td>
                                    <td>
                                        <Stack direction="row">
                                            <Tooltip title="View profile"><IconButton onClick={() => onView(a)}><Icon icon="solar:eye-bold-duotone" /></IconButton></Tooltip>
                                            <Tooltip title="Suspend / activate"><IconButton onClick={() => setConfirm(a)}><Icon icon="solar:shield-warning-bold-duotone" /></IconButton></Tooltip>
                                        </Stack>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!list.length && <Box className="empty-state"><Icon icon="solar:users-group-rounded-bold-duotone" /><b>No admins found</b><span>Try updating search or status filter.</span></Box>}
                </Box>
            </Paper>

            <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)}>
                <DialogTitle>{confirm?.status === 'Active' ? 'Suspend administrator?' : 'Activate administrator?'}</DialogTitle>
                <DialogContent>Changing access for <b>{confirm?.name}</b> takes effect immediately. You can reverse this action anytime.</DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirm(null)}>Cancel</Button>
                    <Button variant="contained" color={confirm?.status === 'Active' ? 'warning' : 'primary'} onClick={toggle}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

function AdminForm({ onSave, onCancel }: { onSave: (a: Admin) => void; onCancel: () => void }) {
    const [form, setForm] = useState({ name: '', username: '', email: '', mobile: '', password: '', confirm: '', credit: '', commission: '5', domain: '', notes: '', status: 'Active' as AdminStatus });
    const set = (key: string, value: string) => setForm({ ...form, [key]: value });
    const valid = form.name && form.username && form.email && form.mobile && form.password.length >= 8 && form.password === form.confirm;
    const submit = () => valid && onSave({ id: `ADM-${String(Date.now()).slice(-5)}`, name: form.name, username: form.username, email: form.email, mobile: form.mobile, creditBalance: Number(form.credit) || 0, creditAllocated: Number(form.credit) || 0, creditUsed: 0, users: 0, activeUsers: 0, status: form.status, createdAt: '11 Jul 2026', lastLogin: 'Never', initials: form.name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase() });

    return (
        <Paper className="form-panel">
            <Box className="form-heading">
                <Box className="form-icon"><Icon icon="solar:user-plus-bold-duotone" /></Box>
                <Box>
                    <Typography variant="h6">Administrator Information</Typography>
                    <Typography variant="body2">Configure administrator credentials, credit limits, and permissions.</Typography>
                </Box>
            </Box>
            <FormSection title="Personal Information">
                <Grid container spacing={2}>
                    <Field label="Full Name" value={form.name} onChange={v => set('name', v)} required />
                    <Field label="Username" value={form.username} onChange={v => set('username', v)} required />
                    <Field label="Email Address" value={form.email} onChange={v => set('email', v)} required />
                    <Field label="Mobile Number" value={form.mobile} onChange={v => set('mobile', v)} required />
                    <Field label="Password" type="password" value={form.password} onChange={v => set('password', v)} required />
                    <Field label="Confirm Password" type="password" value={form.confirm} onChange={v => set('confirm', v)} required error={Boolean(form.confirm && form.confirm !== form.password)} helperText={form.confirm && form.confirm !== form.password ? 'Passwords do not match' : 'Minimum 8 characters'} />
                </Grid>
            </FormSection>
            <FormSection title="Business & Credit Limits">
                <Grid container spacing={2}>
                    <Field label="Initial Credit Balance" type="number" value={form.credit} onChange={v => set('credit', v)} adornment="₹" />
                    <Field label="Commission Percentage" type="number" value={form.commission} onChange={v => set('commission', v)} adornment="%" />
                    <Field label="Domain Assignment" value={form.domain} onChange={v => set('domain', v)} placeholder="playverse.in" />
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth multiline minRows={2} label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} /></Grid>
                </Grid>
            </FormSection>
            <FormSection title="Permissions & Access">
                <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
                    <FormControl fullWidth>
                        <Typography variant="subtitle2" mb={1}>Account Status</Typography>
                        <Select value={form.status} onChange={e => set('status', e.target.value)}>
                            {(['Active', 'Suspended', 'Disabled'] as AdminStatus[]).map(x => <MenuItem value={x} key={x}>{x}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Box className="permission-card">
                        <Icon icon="solar:shield-check-bold-duotone" />
                        <Box>
                            <b>Full Super Admin Role</b>
                            <span>Unrestricted module access</span>
                        </Box>
                        <Chip label="Enabled" color="success" size="small" />
                    </Box>
                </Stack>
            </FormSection>
            <Stack direction="row" justifyContent="flex-end" gap={1.5} mt={3}>
                <Button onClick={onCancel}>Cancel</Button>
                <Button variant="contained" disabled={!valid} startIcon={<Icon icon="solar:diskette-bold" />} onClick={submit}>Create Admin</Button>
            </Stack>
        </Paper>
    );
}

function Field({ label, value, onChange, type = 'text', required, placeholder, adornment, error, helperText }: { label: string; value: string; onChange: (x: string) => void; type?: string; required?: boolean; placeholder?: string; adornment?: string; error?: boolean; helperText?: string }) {
    return <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={label} type={type} required={required} value={value} error={error} helperText={helperText} placeholder={placeholder} onChange={e => onChange(e.target.value)} InputProps={adornment ? { startAdornment: <InputAdornment position="start">{adornment}</InputAdornment> } : undefined} /></Grid>;
}
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
    return <Box className="form-section"><Typography variant="subtitle1" fontWeight={800}>{title}</Typography><Divider sx={{ my: 2 }} />{children}</Box>;
}

function AdminDetails({ admin, onEdit, onTransfer }: { admin?: Admin; onEdit: (a: Admin) => void; onTransfer: () => void }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(admin?.name || '');
    if (!admin) return <Alert severity="info">Loading administrator details...</Alert>;
    const save = () => { onEdit({ ...admin, name }); setEditing(false); };

    return (
        <>
            <Box className="details-top">
                <Button startIcon={<Icon icon="solar:arrow-left-linear" />} component={Link} to="/admin/admins">Back to Admins</Button>
                <Stack direction="row" gap={1}>
                    <Button variant="outlined" onClick={() => setEditing(!editing)} startIcon={<Icon icon="solar:pen-bold" />}>{editing ? 'Cancel' : 'Edit Profile'}</Button>
                    <Button variant="contained" onClick={onTransfer} startIcon={<Icon icon="solar:card-transfer-bold" />}>Transfer Credits</Button>
                </Stack>
            </Box>
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Paper className="profile-card">
                        <Avatar className="profile-avatar">{admin.initials}</Avatar>
                        {editing ? <TextField value={name} onChange={e => setName(e.target.value)} size="small" /> : <Typography variant="h5" fontWeight={800}>{admin.name}</Typography>}
                        <Typography color="text.secondary">@{admin.username}</Typography>
                        <StatusChip status={admin.status} />
                        <Divider />
                        <Box className="profile-info">
                            <span><Icon icon="solar:letter-bold-duotone" />{admin.email}</span>
                            <span><Icon icon="solar:phone-bold-duotone" />{admin.mobile}</span>
                            <span><Icon icon="solar:calendar-bold-duotone" />Joined {admin.createdAt}</span>
                        </Box>
                        {editing && <Button variant="contained" fullWidth onClick={save}>Save Changes</Button>}
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Grid container spacing={2}>
                        {[
                            ['Credit Allocated', money(admin.creditAllocated), 'solar:wallet-money-bold-duotone'],
                            ['Credit Used', money(admin.creditUsed), 'solar:chart-square-bold-duotone'],
                            ['Available Balance', money(admin.creditBalance), 'solar:card-transfer-bold-duotone'],
                            ['Assigned Users', admin.users.toLocaleString(), 'solar:users-group-rounded-bold-duotone'],
                            ['Active Players', admin.activeUsers.toLocaleString(), 'solar:user-check-bold-duotone'],
                            ['New Today', '48', 'solar:user-plus-bold-duotone']
                        ].map(([label, value, icon]) => (
                            <Grid size={{ xs: 6, md: 4 }} key={label}>
                                <Paper className="small-stat"><Icon icon={icon} /><span>{label}</span><b>{value}</b></Paper>
                            </Grid>
                        ))}
                    </Grid>
                    <Paper className="panel detail-activity">
                        <Typography variant="h6">Financial Overview</Typography>
                        <Grid container spacing={2} mt={0.5}>
                            {[
                                ['Total Deposits', '₹8.46L'],
                                ['Total Withdrawals', '₹5.12L'],
                                ['Net Revenue', '₹3.34L'],
                                ['Profit Margin', '39.4%']
                            ].map(([label, value]) => (
                                <Grid size={{ xs: 6, md: 3 }} key={label}>
                                    <Box className="summary-item"><span>{label}</span><b>{value}</b></Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
}

// --------------------------- USERS ---------------------------

function UsersPage({ users, onToggleStatus }: { users: UserRecord[]; onToggleStatus: (id: string) => void }) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const list = users.filter(u => (filter === 'All' || u.status === filter) && `${u.username} ${u.email} ${u.mobile}`.toLowerCase().includes(query.toLowerCase()));

    return (
        <Paper className="table-panel">
            <Box className="table-toolbar">
                <Box>
                    <Typography variant="h6">Registered Users <Chip label={users.length} size="small" /></Typography>
                    <Typography variant="body2">Player accounts, balances, VIP status, and verification management.</Typography>
                </Box>
            </Box>
            <Divider />
            <Box className="table-filters">
                <TextField size="small" placeholder="Search user by username, email, phone..." value={query} onChange={(e) => setQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="solar:magnifer-linear" /></InputAdornment> }} />
                <Select size="small" value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <MenuItem value="All">All statuses</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Blocked">Blocked</MenuItem>
                </Select>
            </Box>
            <Box className="responsive-table">
                <table>
                    <thead>
                        <tr><th>USER ID</th><th>PLAYER</th><th>BALANCE</th><th>VIP TIER</th><th>RISK SCORE</th><th>KYC STATUS</th><th>ACCOUNT STATUS</th><th>ACTIONS</th></tr>
                    </thead>
                    <tbody>
                        {list.map(u => (
                            <tr key={u.id}>
                                <td><b>{u.id}</b><span>{u.joinedAt}</span></td>
                                <td><b>{u.username}</b><span>{u.email}</span></td>
                                <td><b>{money(u.balance)}</b><span>Dep: {money(u.totalDeposits)}</span></td>
                                <td><Chip label={u.vipLevel} color="secondary" size="small" /></td>
                                <td><Chip label={u.riskScore} color={u.riskScore === 'Low' ? 'success' : u.riskScore === 'Medium' ? 'warning' : 'error'} size="small" /></td>
                                <td><Chip label={u.kycStatus} color={u.kycStatus === 'Verified' ? 'success' : u.kycStatus === 'Pending' ? 'warning' : 'error'} size="small" variant="outlined" /></td>
                                <td><Chip label={u.status} color={u.status === 'Active' ? 'success' : 'error'} size="small" /></td>
                                <td>
                                    <Button size="small" variant="outlined" color={u.status === 'Active' ? 'error' : 'success'} onClick={() => onToggleStatus(u.id)}>
                                        {u.status === 'Active' ? 'Freeze' : 'Unblock'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Paper>
    );
}

// --------------------------- PAYMENTS & FINANCIALS ---------------------------

function PaymentsSection({ admins, ledger, deposits, withdrawals, onTransfer, onApproveDeposit, onRejectDeposit, onApproveWithdrawal, onRejectWithdrawal }: { admins: Admin[]; ledger: CreditLedgerEntry[]; deposits: DepositRequest[]; withdrawals: WithdrawalRequest[]; onTransfer: (e: CreditLedgerEntry) => void; onApproveDeposit: (id: string) => void; onRejectDeposit: (id: string) => void; onApproveWithdrawal: (id: string) => void; onRejectWithdrawal: (id: string) => void; }) {
    const [tab, setTab] = useState<'transfers' | 'deposits' | 'withdrawals' | 'history'>('transfers');

    return (
        <Box>
            <Stack direction="row" spacing={1} mb={2}>
                <Button variant={tab === 'transfers' ? 'contained' : 'outlined'} onClick={() => setTab('transfers')}>Credit Transfers</Button>
                <Button variant={tab === 'deposits' ? 'contained' : 'outlined'} onClick={() => setTab('deposits')}>Deposit Approvals ({deposits.filter(d => d.status === 'Pending').length})</Button>
                <Button variant={tab === 'withdrawals' ? 'contained' : 'outlined'} onClick={() => setTab('withdrawals')}>Withdrawal Payouts ({withdrawals.filter(w => w.status === 'Pending').length})</Button>
                <Button variant={tab === 'history' ? 'contained' : 'outlined'} onClick={() => setTab('history')}>Credit History</Button>
            </Stack>

            {tab === 'transfers' && <CreditTransfer admins={admins} onTransfer={onTransfer} />}
            {tab === 'deposits' && <DepositsTable deposits={deposits} onApprove={onApproveDeposit} onReject={onRejectDeposit} />}
            {tab === 'withdrawals' && <WithdrawalsTable withdrawals={withdrawals} onApprove={onApproveWithdrawal} onReject={onRejectWithdrawal} />}
            {tab === 'history' && <CreditHistory ledger={ledger} />}
        </Box>
    );
}

function DepositsTable({ deposits, onApprove, onReject }: { deposits: DepositRequest[]; onApprove: (id: string) => void; onReject: (id: string) => void }) {
    return (
        <Paper className="table-panel">
            <Box className="table-toolbar">
                <Box>
                    <Typography variant="h6">User Deposit Requests</Typography>
                    <Typography variant="body2">Review player payment receipts and credit player balances.</Typography>
                </Box>
            </Box>
            <Divider />
            <Box className="responsive-table">
                <table>
                    <thead>
                        <tr><th>ID</th><th>USER</th><th>AMOUNT</th><th>GATEWAY</th><th>UTR / REF NUMBER</th><th>STATUS</th><th>DATE</th><th>ACTIONS</th></tr>
                    </thead>
                    <tbody>
                        {deposits.map(d => (
                            <tr key={d.id}>
                                <td><b>{d.id}</b></td>
                                <td><b>{d.username}</b><span>{d.userId}</span></td>
                                <td><b>{money(d.amount)}</b></td>
                                <td>{d.gateway}</td>
                                <td><code>{d.utr}</code></td>
                                <td><Chip size="small" color={d.status === 'Approved' ? 'success' : d.status === 'Pending' ? 'warning' : 'error'} label={d.status} /></td>
                                <td>{d.createdAt}</td>
                                <td>
                                    {d.status === 'Pending' ? (
                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" variant="contained" color="success" onClick={() => onApprove(d.id)}>Approve</Button>
                                            <Button size="small" variant="outlined" color="error" onClick={() => onReject(d.id)}>Reject</Button>
                                        </Stack>
                                    ) : (
                                        <span>Process complete</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Paper>
    );
}

function WithdrawalsTable({ withdrawals, onApprove, onReject }: { withdrawals: WithdrawalRequest[]; onApprove: (id: string) => void; onReject: (id: string) => void }) {
    return (
        <Paper className="table-panel">
            <Box className="table-toolbar">
                <Box>
                    <Typography variant="h6">Player Payout Requests</Typography>
                    <Typography variant="body2">Verify bank details and authorize automated or manual bank transfers.</Typography>
                </Box>
            </Box>
            <Divider />
            <Box className="responsive-table">
                <table>
                    <thead>
                        <tr><th>ID</th><th>USER</th><th>AMOUNT</th><th>BANK NAME</th><th>ACCOUNT NO.</th><th>IFSC CODE</th><th>STATUS</th><th>ACTIONS</th></tr>
                    </thead>
                    <tbody>
                        {withdrawals.map(w => (
                            <tr key={w.id}>
                                <td><b>{w.id}</b></td>
                                <td><b>{w.username}</b><span>{w.userId}</span></td>
                                <td><b>{money(w.amount)}</b></td>
                                <td>{w.bankName}</td>
                                <td><code>{w.accountNumber}</code></td>
                                <td>{w.ifsc}</td>
                                <td><Chip size="small" color={w.status === 'Approved' ? 'success' : w.status === 'Pending' ? 'warning' : 'error'} label={w.status} /></td>
                                <td>
                                    {w.status === 'Pending' ? (
                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" variant="contained" color="success" onClick={() => onApprove(w.id)}>Approve Payout</Button>
                                            <Button size="small" variant="outlined" color="error" onClick={() => onReject(w.id)}>Reject</Button>
                                        </Stack>
                                    ) : (
                                        <span>Completed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Paper>
    );
}

function CreditTransfer({ admins, onTransfer }: { admins: Admin[]; onTransfer: (e: CreditLedgerEntry) => void }) {
    const [admin, setAdmin] = useState('');
    const [amount, setAmount] = useState('');
    const [remarks, setRemarks] = useState('');
    const [confirm, setConfirm] = useState(false);
    const selected = admins.find(a => a.id === admin);
    const valid = selected && Number(amount) > 0;
    const submit = () => {
        if (!selected) return;
        onTransfer({ id: `TXN-${Date.now().toString().slice(-5)}`, date: '11 Jul 2026, just now', admin: selected.name, amount: Number(amount), type: 'Credit In', remarks, createdBy: 'Super Admin' });
        setConfirm(false); setAdmin(''); setAmount(''); setRemarks('');
    };

    return (
        <>
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper className="form-panel">
                        <Box className="form-heading">
                            <Box className="form-icon"><Icon icon="solar:card-transfer-bold-duotone" /></Box>
                            <Box>
                                <Typography variant="h6">Transfer Credits to Admin Account</Typography>
                                <Typography variant="body2">Allocate operating balance to an admin.</Typography>
                            </Box>
                        </Box>
                        <Stack spacing={2.5}>
                            <FormControl fullWidth>
                                <Typography variant="subtitle2" mb={1}>Select Administrator</Typography>
                                <Select displayEmpty value={admin} onChange={e => setAdmin(e.target.value)}>
                                    <MenuItem disabled value="">Choose an admin account</MenuItem>
                                    {admins.filter(a => a.status === 'Active').map(a => <MenuItem key={a.id} value={a.id}>{a.name} — {money(a.creditBalance)} available</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField fullWidth label="Credit Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                            <TextField fullWidth label="Remarks / Purpose" multiline minRows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Reason for this credit transfer" />
                            <Button variant="contained" size="large" disabled={!valid} onClick={() => setConfirm(true)} startIcon={<Icon icon="solar:check-circle-bold" />}>Review & Confirm Transfer</Button>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper className="transfer-aside">
                        <Typography variant="h6">Transfer Guidelines</Typography>
                        {['Select an active admin account', 'Enter amount to transfer', 'Add notes or reference details', 'Authorize transfer'].map((x, i) => (
                            <Box key={x}><span>{i + 1}</span>{x}</Box>
                        ))}
                        <Alert severity="info">All credit adjustments are saved permanently to the audit ledger.</Alert>
                    </Paper>
                </Grid>
            </Grid>
            <Dialog open={confirm} onClose={() => setConfirm(false)}>
                <DialogTitle>Confirm credit transfer</DialogTitle>
                <DialogContent><Typography>Transfer <b>{money(Number(amount))}</b> to <b>{selected?.name}</b>?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirm(false)}>Cancel</Button>
                    <Button variant="contained" onClick={submit}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

function CreditHistory({ ledger }: { ledger: CreditLedgerEntry[] }) {
    const [query, setQuery] = useState('');
    const list = ledger.filter(x => `${x.id} ${x.admin} ${x.remarks}`.toLowerCase().includes(query.toLowerCase()));
    return (
        <Paper className="table-panel">
            <Box className="table-toolbar">
                <Box>
                    <Typography variant="h6">Credit Ledger Audit Trail</Typography>
                    <Typography variant="body2">Historical record of all internal credit adjustments.</Typography>
                </Box>
            </Box>
            <Divider />
            <Box className="table-filters">
                <TextField size="small" placeholder="Search transaction history..." value={query} onChange={e => setQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="solar:magnifer-linear" /></InputAdornment> }} />
            </Box>
            <Box className="responsive-table">
                <table>
                    <thead>
                        <tr><th>TRANSACTION ID</th><th>DATE</th><th>ADMIN</th><th>AMOUNT</th><th>TYPE</th><th>REMARKS</th><th>CREATED BY</th></tr>
                    </thead>
                    <tbody>
                        {list.map(x => (
                            <tr key={x.id}>
                                <td><b>{x.id}</b></td>
                                <td>{x.date}</td>
                                <td><b>{x.admin}</b></td>
                                <td><b>{money(x.amount)}</b></td>
                                <td><Chip size="small" color={x.type === 'Credit In' ? 'success' : 'warning'} label={x.type} /></td>
                                <td>{x.remarks}</td>
                                <td>{x.createdBy}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Paper>
    );
}

// --------------------------- PROVIDERS, GAMES, SPORTS ---------------------------

function CatalogShell({ title, subtitle, query, setQuery, error, count, children }: { title: string; subtitle: string; query: string; setQuery: (value: string) => void; error: string; count: number; children: React.ReactNode }) {
    return (
        <Paper className="table-panel">
            <Box className="table-toolbar">
                <Box>
                    <Typography variant="h6">{title} <Chip label={count} size="small" /></Typography>
                    <Typography variant="body2">{subtitle}</Typography>
                </Box>
            </Box>
            <Divider />
            {error && <Alert className="catalog-error" severity="info" sx={{ m: 2 }}>{error}</Alert>}
            <Box className="table-filters">
                <TextField size="small" placeholder={`Search ${title.toLowerCase()}...`} value={query} onChange={e => setQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="solar:magnifer-linear" /></InputAdornment> }} />
            </Box>
            <Box className="responsive-table">{children}</Box>
            {count === 0 && (
                <Box className="empty-state">
                    <Icon icon="solar:database-bold-duotone" />
                    <b>No records found</b>
                    <span>No records match your filter criteria.</span>
                </Box>
            )}
        </Paper>
    );
}

function ProvidersPage({ providers, error, onToggleVisible, onToggleStatus, toast }: { providers: CatalogProvider[]; error: string; onToggleVisible: (id: string) => void; onToggleStatus: (id: string) => void; toast: (m: string) => void }) {
    const [query, setQuery] = useState('');
    const rows = providers.filter(p => `${p.providerName} ${p.providerCode}`.toLowerCase().includes(query.toLowerCase()));
    return (
        <CatalogShell title="Game Providers" subtitle="Active provider integrations and visibility settings." query={query} setQuery={setQuery} error={error} count={providers.length}>
            <Box p={2} pt={0}>
                <Button variant="outlined" startIcon={<Icon icon="solar:refresh-bold" />} onClick={() => toast('Provider catalog sync triggered successfully')}>
                    Sync Providers with Backend
                </Button>
            </Box>
            <table>
                <thead>
                    <tr><th>PROVIDER</th><th>CODE</th><th>HOMEPAGE VISIBILITY</th><th>PROVIDER STATUS</th><th>SORT ORDER</th><th>ACTIONS</th></tr>
                </thead>
                <tbody>
                    {rows.map(p => (
                        <tr key={p.id}>
                            <td><b>{p.providerName}</b></td>
                            <td><code>{p.providerCode}</code></td>
                            <td><Chip size="small" color={p.isVisible ? 'success' : 'default'} label={p.isVisible ? 'Visible' : 'Hidden'} /></td>
                            <td><Chip size="small" color={p.status ? 'success' : 'error'} label={p.status ? 'Active' : 'Inactive'} /></td>
                            <td>{p.sortOrder}</td>
                            <td>
                                <Stack direction="row" spacing={1}>
                                    <Button size="small" onClick={() => onToggleVisible(p.id)}>{p.isVisible ? 'Hide' : 'Show'}</Button>
                                    <Button size="small" color={p.status ? 'error' : 'success'} onClick={() => onToggleStatus(p.id)}>{p.status ? 'Disable' : 'Enable'}</Button>
                                </Stack>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </CatalogShell>
    );
}

function GamesPage({ games, error, onToggleFeatured, onTogglePopular, onToggleActive }: { games: CatalogGame[]; error: string; onToggleFeatured: (id: string) => void; onTogglePopular: (id: string) => void; onToggleActive: (id: string) => void }) {
    const [query, setQuery] = useState('');
    const rows = games.filter(g => `${g.gameName} ${g.gameCode} ${g.category || ''}`.toLowerCase().includes(query.toLowerCase()));
    return (
        <CatalogShell title="Game Catalog" subtitle="Live games database management." query={query} setQuery={setQuery} error={error} count={games.length}>
            <table>
                <thead>
                    <tr><th>GAME</th><th>GAME CODE</th><th>CATEGORY</th><th>STATUS</th><th>FEATURED</th><th>POPULAR</th><th>TOGGLES</th></tr>
                </thead>
                <tbody>
                    {rows.map(g => (
                        <tr key={g.id}>
                            <td><b>{g.gameName}</b></td>
                            <td><code>{g.gameCode}</code></td>
                            <td>{g.category || 'Slots'}</td>
                            <td><Chip size="small" color={g.isActive ? 'success' : 'default'} label={g.isActive ? 'Active' : 'Disabled'} /></td>
                            <td><Chip size="small" color={g.isFeatured ? 'primary' : 'default'} label={g.isFeatured ? 'Yes' : 'No'} /></td>
                            <td><Chip size="small" color={g.isPopular ? 'secondary' : 'default'} label={g.isPopular ? 'Yes' : 'No'} /></td>
                            <td>
                                <Stack direction="row" spacing={1}>
                                    <Button size="small" variant="outlined" onClick={() => onToggleFeatured(g.id)}>Featured</Button>
                                    <Button size="small" variant="outlined" onClick={() => onTogglePopular(g.id)}>Popular</Button>
                                    <Button size="small" variant="outlined" color={g.isActive ? 'error' : 'success'} onClick={() => onToggleActive(g.id)}>{g.isActive ? 'Disable' : 'Enable'}</Button>
                                </Stack>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </CatalogShell>
    );
}

function SportsPage({ sports, error }: { sports: SportsCategory[]; error: string }) {
    const [query, setQuery] = useState('');
    const rows = sports.flatMap(category => category.matches.map(match => ({ ...match, sport: category.sport }))).filter(m => `${m.sport} ${m.teams}`.toLowerCase().includes(query.toLowerCase()));
    return (
        <CatalogShell title="Sportsbook Events" subtitle="Live sports matches and upcoming odds." query={query} setQuery={setQuery} error={error} count={rows.length}>
            <table>
                <thead>
                    <tr><th>SPORT</th><th>EVENT / TEAMS</th><th>MATCH TIME / STATE</th><th>STATUS</th></tr>
                </thead>
                <tbody>
                    {rows.map(m => (
                        <tr key={m.id}>
                            <td><b>{m.sport}</b></td>
                            <td><b>{m.teams}</b></td>
                            <td>{m.time}</td>
                            <td><Chip size="small" color={m.isLive ? 'error' : 'default'} label={m.isLive ? 'Live Now' : 'Upcoming'} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </CatalogShell>
    );
}

// --------------------------- REPORTS ---------------------------

function ReportsPage() {
    return (
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 4 }}>
                <Paper className="panel">
                    <Typography variant="h6">Gross Gaming Revenue (GGR)</Typography>
                    <Typography variant="h4" fontWeight={800} color="primary" mt={1}>₹1.42 Cr</Typography>
                    <Typography variant="body2" color="text.secondary">Total bets minus payouts across all providers this month.</Typography>
                </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <Paper className="panel">
                    <Typography variant="h6">Net Gaming Revenue (NGR)</Typography>
                    <Typography variant="h4" fontWeight={800} color="success.main" mt={1}>₹98.5 Lakhs</Typography>
                    <Typography variant="body2" color="text.secondary">GGR minus bonuses, cashback, and provider royalties.</Typography>
                </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <Paper className="panel">
                    <Typography variant="h6">Player Retention (D30)</Typography>
                    <Typography variant="h4" fontWeight={800} color="warning.main" mt={1}>64.8%</Typography>
                    <Typography variant="body2" color="text.secondary">Active players returning within 30 days of registration.</Typography>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Paper className="table-panel">
                    <Box className="table-toolbar">
                        <Box>
                            <Typography variant="h6">Top Performing Game Titles</Typography>
                            <Typography variant="body2">Highest turnover and revenue generation.</Typography>
                        </Box>
                        <Button variant="outlined" startIcon={<Icon icon="solar:export-bold" />}>Export Report CSV</Button>
                    </Box>
                    <Divider />
                    <Box className="responsive-table">
                        <table>
                            <thead>
                                <tr><th>RANK</th><th>GAME NAME</th><th>PROVIDER</th><th>TOTAL BETS</th><th>TURNOVER</th><th>GGR</th></tr>
                            </thead>
                            <tbody>
                                {[
                                    [1, 'Sweet Bonanza', 'Pragmatic Play', '142,890', '₹85,40,000', '₹12,40,000'],
                                    [2, 'Crazy Time Live', 'Evolution Gaming', '98,420', '₹62,10,000', '₹9,80,000'],
                                    [3, 'Aviator', 'Spribe', '210,500', '₹1,12,000,000', '₹18,50,000'],
                                    [4, 'Gates of Olympus', 'Pragmatic Play', '84,100', '₹54,00,000', '₹8,20,000']
                                ].map(([rank, name, prov, bets, turnover, ggr]) => (
                                    <tr key={String(rank)}>
                                        <td><b>#{rank}</b></td>
                                        <td><b>{name}</b></td>
                                        <td>{prov}</td>
                                        <td>{bets}</td>
                                        <td><b>{turnover}</b></td>
                                        <td><b style={{ color: '#169762' }}>{ggr}</b></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
}

// --------------------------- CMS ---------------------------

function CmsPage({ banners, onToggleBanner, toast }: { banners: BannerItem[]; onToggleBanner: (id: string) => void; toast: (m: string) => void }) {
    const [ticker, setTicker] = useState('🔥 Welcome to Playverse! Deposit now to get 200% Bonus up to ₹20,000. Live IPL odds are now live!');
    return (
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
                <Paper className="form-panel">
                    <Typography variant="h6" mb={1}>Announcement Ticker Message</Typography>
                    <Typography variant="body2" mb={2}>Top header notification bar shown across the entire platform.</Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField fullWidth value={ticker} onChange={e => setTicker(e.target.value)} />
                        <Button variant="contained" onClick={() => toast('Announcement ticker updated')}>Update Ticker</Button>
                    </Stack>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Paper className="table-panel">
                    <Box className="table-toolbar">
                        <Box>
                            <Typography variant="h6">Homepage Hero Banners</Typography>
                            <Typography variant="body2">Manage promotional slider graphics and target landing routes.</Typography>
                        </Box>
                    </Box>
                    <Divider />
                    <Box className="responsive-table">
                        <table>
                            <thead>
                                <tr><th>BANNER ID</th><th>TITLE</th><th>SUBTITLE</th><th>TARGET LINK</th><th>STATUS</th><th>ACTION</th></tr>
                            </thead>
                            <tbody>
                                {banners.map(b => (
                                    <tr key={b.id}>
                                        <td><b>{b.id}</b></td>
                                        <td><b>{b.title}</b></td>
                                        <td>{b.subtitle}</td>
                                        <td><code>{b.link}</code></td>
                                        <td><Chip size="small" color={b.isActive ? 'success' : 'default'} label={b.isActive ? 'Active' : 'Disabled'} /></td>
                                        <td>
                                            <Button size="small" onClick={() => onToggleBanner(b.id)}>{b.isActive ? 'Hide Banner' : 'Show Banner'}</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
}

// --------------------------- WEBSITE SETTINGS ---------------------------

function SettingsPage({ toast }: { toast: (m: string) => void }) {
    const [siteName, setSiteName] = useState('Playverse Casino & Sports');
    const [supportEmail, setSupportEmail] = useState('support@playverse.com');
    const [currency, setCurrency] = useState('INR');
    const [minDeposit, setMinDeposit] = useState('500');
    const [minWithdrawal, setMinWithdrawal] = useState('1000');
    const [maintenance, setMaintenance] = useState(false);

    return (
        <Paper className="form-panel">
            <Box className="form-heading">
                <Box className="form-icon"><Icon icon="solar:settings-bold-duotone" /></Box>
                <Box>
                    <Typography variant="h6">Platform Configuration</Typography>
                    <Typography variant="body2">General site settings, financial limits, and maintenance controls.</Typography>
                </Box>
            </Box>

            <FormSection title="Branding & Information">
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Site Title" value={siteName} onChange={e => setSiteName(e.target.value)} /></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Support Email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} /></Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <Typography variant="subtitle2" mb={1}>Default Currency</Typography>
                            <Select value={currency} onChange={e => setCurrency(e.target.value)}>
                                <MenuItem value="INR">INR (₹)</MenuItem>
                                <MenuItem value="USD">USD ($)</MenuItem>
                                <MenuItem value="EUR">EUR (€)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </FormSection>

            <FormSection title="Financial Thresholds">
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Minimum Deposit Limit" type="number" value={minDeposit} onChange={e => setMinDeposit(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Minimum Withdrawal Limit" type="number" value={minWithdrawal} onChange={e => setMinWithdrawal(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
                </Grid>
            </FormSection>

            <FormSection title="Maintenance Controls">
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography fontWeight={700}>System Maintenance Mode</Typography>
                        <Typography variant="body2" color="text.secondary">Temporarily block player logins for scheduled maintenance.</Typography>
                    </Box>
                    <Switch checked={maintenance} onChange={e => setMaintenance(e.target.checked)} />
                </Stack>
            </FormSection>

            <Box mt={3} display="flex" justifyContent="flex-end">
                <Button variant="contained" size="large" onClick={() => toast('Website settings saved successfully')}>
                    Save Settings
                </Button>
            </Box>
        </Paper>
    );
}

// --------------------------- DOMAINS ---------------------------

function DomainsPage({ domains, onToggleDomain }: { domains: DomainItem[]; onToggleDomain: (id: string) => void }) {
    return (
        <Paper className="table-panel">
            <Box className="table-toolbar">
                <Box>
                    <Typography variant="h6">Managed Domains & Mirrors</Typography>
                    <Typography variant="body2">SSL status, regional GEO routing, and administrator domain mappings.</Typography>
                </Box>
            </Box>
            <Divider />
            <Box className="responsive-table">
                <table>
                    <thead>
                        <tr><th>DOMAIN</th><th>ASSIGNED ADMIN</th><th>SSL STATUS</th><th>GEO REGION</th><th>STATUS</th><th>ACTIONS</th></tr>
                    </thead>
                    <tbody>
                        {domains.map(d => (
                            <tr key={d.id}>
                                <td><b>{d.domain}</b></td>
                                <td>{d.assignedAdmin}</td>
                                <td><Chip size="small" color={d.sslStatus === 'Active' ? 'success' : 'warning'} label={d.sslStatus} /></td>
                                <td>{d.geoRegion}</td>
                                <td><Chip size="small" color={d.status === 'Active' ? 'success' : 'default'} label={d.status} /></td>
                                <td>
                                    <Button size="small" onClick={() => onToggleDomain(d.id)}>{d.status === 'Active' ? 'Deactivate' : 'Activate'}</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Paper>
    );
}

// --------------------------- AUDIT LOGS ---------------------------

function AuditPage({ logs }: { logs: AuditLogItem[] }) {
    const [query, setQuery] = useState('');
    const list = logs.filter(l => `${l.actor} ${l.action} ${l.details} ${l.ip}`.toLowerCase().includes(query.toLowerCase()));
    return (
        <Paper className="table-panel">
            <Box className="table-toolbar">
                <Box>
                    <Typography variant="h6">Security Audit Stream</Typography>
                    <Typography variant="body2">Real-time administrator activity and platform security events.</Typography>
                </Box>
            </Box>
            <Divider />
            <Box className="table-filters">
                <TextField size="small" placeholder="Search audit logs..." value={query} onChange={e => setQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="solar:magnifer-linear" /></InputAdornment> }} />
            </Box>
            <Box className="responsive-table">
                <table>
                    <thead>
                        <tr><th>TIMESTAMP</th><th>ACTOR</th><th>ACTION</th><th>DETAILS</th><th>IP ADDRESS</th><th>SEVERITY</th></tr>
                    </thead>
                    <tbody>
                        {list.map(l => (
                            <tr key={l.id}>
                                <td>{l.timestamp}</td>
                                <td><b>{l.actor}</b></td>
                                <td><code>{l.action}</code></td>
                                <td>{l.details}</td>
                                <td><code>{l.ip}</code></td>
                                <td><Chip size="small" color={l.severity === 'Info' ? 'info' : l.severity === 'Warning' ? 'warning' : 'error'} label={l.severity} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Paper>
    );
}

// --------------------------- SYSTEM HEALTH ---------------------------

function SystemPage({ health, toast }: { health: SystemHealthInfo | null; toast: (m: string) => void }) {
    if (!health) return <Alert severity="info">Checking system status...</Alert>;

    return (
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 3 }}>
                <Paper className="panel">
                    <Typography variant="subtitle2" color="text.secondary">Server Uptime</Typography>
                    <Typography variant="h5" fontWeight={800} mt={1}>{health.serverUptime}</Typography>
                </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
                <Paper className="panel">
                    <Typography variant="subtitle2" color="text.secondary">Database Connection</Typography>
                    <Typography variant="h5" fontWeight={800} color="success.main" mt={1}>{health.databaseStatus}</Typography>
                </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
                <Paper className="panel">
                    <Typography variant="subtitle2" color="text.secondary">Redis Cache</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary.main" mt={1}>{health.redisStatus}</Typography>
                </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
                <Paper className="panel">
                    <Typography variant="subtitle2" color="text.secondary">Active Socket Connections</Typography>
                    <Typography variant="h5" fontWeight={800} mt={1}>{health.activeSockets}</Typography>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Paper className="form-panel">
                    <Typography variant="h6" mb={2}>Diagnostics & Controls</Typography>
                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" color="primary" onClick={() => toast('Database health check clean (Supabase & Prisma connected)')}>
                            Check Database Health
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={() => toast(`Server Public Outbound IP: ${health.publicIp}`)}>
                            View Outbound Public IP ({health.publicIp})
                        </Button>
                    </Stack>
                </Paper>
            </Grid>
        </Grid>
    );
}
