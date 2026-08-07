export interface AgentRecord {
    id: string;
    name: string;
    username: string;
    email: string;
    mobile: string | null;
    status: 'ACTIVE' | 'DISABLED';
    walletBalance: number;
    assignedPlayersCount: number;
    lastLoginAt?: string | null;
    createdAt: string;
}

export interface UserRecord {
    id: string;
    username: string;
    mobile: string;
    email: string | null;
    name: string | null;
    agentId?: string | null;
    assignedAgent: string;
    status: 'ACTIVE' | 'SUSPENDED';
    walletBalance: number;
    lastLoginAt?: string | null;
    createdAt: string;
}

export interface DepositRequestRecord {
    id: string;
    userId: string;
    username: string;
    agentId?: string | null;
    assignedAgent?: string;
    amount: number;
    gateway: string;
    utr: string;
    screenshotUrl: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectReason?: string | null;
    createdAt: string;
}

export interface WithdrawalRequestRecord {
    id: string;
    userId: string;
    username: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectReason?: string | null;
    createdAt: string;
}

export interface PaymentSettingsData {
    upiId: string;
    upiName: string;
    qrCodeUrl: string | null;
    minDeposit: number;
    maxDeposit: number;
    isEnabled: boolean;
}

export interface WebsiteSettingsData {
    platformName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    allowRegistrations: boolean;
}

export interface DashboardMetrics {
    // Overview
    totalAgents: number;
    activeAgents: number;
    totalPlayers: number;
    onlinePlayers: number;

    // Finance
    todaysDeposits: number;
    todaysWithdrawals: number;
    totalWalletBalance: number;
    platformRevenue: number;

    // Gaming
    activeGames: number;
    activeProviders: number;
    betsToday: number;

    // Operations
    pendingDeposits: number;
    pendingWithdrawals: number;
    failedTransactions: number;
}

export interface CatalogProvider {
    id: string;
    providerCode: string;
    providerName: string;
    providerLogo?: string | null;
    status: boolean;
    isVisible: boolean;
    sortOrder: number;
    createdAt: string;
}

export interface CatalogGame {
    id: string;
    gameCode: string;
    gameName: string;
    providerId?: string;
    category?: string | null;
    thumbnail?: string | null;
    status: string;
    isActive: boolean;
    isFeatured: boolean;
    isPopular: boolean;
    playCount: number;
    createdAt: string;
}

export interface GameTransactionRecord {
    id: string;
    transactionId: string;
    userCode: string;
    providerCode: string;
    gameCode: string;
    gameType: string;
    transactionType: string;
    betAmount: number;
    winAmount: number;
    createdAt: string;
}

export interface AuditLogItem {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
    ip: string;
}

export interface SyncLogItem {
    id: string;
    providerCode: string | null;
    type: string;
    status: string;
    message: string;
    createdAt: string;
}

export interface SystemHealthInfo {
    connected: boolean;
    tablesFound: string[];
    missingTables: string[];
    overview: {
        providers: number;
        games: number;
    };
    outboundIp?: string;
}
