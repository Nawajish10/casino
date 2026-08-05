import type {
    Admin, AuditLogItem, BannerItem, CreditLedgerEntry, DepositRequest, DomainItem, SystemHealthInfo, UserRecord, WithdrawalRequest
} from './types';

export const adminService = {
    getAdmins: async (): Promise<Admin[]> => [
        { id: 'ADM-001', name: 'Arjun Mehta', username: 'arjun.m', email: 'arjun@playverse.com', mobile: '+91 98201 48392', creditBalance: 125000, creditAllocated: 180000, creditUsed: 55000, users: 1248, activeUsers: 842, status: 'Active', createdAt: '12 Jan 2026', lastLogin: '2 min ago', initials: 'AM' },
        { id: 'ADM-002', name: 'Priya Sharma', username: 'priya.s', email: 'priya@playverse.com', mobile: '+91 98710 28571', creditBalance: 84250, creditAllocated: 120000, creditUsed: 35750, users: 986, activeUsers: 617, status: 'Active', createdAt: '18 Feb 2026', lastLogin: '18 min ago', initials: 'PS' },
        { id: 'ADM-003', name: 'Rohan Kapoor', username: 'rohan.k', email: 'rohan@playverse.com', mobile: '+91 99103 68412', creditBalance: 46300, creditAllocated: 95000, creditUsed: 48700, users: 671, activeUsers: 391, status: 'Suspended', createdAt: '02 Mar 2026', lastLogin: '3 days ago', initials: 'RK' },
        { id: 'ADM-004', name: 'Neha Verma', username: 'neha.v', email: 'neha@playverse.com', mobile: '+91 98994 22071', creditBalance: 214500, creditAllocated: 275000, creditUsed: 60500, users: 2104, activeUsers: 1582, status: 'Active', createdAt: '29 Apr 2026', lastLogin: '1 hour ago', initials: 'NV' },
        { id: 'ADM-005', name: 'Karan Singh', username: 'karan.s', email: 'karan@playverse.com', mobile: '+91 98111 65704', creditBalance: 0, creditAllocated: 50000, creditUsed: 50000, users: 392, activeUsers: 102, status: 'Disabled', createdAt: '15 May 2026', lastLogin: '8 days ago', initials: 'KS' }
    ],
    getLedger: async (): Promise<CreditLedgerEntry[]> => [
        { id: 'TXN-98452', date: '11 Jul 2026, 10:24', admin: 'Neha Verma', amount: 25000, type: 'Credit In', remarks: 'Monthly operating credit', createdBy: 'Super Admin' },
        { id: 'TXN-98451', date: '11 Jul 2026, 09:48', admin: 'Arjun Mehta', amount: 15000, type: 'Credit In', remarks: 'Weekend campaign budget', createdBy: 'Super Admin' },
        { id: 'TXN-98439', date: '10 Jul 2026, 18:12', admin: 'Priya Sharma', amount: 10000, type: 'Credit Out', remarks: 'Balance reconciliation', createdBy: 'Super Admin' },
        { id: 'TXN-98422', date: '10 Jul 2026, 14:36', admin: 'Rohan Kapoor', amount: 7500, type: 'Credit In', remarks: 'Retention offer allocation', createdBy: 'Super Admin' }
    ],
    getUsers: async (): Promise<UserRecord[]> => [
        { id: 'USR-10081', username: 'vikram_king', email: 'vikram.k@gmail.com', mobile: '+91 98334 11200', balance: 42500, vipLevel: 'VIP Gold', riskScore: 'Low', kycStatus: 'Verified', status: 'Active', joinedAt: '04 Jan 2026', totalDeposits: 150000, totalWithdrawals: 95000 },
        { id: 'USR-10082', username: 'rahul_roller', email: 'rahul.r@yahoo.com', mobile: '+91 97112 44309', balance: 18900, vipLevel: 'VIP Silver', riskScore: 'Low', kycStatus: 'Verified', status: 'Active', joinedAt: '12 Jan 2026', totalDeposits: 80000, totalWithdrawals: 52000 },
        { id: 'USR-10083', username: 'sneha_luck', email: 'sneha.l@outlook.com', mobile: '+91 99201 55671', balance: 3400, vipLevel: 'VIP Bronze', riskScore: 'Medium', kycStatus: 'Pending', status: 'Active', joinedAt: '01 Feb 2026', totalDeposits: 25000, totalWithdrawals: 18000 },
        { id: 'USR-10084', username: 'amit_poker', email: 'amit.p@gmail.com', mobile: '+91 98199 00412', balance: 0, vipLevel: 'VIP Platinum', riskScore: 'High', kycStatus: 'Rejected', status: 'Blocked', joinedAt: '18 Feb 2026', totalDeposits: 500000, totalWithdrawals: 490000 },
        { id: 'USR-10085', username: 'divya_star', email: 'divya.s@gmail.com', mobile: '+91 98223 88102', balance: 98000, vipLevel: 'VIP Diamond', riskScore: 'Low', kycStatus: 'Verified', status: 'Active', joinedAt: '05 Mar 2026', totalDeposits: 320000, totalWithdrawals: 210000 }
    ],
    getDeposits: async (): Promise<DepositRequest[]> => [
        { id: 'DP-45092', userId: 'USR-10081', username: 'vikram_king', amount: 12500, gateway: 'UPI / PhonePe', utr: 'UTR8941058291', status: 'Approved', createdAt: '11 Jul 2026, 10:45' },
        { id: 'DP-45093', userId: 'USR-10083', username: 'sneha_luck', amount: 5000, gateway: 'Google Pay', utr: 'UTR8941058292', status: 'Pending', createdAt: '11 Jul 2026, 11:02' },
        { id: 'DP-45094', userId: 'USR-10085', username: 'divya_star', amount: 50000, gateway: 'IMPS Direct', utr: 'UTR8941058293', status: 'Pending', createdAt: '11 Jul 2026, 11:15' },
        { id: 'DP-45091', userId: 'USR-10082', username: 'rahul_roller', amount: 10000, gateway: 'Paytm', utr: 'UTR8941058290', status: 'Approved', createdAt: '11 Jul 2026, 09:30' }
    ],
    getWithdrawals: async (): Promise<WithdrawalRequest[]> => [
        { id: 'WD-98141', userId: 'USR-10085', username: 'divya_star', amount: 25000, bankName: 'HDFC Bank', accountNumber: '501004921948', ifsc: 'HDFC0000128', status: 'Pending', createdAt: '11 Jul 2026, 10:50' },
        { id: 'WD-98142', userId: 'USR-10081', username: 'vikram_king', amount: 15000, bankName: 'ICICI Bank', accountNumber: '001205938102', ifsc: 'ICIC0000241', status: 'Approved', createdAt: '11 Jul 2026, 08:20' },
        { id: 'WD-98140', userId: 'USR-10084', username: 'amit_poker', amount: 40000, bankName: 'State Bank of India', accountNumber: '302910482910', ifsc: 'SBIN0001402', status: 'Rejected', createdAt: '10 Jul 2026, 17:40' }
    ],
    getBanners: async (): Promise<BannerItem[]> => [
        { id: 'BNR-01', title: 'Welcome Bonus 200%', subtitle: 'Get up to ₹20,000 on your first deposit', image: '/static/banner1.jpg', link: '/bonus', isActive: true },
        { id: 'BNR-02', title: 'IPL 2026 Special Odds', subtitle: 'Highest odds on all cricket matches', image: '/static/banner2.jpg', link: '/sports', isActive: true },
        { id: 'BNR-03', title: 'Weekly Slots Cashback 10%', subtitle: 'Every Monday instant cashback drop', image: '/static/banner3.jpg', link: '/casino', isActive: false }
    ],
    getDomains: async (): Promise<DomainItem[]> => [
        { id: 'DOM-01', domain: 'playverse.com', assignedAdmin: 'Super Admin', sslStatus: 'Active', geoRegion: 'Global', status: 'Active' },
        { id: 'DOM-02', domain: 'playverse.in', assignedAdmin: 'Arjun Mehta', sslStatus: 'Active', geoRegion: 'India (IN)', status: 'Active' },
        { id: 'DOM-03', domain: 'playverse.bet', assignedAdmin: 'Priya Sharma', sslStatus: 'Pending', geoRegion: 'Southeast Asia', status: 'Active' }
    ],
    getAuditLogs: async (): Promise<AuditLogItem[]> => [
        { id: 'AUD-901', timestamp: '11 Jul 2026, 11:20:14', actor: 'Super Admin', action: 'CREDIT_TRANSFER', details: 'Transferred ₹25,000 to Neha Verma', ip: '103.21.124.5', severity: 'Info' },
        { id: 'AUD-902', timestamp: '11 Jul 2026, 10:45:02', actor: 'Neha Verma', action: 'DEPOSIT_APPROVE', details: 'Approved deposit #DP-45092 for ₹12,500', ip: '157.33.19.42', severity: 'Info' },
        { id: 'AUD-903', timestamp: '11 Jul 2026, 09:12:33', actor: 'Arjun Mehta', action: 'GAME_TOGGLE', details: 'Toggled featured status for Sweet Bonanza', ip: '49.37.102.89', severity: 'Info' },
        { id: 'AUD-904', timestamp: '10 Jul 2026, 22:15:10', actor: 'SYSTEM', action: 'SECURITY_ALERT', details: 'Multiple failed login attempts for user amit_poker', ip: '185.220.101.4', severity: 'Warning' }
    ],
    getSystemHealth: async (): Promise<SystemHealthInfo> => ({
        serverUptime: '99.98% (14 days 6 hrs)',
        cpuLoad: '18% / 100%',
        memoryUsage: '3.4 GB / 8.0 GB',
        databaseStatus: 'Healthy',
        redisStatus: 'Connected',
        activeSockets: 1284,
        publicIp: '13.235.42.110'
    })
};
