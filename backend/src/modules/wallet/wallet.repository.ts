import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class WalletRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByUserId(userId: string) {
        return this.prisma.wallet.findUnique({
            where: { userId }
        });
    }

    async createWallet(userId: string, currency = 'INR') {
        return this.prisma.wallet.create({
            data: {
                userId,
                balance: 0.0,
                currency
            }
        });
    }

    async updateBalance(userId: string, balance: number | string) {
        return this.prisma.wallet.update({
            where: { userId },
            data: { balance }
        });
    }
}
