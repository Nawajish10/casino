import { Injectable, Logger } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { ProviderGateway } from '../provider/provider.gateway';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class WalletService {
    private readonly logger = new Logger(WalletService.name);

    constructor(
        private readonly walletRepository: WalletRepository,
        private readonly walletGateway: ProviderGateway,
        private readonly prisma: PrismaService,
    ) {}

    private async retryRequest<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (retries <= 0) throw error;
            this.logger.warn(`Request failed. Retrying in ${delayMs}ms. Error: ${error.message}`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            return this.retryRequest(fn, retries - 1, delayMs * 2);
        }
    }

    async getOrCreateWallet(userId: string, currency = 'INR') {
        let wallet = await this.walletRepository.findByUserId(userId);
        if (!wallet) {
            wallet = await this.walletRepository.createWallet(userId, currency);
            this.logger.log(`Created new wallet for user ${userId} with currency ${currency}`);
        }
        return wallet;
    }

    async syncBalance(userId: string): Promise<number> {
        // 1. Get or create local wallet
        const localWallet = await this.getOrCreateWallet(userId);

        // 2. Fetch user balance from Provider Nation with retry logic
        const userInfo = await this.retryRequest(
            () => this.walletGateway.getUserInfo(userId),
            3,
            1000
        );
        const providerBalance = Number(userInfo?.user?.balance ?? 0);

        const currentLocalBalance = Number(localWallet.balance);

        // 3. Sync if there is a mismatch
        if (currentLocalBalance !== providerBalance) {
            this.logger.log(`Balance mismatch for user ${userId}. Local: ${currentLocalBalance}, Provider: ${providerBalance}. Syncing...`);
            
            // Update local balance
            await this.walletRepository.updateBalance(userId, providerBalance);

            // Log to AuditLog table
            try {
                await this.prisma.auditLog.create({
                    data: {
                        adminUser: 'SYSTEM_WALLET',
                        action: 'WALLET_SYNC',
                        entityId: userId,
                        previousValue: { balance: currentLocalBalance },
                        newValue: { balance: providerBalance }
                    }
                });
            } catch (auditErr) {
                this.logger.error(`Failed to write wallet sync audit log: ${auditErr.message}`);
            }
        }

        return providerBalance;
    }

    async getAgentBalance(): Promise<number> {
        const agentInfo = await this.retryRequest(() => this.walletGateway.getAgentInfo());
        return Number(agentInfo?.agent?.balance ?? 0);
    }

}
