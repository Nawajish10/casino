export interface DashboardMetrics {
    totalUsers: number;
    activeUsers24h: number;
    totalGames: number;
    activeProviders: number;
    totalWalletBalance: number;
    totalBetsCount: number;
    totalBetAmount: number;
    totalWinAmount: number;
    activeSessionsCount: number;
}

export interface UserRecord {
    id: string;
    mobile: string;
    email: string | null;
    name: string | null;
    emailVerified: boolean;
    mobileVerified: boolean;
    createdAt: string;
    walletBalance: number;
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
