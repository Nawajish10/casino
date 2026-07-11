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

export interface CatalogProvider { id: string; providerCode: string; providerName: string; providerLogo?: string | null; status: boolean; isVisible: boolean; sortOrder: number; createdAt: string; }
export interface CatalogGame { id: string; gameCode: string; gameName: string; category?: string | null; thumbnail?: string | null; status: string; isActive: boolean; isFeatured: boolean; isPopular: boolean; }
export interface SportsMatch { id: number; time: string; teams: string; isLive: boolean; }
export interface SportsCategory { sport: string; matches: SportsMatch[]; }
