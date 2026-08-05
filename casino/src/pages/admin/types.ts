export type AdminStatus = 'Active' | 'Suspended' | 'Disabled';

export interface Admin {
    id: string;
    name: string;
    username: string;
    email: string;
    mobile: string;
    creditBalance: number;
    creditAllocated: number;
    creditUsed: number;
    users: number;
    activeUsers: number;
    status: AdminStatus;
    createdAt: string;
    lastLogin: string;
    initials: string;
}

export interface CreditLedgerEntry {
    id: string;
    date: string;
    admin: string;
    amount: number;
    type: 'Credit In' | 'Credit Out';
    remarks: string;
    createdBy: string;
}

export interface UserRecord {
    id: string;
    username: string;
    email: string;
    mobile: string;
    balance: number;
    vipLevel: string;
    riskScore: 'Low' | 'Medium' | 'High';
    kycStatus: 'Verified' | 'Pending' | 'Rejected';
    status: 'Active' | 'Blocked';
    joinedAt: string;
    totalDeposits: number;
    totalWithdrawals: number;
}

export interface DepositRequest {
    id: string;
    userId: string;
    username: string;
    amount: number;
    gateway: string;
    utr: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
}

export interface WithdrawalRequest {
    id: string;
    userId: string;
    username: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
}

export interface CatalogProvider { id: string; providerCode: string; providerName: string; providerLogo?: string | null; status: boolean; isVisible: boolean; sortOrder: number; createdAt: string; }
export interface CatalogGame { id: string; gameCode: string; gameName: string; category?: string | null; thumbnail?: string | null; status: string; isActive: boolean; isFeatured: boolean; isPopular: boolean; }
export interface SportsMatch { id: number; time: string; teams: string; isLive: boolean; }
export interface SportsCategory { sport: string; matches: SportsMatch[]; }

export interface BannerItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    link: string;
    isActive: boolean;
}

export interface DomainItem {
    id: string;
    domain: string;
    assignedAdmin: string;
    sslStatus: 'Active' | 'Pending' | 'Expired';
    geoRegion: string;
    status: 'Active' | 'Inactive';
}

export interface AuditLogItem {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
    ip: string;
    severity: 'Info' | 'Warning' | 'Critical';
}

export interface SystemHealthInfo {
    serverUptime: string;
    cpuLoad: string;
    memoryUsage: string;
    databaseStatus: 'Healthy' | 'Degraded' | 'Offline';
    redisStatus: 'Connected' | 'Disconnected';
    activeSockets: number;
    publicIp: string;
}
