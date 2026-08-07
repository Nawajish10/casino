import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AgentService {
  constructor(private readonly prisma: PrismaService) {}

  async getAgents(search?: string, status?: string) {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ];
    }

    const agents = await this.prisma.agent.findMany({
      where,
      include: {
        _count: {
          select: { players: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return agents.map((a) => ({
      id: a.id,
      name: a.name,
      username: a.username,
      email: a.email,
      mobile: a.mobile,
      status: a.status,
      walletBalance: Number(a.walletBalance),
      assignedPlayersCount: a._count.players,
      lastLoginAt: a.lastLoginAt,
      createdAt: a.createdAt,
    }));
  }

  async getAgentById(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        players: true,
        _count: { select: { players: true } },
      },
    });
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
    return {
      ...agent,
      walletBalance: Number(agent.walletBalance),
      assignedPlayersCount: agent._count.players,
    };
  }

  async createAgent(dto: { name: string; username: string; email: string; mobile?: string; initialBalance?: number }) {
    const existing = await this.prisma.agent.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.email }],
      },
    });
    if (existing) {
      throw new BadRequestException('Agent with this username or email already exists.');
    }

    const agent = await this.prisma.agent.create({
      data: {
        name: dto.name,
        username: dto.username,
        email: dto.email,
        mobile: dto.mobile || null,
        status: 'ACTIVE',
        walletBalance: dto.initialBalance || 0,
      },
    });

    return {
      ...agent,
      walletBalance: Number(agent.walletBalance),
      assignedPlayersCount: 0,
    };
  }

  async updateAgent(id: string, dto: { name?: string; email?: string; mobile?: string; walletBalance?: number; status?: string }) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    const updated = await this.prisma.agent.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.mobile !== undefined && { mobile: dto.mobile }),
        ...(dto.walletBalance !== undefined && { walletBalance: dto.walletBalance }),
        ...(dto.status && { status: dto.status }),
      },
    });

    return {
      ...updated,
      walletBalance: Number(updated.walletBalance),
    };
  }

  async toggleAgentStatus(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    const newStatus = agent.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const updated = await this.prisma.agent.update({
      where: { id },
      data: { status: newStatus },
    });

    return {
      id: updated.id,
      status: updated.status,
    };
  }

  async deleteAgent(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    // Unassign players before deleting
    await this.prisma.user.updateMany({
      where: { agentId: id },
      data: { agentId: null },
    });

    await this.prisma.agent.delete({ where: { id } });
    return { success: true, message: `Agent ${agent.name} deleted successfully` };
  }

  async getAssignedPlayers(agentId: string) {
    const players = await this.prisma.user.findMany({
      where: { agentId },
      include: {
        agent: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return players.map((p) => ({
      id: p.id,
      username: p.username || p.mobile,
      mobile: p.mobile,
      email: p.email,
      name: p.name,
      status: p.status,
      agentId: p.agentId,
      assignedAgent: p.agent?.name || 'Unassigned',
      lastLoginAt: p.lastLoginAt,
      createdAt: p.createdAt,
    }));
  }
}
