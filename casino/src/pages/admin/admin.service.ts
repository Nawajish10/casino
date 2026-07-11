import type { Admin, CreditLedgerEntry } from './types';

// API-ready mock adapter. Replace these promises with HTTP calls when endpoints are available.
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
    ]
};
