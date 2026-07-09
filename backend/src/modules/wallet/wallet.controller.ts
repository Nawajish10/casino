import { Controller, Get, Post, Req, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
    private readonly logger = new Logger(WalletController.name);

    constructor(private readonly walletService: WalletService) {}

    @Get('me')
    @ApiOperation({ summary: "Get current user's local wallet balance" })
    @ApiResponse({ status: 200, description: 'Return user balance.' })
    async getMe(@Req() req: any) {
        const userId = req.user.id;
        const wallet = await this.walletService.getOrCreateWallet(userId);
        return {
            balance: Number(wallet.balance),
            currency: wallet.currency
        };
    }

    @Post('sync')
    @ApiOperation({ summary: "Sync user's wallet balance with Provider Nation" })
    @ApiResponse({ status: 200, description: 'Return synchronized balance.' })
    async syncWallet(@Req() req: any) {
        const userId = req.user.id;
        const syncedBalance = await this.walletService.syncBalance(userId);
        return {
            balance: Number(syncedBalance)
        };
    }

    @Get('agent-balance')
    @ApiOperation({ summary: 'Get total agent balance from Provider Nation' })
    @ApiResponse({ status: 200, description: 'Return agent balance.' })
    async getAgentBalance() {
        const agentBalance = await this.walletService.getAgentBalance();
        return {
            balance: Number(agentBalance)
        };
    }
}
