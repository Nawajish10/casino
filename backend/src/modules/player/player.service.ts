import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PlayerService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlayers(search?: string, status?: string, agentId?: string) {
    const where: any = {};
    if (agentId && agentId !== 'ALL') {
      where.agentId = agentId;
    }
    if (search) {
      where.OR = [
        { mobile: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [players, wallets] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          agent: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.wallet.findMany(),
    ]);

    const walletMap = new Map(wallets.map((w) => [w.userId, Number(w.balance)]));

    return players.map((p) => ({
      id: p.id,
      username: p.name || p.mobile,
      mobile: p.mobile,
      email: p.email,
      name: p.name,
      status: p.mobileVerified ? 'ACTIVE' : 'PENDING',
      agentId: p.agentId,
      assignedAgent: p.agent ? p.agent.name : 'Unassigned',
      walletBalance: walletMap.get(p.id) || 0,
      lastLoginAt: p.updatedAt,
      createdAt: p.createdAt,
    }));
  }

  async getPlayerById(id: string) {
    const player = await this.prisma.user.findUnique({
      where: { id },
      include: {
        agent: true,
      },
    });
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { userId: id } });

    return {
      id: player.id,
      username: player.name || player.mobile,
      mobile: player.mobile,
      email: player.email,
      name: player.name,
      status: player.mobileVerified ? 'ACTIVE' : 'PENDING',
      agentId: player.agentId,
      assignedAgent: player.agent ? player.agent.name : 'Unassigned',
      walletBalance: wallet ? Number(wallet.balance) : 0,
      lastLoginAt: player.updatedAt,
      createdAt: player.createdAt,
    };
  }

  async updatePlayer(id: string, dto: { name?: string; email?: string; agentId?: string | null; status?: string }) {
    const player = await this.prisma.user.findUnique({ where: { id } });
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.agentId !== undefined && { agentId: dto.agentId }),
      },
      include: {
        agent: true,
      },
    });

    return {
      id: updated.id,
      username: updated.name || updated.mobile,
      mobile: updated.mobile,
      status: updated.mobileVerified ? 'ACTIVE' : 'PENDING',
      assignedAgent: updated.agent ? updated.agent.name : 'Unassigned',
    };
  }

  async togglePlayerStatus(id: string) {
    const player = await this.prisma.user.findUnique({ where: { id } });
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { mobileVerified: !player.mobileVerified },
    });

    return {
      id: updated.id,
      status: updated.mobileVerified ? 'ACTIVE' : 'SUSPENDED',
    };
  }

  async deletePlayer(id: string) {
    const player = await this.prisma.user.findUnique({ where: { id } });
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }

    await this.prisma.wallet.deleteMany({ where: { userId: id } });
    await this.prisma.depositRequest.deleteMany({ where: { userId: id } });
    await this.prisma.withdrawalRequest.deleteMany({ where: { userId: id } });
    await this.prisma.user.delete({ where: { id } });

    return { success: true, message: `Player ${player.name || player.mobile} deleted successfully` };
  }

  async getPlayerDepositHistory(id: string) {
    const deposits = await this.prisma.depositRequest.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    });
    return deposits.map((d) => ({
      ...d,
      amount: Number(d.amount),
    }));
  }

  async getPlayerWithdrawalHistory(id: string) {
    const withdrawals = await this.prisma.withdrawalRequest.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    });
    return withdrawals.map((w) => ({
      ...w,
      amount: Number(w.amount),
    }));
  }
}
