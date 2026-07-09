import { Controller, Get, Req, Body, Post, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/auth.controller';
import { WalletService } from './modules/wallet/wallet.service';
import { PrismaService } from './shared/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly walletService: WalletService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/player/balance')
  async getPlayerBalance(@Req() req: any) {
    const userId = req.user.id;
    const wallet = await this.walletService.getOrCreateWallet(userId);
    return {
      amount: Number(wallet.balance),
      pending: 0.0,
      bonus: 0.0,
      turnover: 0.0,
      withdrawable: Number(wallet.balance),
      currency: wallet.currency,
      icon: '₹'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/preference')
  getPreference(@Req() req: any) {
    return {
      userId: req.user.id,
      theme: 'dark',
      hideUsername: false,
      maxBetAlert: true,
      currency: {
        _id: 'usd-id',
        name: 'INR',
        icon: '₹'
      },
      depositEmailNotify: true,
      withdrawEmailNotify: true,
      marketingEmailNotify: false,
      language: 'en'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/notification')
  getNotifications(@Req() req: any) {
    return [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/player/kyc')
  getKyc(@Req() req: any) {
    return {
      status: 'none'
    };
  }

}
